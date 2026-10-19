window.onerror = function(msg, url, line, col, error) {
  console.error('Global JS error:', msg, error);
  const errMsg = (error && error.message) || msg || 'Terjadi kesalahan sistem.';
  if (typeof toast === 'function') toast('Sistem: ' + errMsg, 'err');
  const b = document.getElementById('lb');
  if (b) { b.disabled = false; b.innerHTML = 'Masuk ke Portal'; }
};
window.addEventListener('unhandledrejection', function(event) {
  console.error('Unhandled rejection:', event.reason);
  const errMsg = (event.reason && event.reason.message) || event.reason || 'Koneksi terputus.';
  if (typeof toast === 'function') toast('Koneksi: ' + errMsg, 'err');
  const b = document.getElementById('lb');
  if (b) { b.disabled = false; b.innerHTML = 'Masuk ke Portal'; }
});

const LOGO = 'https://res.cloudinary.com/fkpigfea/image/upload/f_auto,q_auto/Untitled_Design_2';
const S = { t: null, u: null, ch: null, cam: null, rk: null, sw: null, kt: [], curPage: '' }, $ = i => document.getElementById(i);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function toast(m, t) {
  let e = $('toast');
  if (!e) {
    e = document.createElement('div');
    e.id = 'toast';
    e.className = 'toastx';
    document.body.appendChild(e);
  }
  e.textContent = m;
  e.className = 'toastx show ' + (t || '');
  clearTimeout(e._t);
  e._t = setTimeout(() => { if (e) e.className = 'toastx'; }, 5000);
}
const busy = b => { const el = $('bar'); if (el) el.style.display = b ? 'block' : 'none'; };
try { document.documentElement.dataset.theme = localStorage.getItem('th') || 'light'; } catch (e) {}
function theme() {
  const h = document.documentElement, n = h.dataset.theme === 'dark' ? 'light' : 'dark'; h.dataset.theme = n;
  try { localStorage.setItem('th', n); } catch (e) {}
  if (S.ch && typeof Chart !== 'undefined') {
    try {
      Chart.defaults.color = getComputedStyle(h).getPropertyValue('--mut');
      S.ch.update();
    } catch (e) {}
  }
}
const SafeStorage = {
  get(k) { try { return sessionStorage.getItem(k); } catch(e) { return null; } },
  set(k, v) { try { sessionStorage.setItem(k, v); } catch(e) {} },
  remove(k) { try { sessionStorage.removeItem(k); } catch(e) {} }
};

const hideLoader = () => {
  const ld = document.getElementById('ld');
  if (ld) ld.style.display = 'none';
};
hideLoader();
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', hideLoader);
}
window.addEventListener('load', hideLoader);
setTimeout(hideLoader, 50);
setTimeout(hideLoader, 300);

//  Modal Helper 
function openModal(html, extraClass) {
  $('modalContent').className = 'modal-content cardx' + (extraClass ? ' ' + extraClass : '');
  $('modalContent').innerHTML = '<div class="modal-sheet-handle"></div>' + html;
  $('modalBox').style.display = 'flex';
  document.body.classList.add('modal-open');
}
function closeModal() {
  $('modalBox').style.display = 'none';
  $('modalContent').innerHTML = '';
  document.body.classList.remove('modal-open');
}

//  Mobile Drawer Helper 
function toggleDrawer(open) {
  const drawer = $('drawer');
  const overlay = $('drawerOverlay');
  if (!drawer || !overlay) return;
  const isOpen = typeof open === 'boolean' ? open : !drawer.classList.contains('show');
  drawer.classList.toggle('show', isOpen);
  overlay.classList.toggle('show', isOpen);
  document.body.classList.toggle('drawer-open', isOpen);
}

//  Login / logout / Session 
function showApp() {
  const loginEl = $('login');
  const appEl = $('app');
  if (loginEl) {
    loginEl.style.display = 'none';
    loginEl.removeAttribute('hidden');
  }
  if (appEl) {
    appEl.style.display = 'block';
    appEl.removeAttribute('hidden');
  }
}

function showLogin() {
  const loginEl = $('login');
  const appEl = $('app');
  if (appEl) {
    appEl.style.display = 'none';
    appEl.removeAttribute('hidden');
  }
  if (loginEl) {
    loginEl.style.display = 'flex';
    loginEl.removeAttribute('hidden');
  }
}

function togglePasswordVisibility() {
  const pw = $('pw');
  const ic = $('togglePwIcon');
  if (!pw) return;
  if (pw.type === 'password') {
    pw.type = 'text';
    if (ic) ic.className = 'bi bi-eye-slash';
  } else {
    pw.type = 'password';
    if (ic) ic.className = 'bi bi-eye';
  }
}

function doLogin(e) {
  if (e) {
    if (e.preventDefault) e.preventDefault();
    if (e.stopPropagation) e.stopPropagation();
  }
  const la = $('loginAlert');
  if (la) { la.style.display = 'none'; la.textContent = ''; }
  const b = $('lb');
  if (b) {
    b.disabled = true;
    b.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span>Memeriksa...';
  }
  S.t = null;
  const username = $('u') ? $('u').value.trim() : '';
  const password = $('pw') ? $('pw').value.trim() : '';
  if (!username || !password) {
    if (la) { la.textContent = 'Harap isi nama pengguna dan kata sandi.'; la.style.display = 'block'; }
    toast('Harap isi nama pengguna dan kata sandi.', 'wn');
    if (b) { b.disabled = false; b.innerHTML = 'Masuk ke Portal'; }
    return false;
  }
  call('login', { u: username, pw: password })
    .then(d => {
      if (!d || !d.token || !d.user) {
        throw new Error('Data sesi masuk tidak valid.');
      }
      S.t = d.token;
      S.u = d.user;
      SafeStorage.set("smpn2_token", d.token); SafeStorage.set("smpn2_user", JSON.stringify(d.user));
      if ($('pw')) $('pw').value = '';
      if (b) b.innerHTML = '<i class="bi bi-check-circle me-1"></i> Berhasil Masuk';
      start();
    })
    .catch(err => {
      console.error('Login gagal:', err);
      const msg = (err && err.message) || 'Nama pengguna atau kata sandi salah.';
      if (la) {
        la.innerHTML = '<i class="bi bi-exclamation-circle-fill me-1"></i> ' + esc(msg);
        la.style.display = 'block';
      }
      toast(msg, 'err');
      if (b) {
        b.disabled = false;
        b.innerHTML = 'Masuk ke Portal';
      }
      showLogin();
    })
    .finally(() => {
      setTimeout(() => {
        if (b && $('login') && $('login').style.display !== 'none') {
          b.disabled = false;
          b.innerHTML = 'Masuk ke Portal';
        }
      }, 800);
    });
  return false;
}

function out(silent) {
  toggleDrawer(false);
  stopCam(); closeModal();
  SafeStorage.remove("smpn2_token"); SafeStorage.remove("smpn2_user");
  if (!silent && S.t) apiLogout(S.t);
  rcClear();
  S.t = S.u = S.rk = S.sw = null;
  showLogin();
  const b = $('lb');
  if (b) { b.disabled = false; b.innerHTML = 'Masuk ke Portal'; }
}

//  Navigasi SPA 
const NAV = {
  guru: [
    ['dash', 'Dasboard', 'speedometer2'],
    ['scan', 'Scan', 'qr-code-scan'],
    ['siswa', 'Data Siswa', 'people'],
    ['guru', 'Data Guru', 'person-badge'],
    ['rekap', 'Rekap Presensi', 'table'],
    ['pel', 'Pelanggaran', 'exclamation-triangle'],
    ['rekap_pel', 'Rekap Pelanggaran', 'file-earmark-ruled'],
    ['prestasi', 'Prestasi Siswa', 'award'],
    ['rekap_prestasi', 'Rekap Prestasi', 'file-earmark-bar-graph'],
    ['rank', 'Peringkat', 'trophy']
  ],
  admin: [
    ['dash', 'Dasboard', 'speedometer2'],
    ['scan', 'Scan', 'qr-code-scan'],
    ['siswa', 'Data Siswa', 'people'],
    ['guru', 'Data Guru', 'person-badge'],
    ['akun', 'Kelola Akun', 'person-gear'],
    ['rekap', 'Rekap Presensi', 'table'],
    ['pel', 'Pelanggaran', 'exclamation-triangle'],
    ['rekap_pel', 'Rekap Pelanggaran', 'file-earmark-ruled'],
    ['prestasi', 'Prestasi Siswa', 'award'],
    ['rekap_prestasi', 'Rekap Prestasi', 'file-earmark-bar-graph'],
    ['rank', 'Peringkat', 'trophy'],
    ['admin', 'Pengaturan', 'gear']
  ]
};

function start() {
  try {
    if (!S.u) throw new Error('Data profil pengguna kosong.');
    const rawRole = String(S.u.role || 'guru').toLowerCase();
    const role = rawRole.includes('admin') ? 'admin' : 'guru';
    const n = NAV[role] || NAV.guru;
    const l = n.map(x => `<a href="javascript:void(0)" data-p="${x[0]}"><i class="bi bi-${x[2]}"></i><span>${x[1]}</span></a>`).join('');
    
    if ($('side')) {
      $('side').innerHTML = '<div class="brand"><img src="' + LOGO + '" alt="Logo SMPN 2 Ulubongka" class="app-logo"><div><b>SMPN 2 Ulubongka</b><small>PRESENSI DIGITAL</small></div></div>' + l;
      $('side').addEventListener('click',function(ev){var a=ev.target.closest('[data-p]');if(a){ev.preventDefault();nav(a.dataset.p);}});
    }
    var bnavEl=$('bnav'); if(bnavEl){bnavEl.innerHTML=l; bnavEl.addEventListener('click',function(ev){var a=ev.target.closest('[data-p]');if(a){ev.preventDefault();nav(a.dataset.p);}});}
    const dn = $('drawerNav');
    if(dn){dn.innerHTML=l; dn.addEventListener('click',function(ev){var a=ev.target.closest('[data-p]');if(a){ev.preventDefault();nav(a.dataset.p);}});}
    const du = $('drawerUserInfo');
    if (du) {
      du.innerHTML = `
        <div class="d-flex align-items-center gap-2">
          <div style="width:36px;height:36px;border-radius:50%;background:rgba(56,152,236,.25);color:var(--pri2);display:flex;align-items:center;justify-content:center;font-weight:700">
            ${esc((S.u.nama || S.u.username || 'U').charAt(0).toUpperCase())}
          </div>
          <div class="min-w-0 flex-grow-1">
            <div class="fw-bold text-truncate text-white" style="font-size:13px">${esc(S.u.nama || S.u.username)}</div>
            <span class="badge-role ${role === 'admin' ? 'badge-admin' : 'badge-guru'}" style="font-size:10px">
              ${role === 'admin' ? 'Administrator' : 'Guru / Staf'}
            </span>
          </div>
        </div>
      `;
    }
    
    showApp();
    nav(n[0][0]);
    prefetchApp();
  } catch (err) {
    console.error('Error starting app UI:', err);
    toast('Gagal memuat portal: ' + err.message, 'err');
    showLogin();
    const b = $('lb');
    if (b) { b.disabled = false; b.innerHTML = 'Masuk ke Portal'; }
    const la = $('loginAlert');
    if (la) { la.innerHTML = '<i class="bi bi-exclamation-triangle-fill me-1"></i> Gagal memuat antarmuka: ' + esc(err.message); la.style.display = 'block'; }
  }
}

// Inisialisasi otomatis jika token tersimpan di sessionStorage
// Inisialisasi otomatis jika token tersimpan di sessionStorage
function initSavedSession() {
  try {
    const savedToken = SafeStorage.get('smpn2_token');
    const savedUser = SafeStorage.get('smpn2_user');
    if (savedToken && savedUser) {
      S.t = savedToken;
      S.u = JSON.parse(savedUser);
      start();
      return;
    }
  } catch (eInit) {}
  showLogin();
}

function attachEvents() {
  if (window._eventsAttached) return;
  window._eventsAttached = true;

  
  const lf = document.getElementById('loginForm');
  if (lf) {
    lf.onsubmit = function(e) {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      doLogin(e);
      return false;
    };
  }

  
  const lb = document.getElementById('lb');
  if (lb) {
    lb.onclick = function(e) {
      const u = document.getElementById('u');
      const pw = document.getElementById('pw');
      if (u && pw && u.value && pw.value) {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        doLogin(e);
      }
    };
  }

  
  const tpb = document.getElementById('togglePwBtn');
  if (tpb) tpb.onclick = togglePasswordVisibility;

  
  const dov = document.getElementById('drawerOverlay');
  if (dov) dov.onclick = function() { toggleDrawer(false); };

  
  const btnClose = document.getElementById('btnCloseDrawer');
  if (btnClose) btnClose.onclick = function() { toggleDrawer(false); };

  const btnDrawerTheme = document.getElementById('btnDrawerTheme');
  if (btnDrawerTheme) btnDrawerTheme.onclick = theme;

  const btnDrawerOut = document.getElementById('btnDrawerOut');
  if (btnDrawerOut) btnDrawerOut.onclick = function() { out(); };

  
  const btnOpen = document.getElementById('btnOpenDrawer');
  if (btnOpen) btnOpen.onclick = function() { toggleDrawer(true); };

  const btnTopTheme = document.getElementById('btnTopTheme');
  if (btnTopTheme) btnTopTheme.onclick = theme;

  const btnTopOut = document.getElementById('btnTopOut');
  if (btnTopOut) btnTopOut.onclick = function() { out(); };

  
  const mbox = document.getElementById('modalBox');
  if (mbox) mbox.onclick = function(e) { if (e.target === this) closeModal(); };

  
  initSavedSession();
}

// Pasang ke window agar selalu dapat diakses secara global di peramban dan sandbox GAS
window.doLogin = doLogin;
window.togglePasswordVisibility = togglePasswordVisibility;
window.theme = theme;
window.out = out;
window.nav = nav;
window.toggleDrawer = toggleDrawer;
window.openModal = openModal;
window.closeModal = closeModal;
window.showLogin = showLogin;
window.showApp = showApp;
window.start = start;

// Jalankan attachEvents segera dan jadwalkan dengan listener sebagai fallback
// Ditunda sampai seluruh berkas ini selesai dimuat (PG, NAV, dst. harus sudah terdefinisi sebelum nav() dipanggil)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', attachEvents);
} else {
  setTimeout(attachEvents, 0);
}
window.addEventListener('load', attachEvents);
setTimeout(attachEvents, 100);
setTimeout(attachEvents, 500);

function nav(p) {
  try {
    S.curPage = p;
    toggleDrawer(false);
    stopCam(); closeModal();
    if (S.ch) {
      try { S.ch.destroy(); } catch (e) {}
      S.ch = null;
    }
    document.querySelectorAll('[data-p]').forEach(a => a.classList.toggle('on', a.dataset.p === p));
    const role = (S.u && S.u.role ? S.u.role.toLowerCase() : 'guru');
    const navList = NAV[role] || NAV.guru;
    const t = navList.find(x => x[0] === p);
    $('ttl').textContent = t ? t[1] : '';
    $('view').innerHTML = '<div class="skl"></div>';
    if (typeof PG[p] === 'function') {
      PG[p]();
    } else {
      $('view').innerHTML = '<div class="alert alert-warning m-3">Menu tidak tersedia.</div>';
    }
    const activeBnav = document.querySelector(`.bnav a[data-p="${p}"]`);
    if (activeBnav && typeof activeBnav.scrollIntoView === 'function') {
      activeBnav.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  } catch (err) {
    console.error('Navigation error:', err);
    toast('Navigasi gagal: ' + err.message, 'err');
    $('view').innerHTML = '<div class="alert alert-danger m-3">Gagal memuat konten halaman: ' + esc(err.message) + '</div>';
  }
}

//  Komponen kecil 
const BD = { Hadir: ['check-circle-fill', 'ok'], Terlambat: ['clock-fill', 'wn'], Alpa: ['x-circle-fill', 'er'], Izin: ['file-text-fill', 'iz'], Sakit: ['file-text-fill', 'iz'] };
const bdg = s => { const b = BD[s] || ['dash-circle', 'mu']; return `<span class="bs ${b[1]}"><i class="bi bi-${b[0]}"></i>${esc(s)}</span>`; };
const jm = t => t ? esc(t.slice(0, 5)) + ' WITA' : '-';
const hm = m => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
const bulanIni = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); };
const kpi = a => `<div class="row g-3 mb-3">${a.map(x => `<div class="col-6 col-lg-3"><div class="cardx kpi mb-0"><small>${x[0]}</small><b>${x[1]}</b></div></div>`).join('')}</div>`;
const stats = d => kpi([['Hadir', d.st.Hadir], ['Terlambat', d.st.Terlambat], ['Izin / Sakit', (d.st.Izin || 0) + (d.st.Sakit || 0)], ['Persentase', d.pct + '%']]);

