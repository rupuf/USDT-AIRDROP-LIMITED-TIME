// UI helpers
function toast(msg){ alert(msg); }

// Simple TRON address check
function isTron(a){ return /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(String(a||'').trim()); }

// Telegram support link (yahan apna ID lagao)
const SUPPORT_LINK = "https://t.me/jakejonshon12";

// DB in localStorage
function _load(){ return JSON.parse(localStorage.getItem('usdt_multi_db')||'{"users":[],"current":null}') }
function _save(db){ localStorage.setItem('usdt_multi_db', JSON.stringify(db)) }
function currentUser(){
  const db=_load(); if(!db.current) return null;
  return db.users.find(x=>x.u===db.current)||null;
}
function saveUser(u){
  const db=_load();
  const i=db.users.findIndex(x=>x.u===u.u);
  if(i>-1) db.users[i]=u;
  _save(db);
}
function setCurrent(u){ const db=_load(); db.current=u; _save(db); }
function logout(){ const db=_load(); db.current=null; _save(db); }

// Route guard (must be logged in)
function guardAuth(){
  const db=_load();
  if(!db.current){ location.href='login.html'; return; }
}

// SHA-256 for password (front-end only)
async function sha256(str){
  const enc=new TextEncoder().encode(str);
  const buf=await crypto.subtle.digest('SHA-256',enc);
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

// Attach signup & login handlers if forms exist
window.addEventListener('DOMContentLoaded', ()=>{
  const sForm = document.getElementById('signupForm');
  if (sForm){
    sForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const u = document.getElementById('name').value.trim();
      const mail = document.getElementById('email').value.trim();
      const pass = document.getElementById('password').value;
      if(!u || !pass) return toast('Enter name & password');

      const db=_load();
      if(db.users.find(x=>x.u===u)) return toast('Username already exists');

      const ph = await sha256(pass);
      const user = {
        u, mail, ph, bal:30,
        unlocked:false,
        tx:[{id:'B'+Math.random().toString(36).slice(2,8).toUpperCase(),type:'bonus',amount:30,status:'paid',date:Date.now()}],
        created:Date.now()
      };
      db.users.push(user); db.current=u; _save(db);
      location.href='dashboard.html';
    });
  }

  const lForm = document.getElementById('loginForm');
  if (lForm){
    lForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const u = document.getElementById('l_user').value.trim();
      const p = document.getElementById('l_pass').value;
      const ph = await sha256(p);
      const db=_load();
      const ex = db.users.find(x=>x.u===u);
      if(!ex) return toast('User not found');
      if(ex.ph!==ph) return toast('Wrong password');
      db.current=u; _save(db);
      location.href='dashboard.html';
    });
  }
});

// Unlock code verify (front-end only)
function verifyUnlock(code){
  // yahan apna secret code set karo
  return code === 'UNLOCK200';
}
