// ── APP.JS ───────────────────────────────────────────────────
// FIFA World Cup 2026 Predictor

let roundStatuses = {};
let currentRound  = null;
let currentPicks  = {};
let leaderboard   = {};
let myPredictions = {};
let roundListener = null;

// ─── UTIL ─────────────────────────────────────────────────────
function toast(msg, dur = 2200) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), dur);
}
function getRoundStatus(id) { return roundStatuses[id]?.status || 'locked'; }
function getActiveRound()   { return ROUNDS.find(r => ['open','scoring'].includes(getRoundStatus(r.id))); }
function getMatchTeams(roundId, match) {
  const o = (roundStatuses[roundId]?.teams || {})[match.id];
  return { home: o?.home || match.home, away: o?.away || match.away };
}

// ─── BOOT ─────────────────────────────────────────────────────
async function boot() {
  const user = Auth.loadSession();
  if (!user) { showScreen('login'); initLoginUI(); return; }
  showScreen('loading');
  await initApp(user);
}

function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + name)?.classList.add('active');
}

async function initApp(user) {
  document.getElementById('user-display').textContent = user.displayName;
  document.getElementById('user-avatar').textContent  = user.displayName.charAt(0).toUpperCase();
  document.getElementById('tab-admin-btn').style.display = user.isAdmin ? 'flex' : 'none';

  await Promise.all([loadRoundStatuses(), loadMyPredictions(user.username), loadLeaderboard()]);

  roundListener = window.wcDb.collection('rounds').onSnapshot(snap => {
    snap.forEach(doc => { roundStatuses[doc.id] = doc.data(); });
    if (currentRound) renderRoundDetailPage(currentRound);
    else renderRoundsGrid();
  });

  showScreen('app');
  showTab('rounds');
}

async function loadRoundStatuses() { roundStatuses = await Admin.getAllRoundStatuses(); }
async function loadLeaderboard()   { leaderboard   = await Admin.getLeaderboard(); }
async function loadMyPredictions(username) {
  const snap = await window.wcDb.collection('predictions').where('username','==',username).get();
  myPredictions = {};
  snap.forEach(doc => { const d = doc.data(); myPredictions[d.roundId] = d; });
}

// ─── TABS ─────────────────────────────────────────────────────
function showTab(name) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  document.querySelector(`[data-tab="${name}"]`).classList.add('active');
  // Hide submit bar when not on prediction view
  setSubmitBarVisible(false);
  if (name === 'rounds')  { currentRound = null; currentPicks = {}; renderRoundsGrid(); }
  if (name === 'groups')  renderGroupsTab();
  if (name === 'league')  renderLeague();
  if (name === 'admin')   renderAdmin();
}

// ─── SUBMIT BAR ───────────────────────────────────────────────
function setSubmitBarVisible(visible) {
  document.getElementById('submit-wrap').style.display = visible ? 'flex' : 'none';
}

function updateProgress(roundId) {
  if (!roundId) return;
  const total = getRoundById(roundId)?.matches.length || 0;
  const done  = Object.keys(currentPicks).length;
  const pct   = Math.round((done / total) * 100);
  document.getElementById('prog-label').textContent = `${done} of ${total} picked`;
  document.getElementById('prog-fill').style.width  = pct + '%';
  const btn = document.getElementById('submit-btn');
  if (btn) btn.disabled = done < total;
}

