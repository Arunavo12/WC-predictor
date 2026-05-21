// ── ADMIN.JS ─────────────────────────────────────────────────
const Admin = (() => {

  // Set a round's status: 'locked' | 'open' | 'scoring' | 'complete'
  async function setRoundStatus(roundId, status) {
    const db = window.wcDb;

    if (status === 'open') {
      // Check no other round is open/scoring
      const active = await db.collection('rounds')
        .where('status', 'in', ['open','scoring']).get();
      if (!active.empty) throw new Error('Another round is already open or scoring');

      // Check previous round is complete (unless it's the first)
      const idx = getRoundIndex(roundId);
      if (idx > 0) {
        const prevId = ROUNDS[idx - 1].id;
        const prev = await db.collection('rounds').doc(prevId).get();
        if (!prev.exists || prev.data().status !== 'complete') {
          throw new Error(`${ROUNDS[idx-1].label} must be complete first`);
        }
      }
    }

    await db.collection('rounds').doc(roundId).set({
      roundId, status,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  }

  // Set a single match result
  async function setResult(roundId, matchId, result) {
    await window.wcDb.collection('rounds').doc(roundId).set({
      results: { [matchId]: result }
    }, { merge: true });
  }

  // Update team names for knockout matches (called by admin after group stage)
  async function updateKnockoutTeams(roundId, matchId, home, away) {
    await window.wcDb.collection('rounds').doc(roundId).set({
      teams: { [matchId]: { home, away } }
    }, { merge: true });
  }

  // Score all predictions for a round
  async function scoreRound(roundId) {
    const db = window.wcDb;
    const roundDoc = await db.collection('rounds').doc(roundId).get();
    if (!roundDoc.exists) throw new Error('Round not found');
    const results = roundDoc.data().results || {};
    if (Object.keys(results).length === 0) throw new Error('No results entered yet');

    const round = getRoundById(roundId);
    const pts = round.pointsPerCorrect;

    const predsSnap = await db.collection('predictions')
      .where('roundId', '==', roundId).get();

    const batch = db.batch();
    predsSnap.forEach(doc => {
      const pred = doc.data();
      let score = 0;
      const picks = pred.picks || {};
      Object.keys(results).forEach(mId => {
        if (picks[mId] && picks[mId] === results[mId]) score += pts;
      });
      batch.update(doc.ref, { score, scored: true });
      const scoreRef = db.collection('scores').doc(`${pred.username}_${roundId}`);
      batch.set(scoreRef, {
        username: pred.username, roundId, score,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();
    return predsSnap.size;
  }

  async function getAllRoundStatuses() {
    const snap = await window.wcDb.collection('rounds').get();
    const map = {};
    snap.forEach(doc => { map[doc.id] = doc.data(); });
    return map;
  }

  async function getLeaderboard() {
    const snap = await window.wcDb.collection('scores').get();
    const totals = {};
    snap.forEach(doc => {
      const { username, score } = doc.data();
      totals[username] = (totals[username] || 0) + score;
    });
    return totals;
  }

  async function getAllScoresByRound() {
    const snap = await window.wcDb.collection('scores').get();
    const map = {}; // username → { roundId → score }
    snap.forEach(doc => {
      const { username, roundId, score } = doc.data();
      if (!map[username]) map[username] = {};
      map[username][roundId] = score;
    });
    return map;
  }

  return {
    setRoundStatus, setResult, updateKnockoutTeams,
    scoreRound, getAllRoundStatuses, getLeaderboard, getAllScoresByRound,
  };
})();
