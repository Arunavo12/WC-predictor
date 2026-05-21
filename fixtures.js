// ── FIXTURES.JS ──────────────────────────────────────────────
// FIFA World Cup 2026 — USA / Canada / Mexico
// All 104 official matches with real dates, venues and match numbers

// ─── GROUPS ──────────────────────────────────────────────────
const GROUPS = {
  A: ['Mexico', 'South Africa', 'South Korea', 'Czechia'],
  B: ['Canada', 'Bosnia and Herzegovina', 'Qatar', 'Switzerland'],
  C: ['Brazil', 'Morocco', 'Haiti', 'Scotland'],
  D: ['United States', 'Paraguay', 'Australia', 'Türkiye'],
  E: ['Germany', 'Curacao', 'Ivory Coast', 'Ecuador'],
  F: ['Netherlands', 'Japan', 'Sweden', 'Tunisia'],
  G: ['Belgium', 'Egypt', 'Iran', 'New Zealand'],
  H: ['Spain', 'Cape Verde', 'Saudi Arabia', 'Uruguay'],
  I: ['France', 'Senegal', 'DR Congo', 'Norway'],
  J: ['Argentina', 'Algeria', 'Austria', 'Jordan'],
  K: ['Portugal', 'Iraq', 'Uzbekistan', 'Colombia'],
  L: ['England', 'Croatia', 'Ghana', 'Panama'],
};