// ─── ROUNDS GRID ──────────────────────────────────────────────
function renderRoundsGrid() {
  const tab = document.getElementById('tab-rounds');

  const icons  = { gs1:'⚽', gs2:'⚽', gs3:'⚽', r32:'🔴', r16:'🔵', qf:'🟡', sf:'🏅', tp:'🥉', final:'🏆' };
  const labels = { locked:'Locked', open:'Open', scoring:'Live', complete:'Done' };

  function tileHTML(roundId) {
    const round  = getRoundById(roundId);
    const status = getRoundStatus(roundId);
    const hasMine = !!myPredictions[roundId];
    const clickable = status !== 'locked';
    return `<div class="round-tile t-${status}${clickable?' clickable':''}" ${clickable?`onclick="openRoundDetail('${roundId}')"`:''}> 
      ${hasMine && status !== 'locked' ? '<span class="done-tick">✓</span>' : ''}
      <span class="rt-icon">${icons[roundId]||'⚽'}</span>
      <span class="rt-label">${round.shortLabel}</span>
      <span class="rt-sub">${labels[status]||'Locked'}</span>
    </div>`;
  }

  tab.innerHTML = `<div class="page">
    <div class="phase-label">Group Stage</div>
    <div class="rounds-grid">
      ${['gs1','gs2','gs3'].map(tileHTML).join('')}
    </div>
    <div class="phase-label">Knockout Rounds</div>
    <div class="rounds-grid">
      ${['r32','r16','qf','sf','tp','final'].map(tileHTML).join('')}
    </div>
    <div style="display:flex;gap:14px;flex-wrap:wrap;margin-top:14px">
      <span style="font-size:11px;color:var(--muted);display:flex;align-items:center;gap:5px"><span style="width:10px;height:10px;border-radius:2px;background:var(--gold-dim);border:1px solid var(--gold);display:inline-block"></span>Open</span>
      <span style="font-size:11px;color:var(--muted);display:flex;align-items:center;gap:5px"><span style="width:10px;height:10px;border-radius:2px;background:rgba(255,152,0,.1);border:1px solid var(--amber);display:inline-block"></span>Live</span>
      <span style="font-size:11px;color:var(--green)">✓ = picks in</span>
    </div>
  </div>`;
}

// ─── ROUND DETAIL ─────────────────────────────────────────────
function openRoundDetail(roundId) {
  currentRound = roundId;
  currentPicks = { ...(myPredictions[roundId]?.picks || {}) };
  renderRoundDetailPage(roundId);
}

function backToRounds() {
  currentRound = null;
  currentPicks = {};
  setSubmitBarVisible(false);
  renderRoundsGrid();
}

