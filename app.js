// ── APP.JS ───────────────────────────────────────────────────
// FIFA World Cup 2026 Predictor — main app logic

let roundStatuses = {};   // { roundId: { status, results, teams } }
let currentRound = null;  // roundId being viewed
let currentPicks = {};    // { matchId: 'H'|'D'|'A' }
let leaderboard = {};     // { username: totalScore }
let myPredictions = {};   // { roundId: { picks, score, scored } }
let roundListener = null;

// ─── UTIL ─────────────────────────────────────────────────────
function toast(msg, dur = 2200) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), dur);
}

function getRoundStatus(roundId) {
  return roundStatuses[roundId]?.status || 'locked';
}

function getActiveRound() {
  return ROUNDS.find(r => ['open','scoring'].includes(getRoundStatus(r.id)));
}

// Get effective match teams (admin may have updated knockout teams)
function getMatchTeams(roundId, match) {
  const overrides = roundStatuses[roundId]?.teams || {};
  const override = overrides[match.id];
  return {
    home: override?.home || match.home,
    away: override?.away || match.away,
  };
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
  const el = document.getElementById('screen-' + name);
  if (el) el.classList.add('active');
}

async function initApp(user) {
  document.getElementById('user-display').textContent = user.displayName;
  document.getElementById('user-avatar').textContent = user.displayName.charAt(0).toUpperCase();
  document.getElementById('tab-admin-btn').style.display = user.isAdmin ? 'flex' : 'none';

  await Promise.all([loadRoundStatuses(), loadMyPredictions(user.username), loadLeaderboard()]);

  // Real-time listener for round updates
  roundListener = window.wcDb.collection('rounds').onSnapshot(snap => {
    snap.forEach(doc => { roundStatuses[doc.id] = doc.data(); });
    renderRoundsGrid();
    if (currentRound) renderRoundDetail(currentRound);
  });

  showScreen('app');
  showTab('rounds');
}

async function loadRoundStatuses() {
  roundStatuses = await Admin.getAllRoundStatuses();
}

async function loadMyPredictions(username) {
  const snap = await window.wcDb.collection('predictions')
    .where('username', '==', username).get();
  myPredictions = {};
  snap.forEach(doc => {
    const d = doc.data();
    myPredictions[d.roundId] = d;
  });
}

async function loadLeaderboard() {
  leaderboard = await Admin.getLeaderboard();
}

// ─── TABS ─────────────────────────────────────────────────────
function showTab(name) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  document.querySelector(`[data-tab="${name}"]`).classList.add('active');
  if (name === 'rounds')  { renderRoundsGrid(); }
  if (name === 'groups')  { renderGroupsTab(); }
  if (name === 'league')  { renderLeague(); }
  if (name === 'history') { renderHistory(); }
  if (name === 'admin')   { renderAdmin(); }
}

// ─── ROUNDS GRID ──────────────────────────────────────────────
function renderRoundsGrid() {
  const container = document.getElementById('rounds-grid');
  if (!container) return;
  container.innerHTML = '';

  // Group stage
  const gsDiv = document.createElement('div');
  gsDiv.innerHTML = '<div class="phase-divider">Group Stage</div>';
  const gsGrid = document.createElement('div');
  gsGrid.className = 'rounds-grid';
  ['gs1','gs2','gs3'].forEach(id => {
    gsGrid.appendChild(buildRoundTile(id));
  });
  gsDiv.appendChild(gsGrid);
  container.appendChild(gsDiv);

  // Knockouts
  const koDiv = document.createElement('div');
  koDiv.innerHTML = '<div class="phase-divider" style="margin-top:1rem">Knockout Rounds</div>';
  const koGrid = document.createElement('div');
  koGrid.className = 'rounds-grid';
  ['r32','r16','qf','sf','tp','final'].forEach(id => {
    koGrid.appendChild(buildRoundTile(id));
  });
  koDiv.appendChild(koGrid);
  container.appendChild(koDiv);
}