const PG = {
  siswa() {
    S.sw = S.sw || { q: '', kelas: '', status: '' };
    const isAdmin = S.u && S.u.role === 'admin';
    $('view').innerHTML = `
      <div class="cardx">
        <div class="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
          <div>
            <h5 class="mb-0 fw-bold">Data Induk Siswa</h5>
            <small class="mut">Kelola data siswa, pas foto, penempatan kelas, status aktif, dan cetak kartu tanda pelajar</small>
          </div>
          <div class="d-flex gap-2 flex-wrap">
            <button class="btn-out flex-grow-1 flex-md-grow-0" onclick="cetakKartuPerKelas()"><i class="bi bi-printer me-1"></i> Cetak Kartu Per Kelas</button>
            ${isAdmin ? `<button class="btn-pri flex-grow-1 flex-md-grow-0" onclick="bukaFormSiswa()"><i class="bi bi-person-plus-fill"></i> Tambah Siswa</button>` : ''}
          </div>
        </div>
        <div class="row g-2 align-items-end">
          <div class="col-12 col-md-5">
            <label class="mb-1" for="sw_q">Cari Nama / NIS</label>
            <input id="sw_q" class="form-control" placeholder="Ketik nama atau NIS..." value="${esc(S.sw.q)}" oninput="clearTimeout(S.sw_t);S.sw_t=setTimeout(()=>{S.sw.q=this.value;loadSiswa()},300)">
          </div>
          <div class="col-6 col-md-3">
            <label class="mb-1" for="sw_k">Kelas</label>
            <select id="sw_k" class="form-select" onchange="S.sw.kelas=this.value;loadSiswa()"><option value="">Semua Kelas</option></select>
          </div>
          <div class="col-6 col-md-4">
            <label class="mb-1" for="sw_st">Status</label>
            <select id="sw_st" class="form-select" onchange="S.sw.status=this.value;loadSiswa()">
              <option value="">Semua Status</option>
              <option value="Aktif">Aktif Saja</option>
              <option value="Nonaktif">Nonaktif Saja</option>
            </select>
          </div>
        </div>
      </div>
      <div id="sw_kpi"></div>
      <div id="sw_list"></div>
    `;
    loadSiswa();
  },
  guru() {
    const isAdmin = S.u && S.u.role === 'admin';
    $('view').innerHTML = `
      <div class="cardx">
        <div class="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-2">
          <div>
            <h5 class="mb-0 fw-bold">Data Guru</h5>
            <small class="mut">Kelola data guru, wali kelas, dan Guru Wali. Dipakai otomatis di Data Siswa dan tanda tangan laporan</small>
          </div>
          ${isAdmin ? `<button class="btn-pri flex-grow-1 flex-md-grow-0" onclick="bukaFormGuru()"><i class="bi bi-person-plus-fill"></i> Tambah Guru</button>` : ''}
        </div>
        <div class="row g-2 align-items-end mt-2">
          <div class="col-12 col-md-7"><label class="mb-1" for="gr_q">Cari Nama / NIP / Jabatan</label><input id="gr_q" class="form-control" placeholder="Ketik nama, NIP, atau jabatan..." oninput="filterGuru()"></div>
          <div class="col-12 col-md-5"><label class="mb-1" for="gr_f">Filter Peran</label>
            <select id="gr_f" class="form-select" onchange="filterGuru()"><option value="">Semua</option><option value="wk">Wali Kelas</option><option value="wm">Guru Wali</option><option value="no">Bukan Wali</option></select></div>
        </div>
      </div>
      <div id="gr_kpi"></div>
      <div id="gr_list"></div>
    `;
    loadGuru();
  },
  prestasi() {
    const d = new Date(), iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    $('view').innerHTML = `
      <div class="row g-3">
        <div class="col-lg-5">
          <form class="cardx" onsubmit="savePrestasi(event)">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="fw-bold mb-0">Catat Prestasi Siswa</h5>
              <button type="button" class="btn-out btn-sm" onclick="nav('rekap_prestasi')"><i class="bi bi-file-earmark-bar-graph me-1"></i> Rekap Prestasi</button>
            </div>
            <label for="pr_s">Siswa (Nama / NIS) <span class="text-danger">*</span></label>
            <input id="pr_s" class="form-control" autocomplete="off" placeholder="Ketik nama atau NIS siswa..." oninput="cariSiswaPr(this.value)" required>
            <div id="pr_c" class="sug"></div>
            <input type="hidden" id="pr_id">
            <label for="pr_t">Tanggal <span class="text-danger">*</span></label>
            <input id="pr_t" type="date" class="form-control" value="${iso}" max="${iso}" required onchange="hariPr()">
            <small class="mut" id="pr_h"></small>
            <label for="pr_j">Jenis Prestasi <span class="text-danger">*</span></label>
            <select id="pr_j" class="form-select"><option value="Akademik">Akademik</option><option value="Non-Akademik">Non-Akademik</option></select>
            <label for="pr_n">Nama Prestasi <span class="text-danger">*</span></label>
            <input id="pr_n" class="form-control" maxlength="200" required placeholder="Contoh: Juara 1 Olimpiade Matematika Tingkat Kabupaten">
            <button class="btn-pri w-100 mt-4"><i class="bi bi-award-fill me-1"></i> Simpan Prestasi</button>
          </form>
        </div>
        <div class="col-lg-7" id="pr_l"></div>
      </div>
    `;
    hariPr();
    loadPrestasi();
  },
  rekap_prestasi() {
    const R = S.rk_pr = S.rk_pr || { bulan: bulanIni(), kelas: '', jenis: '', q: '' };
    $('view').innerHTML = `
      <div class="cardx">
        <div class="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
          <div>
            <h5 class="mb-0 fw-bold">Rekapitulasi Prestasi Siswa</h5>
            <small class="mut">Laporan prestasi akademik dan non-akademik siswa. Kosongkan bulan untuk melihat semua periode</small>
          </div>
          <div class="d-flex gap-2 flex-wrap">
            <button class="btn-out flex-grow-1 flex-md-grow-0" onclick="nav('prestasi')"><i class="bi bi-plus-circle me-1"></i> Catat Prestasi</button>
            <button class="btn-pri flex-grow-1 flex-md-grow-0" onclick="cetakRekapPrestasi()"><i class="bi bi-printer"></i> Cetak / Ekspor PDF</button>
          </div>
        </div>
        <div class="row g-2 align-items-end">
          <div class="col-6 col-md-3"><label for="rpr_b" class="mb-1">Bulan</label><input id="rpr_b" type="month" class="form-control" value="${R.bulan}" onchange="S.rk_pr.bulan=this.value;loadRekapPrestasi()"></div>
          <div class="col-6 col-md-3"><label for="rpr_k" class="mb-1">Kelas</label><select id="rpr_k" class="form-select" onchange="S.rk_pr.kelas=this.value;loadRekapPrestasi()"><option value="">Semua Kelas</option></select></div>
          <div class="col-6 col-md-3"><label for="rpr_j" class="mb-1">Jenis</label><select id="rpr_j" class="form-select" onchange="S.rk_pr.jenis=this.value;loadRekapPrestasi()"><option value="">Semua Jenis</option><option value="Akademik"${R.jenis === 'Akademik' ? ' selected' : ''}>Akademik</option><option value="Non-Akademik"${R.jenis === 'Non-Akademik' ? ' selected' : ''}>Non-Akademik</option></select></div>
          <div class="col-6 col-md-3"><label for="rpr_q" class="mb-1">Cari</label><input id="rpr_q" class="form-control" placeholder="Nama, NIS, prestasi..." value="${esc(R.q)}" oninput="clearTimeout(S.dpr);S.dpr=setTimeout(()=>{S.rk_pr.q=this.value;loadRekapPrestasi()},350)"></div>
        </div>
      </div>
      <div id="rpr_kpi"></div>
      <div id="rpr_list"></div>
    `;
    loadRekapPrestasi();
  },
  akun() {
    $('view').innerHTML = `
      <div class="cardx">
        <div class="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-2">
          <div>
            <h5 class="mb-0 fw-bold">Kelola Akun Pengguna</h5>
            <small class="mut">Atur hak akses akun Guru dan Administrator yang dapat masuk ke portal presensi</small>
          </div>
          <button class="btn-pri flex-grow-1 flex-md-grow-0" onclick="bukaFormAkun()"><i class="bi bi-person-plus-fill"></i> Tambah Akun Baru</button>
        </div>
        <div class="row g-2 align-items-end mt-2">
          <div class="col-12 col-md-7">
            <label class="mb-1" for="ak_q">Cari Nama / Username</label>
            <input id="ak_q" class="form-control" placeholder="Ketik nama atau username akun..." oninput="filterAkun()">
          </div>
          <div class="col-12 col-md-5">
            <label class="mb-1" for="ak_p">Filter Peran</label>
            <select id="ak_p" class="form-select" onchange="filterAkun()">
              <option value="">Semua Peran</option>
              <option value="Admin">Administrator</option>
              <option value="Guru">Guru / Staf</option>
            </select>
          </div>
        </div>
      </div>
      <div id="ak_kpi"></div>
      <div id="ak_list"></div>
    `;
    loadAkun();
  },
  scan() {
    $('view').innerHTML = `
      <div id="hbanner"></div>
      <div class="cardx text-center">
        <h5 class="fw-bold mb-1">Presensi Scan QR Siswa</h5>
        <p class="mut mb-3">Pindai kode QR pada kartu tanda pelajar siswa untuk mencatat presensi masuk &amp; pulang.</p>
        
        <div id="camWrap" style="display:none;max-width:340px;margin:0 auto 12px">
          <div class="d-flex gap-2 align-items-center justify-content-center">
            <span class="small fw-bold text-nowrap"><i class="bi bi-camera-video"></i> Kamera:</span>
            <select id="camSel" class="form-select form-select-sm" onchange="changeCam(this.value)" aria-label="Pilih Kamera"></select>
          </div>
        </div>

        <div id="rd" class="rd mb-2"></div>
        <div id="camInfo" class="alert alert-warning py-3 px-3 small text-start mx-auto mb-3" style="display:none;max-width:480px;border-radius:12px"></div>

        <div class="d-flex gap-2 justify-content-center flex-wrap mb-3 scan-actions-wrap">
          <label class="btn-pri d-inline-flex align-items-center justify-content-center gap-2" style="cursor:pointer;margin:0;padding:12px 24px;font-size:15px;box-shadow:0 4px 14px rgba(56,152,236,.4)">
            <i class="bi bi-camera-fill fs-5"></i>
            <span>Ambil Foto (Kamera)</span>
            <input type="file" id="camSnap" accept="image/png,image/jpeg,image/jpg" capture="environment" style="display:none" onchange="scanFromFile(this)">
          </label>

          <button id="btnCam" class="btn-out d-inline-flex align-items-center gap-2" style="margin:0" onclick="toggleCam()">
            <i class="bi bi-camera-video"></i>
            <span>Buka Kamera Live</span>
          </button>

          <label class="btn-out d-inline-flex align-items-center gap-2" style="cursor:pointer;margin:0">
            <i class="bi bi-image"></i>
            <span>Pilih File / Galeri</span>
            <input type="file" id="camFile" accept="image/png,image/jpeg,image/jpg" style="display:none" onchange="scanFromFile(this)">
          </label>
        </div>

        <div id="scanPhotoStatus" style="display:none;max-width:480px;margin:0 auto 12px;border-radius:12px"></div>

        <div class="p-2 px-3 mx-auto rounded border small mb-3 text-start" style="max-width:480px;background:rgba(56,152,236,.06)">
          <i class="bi bi-lightbulb-fill text-warning me-1"></i>
          <b>Menu Ambil Foto (Kamera):</b> Arahkan kamera HP ke kartu pelajar siswa untuk memindai presensi secara cepat tanpa kendala izin streaming peramban.
        </div>

        <div class="text-start border-top pt-3 mt-3">
          <label for="mk" class="mb-1">Atau masukkan NIS / Kode QR siswa secara manual:</label>
          <div class="d-flex gap-2 flex-column flex-sm-row">
            <input id="mk" class="form-control" autocomplete="off" placeholder="Ketik NIS lalu tekan Enter..." onkeydown="if(event.key==='Enter')sendCode(this.value)">
            <button class="btn-pri text-nowrap" onclick="sendCode($('mk').value)"><i class="bi bi-send-fill me-1"></i> Kirim</button>
          </div>
        </div>
        <div class="text-start border-top pt-3 mt-3">
          <label for="izNis" class="mb-1"><i class="bi bi-journal-medical me-1 text-info"></i>Catat Izin / Sakit (masukkan NIS siswa):</label>
          <div class="row g-2">
            <div class="col-12 col-sm-5"><input id="izNis" class="form-control" autocomplete="off" placeholder="Ketik NIS atau nama siswa" oninput="izCari(this.value)" onkeydown="if(event.key==='Enter'){event.preventDefault();sendIzin()}"></div>
            <div class="col-6 col-sm-3"><select id="izStatus" class="form-select"><option value="Izin">Izin</option><option value="Sakit">Sakit</option></select></div>
            <div class="col-6 col-sm-4"><input id="izKet" class="form-control" maxlength="200" placeholder="Keterangan (opsional)"></div>
          </div>
          <div id="izInfo" class="mt-2" style="min-height:22px"></div>
          <button class="btn-out w-100 mt-2" onclick="sendIzin()"><i class="bi bi-check2-square me-1"></i> Simpan Izin / Sakit</button>
        </div>
      </div>
      <div id="sr"></div>
    `;
    detectCameras();
    call('siswaRingkas', 0, { silent: true }).then(d => { S.rg = d || []; izCari(($('izNis') || {}).value || ''); })
      .catch(() => { S.rg = null; diagServer(); });
    call('hariGet', 0, { silent: true }).then(h => {
      const b = $('hbanner');
      if (b && h && h.hariIni && !h.hariIni.aktif) b.innerHTML = `<div class="cardx mb-3" style="background:rgba(245,158,11,.14);border:1px solid rgba(245,158,11,.5)"><b><i class="bi bi-calendar-x me-1 text-warning"></i>Hari ini libur: ${esc(h.hariIni.ket)}</b><div class="mut small">Scan dan catatan izin/sakit tidak dapat disimpan pada hari libur.</div></div>`; else if (b) b.innerHTML = '';
    }).catch(() => {});
  },
  dash() {
    go('dashboard', 0, d => {
      try {
        if (S.curPage !== 'dash') return;
        const v = $('view');
        if (!v) return;
        d = d || {};
        const c = d.c || { Hadir: 0, Terlambat: 0, Izin: 0, Sakit: 0, Alpa: 0 };
        const total = d.total || 0;
        const belum = d.belum || 0;
        const pel = d.pel || 0;
        const per = d.per || {};
        const trend = Array.isArray(d.trend) ? d.trend : [];
        const m = (c.Hadir || 0) + (c.Terlambat || 0);
        const p = total ? Math.round(m / total * 100) : 0;

        const nowD = new Date();
        const hariIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][nowD.getDay()];
        const tglStr = hariIndo + ', ' + formatTanggalIndo(nowD);
        const jamStr = String(nowD.getHours()).padStart(2, '0') + ':' + String(nowD.getMinutes()).padStart(2, '0') + ' WITA';

        const heroBanner = `
          <div class="cardx hero-dash p-3 p-md-4 mb-3">
            <div class="d-flex flex-column flex-md-row align-items-center align-items-md-start gap-3">
              <div style="background:#ffffff;border-radius:18px;padding:8px;box-shadow:0 6px 16px rgba(0,0,0,0.18);flex-shrink:0">
                <img src="${LOGO}" alt="Logo SMP Negeri 2 Ulubongka" style="width:72px;height:72px;object-fit:contain;display:block">
              </div>
              <div class="text-center text-md-start flex-grow-1 min-w-0">
                <div class="d-inline-flex align-items-center gap-1 px-3 py-1 mb-2 rounded-pill" style="background:rgba(56,152,236,0.25);border:1px solid rgba(56,152,236,0.4);color:#93c5fd;font-size:11px;font-weight:700;letter-spacing:0.8px">
                  <i class="bi bi-shield-check"></i> PORTAL PRESENSI DIGITAL &amp; KESISWAAN
                </div>
                <h3 class="fw-bold mb-1 text-white" style="letter-spacing:-0.02em;font-size:22px">SMP NEGERI 2 ULUBONGKA</h3>
                <div class="d-flex align-items-center justify-content-center justify-content-md-start gap-2 text-white-50 mt-1" style="font-size:12.5px;line-height:1.4">
                  <i class="bi bi-geo-alt-fill text-danger flex-shrink-0"></i>
                  <span>Jl. Gunung Katopas, No. 1, Desa Watusongu, Kec. Ulubongka, Kab. Tojo Una-una</span>
                </div>
                <div class="d-flex flex-wrap gap-2 justify-content-center justify-content-md-start mt-3" style="font-size:11.5px">
                  <span class="badge bg-white bg-opacity-10 text-white border border-white border-opacity-25 px-2 py-1">
                    <i class="bi bi-calendar3 me-1 text-info"></i> ${tglStr}
                  </span>
                  <span class="badge bg-white bg-opacity-10 text-white border border-white border-opacity-25 px-2 py-1">
                    <i class="bi bi-clock me-1 text-warning"></i> ${jamStr}
                  </span>
                  <span class="badge bg-success bg-opacity-25 text-white border border-success border-opacity-50 px-2 py-1">
                    <i class="bi bi-broadcast me-1 text-success"></i> Sistem Aktif
                  </span>
                </div>
              </div>
            </div>
          </div>
        `;

        const liburBanner = d.libur ? `<div class="cardx mb-3" style="background:rgba(245,158,11,.14);border:1px solid rgba(245,158,11,.5)"><b><i class="bi bi-calendar-x me-1 text-warning"></i>Hari ini libur: ${esc(d.libur)}</b><div class="mut small">Presensi tidak dicatat dan siswa tidak ditandai Alpa.</div></div>` : '';
        $('view').innerHTML = heroBanner + liburBanner + kpi([['Hadir Tepat Waktu', c.Hadir || 0], ['Terlambat', c.Terlambat || 0], ['Belum Scan', belum], ['Pelanggaran Bulan Ini', pel]]) +
        `<div class="row g-3"><div class="col-lg-8"><div class="cardx"><b>Tren Kehadiran 14 Hari</b><div style="position:relative;height:clamp(150px,24vh,210px);margin-top:8px"><canvas id="ch" aria-label="Grafik tren kehadiran"></canvas></div></div></div>
        <div class="col-lg-4"><div class="cardx"><b>Per Kelas Hari Ini</b>${Object.keys(per).sort().map(k => { const o = per[k] || { masuk: 0, total: 0 }, q = o.total ? Math.round(o.masuk / o.total * 100) : 0; return `<div class="my-2"><div class="d-flex justify-content-between"><span>${esc(k)}</span><span>${o.masuk}/${o.total} (${q}%)</span></div><div class="prog"><i style="width:${q}%"></i></div></div>`; }).join('') || '<div class="text-muted small py-2">Belum ada data kelas hari ini.</div>'}</div></div></div>
        <div class="cardx ins"><b><i class="bi bi-stars"></i> Analisis Otomatis</b><p class="mb-0">Hari ini ${m} dari ${total} siswa (${p}%) sudah scan masuk, ${c.Terlambat || 0} di antaranya terlambat. ${belum > total * .1 ? 'Masih ' + belum + ' siswa belum scan, perlu dicek.' : 'Tingkat kehadiran terpantau baik.'}</p></div>`;
        
        if (typeof Chart !== 'undefined' && $('ch')) {
          try {
            Chart.defaults.color = getComputedStyle(document.documentElement).getPropertyValue('--mut');
            if (S.ch) { try { S.ch.destroy(); } catch (e) {} }
            S.ch = new Chart($('ch'), {
              type: 'bar',
              data: {
                labels: trend.map(x => String(x[0] || '').slice(5)),
                datasets: [{ label: 'Siswa hadir', data: trend.map(x => x[1] || 0), backgroundColor: '#3898EC', borderRadius: 4, maxBarThickness: 28 }]
              },
              options: {
                plugins: { legend: { display: false }, tooltip: { displayColors: false } },
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 11 } } },
                  y: { beginAtZero: true, border: { display: false }, grid: { color: 'rgba(148,163,184,.15)' }, ticks: { precision: 0, maxTicksLimit: 4, font: { size: 11 } } }
                }
              }
            });
          } catch (eCh) {
            console.warn('Chart init warning:', eCh);
          }
        }
      } catch (eDash) {
        if (S.curPage !== 'dash') return;
        console.error('Error rendering dashboard:', eDash);
        const v = $('view');
        if (v) v.innerHTML = '<div class="cardx alert-danger"><h5>Gagal Memuat Dasboard</h5><p>' + esc(eDash.message) + '</p></div>';
      }
    });
  },
  rekap() {
    const R = S.rk = S.rk || { bulan: bulanIni(), kelas: '', q: '' };
    $('view').innerHTML = `<div class="cardx">
      <div class="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
        <div>
          <h5 class="mb-0 fw-bold">Rekapitulasi Presensi Siswa</h5>
          <small class="mut">Laporan kehadiran, keterlambatan, dan persentase kehadiran bulanan</small>
        </div>
        <div class="d-flex gap-2 flex-wrap">
          <button class="btn-out flex-grow-1 flex-md-grow-0" onclick="cetakRekap()"><i class="bi bi-printer"></i> Cetak Hasil</button>
          <button class="btn-pri flex-grow-1 flex-md-grow-0" onclick="cetakRekapLengkap()"><i class="bi bi-printer-fill"></i> Cetak Lengkap</button>
        </div>
      </div>
      <div class="row g-2 align-items-end">
        <div class="col-6 col-md-3"><label for="rb" class="mb-1">Bulan</label><input id="rb" type="month" class="form-control" value="${R.bulan}" onchange="S.rk.bulan=this.value;loadRekap()"></div>
        <div class="col-6 col-md-3"><label for="rk" class="mb-1">Kelas</label><select id="rk" class="form-select" onchange="S.rk.kelas=this.value;loadRekap()"><option value="">Semua Kelas</option></select></div>
        <div class="col-12 col-md-6"><label for="rq" class="mb-1">Cari nama / NIS</label><input id="rq" class="form-control" placeholder="Cari nama atau NIS siswa..." value="${esc(R.q)}" oninput="clearTimeout(S.dq);S.dq=setTimeout(()=>{S.rk.q=this.value;loadRekap()},350)"></div>
      </div>
    </div><div id="rt"></div>`;
    loadRekap();
  },
  rank() {
    go('peringkat', { bulan: bulanIni() }, d => {
      if (S.curPage !== 'rank') return;
      const v = $('view');
      if (!v) return;
      d = d || { rajin: [], cepat: [] };
      const t = (a, f) => `<div class="cardx"><div class="tw"><table class="tbl"><tbody>${(a || []).map((r, i) => `<tr><td>${i + 1}</td><td>${esc(r.nama)}<small>${esc(r.kelas)}</small></td><td>${f(r)}</td></tr>`).join('') || '<tr><td>Belum ada data.</td></tr>'}</tbody></table></div></div>`;
      v.innerHTML = `<div class="row g-3"><div class="col-lg-6"><h6>Paling Rajin (persentase hadir)</h6>${t(d.rajin, r => r.pct + '%')}</div>
      <div class="col-lg-6"><h6>Paling Cepat Datang (rata-rata jam)</h6>${t(d.cepat, r => hm(r.avg) + ' WITA')}</div></div>`;
    });
  },
  pel() {
    $('view').innerHTML = `
      <div class="row g-3">
        <div class="col-lg-5">
          <form class="cardx" onsubmit="savePel(event)">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="fw-bold mb-0">Catat Pelanggaran Siswa</h5>
              <button type="button" class="btn-out btn-sm" onclick="nav('rekap_pel')"><i class="bi bi-file-earmark-ruled me-1"></i> Rekap Pelanggaran</button>
            </div>
            
            <label for="ps">Siswa (Nama / NIS / NISN) <span class="text-danger">*</span></label>
            <input id="ps" class="form-control" autocomplete="off" placeholder="Ketik nama, NIS, atau NISN siswa..." oninput="cariSiswa(this.value)" required>
            <div id="pc" class="sug"></div>
            <input type="hidden" id="pid">

            <label for="pj">Catatan / Jenis Pelanggaran Siswa <span class="text-danger">*</span></label>
            <textarea id="pj" class="form-control" rows="3" placeholder="Tuliskan jenis / catatan pelanggaran siswa secara bebas (langsung diketik oleh guru)..." maxlength="400" required></textarea>
            <small class="mut">Tuliskan catatan pelanggaran secara bebas sesuai kejadian di sekolah (tidak dibatasi pilihan baku).</small>

            <label for="pt">Tindakan / Pembinaan Diberikan <span class="text-danger">*</span></label>
            <input id="pt" class="form-control" placeholder="Contoh: Teguran lisan, nasihat, pembinaan guru piket, pemanggilan orang tua..." maxlength="200" required>

            <button class="btn-pri w-100 mt-4"><i class="bi bi-whatsapp me-1 text-white"></i> Simpan &amp; Siapkan Notifikasi WhatsApp</button>
          </form>
        </div>
        <div class="col-lg-7" id="pl"></div>
      </div>
    `;
    loadPel();
  },
  rekap_pel() {
    const R = S.rk_pel = S.rk_pel || { bulan: bulanIni(), kelas: '', q: '' };
    $('view').innerHTML = `
      <div class="cardx">
        <div class="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
          <div>
            <h5 class="mb-0 fw-bold">Rekapitulasi Pelanggaran Siswa</h5>
            <small class="mut">Laporan catatan pelanggaran, pembinaan kesiswaan, dan notifikasi orang tua</small>
          </div>
          <div class="d-flex gap-2 flex-wrap">
            <button class="btn-out flex-grow-1 flex-md-grow-0" onclick="nav('pel')"><i class="bi bi-plus-circle me-1"></i> Catat Pelanggaran</button>
            <button class="btn-pri flex-grow-1 flex-md-grow-0" onclick="cetakRekapPelanggaran()"><i class="bi bi-printer"></i> Cetak / Ekspor PDF</button>
          </div>
        </div>
        <div class="row g-2 align-items-end">
          <div class="col-6 col-md-3">
            <label for="rpb" class="mb-1">Bulan</label>
            <input id="rpb" type="month" class="form-control" value="${R.bulan}" onchange="S.rk_pel.bulan=this.value;loadRekapPelanggaran()">
          </div>
          <div class="col-6 col-md-3">
            <label for="rpk" class="mb-1">Kelas</label>
            <select id="rpk" class="form-select" onchange="S.rk_pel.kelas=this.value;loadRekapPelanggaran()">
              <option value="">Semua Kelas</option>
            </select>
          </div>
          <div class="col-12 col-md-6">
            <label for="rpq" class="mb-1">Cari Nama / NIS / Pelanggaran</label>
            <input id="rpq" class="form-control" placeholder="Ketik nama siswa, NIS, jenis, atau tindakan..." value="${esc(R.q)}" oninput="clearTimeout(S.dpq);S.dpq=setTimeout(()=>{S.rk_pel.q=this.value;loadRekapPelanggaran()},350)">
          </div>
        </div>
      </div>
      <div id="rp_kpi"></div>
      <div id="rp_list"></div>
    `;
    loadRekapPelanggaran();
  },
  admin() {
    $('view').innerHTML = `
      <div class="cardx">
        <h5 class="fw-bold mb-1">Pengaturan Presensi &amp; Jam Operasional</h5>
        <small class="mut d-block mb-3">Atur jam buka gerbang, batas hadir tepat waktu, batas toleransi, jam pulang minimal, dan tahun ajaran aktif</small>
        <div id="ab"><div class="skl"></div></div>
      </div>
      <div class="cardx" id="hl"><div class="skl"></div></div>
    `;
    ADM.cfg();
    loadHari();
  }
};

//  Scan QR (kamera multi-perangkat + file + manual) 
function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = 'sine'; osc.frequency.setValueAtTime(880, ctx.currentTime);
    g.gain.setValueAtTime(0.12, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.15);
  } catch (e) {}
}

function detectCameras() {
  if (!window.Html5Qrcode || !Html5Qrcode.getCameras) return;
  Html5Qrcode.getCameras().then(devices => {
    if (devices && devices.length > 0) {
      const sel = $('camSel'), wrap = $('camWrap');
      if (sel) {
        sel.innerHTML = devices.map((d, i) => `<option value="${esc(d.id)}">${esc(d.label || ('Kamera ' + (i + 1)))}</option>`).join('');
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1);
        if (isMobile) {
          const back = devices.find(d => /back|rear|belakang|environment/i.test(d.label || ''));
          if (back) sel.value = back.id;
        } else {
          sel.value = devices[0].id;
        }
      }
      if (wrap && devices.length > 1) wrap.style.display = 'block';
    }
  }).catch(() => {});
}

function toggleCam() {
  if (S.cam && S.cam.isScanning) {
    stopCam();
  } else {
    startCam();
  }
}

async function changeCam(id) {
  if (S.cam) {
    try {
      if (S.cam.isScanning) await S.cam.stop();
      S.cam.clear();
    } catch (e) {}
    S.cam = null;
  }
  startCam(id);
}