function renderRoundDetailPage(roundId) {
  const user    = Auth.getCurrentUser();
  const round   = getRoundById(roundId);
  const status  = getRoundStatus(roundId);
  const results = roundStatuses[roundId]?.results || {};
  const myPred  = myPredictions[roundId];
  const isOpen     = status === 'open';
  const isScoring  = status === 'scoring';
  const isComplete = status === 'complete';

  const sbClass = { open:'sb-open', scoring:'sb-scoring', complete:'sb-complete' }[status] || 'sb-complete';
  const sbLabel = { open:'Open', scoring:'Live', complete:'Complete' }[status] || status;

  let html = `<div class="page${isOpen ? ' has-submit' : ''}">
    <div class="detail-header">
      <button class="back-btn" onclick="backToRounds()">← Back</button>
      <h2>${round.label}</h2>
      <span class="status-badge ${sbClass}">${sbLabel}</span>
    </div>`;

  // ── OPEN: pick form ───────────────────────────────────────
  if (isOpen) {
    if (myPred) {
      html += `<div style="background:rgba(0,200,83,.08);border:1px solid var(--green);border-radius:var(--radius);padding:12px 14px;margin-bottom:1rem;display:flex;align-items:center;gap:10px">
        <span style="font-size:20px">✅</span>
        <div>
          <div style="font-weight:700;font-size:14px">Picks submitted</div>
          <div style="font-size:12px;color:var(--muted)">You can update until this round goes live</div>
        </div>
      </div>`;
    }

    if (round.phase === 'group') {
      const byGroup = {};
      round.matches.forEach(m => { (byGroup[m.group] = byGroup[m.group]||[]).push(m); });
      Object.keys(byGroup).sort().forEach(grp => {
        html += `<div class="match-group-tag">Group ${grp}</div>`;
        byGroup[grp].forEach(m => { html += matchCardHTML(m, roundId); });
      });
    } else {
      round.matches.forEach((m, i) => {
        const t = getMatchTeams(roundId, m);
        html += matchCardHTML({...m, home:t.home, away:t.away}, roundId, i+1);
      });
    }
  }

  // ── SCORING / COMPLETE: my picks + results ────────────────
  if (isScoring || isComplete) {
    html += `<div class="card">
      <div class="card-label">Your picks${myPred?.scored ? ` · ${myPred.score} pts` : ''}</div>`;

    if (!myPred) {
      html += `<p style="font-size:13px;color:var(--muted)">You didn't submit picks for this round.</p>`;
    } else {
      const picks = myPred.picks || {};
      round.matches.forEach((m, i) => {
        const t    = getMatchTeams(roundId, m);
        const pick = picks[m.id];
        const res  = results[m.id];
        const correct = pick && res && pick === res;
        const wrong   = pick && res && pick !== res;
        const pickLabel = !pick ? '–' : pick==='H' ? `${t.home} Win` : pick==='A' ? `${t.away} Win` : 'Draw';
        const prefix = m.group ? `Grp ${m.group}: ` : `Match ${i+1}: `;
        html += `<div style="display:flex;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);gap:8px">
          <span style="flex:1;font-size:13px;color:var(--muted)">${prefix}${flag(t.home)} ${t.home} vs ${flag(t.away)} ${t.away}</span>
          <span style="font-weight:700;font-size:13px">${pickLabel}</span>
          ${correct ? '<span class="result-chip chip-ok">✓</span>' : wrong ? '<span class="result-chip chip-no">✗</span>' : '<span class="result-chip chip-pending">–</span>'}
        </div>`;
      });
    }
    html += `</div>`;

    // Admin results entry
    if (user.isAdmin) {
      html += `<div class="card"><div class="card-label">Enter results (admin)</div>`;
      round.matches.forEach((m, i) => {
        const t   = getMatchTeams(roundId, m);
        const res = results[m.id];
        const prefix = m.group ? `Group ${m.group}` : `Match ${i+1}`;
        html += `<div class="match-card">
          <div class="match-group-tag">${prefix}${round.phase==='knockout'?` · <span class="tbd-edit" onclick="editTeamName('${roundId}','${m.id}','home','${t.home}')">✏ ${t.home}</span> vs <span class="tbd-edit" onclick="editTeamName('${roundId}','${m.id}','away','${t.away}')">✏ ${t.away}</span>`:''}</div>
          ${round.phase==='group'?`<div style="font-size:13px;font-weight:700;margin-bottom:10px">${flag(t.home)} ${t.home} vs ${flag(t.away)} ${t.away}</div>`:''}
          <div class="pred-row">
            <button class="pred-btn${res==='H'?' sel-H':''}" onclick="adminSetResult('${roundId}','${m.id}','H',this)">${t.home} Win</button>
            <button class="pred-btn${res==='D'?' sel-D':''}" onclick="adminSetResult('${roundId}','${m.id}','D',this)">Draw</button>
            <button class="pred-btn${res==='A'?' sel-A':''}" onclick="adminSetResult('${roundId}','${m.id}','A',this)">${t.away} Win</button>
          </div>
        </div>`;
      });
      const entered = Object.keys(results).length;
      html += `<div style="margin-top:.75rem;text-align:right">
        <button class="btn" onclick="adminScoreRound('${roundId}')">Score (${entered}/${round.matches.length} results)</button>
      </div></div>`;
    }
  }

  html += `</div>`;
  document.getElementById('tab-rounds').innerHTML = html;

  // Show/update submit bar
  if (isOpen) {
    setSubmitBarVisible(true);
    document.getElementById('submit-btn').textContent = myPred ? 'Update picks' : 'Submit picks';
    document.getElementById('submit-btn').onclick = () => submitPredictions(roundId);
    updateProgress(roundId);
  } else {
    setSubmitBarVisible(false);
  }
}

