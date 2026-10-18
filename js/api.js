// ============================================
// API CLIENT — pengganti google.script.run
// Semua permintaan dikirim sebagai POST ke GAS_URL.
// Header WAJIB text/plain agar tidak memicu CORS preflight (GAS tidak menangani OPTIONS).
// Format balasan server tetap: { ok, data, msg, expired }
// ============================================
const API_TIMEOUT_MS = 45000;

function gasConfigured() {
  return typeof GAS_URL === 'string' && /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec/.test(GAS_URL.trim());
}

function call(a, p, o) {
  const quiet = !!(o && o.silent);
  if (!quiet) busy(1);
  return new Promise((ok, no) => {
    if (!gasConfigured()) {
      if (!quiet) busy(0);
      const m = 'URL backend belum diisi. Buka js/config.js lalu isi GAS_URL dengan URL /exec dari Apps Script.';
      if (!quiet) toast(m, 'err');
      return no(new Error(m));
    }
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), API_TIMEOUT_MS);

    fetch(GAS_URL.trim(), {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: a, token: S.t || '', params: p || {} }),
      signal: ctrl.signal
    })
      .then(res => res.text())
      .then(txt => {
        let r;
        try { r = JSON.parse(txt); }
        catch (e) { throw new Error('Balasan server tidak valid. Pastikan Web App di-deploy dengan akses "Anyone" dan URL /exec benar.'); }
        return r;
      })
      .then(r => {
        clearTimeout(timer);
        if (!quiet) busy(0);
        if (r && r.expired) {
          out(1);
          toast(r.msg || 'Sesi berakhir, silakan masuk kembali.', 'err');
          return no(new Error(r.msg || 'Sesi berakhir.'));
        }
        if (r && r.ok) return ok(r.data);
        let msg = (r && r.msg) || 'Gagal memproses permintaan.';
        if (msg === 'Akses ditolak.' || /tidak ditemukan\.$/.test(msg) && /^Fungsi API/.test(msg)) msg += ' Jika Anda sudah login sebagai guru/admin, kemungkinan Kode.gs di Apps Script belum versi terbaru: Deploy → Kelola deployment → Versi baru.';
        if (!quiet) toast(msg, 'err');
        no(new Error(msg));
      })
      .catch(e => {
        clearTimeout(timer);
        if (!quiet) busy(0);
        let msg;
        if (e && e.name === 'AbortError') msg = 'Waktu tunggu koneksi habis (45 detik). Silakan coba lagi.';
        else if (e instanceof TypeError) msg = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
        else msg = (e && e.message) || 'Koneksi ke server gagal.';
        if (!quiet) toast(msg, 'err');
        no(new Error(msg));
      });
  });
}

// Logout: beri tahu server (fire-and-forget) agar token masuk daftar blokir
function apiLogout(token) {
  if (!token || !gasConfigured()) return;
  try {
    fetch(GAS_URL.trim(), {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'logout', token: token, params: {} }),
      keepalive: true
    }).catch(() => {});
  } catch (e) {}
}

// ============================================
// PERCEPATAN (v2.4)
// 1) Cache baca "stale-while-revalidate": data lama langsung ditampilkan (0 ms), data terbaru
//    diambil diam-diam di latar belakang lalu menggantikan tampilan bila ada perubahan.
// 2) Prefetch halaman utama setelah masuk, sehingga pindah menu terasa instan.
// 3) Pemanasan server (ping) agar Apps Script tidak "dingin" saat pertama kali dipakai.
// ============================================
const RC_READ = new Set(['dashboard', 'rekap', 'peringkat', 'pelList', 'rekapPelanggaran', 'kartuQr', 'siswaList', 'akunList', 'cfgGet', 'kategori', 'siswaRingkas', 'hariGet', 'guruList']);
const RC_MAX_AGE = 15 * 60 * 1000;      // data lebih tua dari ini tidak dipakai
const RC_LS_PREFIX = 'rc2:';
const RC_LS_MAX = 350000;               // batas ukuran per entri di localStorage
const RC = { mem: new Map(), fly: new Map() };

