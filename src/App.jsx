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
  .btn-dark:hover{background:#3a2e1a;}
  .btn-accent{background:var(--accent);color:#fff;}
  .btn-accent:hover{background:#a03510;}
  .btn-ghost{background:transparent;color:var(--muted);border:1.5px solid var(--border);}
  .btn-ghost:hover{background:var(--bg2);color:var(--text);}
  .btn-red{color:var(--accent)!important;border-color:var(--accent-l)!important;}
  .btn-full{width:100%;padding:14px;font-size:1rem;margin-top:6px;}
  .btn-full.dim{opacity:.38;pointer-events:none;}
  .btn-x{background:none;border:none;color:var(--muted);cursor:pointer;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.8rem;transition:all .12s;}
  .btn-x:hover{background:var(--accent-l);color:var(--accent);}
  .setup{display:flex;flex-direction:column;gap:14px;}
  .row{display:flex;gap:8px;}
  .inp{flex:1;padding:11px 14px;border:1.5px solid var(--border);border-radius:var(--radius-sm);font-family:'Noto Sans JP',sans-serif;font-size:.92rem;background:var(--surface);color:var(--text);outline:none;transition:border-color .14s;}
  .inp:focus{border-color:var(--accent);}
  .plist{list-style:none;display:flex;flex-direction:column;gap:7px;}
  .pitem{display:flex;align-items:center;gap:8px;padding:11px 12px;background:var(--surface);border:1.5px solid var(--border);border-radius:var(--radius-sm);animation:fadeUp .18s ease;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
  .pbadge{width:24px;height:24px;border-radius:50%;background:var(--bg2);display:flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:700;color:var(--muted);flex-shrink:0;}
  .pname{flex:1;font-size:.9rem;font-weight:600;}
  .rules{background:var(--surface);border:1.5px solid var(--border);border-radius:var(--radius);padding:14px 16px;}
  .rules-t{font-size:.82rem;font-weight:700;margin-bottom:8px;letter-spacing:.04em;}
  .rules ul{list-style:none;display:flex;flex-direction:column;gap:5px;}
  .rules li{font-size:.8rem;color:var(--muted);padding-left:14px;position:relative;line-height:1.5;}
  .rules li::before{content:"--";position:absolute;left:0;color:var(--accent);}
  .rules strong{color:var(--text);}
  .turn-card{background:var(--text);color:#fff;border-radius:var(--radius);padding:22px 22px 18px;box-shadow:0 8px 32px rgba(40,30,16,.18);position:relative;overflow:hidden;}
  .turn-card::before{content:'';position:absolute;top:-28px;right:-28px;width:110px;height:110px;border-radius:50%;background:rgba(192,73,26,.18);}
  .turn-lbl{font-size:.68rem;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.45);margin-bottom:4px;font-family:'Outfit',sans-serif;}
  .turn-name{font-family:'Outfit',sans-serif;font-size:1.9rem;font-weight:900;letter-spacing:-.01em;}
  .turn-info{margin-top:7px;font-size:.84rem;color:rgba(255,255,255,.65);}
  .turn-info strong{color:#fff;}
  .miss-pill{display:inline-block;margin-left:8px;padding:2px 8px;border-radius:20px;background:rgba(192,128,16,.3);color:#f0c040;font-size:.74rem;}
  .input-area{background:var(--surface);border:1.5px solid var(--border);border-radius:var(--radius);padding:18px;}
  .input-lbl{font-size:.74rem;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:12px;font-family:'Outfit',sans-serif;font-weight:600;}
  .qbtns{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin-bottom:12px;}
  .qbtn{aspect-ratio:1;border:1.5px solid var(--border);border-radius:var(--radius-sm);background:var(--bg2);font-family:'Outfit',sans-serif;font-weight:700;font-size:.95rem;color:var(--text);cursor:pointer;transition:all .11s;}
  .qbtn:hover{background:var(--bg);border-color:var(--muted);}
  .qbtn.sel{background:var(--text);color:#fff;border-color:var(--text);transform:scale(1.07);box-shadow:0 2px 10px rgba(40,30,16,.22);}
  .qbtn.miss-btn{color:var(--accent);border-color:var(--accent-l);}
  .qbtn.miss-btn.sel{background:var(--accent);border-color:var(--accent);color:#fff;}
  .sboard{display:flex;flex-direction:column;gap:7px;}
  .srow{display:flex;align-items:center;gap:8px;padding:10px 13px;background:var(--surface);border:1.5px solid var(--border);border-radius:var(--radius-sm);transition:all .18s;}
  .srow.cur{border-color:var(--text);box-shadow:0 0 0 2px rgba(40,30,16,.08);}
  .srow.out{opacity:.38;background:var(--bg2);}
  .srank{font-family:'Outfit',sans-serif;font-weight:700;font-size:.76rem;min-width:24px;color:var(--muted);}
  .sname{font-weight:600;font-size:.88rem;min-width:60px;flex-shrink:0;}
  .sbar-wrap{flex:1;height:5px;background:var(--bg2);border-radius:3px;overflow:hidden;}
  .sbar{height:100%;background:linear-gradient(90deg,var(--green),var(--accent));border-radius:3px;transition:width .4s cubic-bezier(.25,.8,.25,1);}
  .sscore{font-family:'Outfit',sans-serif;font-weight:700;font-size:.88rem;min-width:40px;text-align:right;}
  .ctrl-row{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;}
  .hist-section{display:flex;flex-direction:column;gap:10px;}
  .htable-wrap{overflow-x:auto;border-radius:var(--radius-sm);border:1.5px solid var(--border);}
  .htable{width:100%;border-collapse:collapse;font-size:.8rem;}
  .htable th{background:var(--bg2);padding:8px 10px;text-align:left;font-family:'Outfit',sans-serif;font-weight:600;letter-spacing:.04em;color:var(--muted);font-size:.7rem;text-transform:uppercase;}
  .htable td{padding:8px 10px;border-top:1px solid var(--border);background:var(--surface);vertical-align:middle;}
  .htable tr.rm td{color:var(--accent);}
  .htable tr.ro td{color:var(--warn);}
  .htable tr.re td{color:var(--muted);text-decoration:line-through;}
  .htable tr.editing td{background:#fdf6e3 !important;color:var(--text) !important;text-decoration:none !important;}
  .edit-qbtns{display:flex;flex-wrap:wrap;gap:4px;margin:4px 0;}
  .edit-qbtn{width:28px;height:28px;border:1.5px solid var(--border);border-radius:6px;background:var(--bg2);font-family:'Outfit',sans-serif;font-weight:700;font-size:.78rem;color:var(--text);cursor:pointer;transition:all .1s;display:flex;align-items:center;justify-content:center;}
  .edit-qbtn:hover{background:var(--bg);border-color:var(--muted);}
  .edit-qbtn.sel{background:var(--text);color:#fff;border-color:var(--text);}
  .edit-qbtn.miss-e{color:var(--accent);border-color:var(--accent-l);}
  .edit-qbtn.miss-e.sel{background:var(--accent);border-color:var(--accent);color:#fff;}
  .edit-actions{display:flex;gap:6px;margin-top:6px;}
  .btn-save{padding:5px 14px;border:none;border-radius:6px;background:var(--text);color:#fff;font-family:'Outfit',sans-serif;font-weight:700;font-size:.78rem;cursor:pointer;transition:all .12s;}
  .btn-save:hover{background:#3a2e1a;}
  .btn-save.dim{opacity:.35;pointer-events:none;}
  .btn-cancel{padding:5px 14px;border:1.5px solid var(--border);border-radius:6px;background:transparent;color:var(--muted);font-family:'Outfit',sans-serif;font-weight:600;font-size:.78rem;cursor:pointer;transition:all .12s;}
  .btn-cancel:hover{background:var(--bg2);}
  .btn-edit{padding:3px 10px;border:1.5px solid var(--border);border-radius:6px;background:transparent;color:var(--muted);font-family:'Outfit',sans-serif;font-weight:600;font-size:.72rem;cursor:pointer;transition:all .12s;white-space:nowrap;}
  .btn-edit:hover{background:var(--bg2);color:var(--text);}
  .result{display:flex;flex-direction:column;align-items:center;gap:14px;padding:30px 0;text-align:center;}
  .big-icon{font-size:3.2rem;animation:pop .45s ease;}
  @keyframes pop{0%{transform:scale(.4);opacity:0}70%{transform:scale(1.2)}100%{transform:scale(1);opacity:1}}
  .res-ttl{font-family:'Outfit',sans-serif;font-size:.9rem;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);font-weight:600;}
  .res-name{font-family:'Outfit',sans-serif;font-size:2.6rem;font-weight:900;letter-spacing:-.02em;color:var(--text);}
  .res-sub{font-size:.82rem;color:var(--muted);}
  .res-btns{display:flex;flex-direction:column;gap:8px;width:100%;}
`;

export default function MolkkyApp() {
  const [players, setPlayers]   = useState([]);
  const [newName, setNewName]   = useState("");
  const [started, setStarted]   = useState(false);
  const [turnIdx, setTurnIdx]   = useState(0);
  const [inputVal, setInputVal] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner]     = useState(null);
  const [editing, setEditing]   = useState(null);

  const addPlayer = () => {
    const n = newName.trim();
    if (!n || players.find(p => p.name === n)) return;
    setPlayers(prev => [...prev, { name: n, score: 0, miss: 0, out: false, log: [] }]);
    setNewName("");
  };

  const startGame = () => {
    if (players.length < 2) return;
    const fresh = players.map(p => ({ ...p, score: 0, miss: 0, out: false, log: [] }));
    setPlayers(fresh);
    setStarted(true);
    setTurnIdx(0);
    setGameOver(false);
    setWinner(null);
    setEditing(null);
  };

  const resetGame = () => {
    setStarted(false); setTurnIdx(0); setInputVal("");
    setGameOver(false); setWinner(null); setEditing(null);
    setPlayers(prev => prev.map(p => ({ ...p, score: 0, miss: 0, out: false, log: [] })));
  };

  const fullReset = () => { resetGame(); setPlayers([]); };

  const submit = useCallback(() => {
    const thrown = parseInt(inputVal, 10);
    if (isNaN(thrown) || thrown < 0 || thrown > 12) return;
    setPlayers(prev => {
      const live = prev.filter(p => !p.out);
      if (!live.length) return prev;
      const cur = live[turnIdx % live.length];
      const idx = prev.findIndex(p => p.name === cur.name);
      const newLog = [...prev[idx].log, { thrown }];
      const { score, miss, out, entries } = replayPlayer(newLog);
      const updated = prev.map((p, i) =>
        i === idx ? { ...p, score, miss, out, log: entries } : p
      );
      const remaining = updated.filter(x => !x.out);
      if (!out && score === MAX_SCORE) {
        setTimeout(() => { setWinner(cur.name); setGameOver(true); }, 60);
        return updated;
      }
      if (remaining.length <= 1) {
        setTimeout(() => { setWinner(remaining[0]?.name ?? null); setGameOver(true); }, 60);
        return updated;
      }
      const nextLive = updated.filter(x => !x.out);
      const curInNext = nextLive.findIndex(x => x.name === cur.name);
      setTimeout(() => setTurnIdx((curInNext + 1) % nextLive.length), 0);
      return updated;
    });
    setInputVal("");
  }, [inputVal, turnIdx]);

  const saveEdit = useCallback(() => {
    if (!editing || editing.value === "") return;
    const thrown = parseInt(editing.value, 10);
    if (isNaN(thrown) || thrown < 0 || thrown > 12) return;
    setPlayers(prev => {
      const idx = prev.findIndex(p => p.name === editing.playerName);
      if (idx === -1) return prev;
      const rawLog = prev[idx].log.map((e, i) =>
        i === editing.logIdx ? { thrown } : { thrown: e.thrown }
      );
      const { score, miss, out, entries } = replayPlayer(rawLog);
      const updated = prev.map((p, i) =>
        i === idx ? { ...p, score, miss, out, log: entries } : p
      );
      const won = updated.find(p => p.score === MAX_SCORE && !p.out);
      if (won) setTimeout(() => { setWinner(won.name); setGameOver(true); }, 60);
      else if (gameOver) { setGameOver(false); set