function buildRoundTile(roundId) {
  const round = getRoundById(roundId);
  const status = getRoundStatus(roundId);
  const hasMine = !!myPredictions[roundId];
  const matchCount = round.matches.length;

  const tile = document.createElement('div');
  tile.className = `round-tile t-${status}${status !== 'locked' ? ' clickable' : ''}${roundId === 'final' ? ' t-final' : ''}`;

  const labels = { locked:'', open:'Open', scoring:'Live', complete:'Done' };
  const icons = { gs1:'⚽', gs2:'⚽', gs3:'⚽', r32:'🔴', r16:'🔵', qf:'🟡', sf:'🏅', tp:'🥉', final:'🏆' };

  tile.innerHTML = `
    ${hasMine && status !== 'locked' ? '<span class="done-tick">✓</span>' : ''}
    <span style="font-size:18px;line-height:1;margin-bottom:3px">${icons[roundId] || '⚽'}</span>
    <span class="rt-label">${round.shortLabel}</span>
    <span class="rt-sub">${labels[status] || 'Locked'}</span>
    <span class="rt-count">${matchCount} games</span>
  `;
  if (status !== 'locked') tile.onclick = () => openRoundDetail(roundId);
  return tile;
}

// ─── ROUND DETAIL ─────────────────────────────────────────────
function openRoundDetail(roundId) {
  currentRound = roundId;
  currentPicks = {};
  // Pre-fill existing picks
  if (myPredictions[roundId]) {
    currentPicks = { ...(myPredictions[roundId].picks || {}) };
  }
  renderRoundDetailPage(roundId);
}

function backToRounds() {
  currentRound = null;
  currentPicks = {};
  const tab = document.getElementById('tab-rounds');
  tab.innerHTML = buildRoundsPageHTML();
  renderRoundsGrid();
}

function buildRoundsPageHTML() {
  return `<div class="page">
    <div class="card">
      <div class="card-label">FIFA World Cup 2026</div>
      <div id="rounds-grid"></div>
      <div style="display:flex;gap:14px;flex-wrap:wrap;margin-top:12px">
        <span style="font-size:11px;color:var(--muted);display:flex;align-items:center;gap:5px"><span style="width:10px;height:10px;border-radius:2px;background:var(--gold-dim);border:1px solid var(--gold);display:inline-block"></span>Open</span>
        <span style="font-size:11px;color:var(--muted);display:flex;align-items:center;gap:5px"><span style="width:10px;height:10px;border-radius:2px;background:rgba(255,152,0,.1);border:1px solid var(--amber);display:inline-block"></span>Live</span>
        <span style="font-size:11px;color:var(--muted);display:flex;align-items:center;gap:5px"><span style="width:10px;height:10px;border-radius:2px;background:var(--surface);border:1px solid var(--border);display:inline-block;opacity:.5"></span>Locked</span>
        <span style="font-size:11px;color:var(--green)">✓ = picks submitted</span>
      </div>
    </div>
  </div>`;
}

async function renderRoundDetail(roundId) {
  renderRoundDetailPage(roundId);
}