// ─── ROUNDS ──────────────────────────────────────────────────
const ROUNDS = [
  {
    id: 'gs1', label: 'Group Stage — Matchday 1', shortLabel: 'GS1',
    phase: 'group', pointsPerCorrect: 1, allowDraw: true,
    matches: [
      { id:'m1',  group:'A', matchNum:1,  home:'Mexico',        away:'South Africa',  date:'Thu 11 Jun, 3:00 PM EDT',  venue:'Estadio Azteca, Mexico City' },
      { id:'m2',  group:'A', matchNum:2,  home:'South Korea',   away:'Czechia',        date:'Thu 11 Jun, 10:00 PM EDT', venue:'Estadio Akron, Zapopan' },
      { id:'m3',  group:'B', matchNum:3,  home:'Canada',        away:'Bosnia and Herzegovina',        date:'Fri 12 Jun, 3:00 PM EDT',  venue:'BMO Field, Toronto' },
      { id:'m4',  group:'D', matchNum:4,  home:'United States', away:'Paraguay',      date:'Fri 12 Jun, 9:00 PM EDT',  venue:'SoFi Stadium, Inglewood' },
      { id:'m5',  group:'C', matchNum:5,  home:'Haiti',         away:'Scotland',      date:'Sat 13 Jun, 9:00 PM EDT',  venue:'Gillette Stadium, Foxborough' },
      { id:'m6',  group:'D', matchNum:6,  home:'Australia',     away:'Türkiye',        date:'Sat 13 Jun, 11:59 PM EDT', venue:'BC Place, Vancouver' },
      { id:'m7',  group:'C', matchNum:7,  home:'Brazil',        away:'Morocco',       date:'Sat 13 Jun, 6:00 PM EDT',  venue:'MetLife Stadium, East Rutherford' },
      { id:'m8',  group:'B', matchNum:8,  home:'Qatar',         away:'Switzerland',   date:'Sat 13 Jun, 3:00 PM EDT',  venue:"Levi's Stadium, Santa Clara" },
      { id:'m9',  group:'E', matchNum:9,  home:'Ivory Coast',   away:'Ecuador',       date:'Sun 14 Jun, 7:00 PM EDT',  venue:'Lincoln Financial Field, Philadelphia' },
      { id:'m10', group:'E', matchNum:10, home:'Germany',       away:'Curacao',       date:'Sun 14 Jun, 1:00 PM EDT',  venue:'NRG Stadium, Houston' },
      { id:'m11', group:'F', matchNum:11, home:'Netherlands',   away:'Japan',         date:'Sun 14 Jun, 4:00 PM EDT',  venue:'AT&T Stadium, Arlington' },
      { id:'m12', group:'F', matchNum:12, home:'Sweden',        away:'Tunisia',       date:'Sun 14 Jun, 10:00 PM EDT', venue:'Estadio BBVA, Guadalupe' },
      { id:'m13', group:'H', matchNum:13, home:'Saudi Arabia',  away:'Uruguay',       date:'Mon 15 Jun, 6:00 PM EDT',  venue:'Hard Rock Stadium, Miami Gardens' },
      { id:'m14', group:'H', matchNum:14, home:'Spain',         away:'Cape Verde',    date:'Mon 15 Jun, 12:00 PM EDT', venue:'Mercedes-Benz Stadium, Atlanta' },
      { id:'m15', group:'G', matchNum:15, home:'Iran',          away:'New Zealand',   date:'Mon 15 Jun, 9:00 PM EDT',  venue:'SoFi Stadium, Inglewood' },
      { id:'m16', group:'G', matchNum:16, home:'Belgium',       away:'Egypt',         date:'Mon 15 Jun, 3:00 PM EDT',  venue:'Lumen Field, Seattle' },
      { id:'m17', group:'I', matchNum:17, home:'France',        away:'Senegal',       date:'Tue 16 Jun, 3:00 PM EDT',  venue:'MetLife Stadium, East Rutherford' },
      { id:'m18', group:'I', matchNum:18, home:'DR Congo',        away:'Norway',        date:'Tue 16 Jun, 6:00 PM EDT',  venue:'Gillette Stadium, Foxborough' },
      { id:'m19', group:'J', matchNum:19, home:'Argentina',     away:'Algeria',       date:'Tue 16 Jun, 9:00 PM EDT',  venue:'Arrowhead Stadium, Kansas City' },
      { id:'m20', group:'J', matchNum:20, home:'Austria',       away:'Jordan',        date:'Tue 16 Jun, 11:59 PM EDT', venue:"Levi's Stadium, Santa Clara" },
      { id:'m21', group:'L', matchNum:21, home:'England',       away:'Croatia',       date:'Wed 17 Jun, 4:00 PM EDT',  venue:'AT&T Stadium, Arlington' },
      { id:'m22', group:'L', matchNum:22, home:'Ghana',         away:'Panama',        date:'Wed 17 Jun, 7:00 PM EDT',  venue:'BMO Field, Toronto' },
      { id:'m23', group:'K', matchNum:23, home:'Portugal',      away:'Iraq',        date:'Wed 17 Jun, 1:00 PM EDT',  venue:'NRG Stadium, Houston' },
      { id:'m24', group:'K', matchNum:24, home:'Uzbekistan',    away:'Colombia',      date:'Wed 17 Jun, 10:00 PM EDT', venue:'Estadio Azteca, Mexico City' },
    ],
  },
  {
    id: 'gs2', label: 'Group Stage — Matchday 2', shortLabel: 'GS2',
    phase: 'group', pointsPerCorrect: 1, allowDraw: true,
    matches: [
      { id:'m25', group:'A', matchNum:25, home:'Czechia',        away:'South Africa',  date:'Thu 18 Jun, 12:00 PM EDT', venue:'Mercedes-Benz Stadium, Atlanta' },
      { id:'m26', group:'B', matchNum:26, home:'Switzerland',   away:'Bosnia and Herzegovina',        date:'Thu 18 Jun, 3:00 PM EDT',  venue:'SoFi Stadium, Inglewood' },
      { id:'m27', group:'B', matchNum:27, home:'Canada',        away:'Qatar',         date:'Thu 18 Jun, 6:00 PM EDT',  venue:'BC Place, Vancouver' },
      { id:'m28', group:'A', matchNum:28, home:'Mexico',        away:'South Korea',   date:'Thu 18 Jun, 9:00 PM EDT',  venue:'Estadio Akron, Zapopan' },
      { id:'m29', group:'C', matchNum:29, home:'Brazil',        away:'Haiti',         date:'Fri 19 Jun, 9:00 PM EDT',  venue:'Lincoln Financial Field, Philadelphia' },
      { id:'m30', group:'C', matchNum:30, home:'Scotland',      away:'Morocco',       date:'Fri 19 Jun, 6:00 PM EDT',  venue:'Gillette Stadium, Foxborough' },
      { id:'m31', group:'D', matchNum:31, home:'Türkiye',        away:'Paraguay',      date:'Fri 19 Jun, 11:59 PM EDT', venue:"Levi's Stadium, Santa Clara" },
      { id:'m32', group:'D', matchNum:32, home:'United States', away:'Australia',     date:'Fri 19 Jun, 3:00 PM EDT',  venue:'Lumen Field, Seattle' },
      { id:'m33', group:'E', matchNum:33, home:'Germany',       away:'Ivory Coast',   date:'Sat 20 Jun, 4:00 PM EDT',  venue:'BMO Field, Toronto' },
      { id:'m34', group:'E', matchNum:34, home:'Ecuador',       away:'Curacao',       date:'Sat 20 Jun, 8:00 PM EDT',  venue:'Arrowhead Stadium, Kansas City' },
      { id:'m35', group:'F', matchNum:35, home:'Netherlands',   away:'Sweden',        date:'Sat 20 Jun, 1:00 PM EDT',  venue:'NRG Stadium, Houston' },
      { id:'m36', group:'F', matchNum:36, home:'Tunisia',       away:'Japan',         date:'Sat 20 Jun, 11:59 PM EDT', venue:'Estadio BBVA, Guadalupe' },
      { id:'m37', group:'H', matchNum:37, home:'Uruguay',       away:'Cape Verde',    date:'Sun 21 Jun, 6:00 PM EDT',  venue:'Hard Rock Stadium, Miami Gardens' },
      { id:'m38', group:'H', matchNum:38, home:'Spain',         away:'Saudi Arabia',  date:'Sun 21 Jun, 12:00 PM EDT', venue:'Mercedes-Benz Stadium, Atlanta' },
      { id:'m39', group:'G', matchNum:39, home:'Belgium',       away:'Iran',          date:'Sun 21 Jun, 3:00 PM EDT',  venue:'SoFi Stadium, Inglewood' },
      { id:'m40', group:'G', matchNum:40, home:'New Zealand',   away:'Egypt',         date:'Sun 21 Jun, 9:00 PM EDT',  venue:'BC Place, Vancouver' },
      { id:'m41', group:'I', matchNum:41, home:'Norway',        away:'Senegal',       date:'Mon 22 Jun, 8:00 PM EDT',  venue:'MetLife Stadium, East Rutherford' },
      { id:'m42', group:'I', matchNum:42, home:'France',        away:'DR Congo',        date:'Mon 22 Jun, 5:00 PM EDT',  venue:'Lincoln Financial Field, Philadelphia' },
      { id:'m43', group:'J', matchNum:43, home:'Argentina',     away:'Austria',       date:'Mon 22 Jun, 1:00 PM EDT',  venue:'AT&T Stadium, Arlington' },
      { id:'m44', group:'J', matchNum:44, home:'Jordan',        away:'Algeria',       date:'Mon 22 Jun, 11:00 PM EDT', venue:"Levi's Stadium, Santa Clara" },
      { id:'m45', group:'L', matchNum:45, home:'England',       away:'Ghana',         date:'Tue 23 Jun, 4:00 PM EDT',  venue:'Gillette Stadium, Foxborough' },
      { id:'m46', group:'L', matchNum:46, home:'Panama',        away:'Croatia',       date:'Tue 23 Jun, 7:00 PM EDT',  venue:'BMO Field, Toronto' },
      { id:'m47', group:'K', matchNum:47, home:'Portugal',      away:'Uzbekistan',    date:'Tue 23 Jun, 1:00 PM EDT',  venue:'NRG Stadium, Houston' },
      { id:'m48', group:'K', matchNum:48, home:'Colombia',      away:'Iraq',        date:'Tue 23 Jun, 10:00 PM EDT', venue:'Estadio Akron, Zapopan' },
    ],
  },
  {
    id: 'gs3', label: 'Group Stage — Matchday 3', shortLabel: 'GS3',
    phase: 'group', pointsPerCorrect: 1, allowDraw: true,
    matches: [
      { id:'m49', group:'C', matchNum:49, home:'Scotland',      away:'Brazil',        date:'Wed 24 Jun, 6:00 PM EDT',  venue:'Hard Rock Stadium, Miami Gardens' },
      { id:'m50', group:'C', matchNum:50, home:'Morocco',       away:'Haiti',         date:'Wed 24 Jun, 6:00 PM EDT',  venue:'Mercedes-Benz Stadium, Atlanta' },
      { id:'m51', group:'B', matchNum:51, home:'Switzerland',   away:'Canada',        date:'Wed 24 Jun, 3:00 PM EDT',  venue:'BC Place, Vancouver' },
      { id:'m52', group:'B', matchNum:52, home:'Bosnia and Herzegovina',        away:'Qatar',         date:'Wed 24 Jun, 3:00 PM EDT',  venue:'Lumen Field, Seattle' },
      { id:'m53', group:'A', matchNum:53, home:'Czechia',        away:'Mexico',        date:'Wed 24 Jun, 9:00 PM EDT',  venue:'Estadio Azteca, Mexico City' },
      { id:'m54', group:'A', matchNum:54, home:'South Africa',  away:'South Korea',   date:'Wed 24 Jun, 9:00 PM EDT',  venue:'Estadio BBVA, Guadalupe' },
      { id:'m55', group:'E', matchNum:55, home:'Curacao',       away:'Ivory Coast',   date:'Thu 25 Jun, 4:00 PM EDT',  venue:'Lincoln Financial Field, Philadelphia' },
      { id:'m56', group:'E', matchNum:56, home:'Ecuador',       away:'Germany',       date:'Thu 25 Jun, 4:00 PM EDT',  venue:'MetLife Stadium, East Rutherford' },
      { id:'m57', group:'F', matchNum:57, home:'Japan',         away:'Sweden',        date:'Thu 25 Jun, 7:00 PM EDT',  venue:'AT&T Stadium, Arlington' },
      { id:'m58', group:'F', matchNum:58, home:'Tunisia',       away:'Netherlands',   date:'Thu 25 Jun, 7:00 PM EDT',  venue:'Arrowhead Stadium, Kansas City' },
      { id:'m59', group:'D', matchNum:59, home:'Türkiye',        away:'United States', date:'Thu 25 Jun, 10:00 PM EDT', venue:'SoFi Stadium, Inglewood' },
      { id:'m60', group:'D', matchNum:60, home:'Paraguay',      away:'Australia',     date:'Thu 25 Jun, 10:00 PM EDT', venue:"Levi's Stadium, Santa Clara" },
      { id:'m61', group:'I', matchNum:61, home:'Norway',        away:'France',        date:'Fri 26 Jun, 3:00 PM EDT',  venue:'Gillette Stadium, Foxborough' },
      { id:'m62', group:'I', matchNum:62, home:'Senegal',       away:'DR Congo',        date:'Fri 26 Jun, 3:00 PM EDT',  venue:'BMO Field, Toronto' },
      { id:'m63', group:'G', matchNum:63, home:'Egypt',         away:'Iran',          date:'Fri 26 Jun, 11:00 PM EDT', venue:'Lumen Field, Seattle' },
      { id:'m64', group:'G', matchNum:64, home:'New Zealand',   away:'Belgium',       date:'Fri 26 Jun, 11:00 PM EDT', venue:'BC Place, Vancouver' },
      { id:'m65', group:'H', matchNum:65, home:'Cape Verde',    away:'Saudi Arabia',  date:'Fri 26 Jun, 8:00 PM EDT',  venue:'NRG Stadium, Houston' },
      { id:'m66', group:'H', matchNum:66, home:'Uruguay',       away:'Spain',         date:'Fri 26 Jun, 8:00 PM EDT',  venue:'Estadio Akron, Zapopan' },
      { id:'m67', group:'L', matchNum:67, home:'Panama',        away:'England',       date:'Sat 27 Jun, 5:00 PM EDT',  venue:'MetLife Stadium, East Rutherford' },
      { id:'m68', group:'L', matchNum:68, home:'Croatia',       away:'Ghana',         date:'Sat 27 Jun, 5:00 PM EDT',  venue:'Lincoln Financial Field, Philadelphia' },
      { id:'m69', group:'J', matchNum:69, home:'Algeria',       away:'Austria',       date:'Sat 27 Jun, 10:00 PM EDT', venue:'Arrowhead Stadium, Kansas City' },
      { id:'m70', group:'J', matchNum:70, home:'Jordan',        away:'Argentina',     date:'Sat 27 Jun, 10:00 PM EDT', venue:'AT&T Stadium, Arlington' },
      { id:'m71', group:'K', matchNum:71, home:'Colombia',      away:'Portugal',      date:'Sat 27 Jun, 7:30 PM EDT',  venue:'Hard Rock Stadium, Miami Gardens' },
      { id:'m72', group:'K', matchNum:72, home:'Iraq',        away:'Uzbekistan',    date:'Sat 27 Jun, 7:30 PM EDT',  venue:'Mercedes-Benz Stadium, Atlanta' },
    ],
  },
  {
    id: 'r32', label: 'Round of 32', shortLabel: 'R32',
    phase: 'knockout', pointsPerCorrect: 1, allowDraw: true,
    matches: [
      { id:'m73',  matchNum:73,  home:'2A',     away:'2B',      date:'Sun 28 Jun, 3:00 PM EDT',  venue:'SoFi Stadium, Inglewood' },
      { id:'m74',  matchNum:74,  home:'1E',     away:'3ABCDF',  date:'Mon 29 Jun, 4:30 PM EDT',  venue:'Gillette Stadium, Foxborough' },
      { id:'m75',  matchNum:75,  home:'1F',     away:'2C',      date:'Mon 29 Jun, 9:00 PM EDT',  venue:'Estadio BBVA, Guadalupe' },
      { id:'m76',  matchNum:76,  home:'1C',     away:'2F',      date:'Mon 29 Jun, 1:00 PM EDT',  venue:'NRG Stadium, Houston' },
      { id:'m77',  matchNum:77,  home:'1I',     away:'3CDFGH',  date:'Tue 30 Jun, 5:00 PM EDT',  venue:'MetLife Stadium, East Rutherford' },
      { id:'m78',  matchNum:78,  home:'2E',     away:'2I',      date:'Tue 30 Jun, 2:00 PM EDT',  venue:'AT&T Stadium, Arlington' },
      { id:'m79',  matchNum:79,  home:'1A',     away:'3CEFHI',  date:'Tue 30 Jun, 9:00 PM EDT',  venue:'Estadio Azteca, Mexico City' },
      { id:'m80',  matchNum:80,  home:'1L',     away:'3EHIJK',  date:'Wed 1 Jul, 12:00 PM EDT',  venue:'Mercedes-Benz Stadium, Atlanta' },
      { id:'m81',  matchNum:81,  home:'1D',     away:'3BEFIJ',  date:'Wed 1 Jul, 8:00 PM EDT',   venue:"Levi's Stadium, Santa Clara" },
      { id:'m82',  matchNum:82,  home:'1G',     away:'3AEHIJ',  date:'Wed 1 Jul, 4:00 PM EDT',   venue:'Lumen Field, Seattle' },
      { id:'m83',  matchNum:83,  home:'2K',     away:'2L',      date:'Thu 2 Jul, 7:00 PM EDT',   venue:'BMO Field, Toronto' },
      { id:'m84',  matchNum:84,  home:'1H',     away:'2J',      date:'Thu 2 Jul, 3:00 PM EDT',   venue:'SoFi Stadium, Inglewood' },
      { id:'m85',  matchNum:85,  home:'2B',     away:'3EFGIJ',  date:'Thu 2 Jul, 11:00 PM EDT',  venue:'BC Place, Vancouver' },
      { id:'m86',  matchNum:86,  home:'1J',     away:'2H',      date:'Fri 3 Jul, 6:00 PM EDT',   venue:'Hard Rock Stadium, Miami Gardens' },
      { id:'m87',  matchNum:87,  home:'1K',     away:'3DEIJL',  date:'Fri 3 Jul, 9:30 PM EDT',   venue:'Arrowhead Stadium, Kansas City' },
      { id:'m88',  matchNum:88,  home:'2D',     away:'2G',      date:'Fri 3 Jul, 2:00 PM EDT',   venue:'AT&T Stadium, Arlington' },
    ],
  },
  {
    id: 'r16', label: 'Round of 16', shortLabel: 'R16',
    phase: 'knockout', pointsPerCorrect: 1, allowDraw: true,
    matches: [
      { id:'m89',  matchNum:89,  home:'W74', away:'W77', date:'Sat 4 Jul, 5:00 PM EDT',  venue:'Lincoln Financial Field, Philadelphia' },
      { id:'m90',  matchNum:90,  home:'W73', away:'W75', date:'Sat 4 Jul, 1:00 PM EDT',  venue:'NRG Stadium, Houston' },
      { id:'m91',  matchNum:91,  home:'W76', away:'W78', date:'Sun 5 Jul, 4:00 PM EDT',  venue:'MetLife Stadium, East Rutherford' },
      { id:'m92',  matchNum:92,  home:'W79', away:'W80', date:'Sun 5 Jul, 8:00 PM EDT',  venue:'Estadio Azteca, Mexico City' },
      { id:'m93',  matchNum:93,  home:'W83', away:'W84', date:'Mon 6 Jul, 3:00 PM EDT',  venue:'AT&T Stadium, Arlington' },
      { id:'m94',  matchNum:94,  home:'W81', away:'W82', date:'Mon 6 Jul, 8:00 PM EDT',  venue:'Lumen Field, Seattle' },
      { id:'m95',  matchNum:95,  home:'W86', away:'W88', date:'Tue 7 Jul, 12:00 PM EDT', venue:'Mercedes-Benz Stadium, Atlanta' },
      { id:'m96',  matchNum:96,  home:'W85', away:'W87', date:'Tue 7 Jul, 4:00 PM EDT',  venue:'BC Place, Vancouver' },
    ],
  },
  {
    id: 'qf', label: 'Quarter-finals', shortLabel: 'QF',
    phase: 'knockout', pointsPerCorrect: 1, allowDraw: true,
    matches: [
      { id:'m97',  matchNum:97,  home:'W89', away:'W90', date:'Thu 9 Jul, 4:00 PM EDT',  venue:'Gillette Stadium, Foxborough' },
      { id:'m98',  matchNum:98,  home:'W93', away:'W94', date:'Fri 10 Jul, 3:00 PM EDT', venue:'SoFi Stadium, Inglewood' },
      { id:'m99',  matchNum:99,  home:'W91', away:'W92', date:'Sat 11 Jul, 5:00 PM EDT', venue:'Hard Rock Stadium, Miami Gardens' },
      { id:'m100', matchNum:100, home:'W95', away:'W96', date:'Sat 11 Jul, 9:00 PM EDT', venue:'Arrowhead Stadium, Kansas City' },
    ],
  },
  {
    id: 'sf', label: 'Semi-finals', shortLabel: 'SF',
    phase: 'knockout', pointsPerCorrect: 1, allowDraw: true,
    matches: [
      { id:'m101', matchNum:101, home:'W97',  away:'W98',  date:'Tue 14 Jul, 3:00 PM EDT', venue:'AT&T Stadium, Arlington' },
      { id:'m102', matchNum:102, home:'W99',  away:'W100', date:'Wed 15 Jul, 3:00 PM EDT', venue:'Mercedes-Benz Stadium, Atlanta' },
    ],
  },
  {
    id: 'tp', label: '3rd Place Play-off', shortLabel: '3rd',
    phase: 'knockout', pointsPerCorrect: 1, allowDraw: true,
    matches: [
      { id:'m103', matchNum:103, home:'L101', away:'L102', date:'Sat 18 Jul, 5:00 PM EDT', venue:'Hard Rock Stadium, Miami Gardens' },
    ],
  },
  {
    id: 'final', label: 'The Final', shortLabel: 'FINAL',
    phase: 'knockout', pointsPerCorrect: 1, allowDraw: true,
    matches: [
      { id:'m104', matchNum:104, home:'W101', away:'W102', date:'Sun 19 Jul, 3:00 PM EDT', venue:'MetLife Stadium, East Rutherford' },
    ],
  },
];