async function startCam(preferredId) {
  if (!window.Html5Qrcode) return toast('Pustaka kamera gagal dimuat. Muat ulang halaman.', 'err');
  if (S.cam && S.cam.isScanning) { stopCam(); return; }

  const btn = $('btnCam');
  const info = $('camInfo');
  if (info) info.style.display = 'none';

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Menghubungkan...';
  }

  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Peramban ini tidak mendukung akses kamera live streaming atau halaman belum dibuka dengan protokol HTTPS.');
    }

    let cameras = [];
    try {
      cameras = await Html5Qrcode.getCameras();
    } catch (e) {
      console.warn('Html5Qrcode.getCameras:', e);
    }

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1);
    const sel = $('camSel'), wrap = $('camWrap');
    let chosenCameraId = null;

    if (cameras && cameras.length > 0) {
      if (sel) {
        sel.innerHTML = cameras.map((d, i) => `<option value="${esc(d.id)}">${esc(d.label || ('Kamera ' + (i + 1)))}</option>`).join('');
        if (wrap && cameras.length > 1) wrap.style.display = 'block';
      }

      if (preferredId && cameras.some(c => c.id === preferredId)) {
        chosenCameraId = preferredId;
      } else if (isMobile) {
        const back = cameras.find(d => /back|rear|belakang|environment/i.test(d.label || ''));
        chosenCameraId = back ? back.id : (cameras[cameras.length - 1].id || cameras[0].id);
      } else {
        chosenCameraId = cameras[0].id;
      }

      if (sel && chosenCameraId) sel.value = chosenCameraId;
    }

    if (S.cam) {
      try { if (S.cam.isScanning) await S.cam.stop(); S.cam.clear(); } catch (e) {}
      S.cam = null;
    }
    const rd = $('rd');
    if (rd) rd.innerHTML = '';

    const config = {
      fps: 10,
      qrbox: (w, h) => {
        const s = Math.floor(Math.min(w, h) * 0.75);
        return { width: Math.max(160, s), height: Math.max(160, s) };
      }
    };

    const onScan = tx => {
      if (S.last === tx && Date.now() - S.lt < 3000) return;
      S.last = tx; S.lt = Date.now();
      beep();
      sendCode(tx);
    };

    async function tryStart(source) {
      if (!S.cam) S.cam = new Html5Qrcode('rd');
      try {
        await S.cam.start(source, config, onScan);
        return true;
      } catch (e) {
        console.warn('Gagal start kamera dengan:', source, e);
        try { if (S.cam.isScanning) await S.cam.stop(); S.cam.clear(); } catch (e2) {}
        S.cam = null;
        if (rd) rd.innerHTML = '';
        return false;
      }
    }

    let started = false;
    if (chosenCameraId) {
      started = await tryStart(chosenCameraId);
    }
    if (!started) {
      if (isMobile) {
        started = await tryStart({ facingMode: 'environment' });
        if (!started) started = await tryStart({ facingMode: 'user' });
      } else {
        started = await tryStart({ facingMode: 'user' });
        if (!started) started = await tryStart({ facingMode: 'environment' });
      }
    }
    if (!started) {
      started = await tryStart(true);
    }

    if (!started) {
      throw new Error('Akses streaming kamera langsung dibatasi oleh sistem izin browser atau kebijakan keamanan iframe Google Apps Script.');
    }

    if (btn) {
      btn.disabled = false;
      btn.className = 'btn-out mt-3';
      btn.innerHTML = '<i class="bi bi-camera-video-off"></i> Tutup Kamera Live';
    }
  } catch (err) {
    console.error('Camera start error:', err);
    if (S.cam) {
      try { if (S.cam.isScanning) await S.cam.stop(); S.cam.clear(); } catch (e) {}
      S.cam = null;
    }
    const rd = $('rd');
    if (rd) rd.innerHTML = '';

    let msg = 'Kamera streaming tidak dapat dibuka.';
    const errStr = (typeof err === 'string') ? err : ((err && (err.message || err.name)) ? (err.name ? err.name + ': ' + err.message : err.message) : String(err || ''));
    if (/NotAllowed|Permission|Security/i.test(errStr)) {
      msg = 'Izin streaming kamera dibatasi oleh peramban di dalam iframe portal.';
    } else if (/NotFound|DevicesNotFound/i.test(errStr)) {
      msg = 'Kamera tidak ditemukan pada perangkat Anda.';
    } else if (/NotReadable|TrackStart/i.test(errStr)) {
      msg = 'Kamera sedang digunakan aplikasi lain (Zoom, Meet, WhatsApp, dsb).';
    } else if (err && err.message) {
      msg = err.message;
    }

    const info = $('camInfo');
    if (info) {
      info.style.display = 'block';
      info.innerHTML = `
        <div class="d-flex align-items-start gap-2">
          <i class="bi bi-exclamation-triangle-fill text-warning fs-4 flex-shrink-0"></i>
          <div>
            <b class="d-block text-dark mb-1">${esc(msg)}</b>
            <div class="mut mb-2">Streaming video langsung terkendala oleh izin browser atau kebijakan keamanan iframe Google Apps Script.</div>
            <button type="button" class="btn-pri btn-sm" onclick="$('camSnap').click()">
              <i class="bi bi-camera-fill me-1"></i> Beralih ke Ambil Foto (Kamera) Sekarang
            </button>
          </div>
        </div>
      `;
    } else {
      toast(msg, 'err');
    }

    if (btn) {
      btn.disabled = false;
      btn.className = 'btn-out mt-3';
      btn.innerHTML = '<i class="bi bi-camera-video"></i> Buka Kamera Live';
    }
  }
}

function stopCam() {
  if (S.cam) {
    const c = S.cam; S.cam = null;
    try {
      if (c.isScanning) {
        c.stop().then(() => { try { c.clear(); } catch (e) {} }).catch(() => { try { c.clear(); } catch (e) {} });
      } else {
        try { c.clear(); } catch (e) {}
      }
    } catch (e) {
      try { c.clear(); } catch (e2) {}
    }
  }
  const rd = $('rd');
  if (rd) rd.innerHTML = '';
  const btn = $('btnCam');
  if (btn) {
    btn.disabled = false;
    btn.className = 'btn-out mt-3';
    btn.innerHTML = '<i class="bi bi-camera-video"></i> Buka Kamera Live';
  }
}

let _fileQrScanner = null;
function getFileQrScanner() {
  if (!_fileQrScanner) {
    let el = $('qrFileBox');
    if (!el) {
      el = document.createElement('div');
      el.id = 'qrFileBox';
      document.body.appendChild(el);
    }
    el.style.position = 'fixed';
    el.style.left = '-9999px';
    el.style.top = '-9999px';
    el.style.width = '200px';
    el.style.height = '200px';
    el.style.opacity = '0';
    el.style.pointerEvents = 'none';
    _fileQrScanner = new Html5Qrcode('qrFileBox');
  }
  return _fileQrScanner;
}

async function scanFromFile(input) {
  if (!input.files || !input.files.length) return;
  const file = input.files[0];
  busy(1);
  if (S.cam && S.cam.isScanning) {
    try { await S.cam.stop(); } catch(e) {}
  }
  const statusEl = $('scanPhotoStatus');
  if (statusEl) {
    statusEl.style.display = 'block';
    statusEl.className = 'alert alert-info py-2 px-3 small text-center mb-3';
    statusEl.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Sedang membaca kode QR dari foto...';
  }
  const sc = getFileQrScanner();
  let decoded = null;
  try {
    const opt1 = await optimizeImageForQr(file, 1000, 1.0);
    decoded = await sc.scanFile(opt1, false);
  } catch (e1) {
    try {
      const opt2 = await optimizeImageForQr(file, 750, 1.3);
      decoded = await sc.scanFile(opt2, false);
    } catch (e2) {
      try {
        decoded = await sc.scanFile(file, false);
      } catch (e3) {
        console.warn('Scan QR foto gagal:', e3);
      }
    }
  } finally {
    busy(0);
    input.value = '';
  }

  if (decoded) {
    if (statusEl) {
      statusEl.className = 'alert alert-success py-2 px-3 small text-center mb-3';
      statusEl.innerHTML = '<i class="bi bi-check-circle-fill me-1"></i> Foto presensi berhasil terbaca!';
      setTimeout(() => { if (statusEl) statusEl.style.display = 'none'; }, 3000);
    }
    beep();
    sendCode(decoded);
  } else {
    if (statusEl) {
      statusEl.className = 'alert alert-warning py-2 px-3 small text-center mb-3';
      statusEl.innerHTML = '<i class="bi bi-exclamation-triangle-fill me-1"></i> Kode QR tidak terbaca pada foto. Pastikan kartu siswa berada di tempat terang, tidak buram, dan coba ambil foto lebih dekat.';
    }
    toast('Kode QR tidak terdeteksi pada foto. Pastikan kartu siswa berada di tempat terang, tidak buram, dan coba ambil foto lebih dekat.', 'err');
  }
}