function renderRoundDetailPage(roundId) {
  const user = Auth.getCurrentUser();
  const round = getRoundById(roundId);
  const status = getRoundStatus(roundId);
  const rdData = roundStatuses[roundId] || {};
  const results = rdData.results || {};
  const myPred = myPredictions[roundId];
  const isOpen = status === 'open';
  const isScoring = status === 'scoring';
  const isComplete = status === 'complete';

  const sbClass = { open:'sb-open', scoring:'sb-scoring', complete:'sb-complete' }[status] || 'sb-complete';
  const sbLabel = { open:'Open', scoring:'Live — results pending', complete:'Complete' }[status] || status;

  let html = `<div class="page">
    <div class="detail-header">
      <button class="back-btn" onclick="backToRounds()">← Back</button>
      <h2>${round.label}</h2>
      <span class="status-badge ${sbClass}">${sbLabel}</span>
    </div>`;

  // ── OPEN: prediction form ─────────────────────────────────
  if (isOpen) {
    if (myPred) {
      html += `<div class="card" style="border-color:var(--gold);margin-bottom:.85rem">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:18px">✅</span>
          <div><div style="font-weight:700">Predictions submitted!</div>
          <div style="font-size:12px;color:var(--muted)">You can update your picks until this round goes live.</div></div>
        </div>
      </div>`;
    }

    // Group matches by group label for group stage
    if (round.phase === 'group') {
      const byGroup = {};
      round.matches.forEach(m => {
        if (!byGroup[m.group]) byGroup[m.group] = [];
        byGroup[m.group].push(m);
      });
      Object.keys(byGroup).sort().forEach(grp => {
        html += `<div class="match-group-tag">Group ${grp}</div>`;
        byGroup[grp].forEach(m => { html += buildMatchCard(m, roundId, false); });
      });
    } else {
      // Knockout — show TBD teams
      round.matches.forEach((m, i) => {
        const teams = getMatchTeams(roundId, m);
        html += buildMatchCard({ ...m, home: teams.home, away: teams.away }, roundId, false, i+1);
      });
    }
    html += `</div>`; // close page
    // Submit bar outside page for sticky positioning
    html += `<div class="submit-bar" id="submit-bar">
      <div class="progress">
        <div class="prog-label" id="prog-label">0/${round.matches.length} picked</div>
        <div class="prog-bar"><div class="prog-fill" id="prog-fill" style="width:0%"></div></div>
      </div>
      <button class="btn" id="submit-btn" onclick="submitPredictions('${roundId}')" disabled>${myPred ? 'Update' : 'Submit'}</button>
    </div>`;
  }

  // ── SCORING / COMPLETE: show picks + results ──────────────
  if (isScoring || isComplete) {
    // My picks
    html += `<div class="card">
      <div class="card-label">Your picks${myPred?.scored ? ` · ${myPred.score} pts` : ''}</div>`;
    if (!myPred) {
      html += `<p style="font-size:13px;color:var(--muted)">You didn't submit predictions for this round.</p>`;
    } else {
      const picks = myPred.picks || {};
      round.matches.forEach((m, i) => {
        const teams = getMatchTeams(roundId, m);
        const pick = picks[m.id];
        const res = results[m.id];
        const correct = pick && res && pick === res;
        const wrong = pick && res && pick !== res;
        const pickLabel = !pick ? 'No pick' : pick === 'H' ? `${teams.home} Win` : pick === 'A' ? `${teams.away} Win` : 'Draw';
        const badge = correct ? '<span class="result-chip chip-ok">✓ Correct</span>'
          : wrong ? '<span class="result-chip chip-no">✗ Wrong</span>'
          : '<span class="result-chip chip-pending">Pending</span>';
        const groupTag = m.group ? `<span style="font-size:10px;color:var(--muted);font-weight:700">Group ${m.group} · </span>` : `<span style="font-size:10px;color:var(--muted)">Match ${i+1} · </span>`;
        html += `<div style="display:flex;align-items:center;font-size:13px;padding:7px 0;border-bottom:1px solid var(--border)">
          <div style="flex:1;min-width:0">
            ${groupTag}
            <span style="font-weight:700">${flag(teams.home)}${teams.home} vs ${flag(teams.away)}${teams.away}</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;margin-left:8px">
            <span style="font-weight:700;font-size:12px">${pickLabel}</span>
            ${badge}
          </div>
        </div>`;
      });
    }
    html += `</div>`;

    // Admin: results entry + team name editing for knockouts
    if (user.isAdmin) {
      html += `<div class="card">
        <div class="card-label">Enter results (admin)</div>`;

      if (round.phase === 'knockout') {
        html += `<p style="font-size:12px;color:var(--muted);margin-bottom:.75rem">Tap team names to update them once the bracket is set.</p>`;
      }

      round.matches.forEach((m, i) => {
        const teams = getMatchTeams(roundId, m);
        const res = results[m.id];
        html += `<div class="match-card">`;
        if (m.group) html += `<div class="match-group-tag">Group ${m.group}</div>`;
        html += `<div class="match-teams">`;
        if (round.phase === 'knockout') {
          html += `<div class="match-team">
            <span class="match-flag">${flag(teams.home)}</span>
            <span class="tbd-edit" onclick="editTeamName('${roundId}','${m.id}','home','${teams.home}')">${teams.home}</span>
          </div>
          <span class="match-vs">VS</span>
          <div class="match-team away">
            <span class="match-flag">${flag(teams.away)}</span>
            <span class="tbd-edit" onclick="editTeamName('${roundId}','${m.id}','away','${teams.away}')">${teams.away}</span>
          </div>`;
        } else {
          html += `<div class="match-team"><span class="match-flag">${flag(teams.home)}</span>${teams.home}</div>
          <span class="match-vs">VS</span>
          <div class="match-team away">${teams.away}<span class="match-flag">${flag(teams.away)}</span></div>`;
        }
        html += `</div>
          <div class="pred-row">
            <button class="pred-btn ${res==='H'?'sel-H':''}" onclick="adminSetResult('${roundId}','${m.id}','H',this)">${teams.home} Win</button>
            <button class="pred-btn ${res==='D'?'sel-D':''}" onclick="adminSetResult('${roundId}','${m.id}','D',this)">Draw / Pens</button>
            <button class="pred-btn ${res==='A'?'sel-A':''}" onclick="adminSetResult('${roundId}','${m.id}','A',this)">${teams.away} Win</button>
          </div>
        </div>`;
      });

      const enteredCount = Object.keys(results).length;
      html += `<div style="margin-top:.75rem;text-align:right">
        <button class="btn" onclick="adminScoreRound('${roundId}')">Score predictions (${enteredCount}/${round.matches.length})</button>
      </div></div>`;
    }
    html += `</div>`;
  }

  document.getElementById('tab-rounds').innerHTML = html;
  updateProgress(roundId);
}