function rcKey(a, p) { return ((S.u && (S.u.id || S.u.username)) || '') + '|' + a + '|' + JSON.stringify(p || 0); }
function rcGet(k) {
  let e = RC.mem.get(k);
  if (!e) {
    try {
      const raw = localStorage.getItem(RC_LS_PREFIX + k);
      if (raw) { e = JSON.parse(raw); RC.mem.set(k, e); }
    } catch (x) {}
  }
  return (e && Date.now() - e.t < RC_MAX_AGE) ? e : null;
}
function rcSet(k, d) {
  const e = { t: Date.now(), d: d, j: JSON.stringify(d) };
  RC.mem.set(k, e);
  try { if (e.j.length < RC_LS_MAX) localStorage.setItem(RC_LS_PREFIX + k, JSON.stringify(e)); } catch (x) {}
  return e;
}
function rcClear() {
  RC.mem.clear();
  try {
    const del = [];
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.indexOf(RC_LS_PREFIX) === 0) del.push(k); }
    del.forEach(k => localStorage.removeItem(k));
  } catch (x) {}
}
// Ambil data di latar belakang (tanpa spinner/toast). Permintaan identik digabung.
function rcFetch(a, p, k) {
  if (RC.fly.has(k)) return RC.fly.get(k);
  const pr = call(a, p, { silent: true }).then(d => { RC.fly.delete(k); return rcSet(k, d); }, err => { RC.fly.delete(k); throw err; });
  RC.fly.set(k, pr);
  return pr;
}

const go = (a, p, f) => {
  const pageAtCall = S.curPage;
  const failView = e => {
    console.error('API call failed (' + a + '):', e);
    const msg = (e && e.message) || 'Gagal memuat data dari server.';
    toast(msg, 'err');
    const v = $('view');
    if (v && v.innerHTML.includes('skl') && (!pageAtCall || pageAtCall === S.curPage)) {
      v.innerHTML = `<div class="cardx text-center py-4"><i class="bi bi-exclamation-triangle text-warning fs-1 mb-2"></i><p class="mb-2 fw-semibold text-danger">${esc(msg)}</p><button class="btn-pri" onclick="nav(document.querySelector('.bnav a.on')?.dataset?.p || 'dash')"><i class="bi bi-arrow-clockwise me-1"></i> Coba Lagi</button></div>`;
    }
  };

  // Aksi baca: tampilkan cache dulu, segarkan di belakang layar
  if (RC_READ.has(a)) {
    const k = rcKey(a, p);
    let hit = rcGet(k);
    // Pencarian/filter Data Siswa: saring langsung dari daftar lengkap yang sudah ada (tanpa menunggu server)
    if (!hit && a === 'siswaList' && p && (p.q || p.kelas || p.status)) {
      const base = rcGet(rcKey(a, { q: '', kelas: '', status: '' }));
      if (base && base.d && Array.isArray(base.d.rows)) {
        const q = String(p.q || '').toLowerCase();
        const rows = base.d.rows.filter(x =>
          (!p.kelas || x.kelas === p.kelas) && (!p.status || x.status === p.status) &&
          (!q || (x.nama || '').toLowerCase().includes(q) || (x.nis || '').includes(q) || (x.nisn || '').includes(q)));
        const d = { rows: rows, kelas: base.d.kelas, total: base.d.total, aktif: base.d.aktif, nonaktif: base.d.nonaktif };
        hit = { t: Date.now(), d: d, j: JSON.stringify(d) };
      }
    }
    if (hit) {
      let shown = hit.j;
      try { f(hit.d); } catch (e) { console.error(e); }
      return rcFetch(a, p, k).then(fresh => {
        if (fresh.j !== shown) {
          shown = fresh.j;
          if (!pageAtCall || pageAtCall === S.curPage) { try { f(fresh.d); } catch (e) { console.error(e); } }
        }
      }).catch(e => { console.warn('Penyegaran latar belakang gagal (' + a + '):', e && e.message); });
    }
    return call(a, p).then(d => { rcSet(k, d); return f(d); }).catch(failView);
  }

  // Aksi tulis: data berubah, buang semua cache baca
  return call(a, p).then(d => { if (a !== 'login') rcClear(); return f(d); }).catch(failView);
};

// Muat di muka halaman yang paling sering dibuka (berjalan saat browser menganggur)
function prefetchApp() {
  if (!S.u || !S.t) return;
  const admin = String(S.u.role || '').toLowerCase().includes('admin');
  const jobs = [['dashboard', 0], ['siswaRingkas', 0], ['hariGet', 0], ['siswaList', { q: '', kelas: '', status: '' }], ['guruList', 0], ['pelList', 0]];
  if (admin) jobs.push(['akunList', 0], ['cfgGet', 0]);
  let i = 0;
  const next = () => {
    if (!S.t || i >= jobs.length) return;
    const j = jobs[i++], k = rcKey(j[0], j[1]);
    if (rcGet(k)) return next();
    rcFetch(j[0], j[1], k).catch(() => {}).then(() => setTimeout(next, 150));
  };
  setTimeout(next, 400);
}

// Pemanasan server: GET ringan saat dibuka dan tiap 4 menit selama tab aktif
function warmServer() {
  if (!gasConfigured()) return;
  try { fetch(GAS_URL.trim(), { method: 'GET', mode: 'no-cors', cache: 'no-store' }).catch(() => {}); } catch (e) {}
}
warmServer();
setInterval(() => { if (!document.hidden) warmServer(); }, 240000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) warmServer(); });