function optimizeImageForQr(file, maxDim, contrast) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        let w = img.width, h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) { h = Math.round((h * maxDim) / w); w = maxDim; }
          else { w = Math.round((w * maxDim) / h); h = maxDim; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (contrast && contrast !== 1) {
          ctx.filter = 'contrast(' + contrast + ')';
        }
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(blob => {
          if (blob) resolve(new File([blob], 'opt_' + file.name, { type: 'image/jpeg' }));
          else reject(new Error('Gagal kompresi foto'));
        }, 'image/jpeg', 0.90);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Pratinjau nama siswa saat mengetik NIS/NISN/nama di Catat Izin/Sakit (data lokal, instan)
function izCari(v) {
  const box = $('izInfo'); if (!box) return;
  v = String(v || '').trim();
  if (!v) { box.innerHTML = ''; return; }
  const list = S.rg;
  if (!Array.isArray(list)) { box.innerHTML = '<span class="mut small">Memuat daftar siswa...</span>'; return; }
  const q = v.toLowerCase();
  const exact = list.find(x => x.nis === v || (x.nisn && x.nisn === v));
  if (exact) {
    box.innerHTML = `<div class="d-flex align-items-center gap-2 px-2 py-1 rounded" style="background:rgba(16,185,129,.14);border:1px solid rgba(16,185,129,.45)"><i class="bi bi-check-circle-fill text-success"></i><span><b>${esc(exact.nama)}</b> <span class="mut">• Kelas ${esc(exact.kelas)} • NIS ${esc(exact.nis)}</span></span></div>`;
    return;
  }
  const m = list.filter(x => x.nis.startsWith(v) || (x.nisn && x.nisn.startsWith(v)) || (q.length >= 2 && x.nama.toLowerCase().includes(q))).slice(0, 6);
  if (!m.length) { box.innerHTML = '<div class="small text-danger"><i class="bi bi-x-circle me-1"></i>Siswa dengan NIS/nama tersebut tidak ditemukan (atau nonaktif).</div>'; return; }
  box.innerHTML = '<div class="small mut mb-1">Pilih siswa:</div>' + m.map(x => `<button type="button" class="btn-out w-100 text-start mb-1" style="min-height:34px;padding:4px 10px;font-size:13px" onclick="$('izNis').value='${esc(x.nis)}';izCari('${esc(x.nis)}')"><b>${esc(x.nama)}</b> <span class="mut">• Kelas ${esc(x.kelas)} • NIS ${esc(x.nis)}</span></button>`).join('');
}
function sendIzin() {
  const nis = ($('izNis').value || '').trim(), status = $('izStatus').value, ket = ($('izKet').value || '').trim();
  if (!nis) return toast('Masukkan NIS siswa.', 'err');
  const cocok = Array.isArray(S.rg) && S.rg.find(x => x.nis === nis || (x.nisn && x.nisn === nis));
  if (Array.isArray(S.rg) && !cocok) return toast('Pilih siswa dari daftar atau ketik NIS yang benar.', 'err');
  call('izinSakit', { nis: cocok ? cocok.nis : nis, status, keterangan: ket }).then(r => {
    const l = $('sr'); if (!l) return;
    l.insertAdjacentHTML('afterbegin', `<div class="cardx res"><i class="bi bi-journal-check"></i><div class="flex-grow-1"><b>${esc(r.nama)}</b> <span class="mut">${esc(r.kelas)}</span><br>Dicatat ${bdg(r.status)}${ket ? ' • ' + esc(ket) : ''}</div></div>`);
    while (l.children.length > 8) l.lastChild.remove();
    $('izNis').value = ''; $('izKet').value = ''; izCari('');
    toast(r.nama + ' tercatat ' + r.status, 'ok');
  }).catch(() => {});
}
function sendCode(k) {
  k = String(k || '').trim(); if (!k) return;
  call('scan', { kode: k }).then(r => {
    const l = $('sr'); if (!l) return;
    const waHtml = (r.wa && r.wa.url) ? `
      <div class="mt-2 pt-2 border-top d-flex align-items-center gap-2 flex-wrap">
        <a href="${r.wa.url}" target="_blank" class="btn-wa btn-wa-sm">
          <i class="bi bi-whatsapp"></i> Kirim Notifikasi WA ke Orang Tua (${esc(r.wa.hp)})
        </a>
        ${r.wa.sent ? '<span class="badge bg-success" style="font-size:10px"><i class="bi bi-check2-all me-1"></i>Terkirim Otomatis</span>' : ''}
      </div>
    ` : '';
    l.insertAdjacentHTML('afterbegin', `<div class="cardx res"><i class="bi bi-check-circle-fill"></i><div class="flex-grow-1"><b>${esc(r.nama)}</b> <span class="mut">${esc(r.kelas)}</span><br>Scan ${r.jenis} ${jm(r.jam)} ${r.status ? bdg(r.status) : ''}${r.menit ? ' (+' + r.menit + ' menit)' : ''}${waHtml}</div></div>`);
    while (l.children.length > 8) l.lastChild.remove();
    if ($('mk')) $('mk').value = '';
    toast(r.nama + ' tercatat ' + r.jenis + (r.wa && r.wa.url ? ' • Notifikasi WA siap dikirim' : ''), 'ok');
  }).catch(() => {});
}

//  Rekap & pelanggaran 
function formatBulanIndo(ym) {
  if (!ym) return '';
  const parts = String(ym).split('-');
  if (parts.length < 2) return ym;
  const blnNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const mIdx = parseInt(parts[1], 10) - 1;
  return (blnNames[mIdx] || parts[1]) + ' ' + parts[0];
}

function formatTanggalIndo(d) {
  d = d || new Date();
  const blnNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  return d.getDate() + ' ' + blnNames[d.getMonth()] + ' ' + d.getFullYear();
}

function loadRekap() {
  go('rekap', S.rk, d => {
    if (S.curPage !== 'rekap') return;
    const rt = $('rt');
    if (!rt) return;
    d = d || { rows: [], kelas: [], hari: 0 };
    S.lastRekap = d;
    const k = $('rk'); if (k && k.options.length < 2 && d.kelas) { d.kelas.forEach(x => k.add(new Option(x, x))); k.value = S.rk.kelas; }
    rt.innerHTML = `<div class="cardx"><div class="d-flex justify-content-between align-items-center mb-2"><small class="mut">${d.hari || 0} hari efektif tercatat</small><small class="mut d-md-none" style="font-size:11px"><i class="bi bi-arrow-left-right me-1"></i>Geser ke samping</small></div><div class="tw"><table class="tbl"><thead><tr><th>Nama Siswa</th><th>Kelas</th><th>Hadir</th><th>Telat</th><th>Izin</th><th>Sakit</th><th>Alpa</th><th>%</th><th>Rata² Datang</th><th>Rata² Pulang</th><th class="text-center">Kirim WA Ortu</th><th class="text-center">Detail</th></tr></thead><tbody>
    ${(d.rows || []).map(r => `<tr><td><b>${esc(r.nama)}</b><small class="mut">NIS: ${esc(r.nis)}${r.nisn ? ' • NISN: ' + esc(r.nisn) : ''}</small></td><td><span class="bs mu">${esc(r.kelas)}</span></td><td><b style="color:var(--ok)">${r.hadir}</b></td><td><b class="text-warning">${r.telat}</b></td><td>${r.izin}</td><td>${r.sakit}</td><td><b class="${r.alpa > 0 ? 'text-danger' : 'mut'}">${r.alpa}</b></td><td><b>${r.pct}%</b></td><td class="text-nowrap">${r.avg != null ? hm(r.avg) : '-'}</td><td class="text-nowrap">${r.avgPulang != null ? hm(r.avgPulang) : '-'}</td><td class="text-center">${r.waUrl ? `<a href="${r.waUrl}" target="_blank" class="btn-wa btn-wa-sm" title="Kirim Rekapitulasi Presensi Bulanan ke WhatsApp Orang Tua"><i class="bi bi-whatsapp"></i> Kirim WA</a>` : '<span class="mut small">-</span>'}</td><td class="text-center"><button class="btn-out" style="min-height:32px;padding:3px 10px;font-size:12px" onclick="detailRekap('${esc(r.id)}')"><i class="bi bi-clock-history"></i> Jam</button></td></tr>`).join('') || '<tr><td colspan="12" class="text-center py-3 mut">Tidak ada data.</td></tr>'}</tbody></table></div></div>`;
  });
}

// Pejabat penandatangan laporan cetak (ubah di sini bila berganti)
const KEPSEK = { nama: 'SUTIONO, S.Pd., Gr.', nip: '199104152020121007' };

// Satu wali kelas untuk setiap kelas yang muncul di baris laporan
function daftarWaliKelas(rows) {
  const per = {};
  (rows || []).forEach(r => {
    const k = String(r.kelas || '').trim();
    if (!k) return;
    const o = per[k] = per[k] || { kelas: k, wali: '', nip: '' };
    if (!o.wali && r.wali) { o.wali = r.wali; o.nip = r.nipWali || ''; }
    else if (r.wali && r.wali === o.wali && !o.nip && r.nipWali) o.nip = r.nipWali;
  });
  return Object.keys(per).sort().map(k => per[k]);
}

// Blok tanda tangan: Kepala Sekolah + wali kelas dari siswa yang masuk di rekap
function blokTtdHtml(rows, tglCetak) {
  const titik = '....................................................';
  const blok = (atas, jabatan, nama, nip) => `
    <div style="text-align:center;width:230px">
      <div>${atas}</div>
      <div style="margin-bottom:60px">${jabatan}</div>
      <div style="font-weight:bold;text-decoration:underline">${nama}</div>
      <div>NIP. ${nip}</div>
    </div>`;
  const walis = daftarWaliKelas(rows);
  const kepsek = blok('Mengetahui,', 'Kepala SMP Negeri 2 Ulubongka', esc(KEPSEK.nama), esc(KEPSEK.nip));
  const wali = (walis.length ? walis : [{ kelas: '', wali: '', nip: '' }]).map(w =>
    blok('Ulubongka, ' + tglCetak, 'Wali Kelas ' + (w.kelas ? esc(w.kelas) : '..........'), w.wali ? esc(w.wali) : titik, w.nip ? esc(w.nip) : '.................................'));
  return `<div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:28px 16px;margin-top:28px;page-break-inside:avoid;font-size:12px">${kepsek}${wali.join('')}</div>`;
}

// Tanda tangan rekap pelanggaran: Kepala Sekolah + guru wali murid dari siswa yang tampil di laporan
function blokTtdPelHtml(rows, tglCetak) {
  const titik = '....................................................';
  const blok = (atas, jabatan, nama, nip) => `
    <div style="text-align:center;width:230px">
      <div>${atas}</div>
      <div style="margin-bottom:60px">${jabatan}</div>
      <div style="font-weight:bold;text-decoration:underline">${nama}</div>
      <div>NIP. ${nip}</div>
    </div>`;
  const per = {};
  (rows || []).forEach(r => { const n = String(r.waliMurid || '').trim(); if (n && !(n in per)) per[n] = r.nipWaliMurid || ''; });
  const names = Object.keys(per).sort();
  const kepsek = blok('Mengetahui,', 'Kepala SMP Negeri 2 Ulubongka', esc(KEPSEK.nama), esc(KEPSEK.nip));
  const wali = (names.length ? names : ['']).map(n => blok('Ulubongka, ' + tglCetak, 'Guru Wali Murid', n ? esc(n) : titik, n && per[n] ? esc(per[n]) : '.................................'));
  return `<div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:28px 16px;margin-top:28px;page-break-inside:avoid;font-size:12px">${kepsek}${wali.join('')}</div>`;
}

// Detail jam datang & pulang satu siswa (dari tombol "Jam" di tabel rekap)
function detailRekap(id) {
  call('rekapDetail', { bulan: S.rk.bulan, id_siswa: id }).then(d => {
    const s = (d.siswa || [])[0];
    if (!s) return toast('Data siswa tidak ditemukan.', 'err');
    openModal(`
      <div class="d-flex justify-content-between align-items-center mb-3 no-print">
        <div><h5 class="mb-0 fw-bold"><i class="bi bi-clock-history me-2 text-primary"></i>${esc(s.nama)}</h5>
        <small class="mut">NIS ${esc(s.nis)} • Kelas ${esc(s.kelas)} • ${esc(formatBulanIndo(d.bulan))}</small></div>
        <div class="d-flex gap-2"><button type="button" class="btn-pri" onclick="window.print()"><i class="bi bi-printer-fill"></i></button><button type="button" class="btn-out" onclick="closeModal()">Tutup</button></div>
      </div>
      <div class="tw"><table class="tbl"><thead><tr><th>Hari, Tanggal</th><th>Status</th><th>Jam Datang</th><th>Jam Pulang</th><th>Terlambat</th></tr></thead><tbody>
      ${s.list.map(r => `<tr><td class="text-nowrap">${hariTgl(r.tanggal)}</td><td>${bdg(r.status)}</td><td><b>${r.masuk ? esc(r.masuk) + ' WITA' : '-'}</b></td><td><b>${r.pulang ? esc(r.pulang) + ' WITA' : '-'}</b></td><td>${r.menit ? '+' + r.menit + ' menit' : '-'}</td></tr>`).join('') || '<tr><td colspan="5" class="text-center py-3 mut">Belum ada catatan presensi pada bulan ini.</td></tr>'}
      </tbody></table></div>`, 'modal-lg');
  }).catch(() => {});
}

// Cetak Lengkap: seluruh catatan harian (jam datang & pulang) per siswa sesuai filter rekap
function cetakRekapLengkap() {
  call('rekapDetail', { bulan: S.rk.bulan, kelas: S.rk.kelas, q: S.rk.q }).then(d => {
    const sw = d.siswa || [];
    if (!sw.length) return toast('Belum ada data rekapitulasi untuk dicetak.', 'err');
    const periode = formatBulanIndo(d.bulan), tglCetak = formatTanggalIndo(new Date());
    const filterKls = S.rk.kelas ? 'Kelas ' + esc(S.rk.kelas) : 'Semua Kelas';
    const c = 'border:1px solid #333;padding:4px 6px;';
    const body = sw.map(s => {
      const n = k => s.list.filter(r => r.status === k).length;
      const head = `<tr style="background:#e2e8f0;page-break-inside:avoid"><td colspan="7" style="${c}font-weight:bold">${esc(s.nama)} <span style="font-weight:normal">• NIS ${esc(s.nis)} • Kelas ${esc(s.kelas)} • Hadir ${n('Hadir')}, Telat ${n('Terlambat')}, Izin ${n('Izin')}, Sakit ${n('Sakit')}, Alpa ${n('Alpa')}</span></td></tr>`;
      const rows = s.list.map((r, i) => `<tr style="page-break-inside:avoid"><td style="${c}text-align:center">${i + 1}</td><td style="${c}white-space:nowrap">${hariTgl(r.tanggal)}</td><td style="${c}text-align:center">${esc(r.status)}</td><td style="${c}text-align:center">${r.masuk ? esc(r.masuk) : '-'}</td><td style="${c}text-align:center">${r.pulang ? esc(r.pulang) : '-'}</td><td style="${c}text-align:center">${r.menit ? r.menit + ' mnt' : '-'}</td><td style="${c}">${esc(r.ket)}</td></tr>`).join('') || `<tr><td colspan="7" style="${c}text-align:center;color:#555">Tidak ada catatan presensi</td></tr>`;
      return head + rows;
    }).join('');
    openModal(`
      <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom no-print">
        <div><h5 class="mb-0 fw-bold"><i class="bi bi-printer me-2"></i>Pratinjau Cetak Lengkap Presensi</h5>
        <small class="text-muted">Berisi jam datang &amp; pulang setiap hari. Klik Cetak lalu pilih "Save as PDF".</small></div>
        <div class="d-flex gap-2"><button type="button" class="btn-pri" onclick="window.print()"><i class="bi bi-printer-fill me-1"></i> Cetak Sekarang</button><button type="button" class="btn-out" onclick="closeModal()">Tutup</button></div>
      </div>
      <div class="rekap-print-doc" style="padding:10px;background:#fff;color:#000;border-radius:8px">
        <div style="display:flex;align-items:center;gap:16px;border-bottom:3px double #000;padding-bottom:12px;margin-bottom:14px">
          <img src="${LOGO}" alt="Logo" style="height:72px;width:72px;object-fit:contain">
          <div style="flex:1;text-align:center">
            <div style="font-size:14px;font-weight:bold;letter-spacing:1px;text-transform:uppercase">Pemerintah Kabupaten Tojo Una-Una</div>
            <div style="font-size:13px;font-weight:bold;letter-spacing:1px;text-transform:uppercase">Dinas Pendidikan dan Kebudayaan</div>
            <div style="font-size:18px;font-weight:900;letter-spacing:1.5px;text-transform:uppercase;margin:2px 0">SMP NEGERI 2 ULUBONGKA</div>
            <div style="font-size:11px;color:#333">Jl. Gunung Katopas, No. 1, Desa Watusongu, Kec. Ulubongka, Kab. Tojo Una-una</div>
          </div>
        </div>
        <div style="text-align:center;margin-bottom:14px">
          <div style="font-size:15px;font-weight:bold;text-decoration:underline;text-transform:uppercase">LAPORAN LENGKAP PRESENSI SISWA (JAM DATANG &amp; PULANG)</div>
          <div style="font-size:12px;margin-top:4px">Periode: <b>${periode}</b> &nbsp;|&nbsp; Kelas: <b>${filterKls}</b> &nbsp;|&nbsp; Hari Efektif: <b>${d.hari} Hari</b> &nbsp;|&nbsp; Jumlah Siswa: <b>${sw.length}</b></div>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:11px;margin-bottom:18px">
          <thead><tr style="background:#f1f5f9;color:#000"><th style="${c}width:30px">No</th><th style="${c}width:150px">Hari, Tanggal</th><th style="${c}width:70px">Status</th><th style="${c}width:75px">Jam Datang (WITA)</th><th style="${c}width:75px">Jam Pulang (WITA)</th><th style="${c}width:65px">Terlambat</th><th style="${c}text-align:left">Keterangan</th></tr></thead>
          <tbody>${body}</tbody>
        </table>
        ${blokTtdHtml(sw, tglCetak)}
      </div>`, 'modal-lg');
  }).catch(() => {});
}

function cetakRekap() {
  const d = S.lastRekap;
  if (!d || !d.rows || !d.rows.length) {
    return toast('Belum ada data rekapitulasi untuk dicetak.', 'err');
  }

  const periode = formatBulanIndo(d.bulan || (S.rk && S.rk.bulan) || '');
  const filterKls = (S.rk && S.rk.kelas) ? 'Kelas ' + esc(S.rk.kelas) : 'Semua Kelas';
  const hariEfektif = d.hari || 0;
  const tglCetak = formatTanggalIndo(new Date());

  let totalH = 0, totalT = 0, totalI = 0, totalS = 0, totalA = 0;
  d.rows.forEach(r => {
    totalH += (+r.hadir || 0);
    totalT += (+r.telat || 0);
    totalI += (+r.izin || 0);
    totalS += (+r.sakit || 0);
    totalA += (+r.alpa || 0);
  });

  const tableRowsHtml = d.rows.map((r, i) => `
    <tr>
      <td style="text-align:center">${i + 1}</td>
      <td style="text-align:center">${esc(r.nis)}${r.nisn ? '<br><small style="color:#555">NISN: ' + esc(r.nisn) + '</small>' : ''}</td>
      <td><b>${esc(r.nama)}</b></td>
      <td style="text-align:center">${esc(r.kelas)}</td>
      <td style="text-align:center">${r.hadir}</td>
      <td style="text-align:center">${r.telat}</td>
      <td style="text-align:center">${r.izin}</td>
      <td style="text-align:center">${r.sakit}</td>
      <td style="text-align:center">${r.alpa}</td>
      <td style="text-align:center;font-weight:bold">${r.pct}%</td>
      <td style="text-align:center">${r.avg != null ? hm(r.avg) : '-'}</td>
      <td style="text-align:center">${r.avgPulang != null ? hm(r.avgPulang) : '-'}</td>
    </tr>
  `).join('');

  const printHtml = `
    <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom no-print">
      <div>
        <h5 class="mb-0 fw-bold"><i class="bi bi-printer me-2"></i>Pratinjau Cetak / Ekspor PDF</h5>
        <small class="text-muted">Klik Cetak lalu pilih "Save as PDF" untuk mengunduh berkas PDF resmi.</small>
      </div>
      <div class="d-flex gap-2">
        <button type="button" class="btn-pri" onclick="window.print()"><i class="bi bi-printer-fill me-1"></i> Cetak Sekarang</button>
        <button type="button" class="btn-out" onclick="closeModal()">Tutup</button>
      </div>
    </div>

    <div class="rekap-print-doc" style="padding:10px;background:#fff;color:#000;border-radius:8px">
      
      <div style="display:flex;align-items:center;gap:16px;border-bottom:3px double #000;padding-bottom:12px;margin-bottom:14px">
        <img src="${LOGO}" alt="Logo" style="height:72px;width:72px;object-fit:contain">
        <div style="flex:1;text-align:center">
          <div style="font-size:14px;font-weight:bold;letter-spacing:1px;text-transform:uppercase">Pemerintah Kabupaten Tojo Una-Una</div>
          <div style="font-size:13px;font-weight:bold;letter-spacing:1px;text-transform:uppercase">Dinas Pendidikan dan Kebudayaan</div>
          <div style="font-size:18px;font-weight:900;letter-spacing:1.5px;text-transform:uppercase;margin:2px 0">SMP NEGERI 2 ULUBONGKA</div>
          <div style="font-size:11px;font-weight:normal;color:#333">Jl. Gunung Katopas, No. 1, Desa Watusongu, Kec. Ulubongka, Kab. Tojo Una-una</div>
        </div>
      </div>

      
      <div style="text-align:center;margin-bottom:16px">
        <div style="font-size:15px;font-weight:bold;text-decoration:underline;text-transform:uppercase">LAPORAN REKAPITULASI PRESENSI SISWA</div>
        <div style="font-size:12px;margin-top:4px">
          Periode: <b>${periode}</b> &nbsp;|&nbsp; 
          Kelas: <b>${filterKls}</b> &nbsp;|&nbsp; 
          Hari Efektif: <b>${hariEfektif} Hari</b>
        </div>
      </div>

      
      <style>.rekap-print-doc table th, .rekap-print-doc table td { border: 1px solid #333 !important; }</style>
      <table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:18px">
        <thead>
          <tr style="background:#f1f5f9;color:#000">
            <th style="border:1px solid #333;padding:6px 4px;text-align:center;width:35px">No</th>
            <th style="border:1px solid #333;padding:6px 6px;text-align:center;width:80px">NIS</th>
            <th style="border:1px solid #333;padding:6px 8px;text-align:left">Nama Siswa</th>
            <th style="border:1px solid #333;padding:6px 6px;text-align:center;width:60px">Kelas</th>
            <th style="border:1px solid #333;padding:6px 4px;text-align:center;width:50px">Hadir</th>
            <th style="border:1px solid #333;padding:6px 4px;text-align:center;width:50px">Telat</th>
            <th style="border:1px solid #333;padding:6px 4px;text-align:center;width:45px">Izin</th>
            <th style="border:1px solid #333;padding:6px 4px;text-align:center;width:45px">Sakit</th>
            <th style="border:1px solid #333;padding:6px 4px;text-align:center;width:45px">Alpa</th>
            <th style="border:1px solid #333;padding:6px 6px;text-align:center;width:65px">% Hadir</th>
            <th style="border:1px solid #333;padding:6px 6px;text-align:center;width:70px">Rata² Datang</th>
            <th style="border:1px solid #333;padding:6px 6px;text-align:center;width:70px">Rata² Pulang</th>
          </tr>
        </thead>
        <tbody>
          ${tableRowsHtml}
        </tbody>
        <tfoot>
          <tr style="background:#f8fafc;font-weight:bold">
            <td colspan="4" style="border:1px solid #333;padding:6px 8px;text-align:right">Total (${d.rows.length} Siswa)</td>
            <td style="border:1px solid #333;padding:6px 4px;text-align:center">${totalH}</td>
            <td style="border:1px solid #333;padding:6px 4px;text-align:center">${totalT}</td>
            <td style="border:1px solid #333;padding:6px 4px;text-align:center">${totalI}</td>
            <td style="border:1px solid #333;padding:6px 4px;text-align:center">${totalS}</td>
            <td style="border:1px solid #333;padding:6px 4px;text-align:center">${totalA}</td>
            <td style="border:1px solid #333;padding:6px 6px;text-align:center">-</td>
            <td style="border:1px solid #333;padding:6px 6px;text-align:center">-</td>
            <td style="border:1px solid #333;padding:6px 6px;text-align:center">-</td>
          </tr>
        </tfoot>
      </table>

      
      ${blokTtdHtml(d.rows, tglCetak)}
    </div>
  `;

  openModal(printHtml, 'modal-lg');
}

function cariSiswa(q) {
  clearTimeout(S.dq);
  const pid = $('pid'), pc = $('pc');
  if (pid) pid.value = '';
  if (q.length < 2) { if (pc) pc.innerHTML = ''; return; }
  S.dq = setTimeout(() => go('cari', { q }, r => {
    const pcEl = $('pc');
    if (!pcEl) return;
    pcEl.innerHTML = (r || []).map(s => `<button type="button" data-id="${esc(s.id)}" data-n="${esc(s.nama)} (${esc(s.kelas)})" onclick="pick(this)">${esc(s.nama)} • Kelas ${esc(s.kelas)} • NIS: ${esc(s.nis)}${s.nisn ? ' / NISN: ' + esc(s.nisn) : ''}</button>`).join('');
  }), 300);
}
function pick(b) { $('pid').value = b.dataset.id; $('ps').value = b.dataset.n; $('pc').innerHTML = ''; }
function savePel(e) {
  e.preventDefault();
  if (!$('pid').value) return toast('Pilih siswa dari daftar pencarian.', 'err');
  const jenisVal = $('pj').value.trim();
  const tindakVal = $('pt').value.trim();
  if (!jenisVal) return toast('Tuliskan catatan pelanggaran siswa.', 'err');
  go('pelSimpan', { id_siswa: $('pid').value, jenis: jenisVal, uraian: jenisVal, tindakan: tindakVal }, r => {
    e.target.reset(); $('pid').value = '';
    loadPel();
    if (r.wa && r.wa.url) {
      openModal(`
        <div class="text-center p-2">
          <div style="width:60px;height:60px;background:rgba(37,211,102,.15);color:#25D366;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;font-size:32px">
            <i class="bi bi-whatsapp"></i>
          </div>
          <h5 class="fw-bold mb-2">Pelanggaran Berhasil Dicatat!</h5>
          <p class="mut small mb-3">Laporan pelanggaran siswa telah tersimpan. Silakan klik tombol di bawah untuk langsung mengirimkan pemberitahuan resmi ke WhatsApp orang tua.</p>
          <div class="p-3 rounded border text-start mb-3" style="background:var(--cv);font-size:12px;line-height:1.6">
            <div><b>Nomor WhatsApp Wali:</b> <span class="badge bg-success-subtle text-success">${esc(r.wa.hp)}</span></div>
            ${r.wa.sent ? '<div class="text-success mt-1"><i class="bi bi-check2-all me-1"></i>Otomatis terkirim ke server gateway WA!</div>' : '<div class="text-muted mt-1"><i class="bi bi-info-circle me-1"></i>Klik tombol hijau untuk membuka WhatsApp dengan pesan yang sudah rapi otomatis.</div>'}
          </div>
          <div class="d-flex gap-2 justify-content-center flex-wrap">
            <a href="${r.wa.url}" target="_blank" class="btn-wa" onclick="closeModal()">
              <i class="bi bi-whatsapp fs-5"></i> Kirim Notifikasi WhatsApp Sekarang
            </a>
            <button type="button" class="btn-out" onclick="closeModal()">Tutup</button>
          </div>
        </div>
      `);
    } else {
      toast(r.email === 'Ya' ? 'Pelanggaran tersimpan, email wali terkirim.' : 'Pelanggaran tersimpan. ' + (r.peringatan || ''), 'ok');
    }
  });
}
function loadPel() {
  go('pelList', 0, l => {
    if (S.curPage !== 'pel') return;
    const pl = $('pl');
    if (!pl) return;
    l = l || [];
    pl.innerHTML = `<div class="cardx"><div class="d-flex justify-content-between align-items-center mb-3"><h6 class="fw-bold mb-0">Riwayat Pelanggaran Terbaru</h6><button type="button" class="btn-out btn-sm" onclick="nav('rekap_pel')"><i class="bi bi-table me-1"></i> Buka Rekap</button></div>${l.map(r => `
      <div class="li flex-wrap gap-2">
        <div class="min-w-0 flex-grow-1">
          <b>${esc(r.nama)}</b> <span class="bs mu" style="font-size:10px">${esc(r.kelas)}</span>
          <small class="mut">NIS: <b>${esc(r.nis)}</b>${r.nisn ? ' • NISN: ' + esc(r.nisn) : ''}</small>
          <div class="mt-1 fw-bold text-danger" style="font-size:13px">${esc(r.jenis)}</div>
          ${r.uraian && r.uraian !== r.jenis ? `<small class="mut d-block">${esc(r.uraian)}</small>` : ''}
          <small class="mut mt-1"><i class="bi bi-calendar3 me-1"></i>${esc(r.tanggal)} • Tindakan: <b>${esc(r.tindakan)}</b> • Pencatat: ${esc(r.guru || 'Guru')}</small>
        </div>
        <div class="d-flex flex-column align-items-end gap-1 flex-shrink-0">
          ${r.waUrl ? `<a href="${r.waUrl}" target="_blank" class="btn-wa btn-wa-sm" title="Kirim Laporan Pelanggaran ke WhatsApp Orang Tua (${esc(r.hp)})"><i class="bi bi-whatsapp"></i> Kirim WA</a>` : '<span class="mut small" style="font-size:11px">Tanpa No WA</span>'}
          <span class="bs ${r.email === 'Ya' ? 'ok' : 'mu'}" style="font-size:10px">
            <i class="bi bi-envelope${r.email === 'Ya' ? '-check' : ''}"></i> ${r.email === 'Ya' ? 'Email' : 'Tanpa Email'}
          </span>
        </div>
      </div>
    `).join('') || '<p class="mut mb-0">Belum ada catatan pelanggaran.</p>'}</div>`;
  });
}

// ── Modul Rekapitulasi Pelanggaran ──
function loadRekapPelanggaran() {
  const rpList = $('rp_list');
  if (!rpList) return;
  if (!rpList.firstElementChild || rpList.querySelector('.skl')) rpList.innerHTML = '<div class="skl"></div>';
  go('rekapPelanggaran', S.rk_pel, d => {
    if (S.curPage !== 'rekap_pel') return;
    d = d || { rows: [], kelas: [], totalPelanggaran: 0, totalSiswaTerlibat: 0, topJenis: '-', countWa: 0, countEmail: 0 };
    S.lastRekapPel = d;

    const kSel = $('rpk');
    if (kSel && kSel.options.length <= 1 && d.kelas) {
      d.kelas.forEach(k => kSel.add(new Option('Kelas ' + k, k)));
      kSel.value = S.rk_pel.kelas;
    }

    const kpiEl = $('rp_kpi');
    if (kpiEl) {
      kpiEl.innerHTML = `
        <div class="row g-2 mb-3">
          <div class="col-6 col-md-3">
            <div class="cardx mb-0 text-center">
              <small class="mut">Total Pelanggaran</small>
              <b style="color:var(--er, #D8432F)">${d.totalPelanggaran}</b>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="cardx mb-0 text-center">
              <small class="mut">Siswa Terlibat</small>
              <b style="color:var(--wn, #B87405)">${d.totalSiswaTerlibat}</b>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="cardx mb-0 text-center">
              <small class="mut">Pelanggaran Tersering</small>
              <b class="text-truncate d-block" style="font-size:14px;line-height:1.9;color:var(--pri)">${esc(d.topJenis)}</b>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="cardx mb-0 text-center">
              <small class="mut">Notifikasi WA / Email</small>
              <b style="color:var(--ok)">${d.countWa} / ${d.countEmail}</b>
            </div>
          </div>
        </div>
      `;
    }

    const isAdmin = S.u && S.u.role === 'admin';
    if (!d.rows || !d.rows.length) {
      rpList.innerHTML = '<div class="cardx text-center py-4 mut"><i class="bi bi-shield-check text-success fs-1 mb-2 d-block"></i>Tidak ada data pelanggaran siswa yang tercatat pada periode ini.</div>';
      return;
    }

    rpList.innerHTML = `
      <div class="cardx">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <small class="mut">${d.rows.length} catatan pelanggaran ditemukan</small>
          <small class="mut d-md-none" style="font-size:11px"><i class="bi bi-arrow-left-right me-1"></i>Geser ke samping</small>
        </div>

        <!-- Desktop Table -->
        <div class="tw d-none d-md-block">
          <table class="tbl">
            <thead>
              <tr>
                <th style="width:40px">No</th>
                <th>Tanggal</th>
                <th>Siswa &amp; Kelas</th>
                <th>NIS &amp; NISN</th>
                <th>Jenis / Uraian Pelanggaran</th>
                <th>Tindakan / Pembinaan</th>
                <th>Pencatat</th>
                <th class="text-center">Kirim WA Wali</th>
                ${isAdmin ? '<th class="text-end">Aksi</th>' : ''}
              </tr>
            </thead>
            <tbody>
              ${d.rows.map((r, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td class="text-nowrap"><span class="badge bg-secondary-subtle text-secondary-emphasis"><i class="bi bi-calendar3 me-1"></i>${esc(r.tanggal)}</span></td>
                  <td>
                    <div class="d-flex align-items-center gap-2">
                      <div style="width:32px;height:42px;border-radius:4px;overflow:hidden;background:#f1f5f9;border:1px solid #cbd5e1;flex-shrink:0;display:flex;align-items:center;justify-content:center">
                        ${r.foto ? `<img src="${esc(r.foto)}" alt="" style="width:100%;height:100%;object-fit:cover">` : '<i class="bi bi-person-fill text-muted"></i>'}
                      </div>
                      <div>
                        <b>${esc(r.nama)}</b>
                        <div class="d-flex gap-1 align-items-center mt-1">
                          <span class="bs mu" style="font-size:10px">${esc(r.kelas)}</span>
                          <span class="badge-jk ${r.jk === 'Perempuan' ? 'p' : 'l'}" style="font-size:10px">${r.jk === 'Perempuan' ? 'P' : 'L'}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="text-nowrap">
                    <div><b>${esc(r.nis)}</b></div>
                    ${r.nisn ? `<small class="mut">NISN: ${esc(r.nisn)}</small>` : ''}
                  </td>
                  <td>
                    <div class="fw-semibold text-danger">${esc(r.jenis)}</div>
                    ${r.uraian && r.uraian !== r.jenis ? `<small class="mut d-block">${esc(r.uraian)}</small>` : ''}
                  </td>
                  <td>${esc(r.tindakan || '-')}</td>
                  <td><small class="mut">${esc(r.guru || 'Guru')}</small></td>
                  <td class="text-center text-nowrap">
                    ${r.waUrl ? `
                      <a href="${r.waUrl}" target="_blank" class="btn-wa btn-wa-sm" title="Kirim Laporan Pelanggaran ke WhatsApp Orang Tua (${esc(r.hp)})">
                        <i class="bi bi-whatsapp"></i> Kirim WA
                      </a>
                    ` : '<span class="mut small">-</span>'}
                  </td>
                  ${isAdmin ? `
                    <td class="text-end">
                      <button class="btn-out text-danger py-1 px-2" style="min-height:32px;font-size:12px" title="Hapus Catatan" onclick="hapusPelanggaran('${esc(r.id)}','${esc(r.nama)}')">
                        <i class="bi bi-trash"></i>
                      </button>
                    </td>
                  ` : ''}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Mobile Card List -->
        <div class="d-md-none">
          ${d.rows.map((r, i) => `
            <div class="mb-2 p-3 rounded-3 border" style="background:var(--card)">
              <div class="d-flex align-items-start justify-content-between gap-2 mb-2">
                <div class="d-flex align-items-center gap-2">
                  <div style="width:38px;height:50px;border-radius:4px;overflow:hidden;background:#f1f5f9;border:1px solid #cbd5e1;flex-shrink:0;display:flex;align-items:center;justify-content:center">
                    ${r.foto ? `<img src="${esc(r.foto)}" alt="" style="width:100%;height:100%;object-fit:cover">` : '<i class="bi bi-person-fill text-muted"></i>'}
                  </div>
                  <div>
                    <b class="d-block" style="font-size:14px;color:var(--tx)">${esc(r.nama)}</b>
                    <small class="mut">NIS: <b>${esc(r.nis)}</b>${r.nisn ? ' • NISN: ' + esc(r.nisn) : ''}</small>
                  </div>
                </div>
                <span class="badge bg-secondary-subtle text-secondary-emphasis" style="font-size:11px">${esc(r.kelas)}</span>
              </div>
              <div class="p-2 rounded border mb-2" style="background:rgba(216,67,47,.05);border-color:rgba(216,67,47,.2)!important">
                <div class="fw-bold text-danger" style="font-size:13px"><i class="bi bi-exclamation-triangle-fill me-1"></i>${esc(r.jenis)}</div>
                ${r.uraian && r.uraian !== r.jenis ? `<div class="small mt-1 text-muted">${esc(r.uraian)}</div>` : ''}
                <div class="small text-muted mt-1"><i class="bi bi-arrow-right-short"></i> Tindakan: <b>${esc(r.tindakan || 'Pembinaan')}</b></div>
              </div>
              <div class="d-flex align-items-center justify-content-between small text-muted mb-2">
                <span><i class="bi bi-calendar3 me-1"></i>${esc(r.tanggal)}</span>
                <span>Pencatat: <b>${esc(r.guru || 'Guru')}</b></span>
              </div>
              <div class="d-flex gap-2 pt-2 border-top">
                ${r.waUrl ? `
                  <a href="${r.waUrl}" target="_blank" class="btn-wa flex-grow-1 justify-content-center">
                    <i class="bi bi-whatsapp"></i> Kirim WhatsApp ke Wali
                  </a>
                ` : '<div class="mut small flex-grow-1 text-center py-1">No HP wali tidak tersedia</div>'}
                ${isAdmin ? `
                  <button class="btn-out text-danger py-1 px-3" style="min-height:36px" title="Hapus" onclick="hapusPelanggaran('${esc(r.id)}','${esc(r.nama)}')">
                    <i class="bi bi-trash"></i>
                  </button>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  });
}

function hapusPelanggaran(id, nama) {
  if (!confirm('Yakin ingin menghapus catatan pelanggaran siswa "' + nama + '"?')) return;
  go('pelHapus', { id }, r => {
    toast(r.msg || 'Catatan pelanggaran telah dihapus.', 'ok');
    loadRekapPelanggaran();
  });
}

function cetakRekapPelanggaran() {
  const d = S.lastRekapPel;
  if (!d || !d.rows || !d.rows.length) {
    return toast('Belum ada data rekapitulasi pelanggaran untuk dicetak.', 'err');
  }

  const periode = formatBulanIndo(d.bulan || (S.rk_pel && S.rk_pel.bulan) || '');
  const filterKls = (S.rk_pel && S.rk_pel.kelas) ? 'Kelas ' + esc(S.rk_pel.kelas) : 'Semua Kelas';
  const tglCetak = formatTanggalIndo(new Date());

  const tableRowsHtml = d.rows.map((r, i) => `
    <tr>
      <td style="text-align:center">${i + 1}</td>
      <td style="text-align:center;white-space:nowrap">${esc(r.tanggal)}</td>
      <td style="text-align:center">${esc(r.nis)}${r.nisn ? '<br><small style="color:#555">NISN: ' + esc(r.nisn) + '</small>' : ''}</td>
      <td><b>${esc(r.nama)}</b></td>
      <td style="text-align:center">${esc(r.kelas)} (${r.jk === 'Perempuan' ? 'P' : 'L'})</td>
      <td><b>${esc(r.jenis)}</b>${r.uraian && r.uraian !== r.jenis ? '<br><small style="color:#444">' + esc(r.uraian) + '</small>' : ''}</td>
      <td>${esc(r.tindakan || 'Pembinaan')}</td>
      <td style="text-align:center">${esc(r.guru || 'Guru')}</td>
      <td style="text-align:center">${r.wa === 'Ya' ? 'WA Terkirim' : (r.email === 'Ya' ? 'Email' : '-')}</td>
    </tr>
  `).join('');

  const printHtml = `
    <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom no-print">
      <div>
        <h5 class="mb-0 fw-bold"><i class="bi bi-printer me-2 text-danger"></i>Pratinjau Cetak / Ekspor PDF Rekap Pelanggaran</h5>
        <small class="text-muted">Klik Cetak lalu pilih "Save as PDF" untuk mengunduh berkas laporan resmi.</small>
      </div>
      <div class="d-flex gap-2">
        <button type="button" class="btn-pri" onclick="window.print()"><i class="bi bi-printer-fill me-1"></i> Cetak Sekarang</button>
        <button type="button" class="btn-out" onclick="closeModal()">Tutup</button>
      </div>
    </div>

    <div class="rekap-print-doc" style="padding:10px;background:#fff;color:#000;border-radius:8px">
      <!-- Kop Surat Resmi SMP Negeri 2 Ulubongka -->
      <div style="display:flex;align-items:center;gap:16px;border-bottom:3px double #000;padding-bottom:12px;margin-bottom:14px">
        <img src="${LOGO}" alt="Logo" style="height:72px;width:72px;object-fit:contain">
        <div style="flex:1;text-align:center">
          <div style="font-size:14px;font-weight:bold;letter-spacing:1px;text-transform:uppercase">Pemerintah Kabupaten Tojo Una-Una</div>
          <div style="font-size:13px;font-weight:bold;letter-spacing:1px;text-transform:uppercase">Dinas Pendidikan dan Kebudayaan</div>
          <div style="font-size:18px;font-weight:900;letter-spacing:1.5px;text-transform:uppercase;margin:2px 0">SMP NEGERI 2 ULUBONGKA</div>
          <div style="font-size:11px;font-weight:normal;color:#333">Jl. Gunung Katopas, No. 1, Desa Watusongu, Kec. Ulubongka, Kab. Tojo Una-una</div>
        </div>
      </div>

      <div style="text-align:center;margin-bottom:16px">
        <div style="font-size:15px;font-weight:bold;text-decoration:underline;text-transform:uppercase">LAPORAN REKAPITULASI PELANGGARAN &amp; PEMBINAAN SISWA</div>
        <div style="font-size:12px;margin-top:4px">
          Periode: <b>${periode}</b> &nbsp;|&nbsp; 
          Kelas: <b>${filterKls}</b> &nbsp;|&nbsp; 
          Total Pelanggaran: <b>${d.rows.length} Kejadian</b> (${d.totalSiswaTerlibat} Siswa)
        </div>
      </div>

      <table style="width:100%;border-collapse:collapse;font-size:11px;margin-bottom:18px">
        <thead>
          <tr style="background:#f1f5f9;color:#000">
            <th style="border:1px solid #333;padding:6px 4px;text-align:center;width:30px">No</th>
            <th style="border:1px solid #333;padding:6px 4px;text-align:center;width:75px">Tanggal</th>
            <th style="border:1px solid #333;padding:6px 6px;text-align:center;width:85px">NIS / NISN</th>
            <th style="border:1px solid #333;padding:6px 8px;text-align:left">Nama Siswa</th>
            <th style="border:1px solid #333;padding:6px 4px;text-align:center;width:55px">Kelas</th>
            <th style="border:1px solid #333;padding:6px 8px;text-align:left">Jenis / Uraian Pelanggaran</th>
            <th style="border:1px solid #333;padding:6px 8px;text-align:left">Tindakan / Pembinaan</th>
            <th style="border:1px solid #333;padding:6px 6px;text-align:center;width:80px">Pencatat</th>
            <th style="border:1px solid #333;padding:6px 4px;text-align:center;width:70px">Notifikasi</th>
          </tr>
        </thead>
        <tbody>
          ${tableRowsHtml}
        </tbody>
      </table>

      <!-- Tanda Tangan Resmi -->
      ${blokTtdPelHtml(d.rows, tglCetak)}
    </div>
  `;

  openModal(printHtml, 'modal-lg');
}

//  Admin: Pengaturan Presensi 
const CF = [
  ['jam_buka', 'Gerbang dibuka (HH:mm)'],
  ['jam_masuk', 'Batas hadir tepat waktu (HH:mm)'],
  ['batas_toleransi', 'Batas toleransi keterlambatan (HH:mm)'],
  ['jam_pulang_min', 'Jam pulang minimal (HH:mm)'],
  ['jam_jumat_buka', 'Gerbang dibuka hari Jumat (HH:mm)'],
  ['jam_jumat_masuk', 'Batas hadir tepat waktu hari Jumat (HH:mm)'],
  ['jam_jumat_pulang_min', 'Jam pulang minimal hari Jumat (HH:mm)'],
  ['min_hari_peringkat', 'Minimal hari untuk peringkat kehadiran'],
  ['tahun_ajaran', 'Tahun ajaran aktif'],
  ['wa_api_token', 'Token API WhatsApp Fonnte (Opsional untuk server otomatis)'],
  ['wa_auto_open', 'Buka WhatsApp Otomatis Setelah Scan (Ya / Tidak)']
];
const ADM = {
  cfg() {
    go('cfgGet', 0, g => {
      if (S.curPage !== 'admin') return;
      const ab = $('ab');
      if (!ab) return;
      g = g || {};
      ab.innerHTML = `
        <form onsubmit="saveCfg(event)">
          <div class="row g-3">
            ${CF.map(c => `
              <div class="col-12 col-md-6">
                <label for="c_${c[0]}" class="mb-1">${c[1]}</label>
                <input id="c_${c[0]}" class="form-control" value="${esc(g[c[0]] || '')}" required>
              </div>
            `).join('')}
          </div>
          <button class="btn-pri mt-4"><i class="bi bi-check-lg me-1"></i> Simpan Pengaturan</button>
        </form>
      `;
    });
  }
};
function saveCfg(e) {
  e.preventDefault();
  const o = {};
  CF.forEach(c => {
    const el = $('c_' + c[0]);
    if (el) o[c[0]] = el.value.trim();
  });
  go('cfgSet', o, () => toast('Pengaturan presensi berhasil disimpan.', 'ok'));
}

//  Cetak Kartu Pelajar Per Kelas (Diakses dari Modul Data Siswa) 
function cetakKartuPerKelas(kls) {
  const defaultKls = kls || (S.sw && S.sw.kelas) || '';
  busy(1);
  go('kartuQr', { kelas: defaultKls }, d => {
    if (!d || !d.rows || !d.rows.length) {
      return toast('Tidak ada siswa aktif di kelas ini untuk dicetak.', 'wn');
    }
    openModal(`
      <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom no-print">
        <div>
          <h5 class="mb-0 fw-bold"><i class="bi bi-person-vcard me-2 text-primary"></i>Cetak Kartu Siswa Per Kelas</h5>
          <small class="text-muted">Pilih kelas lalu cetak seluruh kartu tanda pelajar untuk kelas tersebut.</small>
        </div>
        <div class="d-flex gap-2">
          <button type="button" class="btn-pri" onclick="window.print()"><i class="bi bi-printer-fill me-1"></i> Cetak Sekarang</button>
          <button type="button" class="btn-out" onclick="closeModal()">Tutup</button>
        </div>
      </div>
      <div class="d-flex gap-2 align-items-center mb-3 no-print flex-wrap">
        <label for="modalKlsSel" class="m-0 fw-bold">Pilih Kelas:</label>
        <select id="modalKlsSel" class="form-select w-auto" onchange="cetakKartuPerKelas(this.value)">
          ${d.kelas.map(k => `<option${k === d.pilih ? ' selected' : ''}>${esc(k)}</option>`).join('')}
        </select>
        <span class="mut small ms-2">${d.rows.length} siswa ditemukan</span>
      </div>
      <div class="kg2">${d.rows.map((s, i) => kartuHtml(s, 'kcp_' + i)).join('')}</div>
    `, 'modal-lg');
    d.rows.forEach((s, i) => new QRCode($('kcp_' + i), { text: s.kode, width: 104, height: 104 }));
  });
}

//  Modul Data Siswa & Kartu Pelajar 
function handleFotoInput(input, pfx) {
  const PX = pfx || 'fsw';
  if (!input.files || !input.files[0]) return;
  const file = input.files[0];
  if (!file.type.startsWith('image/')) {
    return toast('Format berkas harus berupa gambar (JPG, PNG, JPEG).', 'err');
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const targetW = 240, targetH = 320; // Rasio pas foto standar 3x4
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      const imgRatio = img.width / img.height;
      const targetRatio = targetW / targetH;
      let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;
      if (imgRatio > targetRatio) {
        sWidth = img.height * targetRatio;
        sx = (img.width - sWidth) / 2;
      } else {
        sHeight = img.width / targetRatio;
        sy = (img.height - sHeight) / 2;
      }
      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetW, targetH);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
      const prev = $(PX + '_foto_prev');
      const ph = $(PX + '_foto_ph');
      const val = $(PX + '_foto_val');
      if (prev) { prev.src = dataUrl; prev.style.display = 'block'; }
      if (ph) ph.style.display = 'none';
      if (val) val.value = dataUrl;
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function hapusFotoSiswa(pfx) {
  const PX = pfx || 'fsw';
  const prev = $(PX + '_foto_prev');
  const ph = $(PX + '_foto_ph');
  const val = $(PX + '_foto_val');
  const inp1 = $(PX + '_foto_file');
  const inp2 = $(PX + '_foto_cam');
  if (prev) { prev.src = ''; prev.style.display = 'none'; }
  if (ph) ph.style.display = 'flex';
  if (val) val.value = '';
  if (inp1) inp1.value = '';
  if (inp2) inp2.value = '';
}

function loadSiswa() {
  const l = $('sw_list'); if (!l) return;
  if (!l.firstElementChild || l.querySelector('.skl')) l.innerHTML = '<div class="skl"></div>';
  go('siswaList', S.sw, d => {
    if (S.curPage !== 'siswa') return;
    const listEl = $('sw_list');
    if (!listEl) return;
    d = d || { rows: [], kelas: [], total: 0, aktif: 0, nonaktif: 0 };
    const k = $('sw_k');
    if (k && k.options.length <= 1 && d.kelas) {
      d.kelas.forEach(c => k.add(new Option(c, c)));
      k.value = S.sw.kelas;
    }
    const kpiEl = $('sw_kpi');
    if (kpiEl) {
      kpiEl.innerHTML = `<div class="row g-2 mb-3">
        <div class="col-4"><div class="cardx mb-0 text-center"><small class="mut">Total Siswa</small><b>${d.total || 0}</b></div></div>
        <div class="col-4"><div class="cardx mb-0 text-center"><small class="mut">Siswa Aktif</small><b style="color:var(--ok)">${d.aktif || 0}</b></div></div>
        <div class="col-4"><div class="cardx mb-0 text-center"><small class="mut">Nonaktif</small><b class="mut">${d.nonaktif || 0}</b></div></div>
      </div>`;
    }
    const isAdmin = S.u && S.u.role === 'admin';
    if (!d.rows || !d.rows.length) {
      listEl.innerHTML = '<div class="cardx text-center py-4 mut">Tidak ada data siswa yang cocok.</div>';
      return;
    }
    l.innerHTML = `
      <div class="cardx">
        
        <div class="tw d-none d-md-block">
          <table class="tbl">
            <thead>
              <tr>
                <th style="width:40px">No</th>
                <th>Foto &amp; Nama Siswa</th>
                <th>NIS / NISN</th>
                <th>Kelas &amp; JK</th>
                <th>Kontak Ortu (WhatsApp / Email)</th>
                <th>Status</th>
                <th class="text-end">Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${d.rows.map((r, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>
                    <div class="d-flex align-items-center gap-2">
                      <div style="width:36px;height:48px;border-radius:4px;overflow:hidden;flex-shrink:0;background:#f1f5f9;border:1px solid #cbd5e1;display:flex;align-items:center;justify-content:center">
                        ${r.foto ? `<img src="${esc(r.foto)}" alt="${esc(r.nama)}" style="width:100%;height:100%;object-fit:cover">` : `<i class="bi bi-person-fill text-muted" style="font-size:20px"></i>`}
                      </div>
                      <div>
                        <b>${esc(r.nama)}</b>
                        ${ttlTeks(r.tempat, r.tgl) ? `<small class="mut d-block">${esc(ttlTeks(r.tempat, r.tgl))}</small>` : ''}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div><b>${esc(r.nis)}</b></div>
                    ${r.nisn ? `<small class="mut">NISN: ${esc(r.nisn)}</small>` : '<small class="mut">-</small>'}
                  </td>
                  <td>
                    <div class="d-flex align-items-center gap-1">
                      <span class="bs mu">${esc(r.kelas)}</span>
                      <span class="badge-jk ${r.jk === 'Perempuan' ? 'p' : 'l'}">${r.jk === 'Perempuan' ? 'P' : 'L'}</span>
                    </div>
                  </td>
                  <td>
                    ${r.hp ? `
                      <a href="https://api.whatsapp.com/send?phone=${r.hp.replace(/\D/g, '').replace(/^0/, '62')}" target="_blank" class="btn-wa-sm text-decoration-none d-inline-flex align-items-center gap-1 mb-1" title="Chat WhatsApp Wali Siswa">
                        <i class="bi bi-whatsapp"></i> ${esc(r.hp)}
                      </a>
                    ` : '<div class="mut small"><i class="bi bi-telephone-x me-1"></i>Belum ada WA</div>'}
                    ${r.wali || r.waWali ? `<small class="mut d-block"><i class="bi bi-person-badge me-1"></i>Wali Kelas: ${esc(r.wali || '-')}${r.nipWali ? ' (NIP ' + esc(r.nipWali) + ')' : ''}${r.waWali ? ` · <a href="https://api.whatsapp.com/send?phone=${r.waWali.replace(/^0/, '62')}" target="_blank" class="text-success text-decoration-none"><i class="bi bi-whatsapp"></i> ${esc(r.waWali)}</a>` : ''}</small>` : ''}
                  </td>
                  <td>
                    <span class="bs ${r.status === 'Aktif' ? 'ok' : 'mu'}">
                      <i class="bi bi-${r.status === 'Aktif' ? 'check-circle-fill' : 'dash-circle'}"></i> ${esc(r.status)}
                    </span>
                  </td>
                  <td class="text-end text-nowrap">
                    <button class="btn-out me-1" style="min-height:34px;padding:4px 10px;font-size:12px" title="Cetak Kartu Siswa" onclick="lihatQrSiswa('${esc(r.nis)}','${esc(r.nisn || '')}','${esc(r.nama)}','${esc(r.jk || 'Laki-laki')}','${esc(r.kelas)}','${esc(r.qr)}','${esc(r.foto || '')}','${esc(r.hp || '')}','${esc(r.tempat || '')}','${esc(r.tgl || '')}')">
                      <i class="bi bi-person-vcard text-primary me-1"></i> Kartu
                    </button>
                    ${isAdmin ? `
                      <button class="btn-out me-1" style="min-height:34px;padding:4px 10px;font-size:12px" title="Ubah Siswa" onclick="bukaFormSiswa('${esc(r.id)}','${esc(r.nis)}','${esc(r.nisn || '')}','${esc(r.nama)}','${esc(r.jk || 'Laki-laki')}','${esc(r.kelas)}','${esc(r.hp || '')}','${esc(r.email || '')}','${esc(r.status)}','${esc(r.foto || '')}','${esc(r.tempat || '')}','${esc(r.tgl || '')}','${esc(r.wali || '')}','${esc(r.waWali || '')}','${esc(r.nipWali || '')}')">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn-out me-1" style="min-height:34px;padding:4px 10px;font-size:12px" title="${r.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}" onclick="toggleSiswa('${esc(r.id)}')">
                        <i class="bi bi-${r.status === 'Aktif' ? 'pause-fill' : 'play-fill'}"></i>
                      </button>
                      <button class="btn-out text-danger" style="min-height:34px;padding:4px 10px;font-size:12px" title="Hapus Siswa" onclick="hapusSiswa('${esc(r.id)}','${esc(r.nama)}')">
                        <i class="bi bi-trash"></i>
                      </button>
                    ` : ''}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        
        <div class="d-md-none">
          ${d.rows.map((r, i) => `
            <div class="mb-2 p-3 rounded-3 border" style="background:var(--card)">
              <div class="d-flex align-items-center gap-2 mb-2">
                <div style="width:48px;height:64px;border-radius:6px;overflow:hidden;flex-shrink:0;background:#f1f5f9;border:1px solid #cbd5e1;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 3px rgba(0,0,0,0.08)">
                  ${r.foto ? `<img src="${esc(r.foto)}" alt="${esc(r.nama)}" style="width:100%;height:100%;object-fit:cover">` : `<i class="bi bi-person-fill text-muted" style="font-size:24px"></i>`}
                </div>
                <div class="flex-grow-1 min-w-0">
                  <div class="d-flex align-items-center justify-content-between gap-1">
                    <b class="text-truncate" style="font-size:14px;color:var(--tx)">${esc(r.nama)}</b>
                    <span class="bs ${r.status === 'Aktif' ? 'ok' : 'mu'}" style="font-size:10px;padding:2px 6px">
                      <i class="bi bi-${r.status === 'Aktif' ? 'check-circle-fill' : 'dash-circle'}"></i> ${esc(r.status)}
                    </span>
                  </div>
                  <div class="d-flex gap-2 small text-muted mt-1 align-items-center flex-wrap">
                    <span>NIS: <b>${esc(r.nis)}</b></span>
                    ${r.nisn ? `<span>&bull;</span><span>NISN: <b>${esc(r.nisn)}</b></span>` : ''}
                    <span>&bull;</span>
                    <span class="badge bg-secondary-subtle text-secondary-emphasis" style="font-size:11px">Kelas ${esc(r.kelas)}</span>
                    <span class="badge-jk ${r.jk === 'Perempuan' ? 'p' : 'l'}" style="font-size:10px">${r.jk === 'Perempuan' ? 'P' : 'L'}</span>
                  </div>
                  ${ttlTeks(r.tempat, r.tgl) ? `<div class="small text-muted mt-1"><i class="bi bi-calendar3 me-1"></i>${esc(ttlTeks(r.tempat, r.tgl))}</div>` : ''}
                  ${r.hp ? `<div class="mt-1"><a href="https://api.whatsapp.com/send?phone=${r.hp.replace(/\D/g, '').replace(/^0/, '62')}" target="_blank" class="btn-wa-sm text-decoration-none d-inline-flex align-items-center gap-1" style="font-size:11px"><i class="bi bi-whatsapp"></i> ${esc(r.hp)}</a></div>` : ''}
                  ${r.wali || r.waWali ? `<small class="mut d-block text-truncate mt-1" style="font-size:11px"><i class="bi bi-person-badge me-1"></i>Wali Kelas: ${esc(r.wali || '-')}${r.nipWali ? ' (NIP ' + esc(r.nipWali) + ')' : ''}${r.waWali ? ` · <i class="bi bi-whatsapp text-success"></i> ${esc(r.waWali)}` : ''}</small>` : ''}
                </div>
              </div>

              <div class="d-flex gap-1 pt-2 border-top">
                <button class="btn-pri flex-grow-1 py-1 px-2" style="min-height:36px;font-size:12px" onclick="lihatQrSiswa('${esc(r.nis)}','${esc(r.nisn || '')}','${esc(r.nama)}','${esc(r.jk || 'Laki-laki')}','${esc(r.kelas)}','${esc(r.qr)}','${esc(r.foto || '')}','${esc(r.hp || '')}','${esc(r.tempat || '')}','${esc(r.tgl || '')}')">
                  <i class="bi bi-person-vcard me-1"></i> Kartu Pelajar
                </button>
                ${isAdmin ? `
                  <button class="btn-out py-1 px-2" style="min-height:36px;font-size:12px" title="Ubah" onclick="bukaFormSiswa('${esc(r.id)}','${esc(r.nis)}','${esc(r.nisn || '')}','${esc(r.nama)}','${esc(r.jk || 'Laki-laki')}','${esc(r.kelas)}','${esc(r.hp || '')}','${esc(r.email || '')}','${esc(r.status)}','${esc(r.foto || '')}','${esc(r.tempat || '')}','${esc(r.tgl || '')}','${esc(r.wali || '')}','${esc(r.waWali || '')}','${esc(r.nipWali || '')}')">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn-out py-1 px-2" style="min-height:36px;font-size:12px" title="${r.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}" onclick="toggleSiswa('${esc(r.id)}')">
                    <i class="bi bi-${r.status === 'Aktif' ? 'pause-fill' : 'play-fill'}"></i>
                  </button>
                  <button class="btn-out text-danger py-1 px-2" style="min-height:36px;font-size:12px" title="Hapus" onclick="hapusSiswa('${esc(r.id)}','${esc(r.nama)}')">
                    <i class="bi bi-trash"></i>
                  </button>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  });
}

const BULAN_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
// yyyy-MM-dd -> "14 Mei 2012" (tanpa pergeseran zona waktu)
function tglIndo(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
  if (!m || +m[2] < 1 || +m[2] > 12) return '';
  return (+m[3]) + ' ' + BULAN_ID[+m[2] - 1] + ' ' + m[1];
}
// Gabungan "Kendari, 14 Mei 2012"
function ttlTeks(tempat, tgl) {
  const t = String(tempat || '').trim(), d = tglIndo(tgl);
  if (t && d) return t + ', ' + d;
  return t || d || '';
}

function bukaFormSiswa(id, nis, nisn, nama, jk, kelas, hp, email, status, foto, tempat, tgl, wali, waWali, nipWali) {
  const isEdit = !!id;
  openModal(`
    <form onsubmit="simpanSiswa(event)">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="mb-0 fw-bold">${isEdit ? 'Ubah Data Siswa' : 'Tambah Siswa Baru'}</h5>
        <button type="button" class="btn-out" style="min-height:32px;padding:2px 8px" onclick="closeModal()"><i class="bi bi-x-lg"></i></button>
      </div>
      <input type="hidden" id="fsw_id" value="${esc(id || '')}">
      
      <!-- Upload / Ambil Pas Foto Siswa -->
      <label class="mb-1">Pas Foto Siswa (Rasio 3x4)</label>
      <div class="d-flex align-items-center gap-3 mb-3 p-2 border rounded flex-wrap flex-sm-nowrap" style="background:var(--card)">
        <div style="width:72px;height:96px;border:1px solid #cbd5e1;border-radius:6px;overflow:hidden;background:#f8fafc;display:flex;align-items:center;justify-content:center;flex-shrink:0;position:relative;margin:0 auto">
          <img id="fsw_foto_prev" src="${esc(foto || '')}" alt="Pas Foto" style="width:100%;height:100%;object-fit:cover;${foto ? '' : 'display:none'}">
          <div id="fsw_foto_ph" style="text-align:center;color:#94a3b8;${foto ? 'display:none' : 'display:flex'};flex-direction:column;align-items:center">
            <i class="bi bi-person-bounding-box" style="font-size:28px"></i>
            <span style="font-size:9px">Pas Foto</span>
          </div>
        </div>
        <div class="flex-grow-1 text-center text-sm-start">
          <input type="hidden" id="fsw_foto_val" value="${esc(foto || '')}">
          <input type="file" id="fsw_foto_cam" accept="image/png,image/jpeg,image/jpg" capture="user" style="display:none" onchange="handleFotoInput(this)">
          <input type="file" id="fsw_foto_file" accept="image/png,image/jpeg,image/jpg" style="display:none" onchange="handleFotoInput(this)">
          <div class="d-flex gap-2 flex-wrap mb-1 justify-content-center justify-content-sm-start">
            <button type="button" class="btn-pri btn-sm" onclick="$('fsw_foto_cam').click()"><i class="bi bi-camera-fill me-1"></i> Ambil Foto</button>
            <button type="button" class="btn-out btn-sm" onclick="$('fsw_foto_file').click()"><i class="bi bi-upload me-1"></i> Pilih Berkas</button>
            <button type="button" class="btn-out btn-sm text-danger" onclick="hapusFotoSiswa()"><i class="bi bi-trash"></i> Hapus</button>
          </div>
          <small class="mut d-block" style="font-size:11px">Foto dapat diambil langsung dengan kamera atau dipilih dari file/galeri (rasio 3x4).</small>
        </div>
      </div>

      <div class="row g-2">
        <div class="col-6">
          <label for="fsw_nis">NIS (Nomor Induk Siswa) <span class="text-danger">*</span></label>
          <input id="fsw_nis" class="form-control" required inputmode="numeric" value="${esc(nis || '')}" placeholder="Contoh: 202408012">
        </div>
        <div class="col-6">
          <label for="fsw_nisn">NISN (10 Digit)</label>
          <input id="fsw_nisn" class="form-control" inputmode="numeric" maxlength="10" value="${esc(nisn || '')}" placeholder="Contoh: 0081234567">
        </div>
      </div>

      <label for="fsw_nama">Nama Lengkap Siswa <span class="text-danger">*</span></label>
      <input id="fsw_nama" class="form-control" required value="${esc(nama || '')}" placeholder="Contoh: Muhammad Rizky">

      <div class="row g-2">
        <div class="col-7">
          <label for="fsw_tempat">Tempat Lahir</label>
          <input id="fsw_tempat" class="form-control" maxlength="60" value="${esc(tempat || '')}" placeholder="Contoh: Kendari">
        </div>
        <div class="col-5">
          <label for="fsw_tgl">Tanggal Lahir</label>
          <input id="fsw_tgl" type="date" class="form-control" value="${esc(tgl || '')}">
        </div>
      </div>

      <div class="row g-2">
        <div class="col-6">
          <label for="fsw_jk">Jenis Kelamin <span class="text-danger">*</span></label>
          <select id="fsw_jk" class="form-select">
            <option value="Laki-laki"${jk !== 'Perempuan' ? ' selected' : ''}>Laki-laki (L)</option>
            <option value="Perempuan"${jk === 'Perempuan' ? ' selected' : ''}>Perempuan (P)</option>
          </select>
        </div>
        <div class="col-6">
          <label for="fsw_kelas">Kelas <span class="text-danger">*</span></label>
          <input id="fsw_kelas" class="form-control" required value="${esc(kelas || '')}" placeholder="Mis. 8B" style="text-transform:uppercase">
        </div>
      </div>

      <label for="fsw_hp">No. HP / WhatsApp Orang Tua / Wali</label>
      <div class="input-group">
        <span class="input-group-text bg-light text-success"><i class="bi bi-whatsapp"></i></span>
        <input id="fsw_hp" type="tel" class="form-control" value="${esc(hp || '')}" placeholder="Contoh: 081234567890">
      </div>
      <small class="mut d-block mb-2" style="font-size:11px">Laporan presensi harian &amp; pelanggaran siswa langsung dikirim ke WhatsApp orang tua ini.</small>

      <label for="fsw_status">Status</label>
      <select id="fsw_status" class="form-select">
        <option value="Aktif"${status !== 'Nonaktif' ? ' selected' : ''}>Aktif</option>
        <option value="Nonaktif"${status === 'Nonaktif' ? ' selected' : ''}>Nonaktif</option>
      </select>
      <small class="mut d-block mt-2" style="font-size:11px"><i class="bi bi-person-badge me-1"></i>Wali kelas &amp; NIP otomatis mengikuti menu <b>Data Guru</b> sesuai kelas yang dipilih.</small>

      <div class="d-flex gap-2 justify-content-end mt-4">
        <button type="button" class="btn-out" onclick="closeModal()">Batal</button>
        <button type="submit" class="btn-pri"><i class="bi bi-check-lg"></i> Simpan Siswa</button>
      </div>
    </form>
  `);
}

function simpanSiswa(e) {
  e.preventDefault();
  const id = $('fsw_id').value;
  const p = {
    id: id || undefined,
    nis: $('fsw_nis').value.trim(),
    nisn: $('fsw_nisn').value.trim(),
    nama: $('fsw_nama').value.trim(),
    jk: $('fsw_jk').value,
    kelas: $('fsw_kelas').value.trim().toUpperCase(),
    hp: $('fsw_hp').value.trim(),
    status: $('fsw_status').value,
    tempat_lahir: $('fsw_tempat').value.trim(),
    tanggal_lahir: $('fsw_tgl').value,
    foto: $('fsw_foto_val').value.trim()
  };
  go('siswaSimpan', p, r => {
    closeModal();
    toast(r.msg || 'Data siswa tersimpan.', 'ok');
    loadSiswa();
  });
}
function toggleSiswa(id) {
  go('siswaToggle', { id }, r => {
    toast('Status siswa diubah menjadi ' + r.status, 'ok');
    loadSiswa();
  });
}
function hapusSiswa(id, nama) {
  if (!confirm('Yakin ingin menghapus data siswa "' + nama + '"?')) return;
  go('siswaHapus', { id }, r => {
    toast(r.msg || 'Siswa dihapus.', 'ok');
    loadSiswa();
  });
}

// Kartu pelajar (dipakai SAMA PERSIS untuk cetak pribadi dan cetak per kelas)
function kartuHtml(s, qrId) {
  const nama = s.nama || '', nis = s.nis || '', nisn = s.nisn || '', jk = s.jk || '', kelas = s.kelas || '', tempat = s.tempat || '', tgl = s.tgl || '', foto = s.foto || '', hp = s.hp || '';
  return `
    <div class="kartu-pelajar-wrap" style="width:100%;max-width:380px;box-sizing:border-box;margin:0 auto;background:#fff;color:#0e243f;border:2px solid #0e243f;border-radius:14px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.12)">
      <!-- Header Kartu -->
      <div style="background:#0e243f;color:#fff;padding:10px 14px;display:flex;align-items:center;gap:12px">
        <img src="${LOGO}" alt="Logo" style="height:44px;width:44px;object-fit:contain;background:#fff;border-radius:50%;padding:2px;flex-shrink:0">
        <div style="text-align:left;line-height:1.2">
          <div style="font-size:9px;font-weight:700;letter-spacing:0.8px;color:#94a3b8;text-transform:uppercase">PEMERINTAH KABUPATEN TOJO UNA-UNA</div>
          <div style="font-size:9px;font-weight:700;letter-spacing:0.8px;color:#94a3b8;text-transform:uppercase">DINAS PENDIDIKAN DAN KEBUDAYAAN</div>
          <div style="font-size:13px;font-weight:900;letter-spacing:0.5px">SMP NEGERI 2 ULUBONGKA</div>
          <div style="font-size:8px;color:#cbd5e1">Jl. Gunung Katopas, No. 1, Desa Watusongu, Kec. Ulubongka, Kab. Tojo Una-una</div>
        </div>
      </div>

      <!-- Aksen Garis Gradasi -->
      <div style="height:4px;background:linear-gradient(90deg, #3898EC 0%, #10B981 100%)"></div>

      <!-- Badan Kartu: Foto & QR -->
      <div style="padding:14px;background:#f8fafc">
        <div style="display:flex;gap:14px;align-items:center;justify-content:center;margin-bottom:12px">
          <!-- Pas Foto -->
          <div style="width:96px;height:128px;flex-shrink:0;border:2px solid #94a3b8;border-radius:8px;overflow:hidden;background:#e2e8f0;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.08);position:relative">
            ${foto ? `<img src="${esc(foto)}" alt="${esc(nama)}" style="width:100%;height:100%;object-fit:cover">` : `<div style="text-align:center;color:#64748b"><i class="bi bi-person-fill" style="font-size:46px"></i><div style="font-size:9px;font-weight:700">Pas Foto</div><small style="font-size:8px">3x4</small></div>`}
          </div>

          <!-- QR Code Presensi -->
          <div style="display:flex;flex-direction:column;align-items:center;justify-content:center">
            <div id="${qrId}" style="padding:6px;background:#fff;border:1px solid #cbd5e1;border-radius:8px;box-shadow:0 2px 6px rgba(0,0,0,0.06)"></div>
            <div style="font-size:9px;font-weight:700;color:#0e243f;margin-top:4px"><i class="bi bi-qr-code me-1"></i>QR Presensi</div>
          </div>
        </div>

        <!-- Biodata Siswa -->
        <div style="background:#fff;border-radius:8px;padding:10px 14px;border:1px solid #e2e8f0;font-size:12px;line-height:1.6">
          <div style="display:flex;margin-bottom:2px">
            <span style="color:#64748b;width:70px;flex-shrink:0">Nama</span>
            <span style="margin-right:6px">:</span>
            <b style="color:#0e243f;text-transform:uppercase">${esc(nama)}</b>
          </div>
          <div style="display:flex;margin-bottom:2px">
            <span style="color:#64748b;width:70px;flex-shrink:0">NIS / NISN</span>
            <span style="margin-right:6px">:</span>
            <b>${esc(nis)}${nisn ? ' / ' + esc(nisn) : ''}</b>
          </div>
          <div style="display:flex;margin-bottom:2px">
            <span style="color:#64748b;width:70px;flex-shrink:0">Jenis Kelamin</span>
            <span style="margin-right:6px">:</span>
            <b>${esc(jk || '-')}</b>
          </div>
          <div style="display:flex;margin-bottom:2px">
            <span style="color:#64748b;width:70px;flex-shrink:0">TTL</span>
            <span style="margin-right:6px">:</span>
            <b>${esc(ttlTeks(tempat, tgl) || '-')}</b>
          </div>
          <div style="display:flex;margin-bottom:2px">
            <span style="color:#64748b;width:70px;flex-shrink:0">Kelas</span>
            <span style="margin-right:6px">:</span>
            <b>${esc(kelas)}</b>
          </div>
          ${hp ? `
          <div style="display:flex">
            <span style="color:#64748b;width:70px;flex-shrink:0">No. HP Ortu</span>
            <span style="margin-right:6px">:</span>
            <span><i class="bi bi-whatsapp text-success me-1"></i>${esc(hp)}</span>
          </div>` : ''}
        </div>
      </div>

      <!-- Footer Kartu -->
      <div style="background:#f1f5f9;border-top:1px dashed #cbd5e1;padding:8px 12px;text-align:center;font-size:9px;color:#475569">
        <div>Kartu identitas resmi siswa SMP Negeri 2 Ulubongka</div>
        <div style="font-size:8px;color:#94a3b8;margin-top:2px">Wajib dibawa setiap hari untuk presensi digital masuk &amp; pulang</div>
      </div>
    </div>
  `;
}

function lihatQrSiswa(nis, nisn, nama, jk, kelas, qr, foto, hp, tempat, tgl) {
  const cleanPhone = hp ? String(hp).replace(/\D/g, '').replace(/^0/, '62') : '';
  const waMsg = `*KARTU PRESENSI DIGITAL SISWA*\n*SMP NEGERI 2 ULUBONGKA*\nJl. Gunung Katopas, No. 1, Desa Watusongu, Kec. Ulubongka, Kab. Tojo Una-una\n\nYth. Orang Tua / Wali dari:\n• Nama: *${nama}*\n• NIS / NISN: ${nis}${nisn ? ' / ' + nisn : ''}\n• Jenis Kelamin: ${jk || '-'}\n• Kelas: ${kelas}\n\nKartu presensi digital siswa telah aktif. Kode QR ini wajib dibawa setiap hari untuk presensi digital masuk & pulang di sekolah.\n\nTerima kasih.`;
  const waUrl = cleanPhone ? 'https://api.whatsapp.com/send?phone=' + cleanPhone + '&text=' + encodeURIComponent(waMsg) : '';

  openModal(`
    <div class="text-center no-print mb-3">
      <h5 class="fw-bold mb-1"><i class="bi bi-person-vcard me-2 text-primary"></i>Kartu Pelajar Siswa</h5>
      <p class="mut small mb-0">Kartu identitas resmi siswa beserta pas foto dan kode QR presensi.</p>
    </div>

    <!-- Tampilan Kartu Pelajar Siap Cetak -->
    ${kartuHtml({ nama, nis, nisn, jk, kelas, tempat, tgl, foto, hp }, 'modalQr')}

    <!-- Tombol Aksi -->
    <div class="d-flex gap-2 justify-content-center flex-wrap mt-3 no-print kartu-pelajar-actions">
      <button class="btn-pri" onclick="window.print()"><i class="bi bi-printer-fill me-1"></i> Cetak Kartu Siswa</button>
      <button class="btn-out" onclick="unduhKartuSiswa('${esc(nis)}','${esc(nisn || '')}','${esc(nama)}','${esc(jk || '')}','${esc(kelas)}','${esc(qr)}','${esc(foto || '')}','${esc(tempat || '')}','${esc(tgl || '')}')"><i class="bi bi-download me-1 text-primary"></i> Unduh Gambar (PNG)</button>
      ${waUrl ? `<a href="${waUrl}" target="_blank" class="btn-wa"><i class="bi bi-whatsapp me-1"></i> Kirim ke WhatsApp Ortu</a>` : ''}
      <button class="btn-out" onclick="closeModal()">Tutup</button>
    </div>
  `);
  new QRCode($('modalQr'), { text: 'SISWA|' + qr, width: 104, height: 104 });
}

function unduhKartuSiswa(nis, nisn, nama, jk, kelas, qr, foto, tempat, tgl) {
  busy(1);
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 920;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 600, 920);

  ctx.strokeStyle = '#0E243F';
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, 592, 912);

  ctx.fillStyle = '#0E243F';
  ctx.fillRect(8, 8, 584, 150);

  const grad = ctx.createLinearGradient(8, 158, 592, 158);
  grad.addColorStop(0, '#3898EC');
  grad.addColorStop(1, '#10B981');
  ctx.fillStyle = grad;
  ctx.fillRect(8, 158, 584, 8);

  function finishRender(logoImg, fotoImg, qrImg) {
    if (logoImg) {
      ctx.drawImage(logoImg, 28, 30, 90, 90);
    }
    ctx.textAlign = 'left';
    ctx.fillStyle = '#94A3B8';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('PEMERINTAH KABUPATEN TOJO UNA-UNA', 134, 44);
    ctx.fillText('DINAS PENDIDIKAN DAN KEBUDAYAAN', 134, 64);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 24px sans-serif';
    ctx.fillText('SMP NEGERI 2 ULUBONGKA', 134, 94);

    ctx.fillStyle = '#CBD5E1';
    ctx.font = '11px sans-serif';
    ctx.fillText('Jl. Gunung Katopas, No. 1, Desa Watusongu, Kec. Ulubongka, Kab. Tojo Una-una', 134, 116);
    ctx.font = 'bold 13px sans-serif';
    ctx.fillStyle = '#3898EC';
    ctx.fillText('KARTU TANDA PELAJAR & PRESENSI DIGITAL', 134, 140);

    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(8, 166, 584, 666);

    const fotoX = 60, fotoY = 195, fotoW = 200, fotoH = 266;
    ctx.fillStyle = '#E2E8F0';
    ctx.fillRect(fotoX, fotoY, fotoW, fotoH);
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 3;
    ctx.strokeRect(fotoX, fotoY, fotoW, fotoH);

    if (fotoImg) {
      ctx.drawImage(fotoImg, fotoX, fotoY, fotoW, fotoH);
    } else {
      ctx.textAlign = 'center';
      ctx.fillStyle = '#64748B';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('PAS FOTO', fotoX + fotoW / 2, fotoY + fotoH / 2 - 10);
      ctx.font = '14px sans-serif';
      ctx.fillText('3 x 4', fotoX + fotoW / 2, fotoY + fotoH / 2 + 15);
    }

    const qrX = 330, qrY = 215, qrW = 210, qrH = 210;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(qrX - 10, qrY - 10, qrW + 20, qrH + 20);
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 2;
    ctx.strokeRect(qrX - 10, qrY - 10, qrW + 20, qrH + 20);

    if (qrImg) {
      ctx.drawImage(qrImg, qrX, qrY, qrW, qrH);
    }
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0E243F';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('QR PRESENSI', qrX + qrW / 2, qrY + qrH + 34);

    const bioX = 40, bioY = 495, bioW = 520, bioH = 340;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(bioX, bioY, bioW, bioH);
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 2;
    ctx.strokeRect(bioX, bioY, bioW, bioH);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#64748B';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('NAMA', bioX + 24, bioY + 50);
    ctx.fillText(':', bioX + 160, bioY + 50);
    ctx.fillStyle = '#0E243F';
    ctx.font = '900 20px sans-serif';
    ctx.fillText(String(nama || '').toUpperCase().slice(0, 26), bioX + 180, bioY + 50);

    ctx.fillStyle = '#64748B';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('NIS / NISN', bioX + 24, bioY + 110);
    ctx.fillText(':', bioX + 160, bioY + 110);
    ctx.fillStyle = '#0E243F';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(String(nis || '') + (nisn ? ' / ' + String(nisn) : ''), bioX + 180, bioY + 110);

    ctx.fillStyle = '#64748B';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('JENIS KELAMIN', bioX + 24, bioY + 170);
    ctx.fillText(':', bioX + 160, bioY + 170);
    ctx.fillStyle = '#0E243F';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(String(jk || 'Laki-laki'), bioX + 180, bioY + 170);

    ctx.fillStyle = '#64748B';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('KELAS', bioX + 24, bioY + 230);
    ctx.fillText(':', bioX + 160, bioY + 230);
    ctx.fillStyle = '#0E243F';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(String(kelas || ''), bioX + 180, bioY + 230);

    ctx.fillStyle = '#64748B';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('TTL', bioX + 24, bioY + 290);
    ctx.fillText(':', bioX + 160, bioY + 290);
    ctx.fillStyle = '#0E243F';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(String(ttlTeks(tempat, tgl) || '-').slice(0, 34), bioX + 180, bioY + 290);

    ctx.fillStyle = '#F1F5F9';
    ctx.fillRect(8, 836, 584, 76);
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(8, 836);
    ctx.lineTo(592, 836);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#334155';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('Kartu Identitas Resmi Siswa SMP Negeri 2 Ulubongka', 300, 865);
    ctx.fillStyle = '#94A3B8';
    ctx.font = '12px sans-serif';
    ctx.fillText('Wajib dibawa setiap hari untuk presensi digital masuk & pulang', 300, 890);

    busy(0);
    canvas.toBlob(blob => {
      if (!blob) return toast('Gagal membuat gambar kartu.', 'err');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'Kartu_Siswa_' + nis + '_' + (nama || '').replace(/[\s\/\\?%*:|"<>]/g, '_') + '.png';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(a.href); }, 1000);
      toast('Kartu siswa ' + nama + ' berhasil diunduh.', 'ok');
    }, 'image/png');
  }

  let qrImg = null;
  const qrEl = $('modalQr') ? ($('modalQr').querySelector('canvas') || $('modalQr').querySelector('img')) : null;
  if (qrEl) qrImg = qrEl;

  const logo = new Image();
  logo.crossOrigin = 'anonymous';
  logo.onload = () => {
    if (foto) {
      const ft = new Image();
      ft.crossOrigin = 'anonymous';
      ft.onload = () => finishRender(logo, ft, qrImg);
      ft.onerror = () => finishRender(logo, null, qrImg);
      ft.src = foto;
    } else {
      finishRender(logo, null, qrImg);
    }
  };
  logo.onerror = () => {
    if (foto) {
      const ft = new Image();
      ft.crossOrigin = 'anonymous';
      ft.onload = () => finishRender(null, ft, qrImg);
      ft.onerror = () => finishRender(null, null, qrImg);
      ft.src = foto;
    } else {
      finishRender(null, null, qrImg);
    }
  };
  logo.src = LOGO;
}

//  Modul Kelola Akun 
// ── Modul Prestasi Siswa & Rekap Prestasi ──
function hariTgl(iso) {
  const t = tglIndo(iso); if (!t) return esc(iso || '');
  return NM_HARI[new Date(iso + 'T00:00:00Z').getUTCDay() || 7] + ', ' + t;
}
const bdgPr = j => `<span class="bs ${j === 'Akademik' ? 'ok' : 'wn'}"><i class="bi bi-${j === 'Akademik' ? 'mortarboard-fill' : 'trophy-fill'}"></i>${esc(j)}</span>`;
function hariPr() { const t = $('pr_t'), h = $('pr_h'); if (h && t) h.textContent = t.value ? hariTgl(t.value) : ''; }
function cariSiswaPr(q) {
  clearTimeout(S.dqp);
  const pid = $('pr_id'), pc = $('pr_c');
  if (pid) pid.value = '';
  if (q.length < 2) { if (pc) pc.innerHTML = ''; return; }
  S.dqp = setTimeout(() => call('cari', { q }, { silent: true }).then(r => {
    const el = $('pr_c'); if (!el) return;
    el.innerHTML = (r || []).map(s => `<button type="button" data-id="${esc(s.id)}" data-n="${esc(s.nama)} (${esc(s.kelas)})" onclick="pickPr(this)">${esc(s.nama)} • Kelas ${esc(s.kelas)} • NIS: ${esc(s.nis)}</button>`).join('');
  }).catch(() => {}), 300);
}
function pickPr(b) { $('pr_id').value = b.dataset.id; $('pr_s').value = b.dataset.n; $('pr_c').innerHTML = ''; }
function savePrestasi(e) {
  e.preventDefault();
  const fm = e.target;
  if (!$('pr_id').value) return toast('Pilih siswa dari daftar pencarian.', 'err');
  go('prestasiSimpan', { id_siswa: $('pr_id').value, tanggal: $('pr_t').value, jenis: $('pr_j').value, nama_prestasi: $('pr_n').value.trim() }, r => {
    fm.reset(); $('pr_id').value = ''; hariPr();
    toast(r.msg || 'Prestasi tersimpan.', 'ok');
    loadPrestasi();
  });
}
function loadPrestasi() {
  go('prestasiList', 0, l => {
    if (S.curPage !== 'prestasi') return;
    const el = $('pr_l'); if (!el) return;
    const isAdmin = S.u && S.u.role === 'admin';
    el.innerHTML = `<div class="cardx"><div class="d-flex justify-content-between align-items-center mb-3"><h6 class="fw-bold mb-0">Riwayat Prestasi Terbaru</h6><button type="button" class="btn-out btn-sm" onclick="nav('rekap_prestasi')"><i class="bi bi-table me-1"></i> Buka Rekap</button></div>${(l || []).map(r => `
      <div class="li flex-wrap gap-2">
        <div class="min-w-0 flex-grow-1">
          <b>${esc(r.nama)}</b> <span class="bs mu" style="font-size:10px">${esc(r.kelas)}</span> ${bdgPr(r.jenis)}
          <small class="mut">NIS: <b>${esc(r.nis)}</b></small>
          <div class="mt-1 fw-bold" style="font-size:13px;color:var(--ok)"><i class="bi bi-award-fill me-1"></i>${esc(r.prestasi)}</div>
          <small class="mut mt-1"><i class="bi bi-calendar3 me-1"></i>${hariTgl(r.tanggal)} • Pencatat: ${esc(r.guru)}</small>
        </div>
        ${isAdmin ? `<button class="btn-out text-danger py-1 px-2" style="min-height:32px" title="Hapus" onclick="hapusPrestasi('${esc(r.id)}','${esc(r.nama)}')"><i class="bi bi-trash"></i></button>` : ''}
      </div>`).join('') || '<p class="mut mb-0">Belum ada catatan prestasi.</p>'}</div>`;
  });
}
function loadRekapPrestasi() {
  const l = $('rpr_list'); if (!l) return;
  if (!l.firstElementChild || l.querySelector('.skl')) l.innerHTML = '<div class="skl"></div>';
  go('rekapPrestasi', S.rk_pr, d => {
    if (S.curPage !== 'rekap_prestasi') return;
    d = d || { rows: [], kelas: [], total: 0, siswa: 0, akademik: 0, nonAkademik: 0 };
    S.lastRekapPr = d;
    const ks = $('rpr_k');
    if (ks && ks.options.length <= 1 && d.kelas) { d.kelas.forEach(k => ks.add(new Option('Kelas ' + k, k))); ks.value = S.rk_pr.kelas; }
    const kp = $('rpr_kpi');
    if (kp) kp.innerHTML = `<div class="row g-2 mb-3">
      <div class="col-6 col-md-3"><div class="cardx mb-0 text-center"><small class="mut">Total Prestasi</small><b style="color:var(--pri)">${d.total}</b></div></div>
      <div class="col-6 col-md-3"><div class="cardx mb-0 text-center"><small class="mut">Siswa Berprestasi</small><b>${d.siswa}</b></div></div>
      <div class="col-6 col-md-3"><div class="cardx mb-0 text-center"><small class="mut">Akademik</small><b style="color:var(--ok)">${d.akademik}</b></div></div>
      <div class="col-6 col-md-3"><div class="cardx mb-0 text-center"><small class="mut">Non-Akademik</small><b style="color:#B87405">${d.nonAkademik}</b></div></div>
    </div>`;
    const el = $('rpr_list'); if (!el) return;
    if (!d.rows || !d.rows.length) { el.innerHTML = '<div class="cardx text-center py-4 mut"><i class="bi bi-award text-warning fs-1 mb-2 d-block"></i>Belum ada data prestasi pada filter ini.</div>'; return; }
    const isAdmin = S.u && S.u.role === 'admin';
    const del = r => isAdmin ? `<button class="btn-out text-danger py-1 px-2" style="min-height:32px" title="Hapus" onclick="hapusPrestasi('${esc(r.id)}','${esc(r.nama)}')"><i class="bi bi-trash"></i></button>` : '';
    el.innerHTML = `<div class="cardx">
      <div class="d-flex justify-content-between align-items-center mb-2"><small class="mut">${d.rows.length} catatan prestasi</small><small class="mut d-md-none" style="font-size:11px"><i class="bi bi-arrow-left-right me-1"></i>Geser ke samping</small></div>
      <div class="tw d-none d-md-block"><table class="tbl"><thead><tr><th style="width:40px">No</th><th>Hari, Tanggal</th><th>Nama &amp; NIS</th><th>Kelas</th><th>Jenis</th><th>Nama Prestasi</th>${isAdmin ? '<th class="text-end">Aksi</th>' : ''}</tr></thead><tbody>
      ${d.rows.map((r, i) => `<tr><td>${i + 1}</td><td class="text-nowrap">${hariTgl(r.tanggal)}</td><td><b>${esc(r.nama)}</b><small class="mut">NIS: ${esc(r.nis)}</small></td><td><span class="bs mu">${esc(r.kelas)}</span></td><td>${bdgPr(r.jenis)}</td><td class="fw-semibold">${esc(r.prestasi)}</td>${isAdmin ? `<td class="text-end">${del(r)}</td>` : ''}</tr>`).join('')}
      </tbody></table></div>
      <div class="d-md-none">${d.rows.map(r => `<div class="mb-2 p-3 rounded-3 border" style="background:var(--card)">
        <div class="d-flex justify-content-between gap-2"><div><b class="d-block">${esc(r.nama)}</b><small class="mut">NIS: ${esc(r.nis)} • Kelas ${esc(r.kelas)}</small></div>${bdgPr(r.jenis)}</div>
        <div class="fw-bold mt-2" style="color:var(--ok)"><i class="bi bi-award-fill me-1"></i>${esc(r.prestasi)}</div>
        <div class="d-flex justify-content-between align-items-center mt-2 small mut"><span><i class="bi bi-calendar3 me-1"></i>${hariTgl(r.tanggal)}</span>${del(r)}</div>
      </div>`).join('')}</div></div>`;
  });
}
function hapusPrestasi(id, nama) {
  if (!confirm('Yakin ingin menghapus catatan prestasi siswa "' + nama + '"?')) return;
  go('prestasiHapus', { id }, r => {
    toast(r.msg || 'Catatan prestasi dihapus.', 'ok');
    if (S.curPage === 'prestasi') loadPrestasi(); else loadRekapPrestasi();
  });
}
function cetakRekapPrestasi() {
  const d = S.lastRekapPr;
  if (!d || !d.rows || !d.rows.length) return toast('Belum ada data prestasi untuk dicetak.', 'err');
  const periode = d.bulan ? formatBulanIndo(d.bulan) : 'Semua Periode';
  const filterKls = (S.rk_pr && S.rk_pr.kelas) ? 'Kelas ' + esc(S.rk_pr.kelas) : 'Semua Kelas';
  const filterJns = (S.rk_pr && S.rk_pr.jenis) ? esc(S.rk_pr.jenis) : 'Akademik & Non-Akademik';
  const tglCetak = formatTanggalIndo(new Date());
  const th = 'border:1px solid #333;padding:6px 6px;';
  const rowsHtml = d.rows.map((r, i) => `<tr><td style="text-align:center">${i + 1}</td><td style="white-space:nowrap">${hariTgl(r.tanggal)}</td><td style="text-align:center">${esc(r.nis)}</td><td><b>${esc(r.nama)}</b></td><td style="text-align:center">${esc(r.kelas)}</td><td style="text-align:center">${esc(r.jenis)}</td><td>${esc(r.prestasi)}</td></tr>`).join('');
  openModal(`
    <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom no-print">
      <div><h5 class="mb-0 fw-bold"><i class="bi bi-printer me-2 text-warning"></i>Pratinjau Cetak / Ekspor PDF Rekap Prestasi</h5>
      <small class="text-muted">Klik Cetak lalu pilih "Save as PDF" untuk mengunduh berkas laporan resmi.</small></div>
      <div class="d-flex gap-2"><button type="button" class="btn-pri" onclick="window.print()"><i class="bi bi-printer-fill me-1"></i> Cetak Sekarang</button><button type="button" class="btn-out" onclick="closeModal()">Tutup</button></div>
    </div>
    <div class="rekap-print-doc" style="padding:10px;background:#fff;color:#000;border-radius:8px">
      <div style="display:flex;align-items:center;gap:16px;border-bottom:3px double #000;padding-bottom:12px;margin-bottom:14px">
        <img src="${LOGO}" alt="Logo" style="height:72px;width:72px;object-fit:contain">
        <div style="flex:1;text-align:center">
          <div style="font-size:14px;font-weight:bold;letter-spacing:1px;text-transform:uppercase">Pemerintah Kabupaten Tojo Una-Una</div>
          <div style="font-size:13px;font-weight:bold;letter-spacing:1px;text-transform:uppercase">Dinas Pendidikan dan Kebudayaan</div>
          <div style="font-size:18px;font-weight:900;letter-spacing:1.5px;text-transform:uppercase;margin:2px 0">SMP NEGERI 2 ULUBONGKA</div>
          <div style="font-size:11px;font-weight:normal;color:#333">Jl. Gunung Katopas, No. 1, Desa Watusongu, Kec. Ulubongka, Kab. Tojo Una-una</div>
        </div>
      </div>
      <div style="text-align:center;margin-bottom:16px">
        <div style="font-size:15px;font-weight:bold;text-decoration:underline;text-transform:uppercase">LAPORAN REKAPITULASI PRESTASI SISWA</div>
        <div style="font-size:12px;margin-top:4px">Periode: <b>${periode}</b> &nbsp;|&nbsp; Kelas: <b>${filterKls}</b> &nbsp;|&nbsp; Jenis: <b>${filterJns}</b> &nbsp;|&nbsp; Total: <b>${d.total} Prestasi</b> (${d.siswa} Siswa)</div>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:11px;margin-bottom:18px">
        <thead><tr style="background:#f1f5f9;color:#000">
          <th style="${th}width:30px">No</th><th style="${th}width:130px">Hari, Tanggal</th><th style="${th}width:80px">NIS</th><th style="${th}text-align:left">Nama Siswa</th><th style="${th}width:55px">Kelas</th><th style="${th}width:90px">Jenis</th><th style="${th}text-align:left">Nama Prestasi</th>
        </tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
      ${blokTtdHtml(d.rows, tglCetak)}
    </div>
  `, 'modal-lg');
}

// ── Modul Data Guru ──
let _allGuru = [], _gSel = new Set(), _gRg = [], _gTaken = {};
function loadGuru() {
  const l = $('gr_list'); if (!l) return;
  if (!l.firstElementChild || l.querySelector('.skl')) l.innerHTML = '<div class="skl"></div>';
  go('guruList', 0, rows => {
    if (S.curPage !== 'guru') return;
    _allGuru = rows || [];
    const k = $('gr_kpi');
    if (k) k.innerHTML = `<div class="row g-2 mb-3">
      <div class="col-4"><div class="cardx mb-0 text-center"><small class="mut">Total Guru</small><b>${_allGuru.length}</b></div></div>
      <div class="col-4"><div class="cardx mb-0 text-center"><small class="mut">Wali Kelas</small><b style="color:var(--pri)">${_allGuru.filter(g => g.waliKelas).length}</b></div></div>
      <div class="col-4"><div class="cardx mb-0 text-center"><small class="mut">Guru Wali</small><b style="color:var(--ok)">${_allGuru.filter(g => g.waliMurid).length}</b></div></div>
    </div>`;
    filterGuru();
  });
}
function filterGuru() {
  const q = $('gr_q') ? $('gr_q').value.trim().toLowerCase() : '', f = $('gr_f') ? $('gr_f').value : '';
  renderGuruList(_allGuru.filter(g =>
    (!q || (g.nama || '').toLowerCase().includes(q) || (g.nip || '').includes(q) || (g.jabatan || '').toLowerCase().includes(q)) &&
    (!f || (f === 'wk' && g.waliKelas) || (f === 'wm' && g.waliMurid) || (f === 'no' && !g.waliKelas && !g.waliMurid))));
}
function guruFotoHtml(g, w, h) {
  return `<div style="width:${w}px;height:${h}px;border-radius:4px;overflow:hidden;flex-shrink:0;background:#f1f5f9;border:1px solid #cbd5e1;display:flex;align-items:center;justify-content:center">${g.foto ? `<img src="${esc(g.foto)}" alt="${esc(g.nama)}" style="width:100%;height:100%;object-fit:cover">` : '<i class="bi bi-person-fill text-muted" style="font-size:20px"></i>'}</div>`;
}
function guruPeranHtml(g) {
  const a = [];
  if (g.waliKelas) a.push(`<span class="bs ok"><i class="bi bi-mortarboard-fill"></i> Wali Kelas ${esc(g.kelas)}</span>`);
  if (g.waliMurid) {
    const n = g.murid || [];
    a.push(`<span class="bs iz"><i class="bi bi-people-fill"></i> Guru Wali (${n.length})</span>`);
    if (n.length) a.push(`<small class="mut d-block mt-1" style="max-width:260px">${n.slice(0, 3).map(m => esc(m.nama)).join(', ')}${n.length > 3 ? ' +' + (n.length - 3) + ' lainnya' : ''}</small>`);
  }
  return a.length ? a.join(' ') : '<span class="mut small">-</span>';
}
function guruWaHtml(g) {
  return g.hp ? `<a href="https://api.whatsapp.com/send?phone=${esc(g.hp.replace(/\D/g, '').replace(/^0/, '62'))}" target="_blank" class="btn-wa btn-wa-sm"><i class="bi bi-whatsapp"></i> ${esc(g.hp)}</a>` : '<span class="mut small">-</span>';
}
function renderGuruList(rows) {
  const l = $('gr_list'); if (!l) return;
  if (!rows || !rows.length) { l.innerHTML = '<div class="cardx text-center py-4 mut">Belum ada data guru yang cocok.</div>'; return; }
  const isAdmin = S.u && S.u.role === 'admin';
  const aksi = (g, sm) => isAdmin ? `
    <button class="btn-out ${sm ? 'py-1 px-2' : 'me-1'}" style="min-height:${sm ? 36 : 34}px;padding:4px 10px;font-size:12px" title="Ubah" onclick="bukaFormGuru('${esc(g.id)}')"><i class="bi bi-pencil"></i></button>
    <button class="btn-out text-danger ${sm ? 'py-1 px-2' : ''}" style="min-height:${sm ? 36 : 34}px;padding:4px 10px;font-size:12px" title="Hapus" onclick="hapusGuru('${esc(g.id)}','${esc(g.nama)}')"><i class="bi bi-trash"></i></button>` : '';
  l.innerHTML = `<div class="cardx">
    <div class="tw d-none d-md-block"><table class="tbl"><thead><tr>
      <th style="width:40px">No</th><th>Foto &amp; Nama</th><th>NIP</th><th>Jabatan</th><th>No. HP</th><th>Peran</th>${isAdmin ? '<th class="text-end">Aksi</th>' : ''}
    </tr></thead><tbody>
    ${rows.map((g, i) => `<tr><td>${i + 1}</td>
      <td><div class="d-flex align-items-center gap-2">${guruFotoHtml(g, 36, 48)}<b>${esc(g.nama)}</b></div></td>
      <td>${esc(g.nip) || '<span class="mut">-</span>'}</td><td>${esc(g.jabatan) || '<span class="mut">-</span>'}</td>
      <td>${guruWaHtml(g)}</td><td>${guruPeranHtml(g)}</td>
      ${isAdmin ? `<td class="text-end text-nowrap">${aksi(g, false)}</td>` : ''}</tr>`).join('')}
    </tbody></table></div>
    <div class="d-md-none">
    ${rows.map(g => `<div class="mb-2 p-3 rounded-3 border" style="background:var(--card)">
      <div class="d-flex gap-2 align-items-start">${guruFotoHtml(g, 48, 64)}
        <div class="min-w-0 flex-grow-1"><b class="d-block">${esc(g.nama)}</b>
          <small class="mut d-block">${g.nip ? 'NIP: ' + esc(g.nip) : 'NIP: -'}${g.jabatan ? ' • ' + esc(g.jabatan) : ''}</small>
          <div class="mt-1">${guruWaHtml(g)}</div></div></div>
      <div class="mt-2">${guruPeranHtml(g)}</div>
      ${isAdmin ? `<div class="d-flex gap-1 justify-content-end pt-2 mt-2 border-top">${aksi(g, true)}</div>` : ''}
    </div>`).join('')}
    </div></div>`;
}
function bukaFormGuru(id) {
  busy(1);
  call('siswaRingkas', 0, { silent: true }).then(list => { busy(0); _gRg = list || []; formGuru(id); })
    .catch(e => { busy(0); toast((e && e.message) || 'Gagal memuat daftar siswa.', 'err'); });
}
function formGuru(id) {
  const g = id ? (_allGuru.find(x => x.id === id) || {}) : {};
  const lain = _allGuru.filter(x => x.id !== id);
  const kelasAll = [...new Set(_gRg.map(s => s.kelas).filter(Boolean))].sort();
  const kelasAmbil = {}; _gTaken = {};
  lain.forEach(x => {
    if (x.waliKelas && x.kelas) kelasAmbil[x.kelas.toUpperCase()] = x.nama;
    (x.murid || []).forEach(m => { _gTaken[m.id] = x.nama; });
  });
  _gSel = new Set((g.murid || []).map(m => m.id));
  const wk = !!g.waliKelas, wm = !!g.waliMurid, foto = g.foto || '';
  openModal(`
    <form onsubmit="simpanGuru(event)">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="mb-0 fw-bold">${id ? 'Ubah Data Guru' : 'Tambah Guru Baru'}</h5>
        <button type="button" class="btn-out" style="min-height:32px;padding:2px 8px" onclick="closeModal()"><i class="bi bi-x-lg"></i></button>
      </div>
      <input type="hidden" id="fg_id" value="${esc(id || '')}">
      <label class="mb-1">Foto Guru (Rasio 3x4)</label>
      <div class="d-flex align-items-center gap-3 mb-3 p-2 border rounded flex-wrap flex-sm-nowrap" style="background:var(--card)">
        <div style="width:72px;height:96px;border:1px solid #cbd5e1;border-radius:6px;overflow:hidden;background:#f8fafc;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin:0 auto">
          <img id="fg_foto_prev" src="${esc(foto)}" alt="Foto" style="width:100%;height:100%;object-fit:cover;${foto ? '' : 'display:none'}">
          <div id="fg_foto_ph" style="text-align:center;color:#94a3b8;${foto ? 'display:none' : 'display:flex'};flex-direction:column;align-items:center"><i class="bi bi-person-bounding-box" style="font-size:28px"></i><span style="font-size:9px">Foto</span></div>
        </div>
        <div class="flex-grow-1 text-center text-sm-start">
          <input type="hidden" id="fg_foto_val" value="${esc(foto)}">
          <input type="file" id="fg_foto_cam" accept="image/png,image/jpeg,image/jpg" capture="user" style="display:none" onchange="handleFotoInput(this,'fg')">
          <input type="file" id="fg_foto_file" accept="image/png,image/jpeg,image/jpg" style="display:none" onchange="handleFotoInput(this,'fg')">
          <div class="d-flex gap-2 flex-wrap justify-content-center justify-content-sm-start">
            <button type="button" class="btn-pri btn-sm" onclick="$('fg_foto_cam').click()"><i class="bi bi-camera-fill me-1"></i> Ambil Foto</button>
            <button type="button" class="btn-out btn-sm" onclick="$('fg_foto_file').click()"><i class="bi bi-upload me-1"></i> Pilih Berkas</button>
            <button type="button" class="btn-out btn-sm text-danger" onclick="hapusFotoSiswa('fg')"><i class="bi bi-trash"></i> Hapus</button>
          </div>
        </div>
      </div>
      <label for="fg_nama">Nama Lengkap &amp; Gelar <span class="text-danger">*</span></label>
      <input id="fg_nama" class="form-control" required maxlength="100" value="${esc(g.nama || '')}" placeholder="Contoh: Nurul Hidayati, S.Pd">
      <div class="row g-2">
        <div class="col-12 col-sm-6"><label for="fg_nip">NIP</label><input id="fg_nip" class="form-control" inputmode="numeric" maxlength="25" value="${esc(g.nip || '')}" placeholder="Contoh: 199104152020121007"></div>
        <div class="col-12 col-sm-6"><label for="fg_hp">Nomor HP / WhatsApp</label><input id="fg_hp" type="tel" class="form-control" value="${esc(g.hp || '')}" placeholder="Contoh: 081234567890"></div>
      </div>
      <label for="fg_jab">Jabatan</label>
      <input id="fg_jab" class="form-control" list="fg_jab_list" maxlength="80" value="${esc(g.jabatan || '')}" placeholder="Contoh: Guru Mata Pelajaran">
      <datalist id="fg_jab_list"><option value="Kepala Sekolah"><option value="Wakil Kepala Sekolah"><option value="Guru Mata Pelajaran"><option value="Guru Kelas"><option value="Guru BK"><option value="Staf Tata Usaha"></datalist>

      <div class="row g-2">
        <div class="col-12 col-sm-6"><label for="fg_wk">Wali Kelas?</label>
          <select id="fg_wk" class="form-select" onchange="togGuruPeran()"><option value="Tidak"${wk ? '' : ' selected'}>Tidak</option><option value="Ya"${wk ? ' selected' : ''}>Ya</option></select></div>
        <div class="col-12 col-sm-6" id="fg_wk_box" style="${wk ? '' : 'display:none'}"><label for="fg_kelas">Kelas yang Dipegang</label>
          <select id="fg_kelas" class="form-select"><option value="">— Pilih kelas —</option>${kelasAll.map(k => `<option value="${esc(k)}"${(g.kelas || '').toUpperCase() === k.toUpperCase() ? ' selected' : ''}${kelasAmbil[k.toUpperCase()] ? ' disabled' : ''}>${esc(k)}${kelasAmbil[k.toUpperCase()] ? ' (wali: ' + esc(kelasAmbil[k.toUpperCase()]) + ')' : ''}</option>`).join('')}</select></div>
      </div>

      <label for="fg_wm">Guru Wali?</label>
      <select id="fg_wm" class="form-select" onchange="togGuruPeran()"><option value="Tidak"${wm ? '' : ' selected'}>Tidak</option><option value="Ya"${wm ? ' selected' : ''}>Ya</option></select>
      <div id="fg_wm_box" class="mt-2 p-2 border rounded" style="${wm ? '' : 'display:none'};background:var(--card)">
        <div class="row g-2 align-items-end">
          <div class="col-5"><small class="mut">Kelas</small><select id="fg_mk" class="form-select" onchange="renderMuridPick()"><option value="">Semua</option>${kelasAll.map(k => `<option>${esc(k)}</option>`).join('')}</select></div>
          <div class="col-7"><small class="mut">Cari nama / NIS</small><input id="fg_mq" class="form-control" oninput="renderMuridPick()" placeholder="Cari siswa..."></div>
        </div>
        <div class="d-flex justify-content-between align-items-center my-2">
          <small class="mut" id="fg_mc"></small>
          <span><button type="button" class="btn-out btn-sm" style="min-height:30px;padding:2px 8px;font-size:12px" onclick="pilihSemuaMurid(true)">Pilih semua</button>
          <button type="button" class="btn-out btn-sm" style="min-height:30px;padding:2px 8px;font-size:12px" onclick="pilihSemuaMurid(false)">Kosongkan</button></span>
        </div>
        <div id="fg_ml" style="max-height:220px;overflow-y:auto"></div>
      </div>
      <div class="d-flex gap-2 justify-content-end mt-4">
        <button type="button" class="btn-out" onclick="closeModal()">Batal</button>
        <button type="submit" class="btn-pri"><i class="bi bi-check-lg"></i> Simpan Guru</button>
      </div>
    </form>`);
  if (wm) renderMuridPick();
}
function togGuruPeran() {
  const wk = $('fg_wk').value === 'Ya', wm = $('fg_wm').value === 'Ya';
  $('fg_wk_box').style.display = wk ? '' : 'none';
  $('fg_wm_box').style.display = wm ? 'block' : 'none';
  if (wm) renderMuridPick();
}
function muridCount() { const c = $('fg_mc'); if (c) c.textContent = _gSel.size + ' siswa dipilih'; }
function renderMuridPick() {
  const box = $('fg_ml'); if (!box) return;
  const k = $('fg_mk') ? $('fg_mk').value : '', q = $('fg_mq') ? $('fg_mq').value.trim().toLowerCase() : '';
  const list = _gRg.filter(s => (!k || s.kelas === k) && (!q || (s.nama || '').toLowerCase().includes(q) || (s.nis || '').includes(q)));
  box.innerHTML = list.map(s => { const tk = _gTaken[s.id]; return `<label class="d-flex align-items-center gap-2 py-1 px-1" style="margin:0;font-weight:500;${tk ? 'opacity:.5' : 'cursor:pointer'}"><input type="checkbox" value="${esc(s.id)}"${_gSel.has(s.id) ? ' checked' : ''}${tk ? ' disabled' : ''} onchange="togMurid(this)"><span class="flex-grow-1">${esc(s.nama)} <span class="mut small">• ${esc(s.kelas)}</span></span>${tk ? `<small class="mut">wali: ${esc(tk)}</small>` : ''}</label>`; }).join('') || '<div class="mut small p-2">Tidak ada siswa.</div>';
  muridCount();
}
function togMurid(cb) { if (cb.checked) _gSel.add(cb.value); else _gSel.delete(cb.value); muridCount(); }
function pilihSemuaMurid(on) {
  document.querySelectorAll('#fg_ml input[type=checkbox]:not(:disabled)').forEach(cb => { cb.checked = on; if (on) _gSel.add(cb.value); else _gSel.delete(cb.value); });
  muridCount();
}
function simpanGuru(e) {
  e.preventDefault();
  const wk = $('fg_wk').value, wm = $('fg_wm').value;
  if (wk === 'Ya' && !$('fg_kelas').value) return toast('Pilih kelas yang dipegang.', 'err');
  if (wm === 'Ya' && !_gSel.size) return toast('Pilih minimal satu siswa yang diwalikan.', 'err');
  const p = {
    id: $('fg_id').value || undefined,
    nama: $('fg_nama').value.trim(), nip: $('fg_nip').value.trim(), jabatan: $('fg_jab').value.trim(), hp: $('fg_hp').value.trim(),
    foto: $('fg_foto_val').value.trim(),
    wali_kelas: wk, kelas_wali: wk === 'Ya' ? $('fg_kelas').value : '',
    wali_murid: wm, murid_wali: wm === 'Ya' ? [..._gSel].join(',') : ''
  };
  go('guruSimpan', p, r => { closeModal(); toast(r.msg || 'Data guru tersimpan.', 'ok'); loadGuru(); });
}
function hapusGuru(id, nama) {
  if (!confirm('Yakin ingin menghapus data guru "' + nama + '"? Siswa dan kelas yang diwalikannya akan kembali tanpa wali.')) return;
  go('guruHapus', { id }, r => { toast(r.msg || 'Data guru dihapus.', 'ok'); loadGuru(); });
}

let _allAkunRows = [];
function filterAkun() {
  const q = $('ak_q') ? $('ak_q').value.trim().toLowerCase() : '';
  const p = $('ak_p') ? $('ak_p').value : '';
  let filtered = _allAkunRows;
  if (q) {
    filtered = filtered.filter(r => (r.nama || '').toLowerCase().includes(q) || (r.username || '').toLowerCase().includes(q));
  }
  if (p) {
    filtered = filtered.filter(r => r.peran === p);
  }
  renderAkunList(filtered);
}

function loadAkun() {
  const l = $('ak_list'); if (!l) return;
  if (!l.firstElementChild || l.querySelector('.skl')) l.innerHTML = '<div class="skl"></div>';
  go('akunList', 0, rows => {
    if (S.curPage !== 'akun') return;
    const listEl = $('ak_list');
    if (!listEl) return;
    _allAkunRows = rows || [];
    const total = _allAkunRows.length;
    const adminCount = _allAkunRows.filter(r => r.peran === 'Admin').length;
    const guruCount = _allAkunRows.filter(r => r.peran === 'Guru').length;
    const aktifCount = _allAkunRows.filter(r => r.status === 'Aktif').length;

    const kpiEl = $('ak_kpi');
    if (kpiEl) {
      kpiEl.innerHTML = `<div class="row g-2 mb-3">
        <div class="col-6 col-md-3"><div class="cardx mb-0 text-center"><small class="mut">Total Akun</small><b>${total}</b></div></div>
        <div class="col-6 col-md-3"><div class="cardx mb-0 text-center"><small class="mut">Administrator</small><b style="color:var(--pri)">${adminCount}</b></div></div>
        <div class="col-6 col-md-3"><div class="cardx mb-0 text-center"><small class="mut">Guru / Staf</small><b>${guruCount}</b></div></div>
        <div class="col-6 col-md-3"><div class="cardx mb-0 text-center"><small class="mut">Akun Aktif</small><b style="color:var(--ok)">${aktifCount}</b></div></div>
      </div>`;
    }
    filterAkun();
  });
}

function renderAkunList(rows) {
  const l = $('ak_list'); if (!l) return;
  if (!rows || !rows.length) {
    l.innerHTML = '<div class="cardx text-center py-4 mut">Tidak ada akun yang cocok dengan pencarian.</div>';
    return;
  }
  l.innerHTML = `
    <div class="cardx">
      
      <div class="tw d-none d-md-block">
        <table class="tbl">
          <thead>
            <tr>
              <th style="width:40px">No</th>
              <th>Nama Pengguna</th>
              <th>Username</th>
              <th>Email</th>
              <th>Peran</th>
              <th>Status</th>
              <th class="text-end">Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((r, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>
                  <b>${esc(r.nama)}</b>
                  ${r.isMe ? '<span class="badge bg-primary ms-1" style="font-size:10px">Akun Anda</span>' : ''}
                </td>
                <td><code>${esc(r.username)}</code></td>
                <td>${esc(r.email) || '<span class="mut">-</span>'}</td>
                <td>
                  <span class="badge-role ${r.peran === 'Admin' ? 'badge-admin' : 'badge-guru'}">
                    <i class="bi bi-${r.peran === 'Admin' ? 'shield-lock' : 'person'} me-1"></i>${esc(r.peran)}
                  </span>
                </td>
                <td>
                  <span class="bs ${r.status === 'Aktif' ? 'ok' : 'er'}">
                    <i class="bi bi-${r.status === 'Aktif' ? 'check-circle-fill' : 'x-circle-fill'}"></i> ${esc(r.status)}
                  </span>
                </td>
                <td class="text-end">
                  <button class="btn-out me-1" style="min-height:34px;padding:4px 10px;font-size:12px" title="Ubah Akun" onclick="bukaFormAkun('${esc(r.id)}','${esc(r.nama)}','${esc(r.username)}','${esc(r.email)}','${esc(r.peran)}','${esc(r.status)}',${r.isMe})">
                    <i class="bi bi-pencil"></i> Ubah
                  </button>
                  ${!r.isMe ? `
                    <button class="btn-out me-1" style="min-height:34px;padding:4px 10px;font-size:12px" title="${r.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}" onclick="toggleAkun('${esc(r.id)}')">
                      <i class="bi bi-${r.status === 'Aktif' ? 'pause-fill' : 'play-fill'}"></i>
                    </button>
                    <button class="btn-out text-danger" style="min-height:34px;padding:4px 10px;font-size:12px" title="Hapus Akun" onclick="hapusAkun('${esc(r.id)}','${esc(r.username)}')">
                      <i class="bi bi-trash"></i>
                    </button>
                  ` : ''}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      
      <div class="d-md-none">
        ${rows.map((r, i) => `
          <div class="mb-2 p-3 rounded-3 border" style="background:var(--card)">
            <div class="d-flex align-items-center justify-content-between mb-1">
              <span class="badge-role ${r.peran === 'Admin' ? 'badge-admin' : 'badge-guru'}" style="font-size:10px">
                <i class="bi bi-${r.peran === 'Admin' ? 'shield-lock' : 'person'} me-1"></i>${esc(r.peran)}
              </span>
              <span class="bs ${r.status === 'Aktif' ? 'ok' : 'er'}" style="font-size:10px;padding:2px 6px">
                <i class="bi bi-${r.status === 'Aktif' ? 'check-circle-fill' : 'x-circle-fill'}"></i> ${esc(r.status)}
              </span>
            </div>
            <b class="d-block mt-1" style="font-size:14px;color:var(--tx)">${esc(r.nama)}</b>
            <div class="small text-muted mt-1">Username: <code>${esc(r.username)}</code> ${r.isMe ? '<span class="badge bg-primary ms-1" style="font-size:10px">Akun Anda</span>' : ''}</div>
            ${r.email ? `<small class="mut d-block text-truncate mt-1" style="font-size:11px"><i class="bi bi-envelope me-1"></i>${esc(r.email)}</small>` : ''}
            <div class="d-flex gap-1 pt-2 border-top mt-2 justify-content-end">
              <button class="btn-out py-1 px-3 flex-grow-1" style="min-height:36px;font-size:12px" onclick="bukaFormAkun('${esc(r.id)}','${esc(r.nama)}','${esc(r.username)}','${esc(r.email)}','${esc(r.peran)}','${esc(r.status)}',${r.isMe})">
                <i class="bi bi-pencil me-1"></i> Ubah
              </button>
              ${!r.isMe ? `
                <button class="btn-out py-1 px-2" style="min-height:36px;font-size:12px" title="${r.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}" onclick="toggleAkun('${esc(r.id)}')">
                  <i class="bi bi-${r.status === 'Aktif' ? 'pause-fill' : 'play-fill'}"></i>
                </button>
                <button class="btn-out text-danger py-1 px-2" style="min-height:36px;font-size:12px" title="Hapus" onclick="hapusAkun('${esc(r.id)}','${esc(r.username)}')">
                  <i class="bi bi-trash"></i>
                </button>
              ` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function bukaFormAkun(id, nama, username, email, peran, status, isMe) {
  const isEdit = !!id;
  openModal(`
    <form onsubmit="simpanAkun(event)">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="mb-0 fw-bold">${isEdit ? 'Ubah Akun Pengguna' : 'Tambah Akun Baru'}</h5>
        <button type="button" class="btn-out" style="min-height:32px;padding:2px 8px" onclick="closeModal()"><i class="bi bi-x-lg"></i></button>
      </div>
      <input type="hidden" id="fak_id" value="${esc(id || '')}">
      <label for="fak_nama">Nama Lengkap &amp; Gelar <span class="text-danger">*</span></label>
      <input id="fak_nama" class="form-control" required value="${esc(nama || '')}" placeholder="Contoh: Budi Santoso, S.Pd">
      <label for="fak_username">Nama Pengguna (Username) <span class="text-danger">*</span></label>
      <input id="fak_username" class="form-control" required autocomplete="off" value="${esc(username || '')}" placeholder="Contoh: budi_santoso">
      <small class="mut">Gunakan huruf, angka, titik, atau strip tanpa spasi.</small>
      <label for="fak_email">Email Akun (opsional)</label>
      <input id="fak_email" type="email" class="form-control" value="${esc(email || '')}" placeholder="guru@sekolah.sch.id">
      <div class="row g-2">
        <div class="col-6">
          <label for="fak_peran">Peran Akses <span class="text-danger">*</span></label>
          <select id="fak_peran" class="form-select"${isMe ? ' disabled' : ''}>
            <option value="Guru"${peran !== 'Admin' ? ' selected' : ''}>Guru</option>
            <option value="Admin"${peran === 'Admin' ? ' selected' : ''}>Administrator</option>
          </select>
        </div>
        <div class="col-6">
          <label for="fak_status">Status Akun</label>
          <select id="fak_status" class="form-select"${isMe ? ' disabled' : ''}>
            <option value="Aktif"${status !== 'Nonaktif' ? ' selected' : ''}>Aktif (Bisa Masuk)</option>
            <option value="Nonaktif"${status === 'Nonaktif' ? ' selected' : ''}>Nonaktif (Diblokir)</option>
          </select>
        </div>
      </div>
      <label for="fak_pw">Kata Sandi ${isEdit ? '<span class="mut small">(Kosongkan jika tidak ingin mengubah)</span>' : '<span class="text-danger">*</span>'}</label>
      <input id="fak_pw" type="text" class="form-control" ${isEdit ? '' : 'required'} minlength="6" placeholder="${isEdit ? 'Ketik sandi baru untuk mengganti' : 'Minimal 6 karakter'}">
      <div class="d-flex gap-2 justify-content-end mt-4">
        <button type="button" class="btn-out" onclick="closeModal()">Batal</button>
        <button type="submit" class="btn-pri"><i class="bi bi-check-lg"></i> Simpan Akun</button>
      </div>
    </form>
  `);
}
function simpanAkun(e) {
  e.preventDefault();
  const id = $('fak_id').value;
  const p = {
    id: id || undefined,
    nama: $('fak_nama').value.trim(),
    username: $('fak_username').value.trim(),
    email: $('fak_email').value.trim(),
    peran: $('fak_peran') ? $('fak_peran').value : 'Guru',
    status: $('fak_status') ? $('fak_status').value : 'Aktif',
    password: $('fak_pw').value.trim() || undefined
  };
  go('akunSimpan', p, r => {
    closeModal();
    toast(r.msg || 'Akun tersimpan.', 'ok');
    loadAkun();
  });
}
function toggleAkun(id) {
  go('akunToggle', { id }, r => {
    toast('Status akun diubah menjadi ' + r.status, 'ok');
    loadAkun();
  });
}
function hapusAkun(id, username) {
  if (!confirm('Yakin ingin menghapus akun "' + username + '"? Akun ini tidak akan dapat login lagi.')) return;
  go('akunHapus', { id }, r => {
    toast(r.msg || 'Akun dihapus.', 'ok');
    loadAkun();
  });
}


//  Admin: Hari Belajar & Hari Libur 
const NM_HARI = ['', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
function loadHari() {
  go('hariGet', 0, h => {
    const box = $('hl'); if (!box || S.curPage !== 'admin') return;
    h = h || { aktif: [], libur: [] };
    const tgl = t => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t || ''); return m ? tglIndo(t) : esc(t); };
    box.innerHTML = `
      <h5 class="fw-bold mb-1">Hari Belajar &amp; Hari Libur</h5>
      <small class="mut d-block mb-3">Pada hari yang bukan hari belajar atau tanggal libur, scan ditolak dan siswa <b>tidak</b> ditandai Alpa otomatis.</small>
      <div class="mb-3">
        <label class="mb-1 d-block fw-semibold">Hari belajar rutin</label>
        <div class="d-flex flex-wrap gap-2">
          ${[1, 2, 3, 4, 5, 6, 7].map(n => `<label class="d-flex align-items-center gap-1 px-2 py-1 rounded" style="border:1px solid var(--bd,#94a3b8);cursor:pointer"><input type="checkbox" class="hr-aktif" value="${n}"${(h.aktif || []).indexOf(n) >= 0 ? ' checked' : ''}> ${NM_HARI[n]}</label>`).join('')}
        </div>
        <button class="btn-pri mt-2" onclick="simpanHariAktif()"><i class="bi bi-check-lg me-1"></i> Simpan Hari Belajar</button>
      </div>
      <hr>
      <label class="mb-1 d-block fw-semibold">Tambah hari libur (tanggal tertentu / rentang)</label>
      <div class="row g-2 align-items-end">
        <div class="col-6 col-md-3"><small class="mut">Dari tanggal</small><input id="lb_m" type="date" class="form-control"></div>
        <div class="col-6 col-md-3"><small class="mut">Sampai (opsional)</small><input id="lb_s" type="date" class="form-control"></div>
        <div class="col-12 col-md-4"><small class="mut">Keterangan</small><input id="lb_k" class="form-control" maxlength="100" placeholder="mis. Libur Semester, HUT RI"></div>
        <div class="col-12 col-md-2"><button class="btn-pri w-100" onclick="tambahLibur()"><i class="bi bi-plus-lg me-1"></i> Tambah</button></div>
      </div>
      <div class="mt-3">
        ${(h.libur || []).length ? `<div class="tw"><table class="tbl"><thead><tr><th>Tanggal</th><th>Keterangan</th><th class="text-end">Aksi</th></tr></thead><tbody>
          ${h.libur.map(x => `<tr><td>${tgl(x.mulai)}${x.selesai && x.selesai !== x.mulai ? ' s/d ' + tgl(x.selesai) : ''}</td><td>${esc(x.ket)}</td><td class="text-end"><button class="btn-out" style="min-height:32px;padding:3px 10px" onclick="hapusLibur('${esc(x.id)}')"><i class="bi bi-trash text-danger"></i></button></td></tr>`).join('')}
        </tbody></table></div>` : '<div class="mut small">Belum ada hari libur tercatat.</div>'}
      </div>`;
  });
}
function simpanHariAktif() {
  const v = [...document.querySelectorAll('.hr-aktif:checked')].map(x => x.value).join(',');
  if (!v) return toast('Pilih minimal satu hari belajar.', 'err');
  go('hariSimpan', { aktif: v }, r => { toast(r.msg || 'Tersimpan.', 'ok'); loadHari(); });
}
function tambahLibur() {
  const m = $('lb_m').value, sd = $('lb_s').value || m, k = ($('lb_k').value || '').trim();
  if (!m) return toast('Pilih tanggal libur.', 'err');
  if (!k) return toast('Isi keterangan libur.', 'err');
  go('liburSimpan', { mulai: m, selesai: sd, keterangan: k }, r => { toast(r.msg || 'Ditambahkan.', 'ok'); loadHari(); });
}
function hapusLibur(id) {
  if (!confirm('Hapus hari libur ini?')) return;
  go('liburHapus', { id }, r => { toast(r.msg || 'Dihapus.', 'ok'); loadHari(); });
}


// Diagnosa: versi server (Apps Script) yang benar-benar terhubung dengan aplikasi ini
function diagServer() {
  const b = $('izInfo'); if (!b) return;
  b.innerHTML = '<span class="small mut">Memeriksa versi server...</span>';
  const ujung = String(GAS_URL || '').trim().replace(/\/exec.*$/, '').slice(-8);
  fetch(String(GAS_URL).trim(), { cache: 'no-store' }).then(r => r.json()).then(j => {
    const v = j && j.data && j.data.versi;
    const ok = v && String(v) >= '2.5';
    b.innerHTML = `<div class="small p-2 rounded" style="background:rgba(245,158,11,.14);border:1px solid rgba(245,158,11,.5)">
      <b><i class="bi bi-exclamation-triangle me-1 text-warning"></i>Server yang terhubung: ${v ? 'versi ' + esc(v) : 'VERSI LAMA (belum ada nomor versi)'}</b><br>
      URL di aplikasi berakhiran <code>…${esc(ujung)}/exec</code>.<br>
      ${ok ? 'Versi server sudah baru. Coba login ulang (Keluar lalu Masuk).' : 'Server ini belum menjalankan Kode.gs v2.5. Pastikan <b>URL deployment yang Anda perbarui (pensil → Versi baru)</b> sama dengan URL di <code>js/config.js</code>, atau salin URL deployment yang baru ke <code>js/config.js</code>.'}
    </div>`;
  }).catch(() => { b.innerHTML = '<span class="small text-warning">Tidak dapat memeriksa versi server.</span>'; });
}