function buildMatchCard(m, roundId, disabled, matchNum) {
  const pick = currentPicks[m.id] || null;
  const groupTag = m.group ? `<div class="match-group-tag">Group ${m.group}</div>` : (matchNum ? `<div class="match-group-tag">Match ${matchNum}</div>` : '');
  return `<div class="match-card">
    ${groupTag}
    <div class="match-teams">
      <div class="match-team"><span class="match-flag">${flag(m.home)}</span>${m.home}</div>
      <span class="match-vs">VS</span>
      <div class="match-team away">${m.away}<span class="match-flag">${flag(m.away)}</span></div>
    </div>
    <div class="pred-row">
      <button class="pred-btn ${pick==='H'?'sel-H':''}" onclick="pick('${m.id}','H',this)" ${disabled?'disabled':''}>${m.home} Win</button>
      <button class="pred-btn ${pick==='D'?'sel-D':''}" onclick="pick('${m.id}','D',this)" ${disabled?'disabled':''}>Draw</button>
      <button class="pred-btn ${pick==='A'?'sel-A':''}" onclick="pick('${m.id}','A',this)" ${disabled?'disabled':''}>${m.away} Win</button>
    </div>
  </div>`;
}

// ─── PICK / SUBMIT ────────────────────────────────────────────
function pick(matchId, val, btn) {
  currentPicks[matchId] = val;
  const row = btn.closest('.pred-row');
  row.querySelectorAll('.pred-btn').forEach(b => b.classList.remove('sel-H','sel-D','sel-A'));
  btn.classList.add('sel-' + val);
  updateProgress(currentRound);
}

function updateProgress(roundId) {
  if (!roundId) return;
  const total = getRoundById(roundId)?.matches.length || 0;
  const done = Object.keys(currentPicks).length;
  const pct = Math.round((done / total) * 100);
  const label = document.getElementById('prog-label');
  const fill = document.getElementById('prog-fill');
  const btn = document.getElementById('submit-btn');
  if (label) label.textContent = `${done}/${total} picked`;
  if (fill) fill.style.width = pct + '%';
  if (btn) btn.disabled = done < total;
}

async function submitPredictions(roundId) {
  const user = Auth.getCurrentUser();
  const round = getRoundById(roundId);
  if (Object.keys(currentPicks).length < round.matches.length) {
    toast(`Pick all ${round.matches.length} matches first`);
    return;
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
    toast('Predictions saved ✓');
    renderRoundDetailPage(roundId);
  } catch(e) {
    toast('Error saving — check your connection');
    btn.disabled = false;
    btn.textContent = 'Submit';
  }
}

// ─── ADMIN ACTIONS ────────────────────────────────────────────
async function adminSetResult(roundId, matchId, result, btn) {
  try {
    await Admin.setResult(roundId, matchId, result);
    if (!roundStatuses[roundId]) roundStatuses[roundId] = {};
    if (!roundStatuses[roundId].results) roundStatuses[roundId].results = {};
    roundStatuses[roundId].results[matchId] = result;
    const row = btn.closest('.pred-row');
    row.querySelectorAll('.pred-btn').forEach(b => b.classList.remove('sel-H','sel-D','sel-A'));
    btn.classList.add('sel-' + result);
  } catch(e) { toast(e.message); }
}

async function adminScoreRound(roundId) {
  try {
    const count = await Admin.scoreRound(roundId);
    await loadMyPredictions(Auth.getCurrentUser().username);
    await loadLeaderboard();
    toast(`Scored ${count} prediction sheets ✓`);
    renderRoundDetailPage(roundId);
  } catch(e) { toast(e.message); }
}