function matchCardHTML(m, roundId, matchNum) {
  const pick = currentPicks[m.id] || null;
  const groupTag = m.group ? `Group ${m.group}` : `Match ${matchNum}`;
  return `<div class="match-card">
    <div class="match-group-tag">${groupTag}</div>
    <div class="match-teams">
      <div class="match-team">
        <span class="match-flag">${flag(m.home)}</span>
        <span class="match-name">${m.home}</span>
      </div>
      <span class="match-vs">VS</span>
      <div class="match-team away">
        <span class="match-flag">${flag(m.away)}</span>
        <span class="match-name">${m.away}</span>
      </div>
    </div>
    <div class="pred-row">
      <button class="pred-btn${pick==='H'?' sel-H':''}" onclick="pick('${m.id}','H',this)">${m.home}<br>Win</button>
      <button class="pred-btn${pick==='D'?' sel-D':''}" onclick="pick('${m.id}','D',this)">Draw</button>
      <button class="pred-btn${pick==='A'?' sel-A':''}" onclick="pick('${m.id}','A',this)">${m.away}<br>Win</button>
    </div>
  </div>`;
}

// ─── PICK / SUBMIT ────────────────────────────────────────────
function pick(matchId, val, btn) {
  currentPicks[matchId] = val;
  btn.closest('.pred-row').querySelectorAll('.pred-btn').forEach(b => b.classList.remove('sel-H','sel-D','sel-A'));
  btn.classList.add('sel-' + val);
  updateProgress(currentRound);
}

async function submitPredictions(roundId) {
  const user  = Auth.getCurrentUser();
  const round = getRoundById(roundId);
  if (Object.keys(currentPicks).length < round.matches.length) {
    toast(`Pick all ${round.matches.length} matches first`); return;
  }
  const btn = document.getElementById('submit-btn');
  btn.disabled = true; btn.textContent = 'Saving…';
  try {
    await window.wcDb.collection('predictions').doc(`${user.username}_${roundId}`).set({
      username: user.username, roundId,
      picks: { ...currentPicks },
      submittedAt: firebase.firestore.FieldValue.serverTimestamp(),
      scored: false, score: null,
    });
    myPredictions[roundId] = { picks: { ...currentPicks }, scored: false, score: null };
    toast('Picks saved ✓');
    renderRoundDetailPage(roundId);
  } catch(e) {
    toast('Error saving — check connection');
    btn.disabled = false;
    btn.textContent = 'Submit picks';
  }
}

// ─── ADMIN ACTIONS ────────────────────────────────────────────
async function adminSetResult(roundId, matchId, result, btn) {
  try {
    await Admin.setResult(roundId, matchId, result);
    if (!roundStatuses[roundId]) roundStatuses[roundId] = {};
    if (!roundStatuses[roundId].results) roundStatuses[roundId].results = {};
    roundStatuses[roundId].results[matchId] = result;
    btn.closest('.pred-row').querySelectorAll('.pred-btn').forEach(b => b.classList.remove('sel-H','sel-D','sel-A'));
    btn.classList.add('sel-' + result);
  } catch(e) { toast(e.message); }
}

async function adminScoreRound(roundId) {
  try {
    const count = await Admin.scoreRound(roundId);
    await loadMyPredictions(Auth.getCurrentUser().username);
    await loadLeaderboard();
    toast(`Scored ${count} sheets ✓`);
    renderRoundDetailPage(roundId);
  } catch(e) { toast(e.message); }
}

function editTeamName(roundId, matchId, side, current) {
  const name = prompt(`${side === 'home' ? 'Home' : 'Away'} team:`, current === 'TBD' ? '' : current);
  if (!name?.trim()) return;
  const existing = roundStatuses[roundId]?.teams?.[matchId] || {};
  const updated  = { ...existing, [side]: name.trim() };
  Admin.updateKnockoutTeams(roundId, matchId, updated.home||'TBD', updated.away||'TBD')
    .then(() => {
      if (!roundStatuses[roundId]) roundStatuses[roundId] = {};
      if (!roundStatuses[roundId].teams) roundStatuses[roundId].teams = {};
      roundStatuses[roundId].teams[matchId] = updated;
      toast(`Updated ✓`);
      renderRoundDetailPage(roundId);
    }).catch(e => toast(e.message));
}

