// ── AUTH.JS ──────────────────────────────────────────────────
const Auth = (() => {
  const SESSION_KEY = 'wc26_session';
  let _currentUser = null;

  async function hashPin(pin, salt) {
    const data = new TextEncoder().encode(pin + salt);
    const buf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
  }

  function generateSalt() {
    return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  }

  function saveSession(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    _currentUser = user;
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
    _currentUser = null;
  }

  function loadSession() {
    try {
      const d = localStorage.getItem(SESSION_KEY);
      if (d) _currentUser = JSON.parse(d);
    } catch(e) { clearSession(); }
    return _currentUser;
  }

  async function signup(username, pin) {
    username = username.trim().toLowerCase();
    if (!username || username.length < 2) throw new Error('Username must be at least 2 characters');
    if (!/^[a-z0-9_]+$/.test(username)) throw new Error('Only letters, numbers and underscores');
    if (pin.length !== 4) throw new Error('PIN must be 4 digits');

    const db = window.wcDb;
    const existing = await db.collection('users').doc(username).get();
    if (existing.exists) throw new Error('Username already taken');

    const salt = generateSalt();
    const pinHash = await hashPin(pin, salt);
    const isAdmin = username === ADMIN_USERNAME.toLowerCase();
    const displayName = username.charAt(0).toUpperCase() + username.slice(1);

    await db.collection('users').doc(username).set({
      username, displayName, pinHash, salt, isAdmin,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    const user = { uid: username, username, displayName, isAdmin };
    saveSession(user);
    return user;
  }

  async function login(username, pin) {
    username = username.trim().toLowerCase();
    if (!username) throw new Error('Enter a username');
    if (pin.length !== 4) throw new Error('Enter your 4-digit PIN');

    const db = window.wcDb;
    const doc = await db.collection('users').doc(username).get();
    if (!doc.exists) throw new Error('Username not found');

    const data = doc.data();
    const pinHash = await hashPin(pin, data.salt);
    if (pinHash !== data.pinHash) throw new Error('Wrong PIN');

    const user = { uid: username, username, displayName: data.displayName, isAdmin: data.isAdmin };
    saveSession(user);
    return user;
  }

  function logout() { clearSession(); }

  return {
    signup, login, logout, loadSession,
    getCurrentUser: () => _currentUser,
    isLoggedIn: () => !!_currentUser,
    isAdmin: () => _currentUser?.isAdmin === true,
  };
})();