function editTeamName(roundId, matchId, side, current) {
  const name = prompt(`Enter ${side} team name:`, current === 'TBD' ? '' : current);
  if (!name || !name.trim()) return;
  const trimmed = name.trim();
  const rdData = roundStatuses[roundId] || {};
  const existing = rdData.teams?.[matchId] || {};
  const updated = { ...existing, [side]: trimmed };
  Admin.updateKnockoutTeams(roundId, matchId, updated.home || 'TBD', updated.away || 'TBD')
    .then(() => {
      if (!roundStatuses[roundId]) roundStatuses[roundId] = {};
      if (!roundStatuses[roundId].teams) roundStatuses[roundId].teams = {};
      roundStatuses[roundId].teams[matchId] = updated;
      toast(`Updated to ${trimmed} ✓`);
      renderRoundDetailPage(roundId);
    })
    .catch(e => toast(e.message));
}

// ─── GROUPS TAB ───────────────────────────────────────────────
function renderGroupsTab() {
  const el = document.getElementById('tab-groups');
  let html = '<div class="page">';

  // Show group tables with results from GS1/2/3
  const allResults = {};
  ['gs1','gs2','gs3'].forEach(rId => {
    const res = roundStatuses[rId]?.results || {};
    const round = getRoundById(rId);
    round.matches.forEach(m => {
      if (res[m.id]) allResults[m.id] = { result: res[m.id], home: m.home, away: m.away };
    });
  });

  Object.keys(GROUPS).sort().forEach(grp => {
    const teams = GROUPS[grp];
    const stats = {};
    teams.forEach(t => { stats[t] = { p:0, w:0, d:0, l:0, gf:0, ga:0, pts:0 }; });

    // Tally results
    Object.values(allResults).forEach(({ result, home, away }) => {
      if (!stats[home] || !stats[away]) return;
      stats[home].p++; stats[away].p++;
      if (result === 'H') { stats[home].w++; stats[home].pts+=3; stats[away].l++; }
      else if (result === 'A') { stats[away].w++; stats[away].pts+=3; stats[home].l++; }
      else { stats[home].d++; stats[home].pts++; stats[away].d++; stats[away].pts++; }
    });

    const sorted = teams.slice().sort((a,b) => stats[b].pts - stats[a].pts || stats[b].w - stats[a].w);

    html += `<div class="card group-section">
      <div class="group-header"><span class="group-badge">Group ${grp}</span></div>
      <table class="group-table">
        <thead><tr><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>Pts</th></tr></thead>
        <tbody>`;
    sorted.forEach((t, i) => {
      const s = stats[t];
      const qualifies = i < 2; // top 2 qualify (+ some 3rd place — simplified)
      html += `<tr class="${qualifies ? 'qualify-row' : ''}">
        <td>${flag(t)} ${t}</td>
        <td>${s.p}</td><td>${s.w}</td><td>${s.d}</td><td>${s.l}</td>
        <td style="font-weight:700">${s.pts}</td>
      </tr>`;
    });
    html += `</tbody></table>
      <p style="font-size:10px;color:var(--muted);margin-top:6px">Gold border = qualify</p>
    </div>`;
  });

  html += '</div>';
  el.innerHTML = html;
}