// ─── GROUPS TAB ───────────────────────────────────────────────
function renderGroupsTab() {
  const el = document.getElementById('tab-groups');
  const allResults = {};
  ['gs1','gs2','gs3'].forEach(rId => {
    const res = roundStatuses[rId]?.results || {};
    getRoundById(rId).matches.forEach(m => {
      if (res[m.id]) allResults[m.id] = { result:res[m.id], home:m.home, away:m.away };
    });
  });

  let html = '<div class="page">';
  Object.keys(GROUPS).sort().forEach(grp => {
    const teams = GROUPS[grp];
    const stats = {};
    teams.forEach(t => { stats[t] = { p:0,w:0,d:0,l:0,pts:0 }; });
    Object.values(allResults).forEach(({ result, home, away }) => {
      if (!stats[home] || !stats[away]) return;
      stats[home].p++; stats[away].p++;
      if (result==='H') { stats[home].w++; stats[home].pts+=3; stats[away].l++; }
      else if (result==='A') { stats[away].w++; stats[away].pts+=3; stats[home].l++; }
      else { stats[home].d++; stats[home].pts++; stats[away].d++; stats[away].pts++; }
    });
    const sorted = [...teams].sort((a,b) => stats[b].pts-stats[a].pts || stats[b].w-stats[a].w);
    html += `<div class="card">
      <div class="group-header"><span class="group-badge">Group ${grp}</span></div>
      <table class="group-table">
        <thead><tr><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>Pts</th></tr></thead>
        <tbody>`;
    sorted.forEach((t,i) => {
      const s = stats[t];
      html += `<tr class="${i<2?'qualify-row':''}">
        <td>${flag(t)} ${t}</td>
        <td>${s.p}</td><td>${s.w}</td><td>${s.d}</td><td>${s.l}</td>
        <td style="font-weight:800">${s.pts}</td>
      </tr>`;
    });
    html += `</tbody></table></div>`;
  });
  html += '</div>';
  el.innerHTML = html;
}

// ─── LEAGUE TAB ───────────────────────────────────────────────
async function renderLeague() {
  await loadLeaderboard();
  const user = Auth.getCurrentUser();
  const el   = document.getElementById('tab-league');

  const usersSnap = await window.wcDb.collection('users').get();
  const displayNames = {};
  usersSnap.forEach(doc => { displayNames[doc.id] = doc.data().displayName; });

  const ranked = Object.entries(leaderboard)
    .filter(([u]) => u !== ADMIN_USERNAME.toLowerCase())
    .map(([username, total]) => ({ username, displayName: displayNames[username]||username, total }))
    .sort((a,b) => b.total - a.total);

  const max = ranked[0]?.total || 1;

  let html = `<div class="page"><div class="card">
    <div class="card-label">Standings</div>`;

  if (!ranked.length) {
    html += `<div class="empty"><div class="e-icon">🏆</div>No scores yet</div>`;
  } else {
    ranked.forEach((r, i) => {
      const rc  = i===0?'r1':i===1?'r2':i===2?'r3':'';
      const pct = max > 0 ? Math.round((r.total/max)*100) : 0;
      const isMe = r.username === user.username;
      html += `<div class="lb-row">
        <div class="lb-rank ${rc}">${i+1}</div>
        <div class="lb-info">
          <div class="lb-name${isMe?' me':''}">${r.displayName}</div>
          <div class="lb-bar-bg"><div class="lb-bar-fill" style="width:${pct}%"></div></div>
        </div>
        <div class="lb-pts">${r.total}<small> pts</small></div>
      </div>`;
    });
  }
  html += `</div></div>`;
  el.innerHTML = html;
}

