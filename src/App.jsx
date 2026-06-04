import { useState, useCallback } from "react";

const MAX_SCORE = 50;
const MISS_LIMIT = 3;
const RESET_SCORE = 25;

function replayPlayer(log) {
  let score = 0, miss = 0, out = false;
  const entries = [];
  for (const entry of log) {
    if (out) { entries.push({ ...entry, scoreAfter: score, note: "（失格後）" }); continue; }
    const isMiss = entry.thrown === 0;
    miss = isMiss ? miss + 1 : 0;
    if (miss >= MISS_LIMIT) {
      out = true;
      entries.push({ ...entry, scoreAfter: score, note: "💀失格" });
      continue;
    }
    let ns = score + entry.thrown;
    let note = isMiss ? "⚠️" : "";
    if (!isMiss && ns > MAX_SCORE) { ns = RESET_SCORE; note = "⚡→25"; }
    score = ns;
    entries.push({ ...entry, scoreAfter: score, note });
  }
  return { score, miss, out, entries };
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;900&family=Noto+Sans+JP:wght@300;400;700&display=swap');
  :root {
    --bg:#f4ede0; --bg2:#ebe1cf; --surface:#fff9f2;
    --border:#d8cbb5; --text:#281e10; --muted:#8a7860;
    --accent:#c0491a; --accent-l:#f5d5c5;
    --green:#2e6b46; --warn:#c08010;
    --radius:14px; --radius-sm:9px;
  }
  *{box-sizing:border-box;margin:0;padding:0;}
  .wrap{font-family:'Noto Sans JP',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;}
  .hdr{background:var(--text);padding:16px 20px 12px;position:sticky;top:0;z-index:10;box-shadow:0 2px 14px rgba(0,0,0,.22);}
  .hdr-inner{max-width:520px;margin:0 auto;}
  .logo{display:flex;align-items:center;gap:9px;}
  .logo-icon{font-size:1.4rem;}
  .logo-txt{font-family:'Outfit',sans-serif;font-weight:900;font-size:1.5rem;letter-spacing:.18em;color:#fff;}
  .logo-sub{font-size:.66rem;letter-spacing:.22em;color:#f5d5c5;margin-top:2px;font-weight:300;text-transform:uppercase;}
  .main{max-width:520px;margin:0 auto;padding:26px 16px 70px;display:flex;flex-direction:column;gap:24px;}
  .ttl{font-family:'Outfit',sans-serif;font-size:1.15rem;font-weight:700;letter-spacing:.03em;margin-bottom:14px;}
  .ttl-sm{font-family:'Outfit',sans-serif;font-size:.82rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:10px;}
  .btn{display:inline-flex;align-items:center;justify-content:center;gap:5px;padding:11px 20px;border:none;border-radius:var(--radius-sm);font-family:'Outfit',sans-serif;font-weight:600;font-size:.92rem;cursor:pointer;transition:all .13s;letter-spacing:.02em;}
  .btn:active{transform:scale(.97);}
  .btn-dark{background:var(--text);color:#fff;}
  .btn-dark:hover{background:#3a