// ─── LEAGUE TAB ───────────────────────────────────────────────
async function renderLeague() {
  await loadLeaderboard();
  const user = Auth.getCurrentUser();
  const el = document.getElementById('tab-league');

  const usersSnap = await window.wcDb.collection('users').get();
  const displayNames = {};
  usersSnap.forEach(doc => { displayNames[doc.id] = doc.data().displayName; });

  const ranked = Object.entries(leaderboard)
    .filter(([u]) => u !== ADMIN_USERNAME.toLowerCase())
    .map(([username, total]) => ({ username, displayName: displayNames[username] || username, total }))
    .sort((a,b) => b.total - a.total);

  const max = ranked[0]?.total || 1;

  const roundScores = await Admin.getAllScoresByRound();
  const completedRounds = ROUNDS.filter(r => ['complete','scoring'].includes(getRoundStatus(r.id)));

  let html = `<div class="page">
    <div class="card">
      <div class="card-label">Overall standings</div>`;

  if (ranked.length === 0) {
    html += `<div class="empty"><div class="e-icon">🏆</div>No scores yet.</div>`;
  } else {
    ranked.forEach((r, i) => {
      const rc = i===0?'r1':i===1?'r2':i===2?'r3':'';
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
  html += `</div>`;

  // Round-by-round breakdown
  if (completedRounds.length > 0) {
    html += `<div class="card"><div class="card-label">Round breakdown</div>
      <div style="overflow-x:auto">
      <table style="width:100%;border-collapse:collapse;min-width:${180+completedRounds.length*52}px">
        <thead><tr>
          <th style="font-size:10px;color:var(--muted);text-align:left;padding:4px 8px;border-bottom:1px solid var(--border)">Player</th>
          ${completedRounds.map(r=>`<th style="font-size:10px;color:var(--muted);text-align:center;padding:4px 4px;border-bottom:1px solid var(--border)">${r.shortLabel}</th>`).join('')}
          <th style="font-size:10px;color:var(--muted);text-align:right;padding:4px 8px;border-bottom:1px solid var(--border)">Total</th>
        </tr></thead><tbody>`;
    ranked.forEach(r => {
      html += `<tr><td style="padding:8px 8px;font-size:13px;font-weight:700;border-bottom:1px solid var(--border)">${r.displayName}${r.username===user.username?' (you)':''}</td>`;
      completedRounds.forEach(round => {
        const pts = roundScores[r.username]?.[round.id];
        html += `<td style="text-align:center;font-size:13px;padding:8px 4px;border-bottom:1px solid var(--border)">${pts !== undefined ? pts : '–'}</td>`;
      });
      html += `<td style="text-align:right;font-size:14px;font-weight:800;padding:8px 8px;border-bottom:1px solid var(--border)">${r.total}</td></tr>`;
    });
    html += `</tbody></table></div></div>`;
  }

  // Max possible pts remaining
  const remaining = ROUNDS.filter(r => getRoundStatus(r.id) === 'locked').reduce((s,r) => s + r.matches.length, 0);
  if (remaining > 0) {
    html += `<p style="font-size:12px;color:var(--muted);text-align:center;margin-top:.5rem">${remaining} points still to play for</p>`;
  }

  html += '</div>';
  el.innerHTML = html;
}

// ─── HISTORY TAB ──────────────────────────────────────────────
async function renderHistory() {
  const user = Auth.getCurrentUser();
  await loadMyPredictions(user.username);

  const completedRounds = ROUNDS.filter(r => ['complete','scoring'].includes(getRoundStatus(r.id)));
  let totalPts = 0, totalPicked = 0, totalCorrect = 0;
  let rows = '';

  completedRounds.forEach(round => {
    const pred = myPredictions[round.id];
    const results = roundStatuses[round.id]?.results || {};
    const pts = pred?.score;
    if (pts !== null && pts !== undefined) totalPts += pts;

    rows += `<div class="card">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.75rem">
        <span style="font-weight:800;font-size:15px">${round.label}</span>
        ${pts !== null && pts !== undefined
          ? `<span style="font-size:18px;font-weight:800;color:var(--gold)">${pts}<span style="font-size:12px;font-weight:400;color:var(--muted)">/${round.matches.length}</span></span>`
          : '<span style="font-size:12px;color:var(--muted)">Not scored yet</span>'}
      </div>`;

    if (!pred) {
      rows += `<p style="font-size:13px;color:var(--muted)">No predictions submitted.</p>`;
    } else {
      const picks = pred.picks || {};
      round.matches.forEach((m, i) => {
        const teams = getMatchTeams(round.id, m);
        const pick = picks[m.id];
        const res = results[m.id];
        const correct = pick && res && pick === res;
        const wrong = pick && res && pick !== res;
        const pickLabel = !pick ? '–'
          : pick === 'H' ? `${teams.home} W`
          : pick === 'A' ? `${teams.away} W`
          : 'Draw';
        if (pick) totalPicked++;
        if (correct) totalCorrect++;
        const prefix = m.group ? `Grp ${m.group}: ` : `M${i+1}: `;
        rows += `<div style="display:flex;align-items:center;font-size:12px;padding:5px 0;border-bottom:1px solid var(--border)">
          <span style="flex:1;color:var(--muted)">${prefix}${flag(teams.home)}${teams.home} vs ${flag(teams.away)}${teams.away}</span>
          <span style="font-weight:700;margin-right:8px">${pickLabel}</span>
          ${correct ? '<span class="result-chip chip-ok">✓</span>'
            : wrong ? '<span class="result-chip chip-no">✗</span>'
            : '<span class="result-chip chip-pending">–</span>'}
        </div>`;
      });
    }
    rows += '</div>';
  });

  const accuracy = totalPicked > 0 ? Math.round((totalCorrect/totalPicked)*100) : 0;

  document.getElementById('tab-history').innerHTML = `<div class="page">
    <div class="stat-row">
      <div class="stat-box"><div class="stat-n">${totalPts}</div><div class="stat-l">Total pts</div></div>
      <div class="stat-box"><div class="stat-n">${completedRounds.length}</div><div class="stat-l">Rounds played</div></div>
      <div class="stat-box"><div class="stat-n">${accuracy}%</div><div class="stat-l">Accuracy</div></div>
    </div>
    ${rows || '<div class="empty"><div class="e-icon">📊</div>No completed rounds yet.</div>'}
  </div>`;
}

// ─── ADMIN TAB ────────────────────────────────────────────────
async function renderAdmin() {
  const el = document.getElementById('tab-admin');
  const activeRound = getActiveRound();

  const usersSnap = await window.wcDb.collection('users').get();
  const playerCount = [...usersSnap.docs].filter(d => !d.data().isAdmin).length;
  const completedCount = ROUNDS.filter(r => getRoundStatus(r.id) === 'complete').length;
  const totalGames = getTotalMatches();

  let roundRows = ROUNDS.map(round => {
    const status = getRoundStatus(round.id);
    const spClass = `sp-${status}`;
    const spLabel = { locked:'Locked', open:'Open', scoring:'Scoring', complete:'Complete' }[status];
    let actions = '';
    const idx = getRoundIndex(round.id);

    if (status === 'locked') {
      const noActive = !activeRound;
      const prevOk = idx === 0 || getRoundStatus(ROUNDS[idx-1].id) === 'complete';
      if (noActive && prevOk) {
        actions = `<button class="btn btn-sm" onclick="adminOpenRound('${round.id}')">Open</button>`;
      }
    } else if (status === 'open') {
      actions = `<button class="btn-outline" style="font-size:12px;padding:5px 10px" onclick="adminMoveRound('${round.id}','scoring')">→ Scoring</button>`;
    } else if (status === 'scoring') {
      actions = `<button class="btn-outline" style="font-size:12px;padding:5px 10px" onclick="adminMoveRound('${round.id}','complete')">→ Complete</button>`;
    }

    return `<div class="round-admin-row">
      <div style="flex:1">
        <div class="round-admin-label">${round.label}</div>
        <div class="round-admin-sub">${round.matches.length} matches · 1 pt each</div>
      </div>
      <span class="status-pill ${spClass}">${spLabel}</span>
      ${actions}
    </div>`;
  }).join('');

  el.innerHTML = `<div class="page">
    <div class="card">
      <div class="admin-section">
        <h3>Tournament stats</h3>
        <div class="stat-row">
          <div class="stat-box"><div class="stat-n">${playerCount}</div><div class="stat-l">Players</div></div>
          <div class="stat-box"><div class="stat-n">${completedCount}/${ROUNDS.length}</div><div class="stat-l">Rounds done</div></div>
          <div class="stat-box"><div class="stat-n">${totalGames}</div><div class="stat-l">Total games</div></div>
        </div>
      </div>
      <div class="admin-section">
        <h3>Round control</h3>
        <p style="font-size:12px;color:var(--muted);margin-bottom:.75rem">
          Locked → Open (predictions) → Scoring (enter results) → Complete (next round unlocks).
          Only one round can be open or scoring at a time.
        </p>
        ${roundRows}
      </div>
    </div>
  </div>`;
}

async function adminOpenRound(roundId) {
  try {
    await Admin.setRoundStatus(roundId, 'open');
    roundStatuses[roundId] = { ...(roundStatuses[roundId]||{}), status:'open', roundId };
    toast(`${getRoundById(roundId).label} is now open ✓`);
    renderAdmin(); renderRoundsGrid();
  } catch(e) { toast(e.message); }
}

async function adminMoveRound(roundId, status) {
  try {
    await Admin.setRoundStatus(roundId, status);
    roundStatuses[roundId] = { ...(roundStatuses[roundId]||{}), status, roundId };
    toast(`Moved to ${status} ✓`);
    renderAdmin(); renderRoundsGrid();
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