// ─── ADMIN TAB ────────────────────────────────────────────────
async function renderAdmin() {
  const el = document.getElementById('tab-admin');
  const activeRound = getActiveRound();
  const usersSnap = await window.wcDb.collection('users').get();
  const playerCount = [...usersSnap.docs].filter(d => !d.data().isAdmin).length;

  const rows = ROUNDS.map(round => {
    const status = getRoundStatus(round.id);
    const spClass = `sp-${status}`;
    const spLabel = { locked:'Locked', open:'Open', scoring:'Scoring', complete:'Complete' }[status];
    const idx = getRoundIndex(round.id);
    let actions = '';
    if (status === 'locked') {
      const prevOk = idx===0 || getRoundStatus(ROUNDS[idx-1].id)==='complete';
      if (!activeRound && prevOk) actions = `<button class="btn btn-sm" onclick="adminOpenRound('${round.id}')">Open</button>`;
    } else if (status === 'open') {
      actions = `<button class="btn-outline" style="font-size:12px;padding:6px 11px" onclick="adminMoveRound('${round.id}','scoring')">→ Scoring</button>`;
    } else if (status === 'scoring') {
      actions = `<button class="btn-outline" style="font-size:12px;padding:6px 11px" onclick="adminMoveRound('${round.id}','complete')">→ Complete</button>`;
    }
    return `<div class="round-admin-row">
      <div style="flex:1">
        <div class="round-admin-label">${round.label}</div>
        <div class="round-admin-sub">${round.matches.length} matches</div>
      </div>
      <span class="status-pill ${spClass}">${spLabel}</span>
      ${actions}
    </div>`;
  }).join('');

  el.innerHTML = `<div class="page"><div class="card">
    <div class="admin-section">
      <h3>Stats</h3>
      <div class="stat-row">
        <div class="stat-box"><div class="stat-n">${playerCount}</div><div class="stat-l">Players</div></div>
        <div class="stat-box"><div class="stat-n">${ROUNDS.filter(r=>getRoundStatus(r.id)==='complete').length}/${ROUNDS.length}</div><div class="stat-l">Rounds done</div></div>
      </div>
    </div>
    <div class="admin-section">
      <h3>Round control</h3>
      ${rows}
    </div>
  </div></div>`;
}

async function adminOpenRound(roundId) {
  try {
    await Admin.setRoundStatus(roundId, 'open');
    roundStatuses[roundId] = { ...(roundStatuses[roundId]||{}), status:'open', roundId };
    toast(`${getRoundById(roundId).label} is now open ✓`);
    renderAdmin();
  } catch(e) { toast(e.message); }
}

async function adminMoveRound(roundId, status) {
  try {
    await Admin.setRoundStatus(roundId, status);
    roundStatuses[roundId] = { ...(roundStatuses[roundId]||{}), status, roundId };
    toast(`Moved to ${status} ✓`);
    renderAdmin();
  } catch(e) { toast(e.message); }
}

// ─── USER MENU ────────────────────────────────────────────────
function toggleUserMenu() {
  const existing = document.getElementById('user-menu');
  if (existing) { existing.remove(); return; }
  const user = Auth.getCurrentUser();
  const menu = document.createElement('div');
  menu.id = 'user-menu';
  menu.style.cssText = `position:fixed;top:54px;right:12px;background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius-lg);padding:.75rem;z-index:200;min-width:160px;box-shadow:0 8px 32px rgba(0,0,0,.5)`;
  menu.innerHTML = `
    <div style="font-size:13px;font-weight:700;padding:4px 8px;margin-bottom:6px">${user.displayName}</div>
    <div style="height:1px;background:var(--border);margin-bottom:6px"></div>
    <button onclick="logout()" style="width:100%;text-align:left;background:none;border:none;color:var(--red);font-size:13px;padding:6px 8px;cursor:pointer;border-radius:6px;font-family:inherit">Sign out</button>`;
  document.body.appendChild(menu);
  setTimeout(() => {
    document.addEventListener('click', function d(e) {
      if (!menu.contains(e.target)) { menu.remove(); document.removeEventListener('click', d); }
    });
  }, 10);
}

function logout() {
  if (roundListener) roundListener();
  Auth.logout();
  location.reload();
}

// ─── INIT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', boot);
