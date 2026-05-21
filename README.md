# 🏆 World Cup 2026 Predictor

Predict win/draw/lose for every game across all 9 rounds of the 2026 FIFA World Cup — group stage through to the Final. Compete with your mates on a live leaderboard.

**48 teams · 104 matches · 9 rounds · 1 point per correct prediction**

---

## 🚀 Setup

Same Firebase setup as the Prem Predictor — if you've already done that, create a separate Firebase project (or use a separate Firestore database).

### 1. Create Firebase project
1. [console.firebase.google.com](https://console.firebase.google.com) → Add project
2. Build → Firestore Database → Create → Production mode → `europe-west2`

### 2. Firestore security rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{username} {
      allow read: always;
      allow create: always;
      allow update, delete: if false;
    }
    match /predictions/{docId} {
      allow read, write: always;
    }
    match /rounds/{roundId} {
      allow read, write: always;
    }
    match /scores/{docId} {
      allow read, write: always;
    }
  }
}
```

### 3. Fill in `firebase-config.js`

```js
const FIREBASE_CONFIG = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};

const ADMIN_USERNAME = "yourname"; // ← your username gets the Admin tab
```

### 4. Push to GitHub → enable Pages

Settings → Pages → main branch → root folder.

---

## 📅 Tournament structure

| Round | Matches | Notes |
|-------|---------|-------|
| Group Stage MD1 | 24 | 12 groups × 2 games |
| Group Stage MD2 | 24 | |
| Group Stage MD3 | 24 | Final matchday |
| Round of 32 | 16 | Knockout begins |
| Round of 16 | 8 | |
| Quarter-finals | 4 | |
| Semi-finals | 2 | |
| 3rd Place | 1 | |
| **The Final** | **1** | **🏆** |
| **Total** | **104** | |

**Scoring:** 1 point per correct prediction, flat throughout. Max 104 points.

**Draws in knockouts:** Predicting "Draw" means you predicted the game went to extra time/penalties. If the result is actually settled in 90 mins, it won't count as a draw.

---

## 🗂️ File structure

```
world-cup-predictor/
├── index.html          ← App shell + login + PIN pad
├── style.css           ← World Cup green/gold theme
├── firebase-config.js  ← YOUR keys (fill this in)
├── fixtures.js         ← All groups, matches, round structure
├── auth.js             ← Login, signup, PIN hashing, sessions
├── admin.js            ← Round control, results, scoring
├── app.js              ← All UI logic
└── README.md
```

---

## 📝 Updating fixtures

The 2026 World Cup draw hasn't happened yet. Once it does (likely late 2025), edit the `GROUPS` object in `fixtures.js`:

```js
const GROUPS = {
  A: ['Germany', 'Japan', 'Morocco', 'Costa Rica'],
  B: ['Spain', 'Croatia', 'USA', 'Cameroon'],
  // ... etc
};
```

That's all you need to change — the 48 group stage matches are generated automatically from the groups.

### Updating knockout teams

Once the group stage is done, you don't need to edit code — the Admin panel lets you tap any team name in a knockout match to update it (e.g. change "TBD" to "France").

---

## 🔄 Round flow (admin)

1. **Open** a round → players can submit predictions
2. **→ Scoring** when games kick off → predictions are locked
3. Enter results in the round detail view (Admin only)
4. Hit **Score predictions** → everyone's points update
5. **→ Complete** → next round unlocks

Only one round can be Open or Scoring at a time. Each round must be Complete before the next can open.

---

## 🔐 Login

Username + 4-digit PIN. PIN is hashed (SHA-256 + salt) before storing — never stored in plain text. Sessions persist in localStorage so players stay logged in on their device.