// ─── LOOKUP HELPERS ───────────────────────────────────────────
function getRoundById(id)       { return ROUNDS.find(r => r.id === id); }
function getRoundIndex(id)      { return ROUNDS.findIndex(r => r.id === id); }
function getMatchById(rId, mId) { return getRoundById(rId)?.matches.find(m => m.id === mId); }
function getTotalMatches()      { return ROUNDS.reduce((s, r) => s + r.matches.length, 0); }

function getMatchTeams(roundId, match) {
  const overrides = (window.roundStatuses || {})[roundId]?.teams || {};
  const o = overrides[match.id];
  return { home: o?.home || match.home, away: o?.away || match.away };
}

// ─── FLAG EMOJIS ─────────────────────────────────────────────
const FLAGS = {
  'Argentina':'🇦🇷','Australia':'🇦🇺','Austria':'🇦🇹',
  'Belgium':'🇧🇪','Brazil':'🇧🇷','Canada':'🇨🇦',
  'Cape Verde':'🇨🇻','Colombia':'🇨🇴','Croatia':'🇭🇷',
  'Curacao':'🇨🇼','Ecuador':'🇪🇨','Egypt':'🇪🇬',
  'England':'🏴󠁧󠁢󠁥󠁮󠁧󠁿','France':'🇫🇷','Germany':'🇩🇪',
  'Ghana':'🇬🇭','Haiti':'🇭🇹','Iran':'🇮🇷',
  'Ivory Coast':'🇨🇮','Japan':'🇯🇵','Jordan':'🇯🇴',
  'Mexico':'🇲🇽','Morocco':'🇲🇦','Netherlands':'🇳🇱',
  'New Zealand':'🇳🇿','Norway':'🇳🇴','Panama':'🇵🇦',
  'Paraguay':'🇵🇾','Portugal':'🇵🇹','Qatar':'🇶🇦',
  'Saudi Arabia':'🇸🇦','Scotland':'🏴󠁧󠁢󠁳󠁣󠁴󠁿','Senegal':'🇸🇳',
  'South Africa':'🇿🇦','South Korea':'🇰🇷','Spain':'🇪🇸',
  'Switzerland':'🇨🇭','Tunisia':'🇹🇳','United States':'🇺🇸',
  'Uruguay':'🇺🇾','Uzbekistan':'🇺🇿','Wales':'🏴󠁧󠁢󠁷󠁬󠁳󠁿',
  'Algeria':'🇩🇿','Bosnia and Herzegovina':'🇧🇦','DR Congo':'🇨🇩','Iraq':'🇮🇶','Sweden':'🇸🇪','Türkiye':'🇹🇷','Czechia':'🇨🇿',
};

function flag(team) { return FLAGS[team] || '🏳️'; }