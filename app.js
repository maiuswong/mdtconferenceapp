// Prevent the browser from restoring the previous scroll position on reload.
// Without this, mobile reloads land mid-page (e.g. wherever the user last
// scrolled in the timetable) which feels like the page is "starting scrolled".
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

// ─── Dummy data toggle ────────────────────────────────────────────
// Set to true to replace the real conference schedule with a small,
// today-anchored dummy schedule. Useful for continuing development
// after the conference has ended. Edit `buildDummyData()` below to
// tweak times, tracks, conflicts, etc.
const USE_DUMMY_DATA = false ;

// Override which calendar date the dummy schedule's "Day 1" anchors
// to. Set to a 'YYYY-MM-DD' string (e.g. '2026-04-30') to pin the
// dummy days to specific dates; leave null to use the real current
// date. Day 2 is always Day 1 + 1.
const DUMMY_BASE_DATE = '2026-04-30';

// Override the "now" the app uses everywhere (Now & Next, current
// slot highlight, etc.). Set to a 'YYYY-MM-DD HH:MM' string (24h,
// local time) to simulate a specific moment; leave null for real now.
// Only takes effect when USE_DUMMY_DATA is true.
const DUMMY_NOW_OVERRIDE = '2026-04-30 14:25';

function buildDummyData() {
    // Day label format must match parseDayLabelToDate: "<Weekday> M/D".
    const WEEKDAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const dayLabel = (d) => `${WEEKDAYS[d.getDay()]} ${d.getMonth()+1}/${d.getDate()}`;
    const fmtTime = (h, m) => {
        const period = h >= 12 ? 'PM' : 'AM';
        const hh = ((h + 11) % 12) + 1;
        return `${hh}:${m.toString().padStart(2,'0')} ${period}`;
    };

    let today;
    if (DUMMY_BASE_DATE) {
        const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(DUMMY_BASE_DATE);
        if (m) {
            today = new Date(parseInt(m[1],10), parseInt(m[2],10)-1, parseInt(m[3],10));
        } else {
            console.warn('DUMMY_BASE_DATE not in YYYY-MM-DD format; falling back to today.');
            today = new Date();
        }
    } else {
        today = new Date();
    }
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today.getTime() + 86400000);
    const dayAfter = new Date(today.getTime() + 2 * 86400000);
    const day1 = dayLabel(today);
    const day2 = dayLabel(tomorrow);
    const day3 = dayLabel(dayAfter);

    let nextUid = 1000;
    const session = (day, h, m, durMin, room, track, title, authors = 'Test Author') => ({
        day, time: fmtTime(h, m), room, type: 'session',
        Track: track, Title: title, Authors: authors,
        Abstract: 'Dummy abstract for development.',
        Affiliation: 'Test Co.',
        SessionLength: `${durMin}m`, isMedtronic: false,
        session_id: nextUid, uid: 'd_' + (nextUid++)
    });
    const keynote = (day, h, m, durMin, room, title, authors) => ({
        day, time: fmtTime(h, m), room, type: 'Keynote',
        Track: 'General', Title: title, Authors: authors,
        SessionLength: `${durMin}m`,
        session_id: nextUid, uid: 'd_' + (nextUid++)
    });
    const brk = (day, h, m, durMin, title = 'Break') => ({
        day, time: fmtTime(h, m), room: 'Foyer', type: 'break',
        Title: title, SessionLength: `${durMin}m`
    });
    const meal = (day, h, m, durMin, title) => ({
        day, time: fmtTime(h, m), room: 'Foyer', type: 'event',
        Title: title, SessionLength: `${durMin}m`
    });

    // ── Day 1 (today) ─────────────────────────────────────────────
    // Realistic schedule: every session sits on a 30-minute grid and
    // is 30/60/90 minutes long. Parallel rooms generally start at the
    // same time, with occasional longer talks crossing block edges so
    // stay-bridges and node markers still get exercised.
    const d1 = [
        keynote(day1, 8, 0, 60, 'Main Hall', 'Opening Keynote', 'Keynote Speaker'),
        // 9:00 block — 6 parallel rooms, mix of 60m and 90m talks.
        session(day1, 9, 0, 60, 'Room A', 'AI/ML', 'AI Foundations'),
        session(day1, 9, 0, 60, 'Room B', 'Cybersecurity', 'Threat Modeling 101'),
        session(day1, 9, 0, 60, 'Room C', 'Healthcare Delivery', 'Care Workflow Patterns'),
        session(day1, 9, 0, 90, 'Room D', 'Digital SE', 'MBSE Crash Course'),
        session(day1, 9, 0, 90, 'Room E', 'Reqs, Test & Risk', 'Long Risk Talk'),
        session(day1, 9, 0, 60, 'Room F', 'Combination Products', 'Combo Quickfire 1'),
        // 10:00 block — A/B/C/F have a fresh start; D/E continue to 10:30.
        session(day1, 10, 0, 60, 'Room A', 'Healthcare Delivery', 'Care Pathways'),
        session(day1, 10, 0, 60, 'Room B', 'Digital SE', 'Digital Thread Basics'),
        session(day1, 10, 0, 60, 'Room C', 'AI/ML', 'AI Tooling Tour'),
        session(day1, 10, 0, 60, 'Room F', 'Beyond the System', 'Stakeholders 201'),
        brk(day1, 10, 30, 30),
        // 11:00 block — wide parallel set, mix of 60m and 90m.
        session(day1, 11, 0, 90, 'Room A', 'AI/ML', 'Deep Dive: Long Talk'),
        session(day1, 11, 0, 60, 'Room B', 'Digital SE', 'MBSE Tooling Tour'),
        session(day1, 11, 0, 60, 'Room C', 'Healthcare Delivery', 'Panel: Care Integration'),
        session(day1, 11, 0, 60, 'Room D', 'Cybersecurity', 'Threat Surface Walk'),
        session(day1, 11, 0, 60, 'Room E', 'Reqs, Test & Risk', 'V&V Strategy'),
        session(day1, 11, 0, 60, 'Room F', 'Beyond the System', 'Strategy Snippet'),
        // 12:00 — A still running until 12:30; others fresh.
        session(day1, 12, 0, 30, 'Room B', 'Combination Products', 'Drug-Device Q&A'),
        session(day1, 12, 0, 30, 'Room C', 'Reqs, Test & Risk', 'Traceability Lite'),
        meal(day1, 12, 30, 60, 'Lunch'),
        // 13:30 block — afternoon wave.
        session(day1, 13, 30, 60, 'Room A', 'AI/ML', 'Afternoon AI'),
        session(day1, 13, 30, 60, 'Room B', 'Beyond the System', 'Strategy Workshop'),
        session(day1, 13, 30, 60, 'Room C', 'Other', 'Lightning Talks'),
        session(day1, 13, 30, 90, 'Room D', 'Digital SE', 'Long MBSE Workshop'),
        session(day1, 13, 30, 60, 'Room E', 'Cybersecurity', 'Pen-Test Tales'),
        session(day1, 13, 30, 60, 'Room F', 'Combination Products', 'Combo Lightning'),
        // 14:30 block — D continues to 15:00; everyone else fresh.
        session(day1, 14, 30, 60, 'Room A', 'Reqs, Test & Risk', 'V&V Patterns'),
        session(day1, 14, 30, 60, 'Room B', 'AI/ML', 'AI for Verification'),
        session(day1, 14, 30, 60, 'Room C', 'AI/ML', 'AI Ethics Panel'),
        session(day1, 14, 30, 60, 'Room E', 'Reqs, Test & Risk', 'Quick V&V'),
        session(day1, 14, 30, 60, 'Room F', 'Beyond the System', 'Late Strategy Hot-Take'),
        // 15:30 block — fresh wave.
        session(day1, 15, 30, 60, 'Room A', 'Digital SE', 'Digital Thread Demo'),
        session(day1, 15, 30, 60, 'Room C', 'Cybersecurity', 'Lessons from a Breach'),
        session(day1, 15, 30, 90, 'Room D', 'Healthcare Delivery', 'Long Healthcare Talk'),
        session(day1, 15, 30, 60, 'Room E', 'AI/ML', 'AI Roadmap Discussion'),
        brk(day1, 16, 30, 30, 'Coffee'),
        // 17:00 wrap.
        session(day1, 17, 0, 30, 'Main Hall', 'General', 'Day 1 Wrap'),
        meal(day1, 18, 0, 90, 'Reception'),
    ];

    // ── Day 2 (tomorrow) ──────────────────────────────────────────
    // Full day, same 30-minute grid and N/2N/3N block sizing as Day 1.
    const d2 = [
        meal(day2, 8, 0, 60, 'Breakfast'),
        keynote(day2, 9, 0, 60, 'Main Hall', 'Day 2 Keynote', 'Another Speaker'),
        // 10:00 block — wide parallel set, mix of 60m and 90m.
        session(day2, 10, 0, 60, 'Room A', 'AI/ML', 'AI Tooling Day 2'),
        session(day2, 10, 0, 60, 'Room B', 'Cybersecurity', 'Threat Intel for Devices'),
        session(day2, 10, 0, 60, 'Room C', 'Healthcare Delivery', 'Care Coordination Patterns'),
        session(day2, 10, 0, 90, 'Room D', 'Digital SE', 'MBSE Workshop Part 1'),
        session(day2, 10, 0, 60, 'Room E', 'Reqs, Test & Risk', 'Hazard Analyses That Live'),
        session(day2, 10, 0, 60, 'Room F', 'Beyond the System', 'Stakeholder Trust'),
        // 11:00 — A/B/C/E/F fresh; D continues to 11:30.
        session(day2, 11, 0, 60, 'Room A', 'AI/ML', 'Prompting in Regulated Work'),
        session(day2, 11, 0, 60, 'Room B', 'Cybersecurity', 'SBOM Triage'),
        session(day2, 11, 0, 60, 'Room C', 'Combination Products', 'Auto-Injector Field Notes'),
        session(day2, 11, 0, 60, 'Room E', 'Reqs, Test & Risk', 'Coverage Metrics'),
        session(day2, 11, 0, 60, 'Room F', 'Beyond the System', 'Mentorship in Practice'),
        // 12:00 — short fillers before lunch.
        session(day2, 12, 0, 30, 'Room B', 'Other', 'Lightning Q&A'),
        session(day2, 12, 0, 30, 'Room C', 'Reqs, Test & Risk', 'V&V Quickfire'),
        meal(day2, 12, 30, 60, 'Lunch'),
        // 13:30 block — afternoon wave, mirrors Day 1.
        session(day2, 13, 30, 60, 'Room A', 'AI/ML', 'Synthetic Data for V&V'),
        session(day2, 13, 30, 60, 'Room B', 'Beyond the System', 'Engineering Resilient Teams'),
        session(day2, 13, 30, 60, 'Room C', 'Other', 'Career Reflections'),
        session(day2, 13, 30, 90, 'Room D', 'Digital SE', 'Digital Thread Demo (Long)'),
        session(day2, 13, 30, 60, 'Room E', 'Cybersecurity', 'Pen-Test War Stories'),
        session(day2, 13, 30, 60, 'Room F', 'Combination Products', 'Drug-Device Interfaces'),
        // 14:30 block — D continues to 15:00; everyone else fresh.
        session(day2, 14, 30, 60, 'Room A', 'Reqs, Test & Risk', 'Risk-Based V&V'),
        session(day2, 14, 30, 60, 'Room B', 'AI/ML', 'AI for Verification 2'),
        session(day2, 14, 30, 60, 'Room C', 'Healthcare Delivery', 'Connected Care Roundtable'),
        session(day2, 14, 30, 60, 'Room E', 'Reqs, Test & Risk', 'Usability On a Budget'),
        session(day2, 14, 30, 60, 'Room F', 'Beyond the System', 'Cross-Industry Lessons'),
        // 15:30 block — fresh wave.
        session(day2, 15, 30, 60, 'Room A', 'Digital SE', 'Open Standards Update'),
        session(day2, 15, 30, 60, 'Room C', 'Cybersecurity', 'Secure Update Mechanisms'),
        session(day2, 15, 30, 90, 'Room D', 'Healthcare Delivery', 'Long Healthcare Panel'),
        session(day2, 15, 30, 60, 'Room E', 'AI/ML', 'AI Governance Q&A'),
        brk(day2, 16, 30, 30, 'Coffee'),
        // 17:00 wrap.
        session(day2, 17, 0, 30, 'Main Hall', 'General', 'Day 2 Wrap'),
        meal(day2, 18, 0, 90, 'Sponsor Reception'),
    ];

    // ── Day 3 (day after tomorrow) ────────────────────────────────
    // Full day, same grid as Days 1 and 2.
    const d3 = [
        meal(day3, 8, 0, 60, 'Breakfast'),
        keynote(day3, 9, 0, 90, 'Main Hall', 'Day 3 Keynote', 'Closing Speaker'),
        brk(day3, 10, 30, 30),
        // 11:00 block — wide parallel set.
        session(day3, 11, 0, 60, 'Room A', 'AI/ML', 'Foundation Models for CDS'),
        session(day3, 11, 0, 60, 'Room B', 'Cybersecurity', 'Vulnerability Disclosure Workflows'),
        session(day3, 11, 0, 60, 'Room C', 'Beyond the System', 'Mentoring Systems Thinkers'),
        session(day3, 11, 0, 90, 'Room D', 'Digital SE', 'SysML v2 Toolchain Bridges'),
        session(day3, 11, 0, 60, 'Room E', 'Reqs, Test & Risk', 'Quality Metrics That Matter'),
        session(day3, 11, 0, 60, 'Room F', 'Combination Products', 'Connected Drug Delivery'),
        // 12:00 — A/B/C/E/F fresh; D continues to 12:30.
        session(day3, 12, 0, 30, 'Room A', 'AI/ML', 'AI Governance Inside Eng'),
        session(day3, 12, 0, 30, 'Room B', 'Cybersecurity', 'Pen-Testing Connected Devices'),
        session(day3, 12, 0, 30, 'Room C', 'Digital SE', 'MBSE Adoption Anti-Patterns'),
        session(day3, 12, 0, 30, 'Room E', 'Reqs, Test & Risk', 'Traceability Without Tears'),
        session(day3, 12, 0, 30, 'Room F', 'Beyond the System', 'Strategy Hot-Take'),
        meal(day3, 12, 30, 60, 'Lunch'),
        // 13:30 block — afternoon wave.
        session(day3, 13, 30, 60, 'Room A', 'AI/ML', 'Continuous Learning Systems'),
        session(day3, 13, 30, 60, 'Room B', 'Cybersecurity', 'Implantable Update Security'),
        session(day3, 13, 30, 60, 'Room C', 'Beyond the System', 'Lessons from Aerospace'),
        session(day3, 13, 30, 90, 'Room D', 'Healthcare Delivery', 'PGHD Pipeline (Long)'),
        session(day3, 13, 30, 60, 'Room E', 'Reqs, Test & Risk', 'Risk Mgmt for SaMD'),
        session(day3, 13, 30, 60, 'Room F', 'Combination Products', 'Drug-Device Roundtable'),
        // 14:30 block — D continues to 15:00; others fresh.
        session(day3, 14, 30, 60, 'Room A', 'AI/ML', 'Explainability for Clinical AI'),
        session(day3, 14, 30, 60, 'Room B', 'Digital SE', 'Sim-Based V&V at Scale'),
        session(day3, 14, 30, 60, 'Room C', 'Healthcare Delivery', 'Rural Care Engineering'),
        session(day3, 14, 30, 60, 'Room E', 'Reqs, Test & Risk', 'Formative Usability'),
        session(day3, 14, 30, 60, 'Room F', 'Other', 'Lightning Wrap-Up Talks'),
        // 15:30 block — fresh wave.
        session(day3, 15, 30, 60, 'Room A', 'AI/ML', 'AI in Hospital Workflows'),
        session(day3, 15, 30, 60, 'Room C', 'Cybersecurity', 'Closing Cyber Q&A'),
        session(day3, 15, 30, 90, 'Room D', 'Beyond the System', 'Resilient Teams (Long)'),
        session(day3, 15, 30, 60, 'Room E', 'Digital SE', 'Open Standards Wrap'),
        brk(day3, 16, 30, 30, 'Coffee'),
        // 17:00 closing.
        session(day3, 17, 0, 60, 'Main Hall', 'General', 'Closing Ceremony & Awards'),
    ];

    return { [day1]: d1, [day2]: d2, [day3]: d3 };
}

// REAL_DATA is loaded from schedule-data.js (must be included before this script)

const data = USE_DUMMY_DATA ? buildDummyData() : REAL_DATA;

// When DUMMY_NOW_OVERRIDE is set (and dummy data is on), override
// the global Date so every `new Date()` returns the simulated
// moment. Existing-arg constructors are passed through unchanged.
(function applyDummyNowOverride() {
    if (!USE_DUMMY_DATA || !DUMMY_NOW_OVERRIDE) return;
    const m = /^(\d{4})-(\d{1,2})-(\d{1,2})[ T](\d{1,2}):(\d{2})$/.exec(DUMMY_NOW_OVERRIDE);
    if (!m) {
        console.warn('DUMMY_NOW_OVERRIDE must be "YYYY-MM-DD HH:MM" (24h); ignored.');
        return;
    }
    const fakeNow = new Date(
        parseInt(m[1],10), parseInt(m[2],10)-1, parseInt(m[3],10),
        parseInt(m[4],10), parseInt(m[5],10), 0, 0
    ).getTime();
    const RealDate = Date;
    function FakeDate(...args) {
        if (args.length === 0) return new RealDate(fakeNow);
        return new RealDate(...args);
    }
    FakeDate.prototype = RealDate.prototype;
    FakeDate.now = () => fakeNow;
    FakeDate.parse = RealDate.parse;
    FakeDate.UTC = RealDate.UTC;
    // eslint-disable-next-line no-global-assign
    Date = FakeDate;
    console.info('[dummy] Now overridden to', new Date().toString());
})();

// Neon track palette. Saturated, distinct hues for at-a-glance track
// recognition on small dots and stripes. Avoids any yellow/lime range
// because high-luminance hues lose contrast on white surfaces (text
// and small dots become hard to read). Beyond the System (formerly
// yellow) shifts to a vivid neon-cyan instead.
const trackColors = {
    "general": "#455A64",
    "innovation summit": "#3949AB",
    "featured keynote": "#8E24AA",
    "session": "#00897B",
    "roundtable": "#D81B60",
    "roundtable session": "#C2185B",
    "hot takes exchange": "#E64A19",
    "pitch competition": "#6D4C41",
    "shark tank": "#5E35B1",
    "abstract happy hour": "#FFB300",
    "abstract lunch hour": "#0097A7",
    "late-breaking clinical trial": "#689F38",
    "sponsor": "#42c5f5",
    "training": "#f542e3",
    "ai/ml": "#FF2A54",
    "cybersecurity": "#FF7300",
    "beyond the system": "#00E5FF",        // neon cyan (replaces yellow)
    "healthcare delivery": "#D923FF",
    "reqs, test & risk": "#1976D2",
    "other": "#7A00FF",
    "tutorial": "#FF007F",
    "combination products": "#00C853",
    "digital se": "#00BFA5"
};

const KEYNOTE_COLOR = '#3949AB';           // Indigo 600 — distinct from any track

// Quiet Events headset channels. These room-led accents make it easy to
// match a session in the schedule with the channel attendees should select.
const channelColors = {
    'main stage 1': '#2563EB',
    'main stage 2': '#D9485F',
    'roundtable 1': '#35A86B',
    'roundtable 2': '#7C4DCC',
    'roundtable 3': '#E0A800',
    'connexions lounge': '#D96D17',
    'hot takes exchange': '#D23D82',
    'hrstv': '#28BFA8'
};

// ─── ROOM ORDER (consistent columns) ───
const ROOM_ORDER = [
    "Hyde Park",
    "Main Stage 1",
    "Main Stage 2",
    "Roundtable 1",
    "Roundtable 2",
    "Roundtable 3",
    "ConneXions Lounge",
    "HRStv Studio",
    "Grand Foyer",
    "Junior Ballroom",
    "Salon A",
    "Salon B",
    "Salon C",
    "Salon D",
    "Oxford",
    "Bristol"
];

// rooms that span full width when alone
const FULLWIDTH_ROOMS = new Set([
    "Grand Ballroom - Salons A-D",
    "Grand Ballroom",
    "Grand Foyer"
]);

const SLOT_MINUTES = 5;
const MOBILE_BREAKPOINT = 700;
const COMPACT_BREAKPOINT = 800;
const VIEWPORT_MODE_HYSTERESIS = 24;
const TOPBAR_COMPACT_ENTER_WIDTH = 1180;
const TOPBAR_COMPACT_EXIT_WIDTH = 1240;

let starredSessions = JSON.parse(localStorage.getItem('incose_2026_stars') || '[]');
let isStarredEditMode = false;
let pendingRemovals = new Set();
// ─── Conflict resolutions ──────────────────────────────────────────
// A "conflict" is a maximal time interval where 2+ starred sessions
// run simultaneously. Each conflict has a key = sorted starrable-UIDs
// joined by '|'. Resolutions live in:
//   { [conflictKey]: chosenUid }
// where chosenUid is the session the user committed to follow through
// that overlap. The other starred sessions stay starred (still in My
// Schedule) but get demoted to the "other sessions" branch of section
// views *during* the conflict's time window.
let conflictResolutions = (() => {
    try { return JSON.parse(localStorage.getItem('incose_2026_conflicts') || '{}') || {}; }
    catch (_) { return {}; }
})();
function saveConflictResolutions() {
    localStorage.setItem('incose_2026_conflicts', JSON.stringify(conflictResolutions));
}
// One-time migration from the legacy transitionDecisions map. Each
// (fromUid → keptUid) pair becomes a 2-UID conflict resolution.
(function migrateTransitionDecisions() {
    let legacy = {};
    try { legacy = JSON.parse(localStorage.getItem('incose_2026_decisions') || '{}') || {}; }
    catch (_) { legacy = {}; }
    let mutated = false;
    Object.entries(legacy).forEach(([fromUid, keptUid]) => {
        if (!fromUid || !keptUid || fromUid === keptUid) return;
        const key = [fromUid, keptUid].sort().join('|');
        if (!conflictResolutions[key]) {
            conflictResolutions[key] = keptUid;
            mutated = true;
        }
    });
    if (mutated) saveConflictResolutions();
    if (Object.keys(legacy).length) {
        localStorage.removeItem('incose_2026_decisions');
    }
})();
let currentView = (() => {
    // Restore last-visited tab on reload. Validate against current data so a
    // saved key for a removed day cleanly falls back to the first day.
    try {
        const saved = localStorage.getItem('incose_2026_currentView');
        if (saved && (saved === 'starred' || saved === 'now' || Object.prototype.hasOwnProperty.call(data, saved))) {
            return saved;
        }
    } catch (e) { /* localStorage may be unavailable */ }
    return Object.keys(data)[0];
})();
let activeTrackFilters = new Set(); // empty = show all
let searchQuery = '';
let isGlobalSearchMode = false;
let suppressSearchRerender = false;
let activeDetailsUid = null;
let activeDetailsAnchor = null;
let stableViewportMode = null;
let stableTopbarCompact = null;
let lastViewportMode = getViewportMode();
let lastViewportRefreshWidth = Math.round(getEffectiveViewportWidth());

const detailsBackdrop = document.getElementById('detailsBackdrop');
const detailsPanel = document.getElementById('detailsPanel');
const scrollIndicatorRow = document.getElementById('scrollIndicatorRow');
const scrollDateTimeIndicator = document.getElementById('scrollDateTimeIndicator');
const scrollIndicatorDayLabel = document.getElementById('scrollIndicatorDayLabel');
let scrollIndicatorRafPending = false;
let scrollIndicatorCurrentLabel = '';
let scrollIndicatorTimeAnimating = false;
let scrollIndicatorPendingTime = null;
let scrollIndicatorAnimationToken = 0;

function getViewportMode() {
    const width = getEffectiveViewportWidth();
    const rawMode = width <= MOBILE_BREAKPOINT
        ? 'mobile'
        : (width <= COMPACT_BREAKPOINT ? 'compact' : 'desktop');

    if (!stableViewportMode) {
        stableViewportMode = rawMode;
        return stableViewportMode;
    }

    if (stableViewportMode === 'mobile') {
        // Stay mobile until width clearly exits the mobile threshold.
        if (width > (MOBILE_BREAKPOINT + VIEWPORT_MODE_HYSTERESIS)) {
            stableViewportMode = rawMode;
        }
        return stableViewportMode;
    }

    if (stableViewportMode === 'desktop') {
        // Stay desktop until width clearly re-enters compact/mobile range.
        if (width < (COMPACT_BREAKPOINT - VIEWPORT_MODE_HYSTERESIS)) {
            stableViewportMode = rawMode;
        }
        return stableViewportMode;
    }

    // compact mode: require clear crossing of either boundary before switching.
    if (width <= (MOBILE_BREAKPOINT - VIEWPORT_MODE_HYSTERESIS)) {
        stableViewportMode = 'mobile';
    } else if (width >= (COMPACT_BREAKPOINT + VIEWPORT_MODE_HYSTERESIS)) {
        stableViewportMode = 'desktop';
    }

    return stableViewportMode;
}

function getEffectiveViewportWidth() {
    const clientWidth = document.documentElement ? document.documentElement.clientWidth : 0;
    const innerWidth = window.innerWidth;
    return [clientWidth, innerWidth].find(w => Number.isFinite(w) && w > 0) || 0;
}

function isMobileLayoutViewport() {
    return getViewportMode() === 'mobile';
}

function updateTopbarMode() {
    const bodyEl = document.body;
    if (!bodyEl) return false;
    const previousMode = bodyEl.classList.contains('topbar-compact');
    const width = getEffectiveViewportWidth();
    const isMobileMode = getViewportMode() === 'mobile';

    if (stableTopbarCompact === null) {
        stableTopbarCompact = isMobileMode || width <= TOPBAR_COMPACT_ENTER_WIDTH;
    } else if (stableTopbarCompact) {
        if (!isMobileMode && width >= TOPBAR_COMPACT_EXIT_WIDTH) {
            stableTopbarCompact = false;
        }
    } else if (isMobileMode || width <= TOPBAR_COMPACT_ENTER_WIDTH) {
        stableTopbarCompact = true;
    }

    bodyEl.classList.toggle('topbar-compact', stableTopbarCompact);
    return previousMode !== stableTopbarCompact;
}

function getTrackColor(trackName) {
    if (!trackName) return '#9AA0A6';
    const normalizedTrack = trackName.toLowerCase();
    if (trackColors[normalizedTrack]) return trackColors[normalizedTrack];
    for (const k in trackColors) {
        if (normalizedTrack.includes(k)) return trackColors[k];
    }
    return '#9AA0A6';
}

function isKeynoteSession(session) {
    return (session?.type || '').toLowerCase() === 'keynote';
}

function getChannelColor(session) {
    const room = String(session?.room || '').trim().toLowerCase();
    const track = String(session?.Track || '').trim().toLowerCase();
    for (const channel of Object.keys(channelColors)) {
        if (room.includes(channel) || track.includes(channel)) {
            return channelColors[channel];
        }
    }
    return '';
}

function getSessionAccentColor(session, fallbackTrackName = '') {
    const channelColor = getChannelColor(session);
    if (channelColor) return channelColor;
    if (isKeynoteSession(session)) return KEYNOTE_COLOR;
    // Break/meal interlude colors — match the deep accent used by
    // the Now/Next interlude card text/border in styles.css so the
    // section dot, the colored text, and any inline interlude rows
    // all read as the same family.
    if (session) {
        if (isMealStyleEvent(session)) return '#1f6b5e';
        if (isBreakStyleEvent(session)) return '#4a3f6b';
    }
    return getTrackColor(fallbackTrackName || session?.Track || session?.type || '');
}

function getSessionRooms(session) {
    const roomLabel = String(session?.room || '');
    const listedRooms = roomLabel.replace(/^Abstract Happy Hour\s*[–-]\s*/, '');
    if (listedRooms !== roomLabel) {
        return listedRooms.split(',').map(room => room.trim()).filter(Boolean);
    }
    return session?.room ? [session.room] : [];
}

function getRoomsForDay(day) {
    const sessions = data[day] || [];
    const roomsUsed = new Set(sessions.flatMap(getSessionRooms));
    // Known rooms first (in canonical ROOM_ORDER), then any unknown
    // rooms in alphabetical order. ROOM_ORDER is a hint for the
    // original conference layout — unknown rooms still need to render
    // when other data sets are loaded.
    const known = ROOM_ORDER.filter(r => roomsUsed.has(r));
    const unknown = [...roomsUsed]
        .filter(r => !ROOM_ORDER.includes(r))
        .sort((a, b) => a.localeCompare(b));
    return [...known, ...unknown];
}

function getAllTracksForDay(day) {
    const sessions = data[day] || [];
    const tracks = new Set();
    sessions.forEach(s => { if (s.Track) tracks.add(s.Track); });
    return [...tracks].sort();
}

function parseClockMinutes(timeString) {
    if (!timeString) return 0;
    const match = String(timeString).match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return 0;
    let hour = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const isPm = match[3].toUpperCase() === 'PM';
    if (isPm && hour !== 12) hour += 12;
    if (!isPm && hour === 12) hour = 0;
    return hour * 60 + minutes;
}

function formatClockMinutes(totalMinutes) {
    const m = ((Math.round(totalMinutes) % (24 * 60)) + 24 * 60) % (24 * 60);
    const h24 = Math.floor(m / 60);
    const min = m % 60;
    const meridiem = h24 >= 12 ? 'PM' : 'AM';
    let h12 = h24 % 12;
    if (h12 === 0) h12 = 12;
    const minStr = min < 10 ? `0${min}` : String(min);
    return formatTime(`${h12}:${minStr} ${meridiem}`);
}

function sortTimes(times) {
    return [...times].sort((left, right) => parseClockMinutes(left) - parseClockMinutes(right));
}

function parseDurationMinutes(lengthValue) {
    if (typeof lengthValue === 'number' && Number.isFinite(lengthValue)) {
        return lengthValue;
    }
    if (typeof lengthValue !== 'string') return null;
    const hoursMatch = lengthValue.match(/(\d+)\s*h/i);
    const minutesMatch = lengthValue.match(/(\d+)\s*m/i);
    const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
    const total = (hours * 60) + minutes;
    return total || null;
}

function parseTimeRangeDuration(timeValue) {
    const matches = String(timeValue || '').match(/\d{1,2}:\d{2}\s*(?:AM|PM)/gi);
    if (!matches || matches.length < 2) return null;
    const startMinutes = parseClockMinutes(matches[0]);
    const endMinutes = parseClockMinutes(matches[1]);
    const duration = endMinutes - startMinutes;
    return duration > 0 ? duration : null;
}

function getDefaultDurationMinutes(dayTimes, session) {
    const sortedTimes = sortTimes(dayTimes);
    const startMinutes = parseClockMinutes(session.time);
    const nextTime = sortedTimes.find(time => parseClockMinutes(time) > startMinutes);
    if (!nextTime) return 30;
    return Math.max(SLOT_MINUTES, parseClockMinutes(nextTime) - startMinutes);
}

function getExplicitDurationMinutes(session) {
    return (
        parseTimeRangeDuration(session.time) ||
        parseDurationMinutes(session.DurationMinutes) ||
        parseDurationMinutes(session.Duration) ||
        parseDurationMinutes(session.SessionLength)
    );
}

function getSessionDurationMinutes(dayTimes, session) {
    return getExplicitDurationMinutes(session) || getDefaultDurationMinutes(dayTimes, session);
}

function getBreakDisplayTitle(session) {
    const baseTitle = String(session.Title || 'Break').trim() || 'Break';
    const daySessions = data[session.day] || [];
    const dayTimes = daySessions.map(s => s.time);
    const durationMinutes = getExplicitDurationMinutes(session) || getSessionDurationMinutes(dayTimes.length ? dayTimes : [session.time], session);
    return `${durationMinutes}-minute ${baseTitle}`;
}

function isBreakStyleEvent(session) {
    const title = (session.Title || '').toLowerCase();
    if (/\babstract\s+(?:lunch|happy)\s+hour\b/.test(title)) return false;
    return session.type === 'break' || /\bbreakfast\b|\blunch\b|\bbreak\b|\bbanquet\b/.test(title);
}

function isMealStyleEvent(session) {
    const title = (session.Title || '').toLowerCase();
    return /\bbreakfast\b|\blunch\b|\bbanquet\b/.test(title);
}

function isBanquetEvent(session) {
    const title = (session.Title || '').toLowerCase();
    return /\bbanquet\b/.test(title);
}

function buildTicketRequiredEl() {
    const span = document.createElement('span');
    span.className = 'ticket-required';
    span.setAttribute('aria-label', 'Separate registration required');
    span.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z"/><path d="M13 7v2M13 11v2M13 15v2"/></svg><span>Separate registration required</span>';
    return span;
}

function isSessionStyleEvent(session) {
    const title = (session.Title || '').toLowerCase();
    const typeLower = (session.type || '').toLowerCase();
    return typeLower === 'keynote' || (typeLower === 'event' && /\bconference kickoff\b/.test(title));
}

function isGlobalOverlayEvent(session) {
    return isBreakStyleEvent(session);
}

function getSlotMetrics(sessions) {
    if (sessions.length === 0) {
        return { dayStart: 0, totalSlots: 1 };
    }
    const dayTimes = sessions.map(s => s.time);
    const starts = sessions.map(s => parseClockMinutes(s.time));
    const ends = sessions.map(s => parseClockMinutes(s.time) + getSessionDurationMinutes(dayTimes, s));
    const dayStart = Math.min(...starts);
    const dayEnd = Math.max(...ends);
    return {
        dayStart,
        totalSlots: Math.max(1, Math.ceil((dayEnd - dayStart) / SLOT_MINUTES))
    };
}

function getGridPlacement(dayTimes, slotMetrics, session) {
    const startMinutes = parseClockMinutes(session.time);
    const durationMinutes = getSessionDurationMinutes(dayTimes, session);
    const startSlot = Math.floor((startMinutes - slotMetrics.dayStart) / SLOT_MINUTES) + 1;
    const slotSpan = Math.max(1, Math.ceil(durationMinutes / SLOT_MINUTES));
    return { startSlot, slotSpan, durationMinutes };
}

function getDayBounds(sessions) {
    if (sessions.length === 0) {
        return { start: 8 * 60, end: (8 * 60) + 60 };
    }

    const dayTimes = sessions.map(s => s.time);
    const starts = sessions.map(s => parseClockMinutes(s.time));
    const ends = sessions.map(s => parseClockMinutes(s.time) + getSessionDurationMinutes(dayTimes, s));

    const minStart = Math.min(...starts);
    const maxEnd = Math.max(...ends);
    const start = Math.floor(minStart / 30) * 30;
    const end = Math.ceil(maxEnd / 30) * 30;
    return { start, end };
}

function minuteToLabel(totalMinutes) {
    const hour24 = Math.floor(totalMinutes / 60) % 24;
    const minute = totalMinutes % 60;
    const suffix = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = ((hour24 + 11) % 12) + 1;
    return `${hour12}:${String(minute).padStart(2, '0')} ${suffix}`;
}

function getVisibleDisplay(el) {
    return el.classList.contains('schedule-item') || el.classList.contains('mobile-card-wrap') ? 'block' : 'flex';
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function buildTransferChipHtml(info) {
    if (!info) return '';
    const rooms = (info.rooms && info.rooms.length)
        ? info.rooms
        : (info.room ? [{ name: info.room, color: '#9ca3af' }] : []);
    const isMulti = rooms.length >= 3;
    const roomItem = (r) =>
        `<span class="transfer-room-item"><span class="transfer-room-dot" style="background:${escapeHtml(r.color || '#9ca3af')};"></span>${escapeHtml(r.name)}</span>`;

    let metaHtml = '';
    if (info.metaHtml) {
        metaHtml = `<span class="transfer-meta">${info.metaHtml}</span>`;
    } else if (info.meta) {
        metaHtml = `<span class="transfer-meta">${escapeHtml(info.meta)}</span>`;
    }
    const iconRaw = info.iconHtml ? info.iconHtml : escapeHtml(info.icon || '→');
    const variant = info.variant ? ` ${escapeHtml(info.variant)}` : '';
    const aria = info.aria || `Transfer to ${info.room || 'next room'}`;
    const ariaAttr = ` role="note" aria-label="${escapeHtml(aria)}"`;

    if (isMulti) {
        const list = `<span class="transfer-room-list">${rooms.map(roomItem).join('')}</span>`;
        return `<span class="transfer-chip multi${variant}"${ariaAttr}><span class="transfer-icon" aria-hidden="true">${iconRaw}</span>${metaHtml}${list}</span>`;
    }

    let roomHtml;
    if (rooms.length === 0) {
        roomHtml = `<span class="transfer-room">next room</span>`;
    } else if (rooms.length === 1) {
        roomHtml = `<span class="transfer-room">${roomItem(rooms[0])}</span>`;
    } else {
        roomHtml = `<span class="transfer-room">${roomItem(rooms[0])} or ${roomItem(rooms[1])}</span>`;
    }
    return `<span class="transfer-chip${variant}"${ariaAttr}><span class="transfer-icon" aria-hidden="true">${iconRaw}</span><span class="transfer-prep">to</span>${roomHtml}${metaHtml}</span>`;
}

function buildFreeChipHtml(info) {
    if (!info) return '';
    const amount = escapeHtml(info.amount || '');
    const window = info.window ? `<span class="free-window">${escapeHtml(info.window)}</span>` : '';
    const aria = info.aria || `Free time: ${info.amount || ''}`;
    return `<span class="free-chip" role="note" aria-label="${escapeHtml(aria)}"><span class="free-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h13v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V9z"/><path d="M17 11h2a2 2 0 0 1 0 4h-2"/><path d="M8 3c0 1.5 1 1.5 1 3M12 3c0 1.5 1 1.5 1 3"/></svg></span><span class="free-amount">${amount}</span>${window}</span>`;
}

function buildDetailsHtml(session) {
    const trackColor = getSessionAccentColor(session, session.Track);
    const trackLabel = isKeynoteSession(session) ? 'Keynote' : (session.Track || session.type || 'Session');
    const meta = [];
    const abstractText = String(session.Abstract || '').trim();
    const hasAbstract = abstractText && abstractText.toLowerCase() !== 'nan';
    meta.push(`<div><strong>When:</strong> ${escapeHtml(session.day || currentView)}, ${escapeHtml(session.time || '')}</div>`);
    if (session.room) meta.push(`<div><strong>Room:</strong> ${escapeHtml(session.room)}</div>`);
    if (session.Authors) meta.push(`<div><strong>Authors:</strong> ${buildAuthorsHtml(session)}</div>`);
    if (session.Affiliation) meta.push(`<div><strong>Affiliation:</strong> ${escapeHtml(session.Affiliation)}</div>`);
    if (session.SessionLength) meta.push(`<div><strong>Length:</strong> ${escapeHtml(session.SessionLength)}</div>`);

    return `
        <button class="details-close" type="button" aria-label="Close details">×</button>
        <div class="details-track" style="color: ${trackColor};">${escapeHtml(trackLabel)}</div>
        <div class="details-title">${escapeHtml(session.Title || 'Session details')}</div>
        <div class="details-scroll-wrap">
            <div class="details-scroll">
                <div class="details-meta">${meta.join('')}</div>
                ${hasAbstract ? `<div class="details-abstract">${escapeHtml(abstractText)}</div>` : ''}
            </div>
        </div>
    `;
}

function buildAuthorsHtml(session) {
    const affiliations = String(session.Affiliation || '').split(';').map(value => value.trim());
    const authorParts = String(session.Authors).split(',').map(value => value.trim()).filter(Boolean);
    const credentialPattern = /^(?:MD|DO|PhD|MPH|MS|MSEE|MBA|RN|NP|PA(?:-C)?|PAC|FHRS|FACC|FAHA|FCCP|II|III|IV)$/i;
    const authors = [];

    authorParts.forEach(part => {
        if (authors.length && credentialPattern.test(part)) {
            authors[authors.length - 1] += `, ${part}`;
        } else {
            authors.push(part);
        }
    });

    if (authors.length !== affiliations.length) return escapeHtml(session.Authors);

    return authors.map((author, index) => {
        const className = /medtronic/i.test(affiliations[index]) ? 'medtronic-author' : '';
        return `<span class="${className}">${escapeHtml(author)}</span>`;
    }).join(', ');
}

function updateSessionTitleLayout() {
    document.querySelectorAll('.session-card').forEach(card => {
        const title = card.querySelector('.session-title');
        if (!title) return;

        const fullTitle = title.dataset.fullTitle || title.textContent || '';

        card.classList.remove('title-truncated');
        title.textContent = fullTitle;
        title.style.maxHeight = '';
    });
}

function syncDetailsScrollState() {
    const scrollEl = detailsPanel.querySelector('.details-scroll');
    if (!scrollEl) {
        detailsPanel.classList.remove('has-scroll-top', 'has-scroll-bottom');
        return;
    }

    const maxScroll = Math.max(0, scrollEl.scrollHeight - scrollEl.clientHeight);
    const atTop = scrollEl.scrollTop <= 2;
    const atBottom = scrollEl.scrollTop >= maxScroll - 2;

    detailsPanel.classList.toggle('has-scroll-top', maxScroll > 0 && !atTop);
    detailsPanel.classList.toggle('has-scroll-bottom', maxScroll > 0 && !atBottom);
}

function closeSessionDetails() {
    activeDetailsUid = null;
    activeDetailsAnchor = null;
    detailsPanel.classList.remove('has-scroll-top', 'has-scroll-bottom');
    detailsBackdrop.classList.remove('show');
    detailsPanel.classList.remove('show');
    detailsPanel.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
}

function positionDetailsPanel(anchorEl) {
    const isMobile = isMobileLayoutViewport();
    const maxPanelHeight = isMobile
        ? Math.min(560, Math.floor(window.innerHeight * 0.76))
        : Math.min(640, Math.floor(window.innerHeight * 0.72));
    const contentHeight = Math.ceil(detailsPanel.scrollHeight || 0);
    const needsConstrainedHeight = contentHeight > maxPanelHeight;
    const panelHeight = needsConstrainedHeight ? maxPanelHeight : contentHeight;

    if (isMobile) {
        detailsPanel.style.height = needsConstrainedHeight ? `${panelHeight}px` : 'auto';
        detailsPanel.style.left = '12px';
        detailsPanel.style.right = '12px';
        detailsPanel.style.top = 'auto';
        detailsPanel.style.bottom = '12px';
        return;
    }

    const rect = anchorEl.getBoundingClientRect();
    const panelWidth = Math.min(360, window.innerWidth - 32);
    const gap = 12;

    detailsPanel.style.width = `${panelWidth}px`;
    detailsPanel.style.height = needsConstrainedHeight ? `${panelHeight}px` : 'auto';

    const spaceRight = window.innerWidth - rect.right - gap;
    const spaceLeft = rect.left - gap;
    const placeRight = (spaceRight >= panelWidth) || (spaceRight >= spaceLeft);
    const preferredLeft = placeRight ? (rect.right + gap) : (rect.left - panelWidth - gap);
    const left = Math.max(12, Math.min(preferredLeft, window.innerWidth - panelWidth - 12));

    const preferredTop = rect.top;
    const renderedHeight = needsConstrainedHeight ? panelHeight : Math.ceil(detailsPanel.getBoundingClientRect().height || panelHeight);
    const top = Math.max(12, Math.min(preferredTop, window.innerHeight - renderedHeight - 12));

    detailsPanel.style.left = `${left}px`;
    detailsPanel.style.right = 'auto';
    detailsPanel.style.top = `${top}px`;
    detailsPanel.style.bottom = 'auto';
}

function openSessionDetails(session, anchorEl) {
    activeDetailsUid = session.uid || null;
    activeDetailsAnchor = anchorEl || null;
    detailsPanel.innerHTML = buildDetailsHtml(session);
    detailsPanel.querySelector('.details-close').onclick = closeSessionDetails;
    const scrollEl = detailsPanel.querySelector('.details-scroll');
    if (scrollEl) {
        scrollEl.scrollTop = 0;
        scrollEl.addEventListener('scroll', syncDetailsScrollState, { passive: true });
    }
    positionDetailsPanel(anchorEl);
    detailsBackdrop.classList.add('show');
    detailsPanel.classList.add('show');
    detailsPanel.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    requestAnimationFrame(syncDetailsScrollState);
}

// ─── INIT ───
// ─── Live "now" awareness for the My Schedule view ─────────────────────────
// Conference is in-progress. In the starred view we want to:
//   1) Auto-scroll to the first in-progress (or next upcoming) starred session
//      whenever the user opens My Schedule.
//   2) Highlight the in-progress card with a "NOW" pill + ring.
//   3) Offer a floating "Jump to now" button if the user scrolls away.
// We don't fade past sessions — they stay fully visible for reference.

const DAY_DATE_REGEX = /(\d{1,2})\/(\d{1,2})/;
function parseDayLabelToDate(dayString) {
    const match = (dayString || '').match(DAY_DATE_REGEX);
    if (!match) return null;
    const month = parseInt(match[1], 10) - 1;
    const dayNum = parseInt(match[2], 10);
    const year = new Date().getFullYear();
    const date = new Date(year, month, dayNum);
    if (Number.isNaN(date.getTime())) return null;
    return date;
}

function getSessionTimeWindow(dayLabel, timeLabel, specificSession = null) {
    const baseDate = parseDayLabelToDate(dayLabel);
    if (!baseDate) return null;
    const startMinutes = parseClockMinutes(timeLabel);
    const sessions = data[dayLabel] || [];
    const dayTimes = sessions.map(s => s.time);

    let durationMinutes = 0;
    if (specificSession) {
        // Use this exact session's duration. Concurrent sessions starting
        // at the same time can have different lengths; using the max would
        // make a short session's progress bar fill at the wrong rate.
        durationMinutes = getSessionDurationMinutes(dayTimes, specificSession);
    } else {
        sessions.forEach(s => {
            if (s.time !== timeLabel) return;
            const d = getSessionDurationMinutes(dayTimes, s);
            if (d > durationMinutes) durationMinutes = d;
        });
    }
    if (!durationMinutes) {
        const sortedTimes = sortTimes([...new Set(dayTimes)]);
        const idx = sortedTimes.indexOf(timeLabel);
        const next = idx >= 0 ? sortedTimes[idx + 1] : null;
        durationMinutes = next ? Math.max(SLOT_MINUTES, parseClockMinutes(next) - startMinutes) : 30;
    }

    const start = new Date(baseDate);
    start.setHours(0, 0, 0, 0);
    start.setMinutes(startMinutes);
    const end = new Date(start.getTime() + durationMinutes * 60000);
    return { start, end };
}

// Find the best target row in the currently rendered starred view:
// prefer the in-progress one, else the next upcoming, else null.
function findStarredNowTarget() {
    const container = document.getElementById('scheduleContainer');
    if (!container || !container.classList.contains('starred-view')) return null;
    const now = new Date();

    const rows = [...container.querySelectorAll('[data-day][data-time]')];
    let current = null;
    let nextUpcoming = null;
    let nextUpcomingStart = Infinity;

    rows.forEach(el => {
        const win = getSessionTimeWindow(el.dataset.day, el.dataset.time);
        if (!win) return;
        if (now >= win.start && now < win.end) {
            if (!current) current = el;
        } else if (win.start > now) {
            const t = win.start.getTime();
            if (t < nextUpcomingStart) {
                nextUpcomingStart = t;
                nextUpcoming = el;
            }
        }
    });

    return { current, next: nextUpcoming, target: current || nextUpcoming };
}

function highlightStarredCurrent() {
    const container = document.getElementById('scheduleContainer');
    if (!container || !container.classList.contains('starred-view')) return;
    const now = new Date();

    container.querySelectorAll('.is-current').forEach(el => el.classList.remove('is-current'));
    container.querySelectorAll('.now-pill').forEach(el => el.remove());

    container.querySelectorAll('[data-day][data-time]').forEach(el => {
        const win = getSessionTimeWindow(el.dataset.day, el.dataset.time);
        if (!win) return;
        if (now >= win.start && now < win.end) {
            el.classList.add('is-current');
            // Tag any cards inside so overlap-group children also light up
            el.querySelectorAll('.session-card, .event-card').forEach(card => {
                if (!card.querySelector('.now-pill')) {
                    const titleEl = card.querySelector('.session-title, .event-title, h3, h4');
                    const pill = document.createElement('span');
                    pill.className = 'now-pill';
                    pill.textContent = 'Now';
                    (titleEl || card).appendChild(pill);
                }
            });
        }
    });
}

let jumpToNowBtn = null;
function ensureJumpToNowButton() {
    if (jumpToNowBtn) return jumpToNowBtn;
    jumpToNowBtn = document.createElement('button');
    jumpToNowBtn.className = 'jump-to-now-btn';
    jumpToNowBtn.type = 'button';
    jumpToNowBtn.innerHTML = '<span class="arrow">↓</span><span>Jump to now</span>';
    jumpToNowBtn.addEventListener('click', () => scrollStarredToNow({ behavior: 'smooth' }));
    document.body.appendChild(jumpToNowBtn);
    return jumpToNowBtn;
}

function scrollStarredToNow(opts = {}) {
    const info = findStarredNowTarget();
    if (!info || !info.target) return false;

    // Compute the actual height of everything that stays pinned at the top so
    // the target lands flush below them (no past-session gap left in view).
    const stack = document.getElementById('headerStickyStack');
    const stackBottom = stack ? stack.getBoundingClientRect().bottom : 0;
    const dayStickyHeight = parseFloat(
        getComputedStyle(document.documentElement)
            .getPropertyValue('--starred-day-sticky-height')
    ) || 30;
    const headerOffset = Math.max(0, stackBottom) + dayStickyHeight + 4;

    const rect = info.target.getBoundingClientRect();
    const top = window.scrollY + rect.top - headerOffset;
    window.scrollTo({ top: Math.max(0, top), behavior: opts.behavior || 'auto' });
    return true;
}

function updateJumpToNowVisibility() {
    const container = document.getElementById('scheduleContainer');
    const btn = ensureJumpToNowButton();
    if (!container || !container.classList.contains('starred-view')) {
        btn.classList.remove('show');
        return;
    }
    const info = findStarredNowTarget();
    if (!info || !info.target) {
        btn.classList.remove('show');
        return;
    }
    const rect = info.target.getBoundingClientRect();
    const viewportH = window.innerHeight || document.documentElement.clientHeight;
    // Show if the target row isn't visible in the central portion of the viewport
    const offscreen = rect.bottom < 80 || rect.top > viewportH - 80;
    btn.classList.toggle('show', offscreen);
}

let starredNowTickId = null;
function startStarredNowTicker() {
    if (starredNowTickId) return;
    starredNowTickId = setInterval(() => {
        if (currentView === 'now') {
            // Re-render the at-a-glance view so cards transition from
            // "happening next" to "happening now" automatically.
            renderSchedule();
            return;
        }
        highlightStarredCurrent();
        updateJumpToNowVisibility();
    }, 60 * 1000);
}

function init() {
    const tabsContainer = document.getElementById('dayTabs');

    // Migrate any saved 'starred' view to 'now' — the My Schedule
    // tab no longer exists; Now & Next is its replacement.
    if (currentView === 'starred') currentView = 'now';

    // "Now & Next" goes first so it's the natural at-a-glance entry during
    // the conference. Pulses green to draw the eye.
    const nowBtn = document.createElement('button');
    nowBtn.className = 'tab-btn now-tab' + (currentView === 'now' ? ' active' : '');
    nowBtn.textContent = 'Now & Next';
    nowBtn.onclick = () => switchDay('now', nowBtn);
    tabsContainer.appendChild(nowBtn);

    Object.keys(data).forEach((day, i) => {
        const btn = document.createElement('button');
        const isActive = currentView === 'now'
            ? false
            : (currentView === day || (currentView == null && i === 0));
        btn.className = 'tab-btn' + (isActive ? ' active' : '');
        btn.textContent = day;
        btn.onclick = () => switchDay(day, btn);
        tabsContainer.appendChild(btn);
    });

    renderTrackFilters();
    renderSchedule();
    setupShareModal();
    handleStarsImportFromHash();
    startStarredNowTicker();
}

// ─── SHARE / IMPORT MY SCHEDULE ───
function encodeStarsForShare(uids) {
    // Compact, URL-safe: comma-separated UIDs (already short like s_91, s_33b).
    return encodeURIComponent(uids.join(','));
}
function decodeStarsFromShare(raw) {
    if (!raw) return [];
    try {
        return decodeURIComponent(raw).split(',').map(s => s.trim()).filter(Boolean);
    } catch (e) {
        return [];
    }
}
function buildShareUrl(uids) {
    const base = location.origin && location.origin !== 'null'
        ? `${location.origin}${location.pathname}`
        : location.href.split('#')[0].split('?')[0];
    // iOS standalone web apps can discard URL fragments when launched
    // from a QR scan. Query parameters survive that launch handoff.
    return `${base}?share=${encodeStarsForShare(uids)}`;
}
function showToast(message, durationMs = 2400) {
    const el = document.getElementById('appToast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => el.classList.remove('show'), durationMs);
}
let _currentShareUrl = '';
function setupShareModal() {
    const modal = document.getElementById('shareModal');
    const closeBtn = document.getElementById('shareModalClose');
    const copyBtn = document.getElementById('shareModalCopy');
    if (!modal || !closeBtn || !copyBtn) return;
    const close = () => modal.classList.remove('show');
    closeBtn.onclick = close;
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) close();
    });
    copyBtn.onclick = async () => {
        if (!_currentShareUrl) return;
        try {
            await navigator.clipboard.writeText(_currentShareUrl);
            showToast('Link copied to clipboard');
        } catch (e) {
            try {
                const ta = document.createElement('textarea');
                ta.value = _currentShareUrl;
                ta.style.position = 'fixed'; ta.style.opacity = '0';
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                showToast('Link copied');
            } catch (err) {
                showToast('Copy failed');
            }
        }
    };
}
function renderQrInto(container, text) {
    container.innerHTML = '';
    container.classList.remove('qr-loading');
    if (typeof qrcode !== 'function') {
        container.classList.add('qr-loading');
        container.textContent = 'QR library failed to load. Use Copy link instead.';
        return;
    }
    // Pick the smallest type-version that fits, with error correction L for capacity.
    let qr = null;
    for (let typeNumber = 4; typeNumber <= 40; typeNumber++) {
        try {
            const candidate = qrcode(typeNumber, 'L');
            candidate.addData(text);
            candidate.make();
            qr = candidate;
            break;
        } catch (e) { /* too small; try next */ }
    }
    if (!qr) {
        container.classList.add('qr-loading');
        container.textContent = 'Link too long for QR. Use Copy link.';
        return;
    }
    // Render as inline SVG for crisp scaling.
    const moduleCount = qr.getModuleCount();
    const cellSize = 4;
    const margin = 4;
    const size = moduleCount * cellSize + margin * 2;
    let path = '';
    for (let r = 0; r < moduleCount; r++) {
        for (let c = 0; c < moduleCount; c++) {
            if (qr.isDark(r, c)) {
                const x = margin + c * cellSize;
                const y = margin + r * cellSize;
                path += `M${x},${y}h${cellSize}v${cellSize}h-${cellSize}z`;
            }
        }
    }
    container.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" preserveAspectRatio="xMidYMid meet"><rect width="${size}" height="${size}" fill="#fff"/><path d="${path}" fill="#111827"/></svg>`;
}
function shareStarredSchedule() {
    if (!starredSessions || starredSessions.length === 0) {
        showToast('No starred sessions to share');
        return;
    }
    const url = buildShareUrl(starredSessions);
    _currentShareUrl = url;
    const modal = document.getElementById('shareModal');
    const qrEl = document.getElementById('shareModalQr');
    const countEl = document.getElementById('shareModalCount');
    if (!modal || !qrEl) return;
    if (countEl) {
        const n = starredSessions.length;
        countEl.innerHTML = `Sharing <strong>${n}</strong> starred session${n === 1 ? '' : 's'}`;
    }
    renderQrInto(qrEl, url);
    modal.classList.add('show');
}
function handleStarsImportFromHash() {
    const queryShare = new URLSearchParams(location.search).get('share');
    const hash = location.hash || '';
    const hashMatch = hash.match(/(?:^#|[#&])share=([^&]+)/);
    const rawShare = queryShare || (hashMatch && hashMatch[1]);
    if (!rawShare) return;
    const incoming = decodeStarsFromShare(rawShare);
    // Restrict to UIDs that actually exist in the data.
    const knownUids = new Set();
    Object.keys(data).forEach(day => (data[day] || []).forEach(s => { if (s.uid) knownUids.add(s.uid); }));
    const valid = incoming.filter(uid => knownUids.has(uid));
    // Clear the processed import data so it doesn't re-prompt on reload.
    const cleanUrl = new URL(location.href);
    cleanUrl.searchParams.delete('share');
    if (hashMatch) cleanUrl.hash = '';
    history.replaceState(null, '', cleanUrl.pathname + cleanUrl.search + cleanUrl.hash);
    if (valid.length === 0) {
        showToast('Shared link had no matching sessions');
        return;
    }
    const current = new Set(starredSessions);
    const incomingSet = new Set(valid);
    const removed = [...current].filter(uid => !incomingSet.has(uid)).length;
    const added = valid.filter(uid => !current.has(uid)).length;

    let promptMsg;
    if (current.size === 0) {
        promptMsg = `Import ${valid.length} starred session${valid.length === 1 ? '' : 's'} from shared link?`;
    } else if (removed === 0 && added === 0) {
        promptMsg = `Your schedule already matches this shared schedule. Nothing to change.`;
        window.alert(promptMsg);
        return;
    } else {
        const parts = [];
        if (added) parts.push(`add ${added}`);
        if (removed) parts.push(`remove ${removed}`);
        promptMsg = `Replace your starred schedule with the shared one? This will ${parts.join(' and ')} session${(added + removed) === 1 ? '' : 's'}.`;
    }
    const accept = window.confirm(promptMsg);
    if (!accept) return;
    starredSessions = [...valid];
    localStorage.setItem('incose_2026_stars', JSON.stringify(starredSessions));
    showToast(`Imported ${valid.length} session${valid.length === 1 ? '' : 's'}`);
    // Re-render the unified Now & Next view to reflect the imported stars.
    renderSchedule();
}

function renderTrackFilters() {
    const container = document.getElementById('trackFilters');
    container.innerHTML = '';
    
    if (currentView === 'starred') {
        container.style.display = 'none';
        return;
    }

    container.style.display = '';

    const isSearchActive = ((document.getElementById('searchBar')?.value || '').trim() !== '');

    const tracks = isSearchActive
        ? Object.values(data).flat().map(s => s.Track).filter(Boolean)
        : getAllTracksForDay(currentView);
    
    const uniqueTracks = [...new Set(tracks)]
        .filter(track => String(track).trim().toLowerCase() !== 'general')
        .sort();
    if (uniqueTracks.length === 0) {
        container.style.display = 'none';
        return;
    }

    const label = document.createElement('span');
    label.className = 'filter-label';
    label.textContent = 'Filter:';
    container.appendChild(label);

    // Medtronic chip — always shown first
    const medChip = document.createElement('button');
    const medActive = activeTrackFilters.has('__medtronic__');
    medChip.className = 'track-chip' + (activeTrackFilters.size === 0 || medActive ? ' active' : ' inactive');
    medChip.style.borderColor = '#007bff';
    if (medActive) medChip.style.background = '#007bff22';
    const medDot = document.createElement('span');
    medDot.className = 'chip-dot';
    medDot.style.background = '#007bff';
    medChip.appendChild(medDot);
    medChip.appendChild(document.createTextNode('Medtronic'));
    medChip.onclick = () => toggleTrackFilter('__medtronic__');
    container.appendChild(medChip);

    uniqueTracks.forEach(track => {
        const chip = document.createElement('button');
        chip.className = 'track-chip' + (activeTrackFilters.size === 0 || activeTrackFilters.has(track) ? ' active' : ' inactive');
        chip.style.borderColor = getTrackColor(track);
        if (activeTrackFilters.has(track)) chip.style.background = getTrackColor(track) + '22';
        
        const dot = document.createElement('span');
        dot.className = 'chip-dot';
        dot.style.background = getTrackColor(track);
        chip.appendChild(dot);
        chip.appendChild(document.createTextNode(track));
        
        chip.onclick = () => toggleTrackFilter(track);
        container.appendChild(chip);
    });

    if (activeTrackFilters.size > 0) {
        const clearBtn = document.createElement('button');
        clearBtn.className = 'track-chip';
        clearBtn.textContent = 'Clear';
        clearBtn.style.borderColor = '#ccc';
        clearBtn.onclick = () => { activeTrackFilters.clear(); renderTrackFilters(); applyFilters(); };
        container.appendChild(clearBtn);
    }
}

function toggleTrackFilter(track) {
    if (activeTrackFilters.has(track)) {
        activeTrackFilters.delete(track);
    } else {
        activeTrackFilters.add(track);
    }
    renderTrackFilters();
    applyFilters();
}

// ─── RENDER SCHEDULE ───
function renderSchedule() {
    searchQuery = (document.getElementById('searchBar')?.value || '').toLowerCase().trim();
    isGlobalSearchMode = currentView !== 'now' && searchQuery !== '';

    // Keep talk-track chips aligned with current mode (day-only vs all-days search).
    renderTrackFilters();

    const container = document.getElementById('scheduleContainer');
    container.innerHTML = '';
    container.classList.remove('starred-view', 'search-results-view', 'now-next-view');
    closeSessionDetails();

    if (currentView === 'now') {
        renderNowNextView(container);
        applyMobileLayout();
        requestAnimationFrame(updateSessionTitleLayout);
        requestAnimationFrame(updateScrollDateTimeIndicator);
        requestAnimationFrame(updateJumpToNowVisibility);
        return;
    }

    if (currentView === 'starred') {
        container.classList.add('starred-view');
        container.classList.toggle('edit-mode', isStarredEditMode);
        renderStarredView(container);
        applyMobileLayout();
        requestAnimationFrame(updateSessionTitleLayout);
        requestAnimationFrame(updateScrollDateTimeIndicator);
        requestAnimationFrame(() => {
            highlightStarredCurrent();
            // Auto-scroll to in-progress / next upcoming starred session.
            // Run twice so any layout settle (sticky bar height, font swap)
            // doesn't leave a gap of past sessions above the target.
            scrollStarredToNow({ behavior: 'auto' });
            requestAnimationFrame(() => {
                scrollStarredToNow({ behavior: 'auto' });
                updateJumpToNowVisibility();
            });
        });
        return;
    }

    if (isGlobalSearchMode) {
        container.classList.add('search-results-view');
        renderGlobalSearchResults(container);
        suppressSearchRerender = true;
        try {
            applyFilters();
        } finally {
            suppressSearchRerender = false;
        }
        applyMobileLayout();
        requestAnimationFrame(updateSessionTitleLayout);
        requestAnimationFrame(updateScrollDateTimeIndicator);
        requestAnimationFrame(updateJumpToNowVisibility);
        return;
    }

    if (isMobileLayoutViewport()) {
        renderMobileDayList(currentView, container);
    } else {
        renderDesktopDayGrid(currentView, container);
    }
    suppressSearchRerender = true;
    try {
        applyFilters();
    } finally {
        suppressSearchRerender = false;
    }
    applyMobileLayout();
    requestAnimationFrame(updateSessionTitleLayout);
    requestAnimationFrame(updateScrollDateTimeIndicator);
    requestAnimationFrame(updateJumpToNowVisibility);
}

function renderDesktopDayGrid(day, container) {
    const sessions = data[day] || [];
    const rooms = getRoomsForDay(day);
    const colRooms = rooms;
    const gridTemplate = `var(--time-col-width) repeat(${colRooms.length}, var(--desktop-col-width))`;
    const dayTimes = sessions.map(s => s.time);
    const baseSlotMetrics = getSlotMetrics(sessions);
    const dayBounds = getDayBounds(sessions);
    const TIMETABLE_BREAK_MIN_GAP = 90;
    const TIMETABLE_BREAK_VISIBLE_MINUTES = 25;

    // Compress long sparse windows by room coverage (not raw session count).
    // This preserves normal single-track plenary blocks while still compressing
    // edge cases like one-room tutorials with most columns empty.
    const salonSpanCount = colRooms.filter(room => /^Salon [A-D]$/.test(room)).length || 4;
    const roomCoverageThreshold = Math.max(1, Math.floor(colRooms.length * 0.2));
    const occupancyRanges = sessions
        .filter(session => !isBreakStyleEvent(session))
        .map(session => {
            const start = parseClockMinutes(session.time);
            const end = start + getSessionDurationMinutes(dayTimes, session);
            let coverage = 1;
            if (session.room === 'Grand Ballroom - Salons A-D') {
                coverage = salonSpanCount;
            }
            return { start, end, coverage };
        });

    const sessionRanges = sessions.map(session => {
        const start = parseClockMinutes(session.time);
        const end = start + getSessionDurationMinutes(dayTimes, session);
        return { session, start, end };
    });

    const lowDensityRuns = [];
    let runStart = null;
    for (let minute = dayBounds.start; minute < dayBounds.end; minute += SLOT_MINUTES) {
        const slotEnd = minute + SLOT_MINUTES;
        let activeCoverage = 0;
        for (const range of occupancyRanges) {
            if (range.start < slotEnd && range.end > minute) {
                activeCoverage += range.coverage;
                if (activeCoverage > roomCoverageThreshold) break;
            }
        }

        const isLowDensity = activeCoverage <= roomCoverageThreshold;
        if (isLowDensity) {
            if (runStart === null) runStart = minute;
        } else if (runStart !== null) {
            lowDensityRuns.push({ start: runStart, end: minute });
            runStart = null;
        }
    }
    if (runStart !== null) {
        lowDensityRuns.push({ start: runStart, end: dayBounds.end });
    }

    // Never compress across explicit event boundaries. This preserves a readable
    // timeline line at key transitions (for example, Happy Hour ending at 7:00 PM).
    const transitionBoundaries = [...new Set(
        sessionRanges.flatMap(range => [range.start, range.end])
    )]
        .filter(minute => Number.isFinite(minute))
        .sort((a, b) => a - b);

    const splittableLowDensityRuns = [];
    lowDensityRuns.forEach(run => {
        const splitPoints = [
            run.start,
            ...transitionBoundaries.filter(minute => minute > run.start && minute < run.end),
            run.end
        ];

        for (let i = 0; i < splitPoints.length - 1; i += 1) {
            const start = splitPoints[i];
            const end = splitPoints[i + 1];
            if ((end - start) >= SLOT_MINUTES) {
                splittableLowDensityRuns.push({ start, end });
            }
        }
    });

    const compressedGaps = [];
    let cumulativeRemoved = 0;
    for (const run of splittableLowDensityRuns) {
        const runDuration = run.end - run.start;
        if (runDuration < TIMETABLE_BREAK_MIN_GAP) continue;

        // Only compress (and therefore zigzag) gaps that can be read directly
        // from timeline labels at both boundaries.
        const hasTimelineReadableBounds = (run.start % 30 === 0) && (run.end % 30 === 0);
        if (!hasTimelineReadableBounds) continue;

        const visibleDuration = Math.min(TIMETABLE_BREAK_VISIBLE_MINUTES, runDuration);
        const removed = runDuration - visibleDuration;
        compressedGaps.push({
            start: run.start,
            end: run.end,
            visibleDuration,
            removed,
            cumulativeRemovedBefore: cumulativeRemoved,
            scale: visibleDuration / runDuration
        });
        cumulativeRemoved += removed;
    }

    const mapMinuteToVisual = minute => {
        for (const gap of compressedGaps) {
            if (minute < gap.start) {
                return minute - gap.cumulativeRemovedBefore;
            }
            if (minute <= gap.end) {
                const withinGap = minute - gap.start;
                return (gap.start - gap.cumulativeRemovedBefore) + (withinGap * gap.scale);
            }
        }
        return minute - cumulativeRemoved;
    };

    const visualDayStart = mapMinuteToVisual(baseSlotMetrics.dayStart);
    const visualDayEnd = mapMinuteToVisual(dayBounds.end);
    const slotMetrics = {
        dayStart: visualDayStart,
        totalSlots: Math.max(1, Math.ceil((visualDayEnd - visualDayStart) / SLOT_MINUTES))
    };

    const getPlacementForRange = (startMinute, endMinute) => {
        const visualStart = mapMinuteToVisual(startMinute);
        const visualEnd = mapMinuteToVisual(endMinute);
        const startSlot = Math.floor((visualStart - slotMetrics.dayStart) / SLOT_MINUTES) + 1;
        const slotSpan = Math.max(1, Math.ceil((visualEnd - visualStart) / SLOT_MINUTES));
        return { startSlot, slotSpan };
    };

    const isInsideCompressedGap = minute => compressedGaps.some(gap => minute > gap.start && minute < gap.end);

    const shell = document.createElement('div');
    shell.className = 'schedule-shell';
    shell.addEventListener('scroll', applyScrollLayout, { passive: true });
    const canvas = document.createElement('div');
    canvas.className = 'schedule-canvas';

    const headerRow = document.createElement('div');
    headerRow.className = 'room-header-row';
    headerRow.style.gridTemplateColumns = gridTemplate;

    const spacer = document.createElement('div');
    spacer.className = 'room-header-spacer';
    headerRow.appendChild(spacer);

    colRooms.forEach(room => {
        const cell = document.createElement('div');
        cell.className = 'room-header-cell';
        cell.dataset.room = room;
        cell.textContent = room;
        headerRow.appendChild(cell);
    });
    canvas.appendChild(headerRow);

    const grid = document.createElement('div');
    grid.className = 'schedule-grid';
    grid.style.gridTemplateColumns = gridTemplate;
    grid.style.gridTemplateRows = `repeat(${slotMetrics.totalSlots}, var(--slot-height))`;

    const roomIndexMap = new Map(colRooms.map((room, index) => [room, index]));
    const salonAIndex = roomIndexMap.get('Salon A');
    const salonDIndex = roomIndexMap.get('Salon D');

    const markerMinutes = new Set();
    for (let marker = dayBounds.start; marker <= dayBounds.end; marker += 30) {
        markerMinutes.add(marker);
    }
    compressedGaps.forEach(gap => {
        markerMinutes.add(gap.start);
        markerMinutes.add(gap.end);
    });

    const renderedMarkerSlots = new Set();
    [...markerMinutes].sort((a, b) => a - b).forEach(marker => {
        if (isInsideCompressedGap(marker)) return;

        const visualMarker = mapMinuteToVisual(marker);
        const startSlot = Math.floor((visualMarker - slotMetrics.dayStart) / SLOT_MINUTES) + 1;
        if (startSlot < 1 || startSlot > slotMetrics.totalSlots) return;

        const isGapBoundary = compressedGaps.some(gap => marker === gap.start || marker === gap.end);
        if (renderedMarkerSlots.has(startSlot) && !isGapBoundary) return;
        renderedMarkerSlots.add(startSlot);

        const label = document.createElement('div');
        label.className = 'timeline-slot-label';
        label.dataset.slot = startSlot;
        label.style.gridColumn = '1';
        label.style.gridRow = `${startSlot} / span 1`;
        label.textContent = formatTime(minuteToLabel(marker));
        grid.appendChild(label);

        const divider = document.createElement('div');
        divider.className = 'timeline-divider';
        if (startSlot === 1) divider.classList.add('first-slot-divider');
        divider.dataset.slot = startSlot;
        divider.style.gridRow = `${startSlot} / span 1`;
        grid.appendChild(divider);
    });

    colRooms.forEach((room, index) => {
        const background = document.createElement('div');
        background.className = 'room-column-bg';
        background.dataset.room = room;
        background.style.gridColumn = `${index + 2}`;
        background.style.gridRow = `1 / span ${slotMetrics.totalSlots}`;
        grid.appendChild(background);
    });

    compressedGaps.forEach(gap => {
        const placement = getPlacementForRange(gap.start, gap.end);
        const indicator = document.createElement('div');
        indicator.className = 'timeline-break-indicator';
        indicator.style.gridRow = `${placement.startSlot} / span ${placement.slotSpan}`;

        const label = document.createElement('div');
        label.className = 'timeline-break-label';
        const gapStartText = formatTime(minuteToLabel(gap.start));
        const gapEndText = formatTime(minuteToLabel(gap.end));
        const startLine = document.createElement('span');
        startLine.textContent = gapStartText;
        const endLine = document.createElement('span');
        endLine.className = 'to-line';
        endLine.textContent = `to ${gapEndText}`;
        label.appendChild(startLine);
        label.appendChild(endLine);

        const line = document.createElement('div');
        line.className = 'timeline-break-line';

        indicator.appendChild(label);
        indicator.appendChild(line);
        grid.appendChild(indicator);
    });

    const mealBreaks = sessions.filter(s => isMealStyleEvent(s));
    const mealTimes = mealBreaks.map(m => ({
        start: parseClockMinutes(m.time),
        end: parseClockMinutes(m.time) + getSessionDurationMinutes(dayTimes, m),
        session: m
    }));

    const checkIfTrainingSpansMeal = (session) => {
        if (session.type !== 'training') return null;
        const sessionStart = parseClockMinutes(session.time);
        const sessionEnd = sessionStart + getSessionDurationMinutes(dayTimes, session);
        for (const meal of mealTimes) {
            if (sessionStart < meal.end && sessionEnd > meal.start) {
                return meal;
            }
        }
        return null;
    };

    const normalSessions = [];
    const overlaySessions = [];
    const breakSessions = [];
    const shortCalloutReservations = [];

    sessions.forEach(session => {
        if (isGlobalOverlayEvent(session)) {
            overlaySessions.push(session);
        } else if (session.type === 'break') {
            breakSessions.push(session);
        } else {
            normalSessions.push(session);
        }
    });

    const placeSessionPart = (originalSession, partStart, partEnd, overlay) => {
        const placement = getPlacementForRange(partStart, partEnd);
        const isAdSpanSession = originalSession.room === 'Grand Ballroom - Salons A-D';

        const wrap = document.createElement('div');
        wrap.className = 'schedule-item';
        if (overlay) wrap.classList.add('overlay-item');
        wrap.dataset.day = day;
        wrap.dataset.time = originalSession.time;
        wrap.dataset.room = originalSession.room;

        const sessionRooms = getSessionRooms(originalSession);
        const spannedRoomIndexes = sessionRooms.map(room => roomIndexMap.get(room)).filter(index => index !== undefined);
        if (spannedRoomIndexes.length > 1) {
            wrap.style.gridColumn = `${Math.min(...spannedRoomIndexes) + 2} / ${Math.max(...spannedRoomIndexes) + 3}`;
            wrap.classList.add('ad-span-item');
        } else if (isAdSpanSession && salonAIndex !== undefined && salonDIndex !== undefined) {
            wrap.style.gridColumn = `${salonAIndex + 2} / ${salonDIndex + 3}`;
            wrap.classList.add('ad-span-item');
        } else {
            const roomIndex = roomIndexMap.get(originalSession.room);
            if (roomIndex === undefined) return;
            wrap.style.gridColumn = `${roomIndex + 2}`;
        }

        wrap.style.gridRow = `${placement.startSlot} / span ${placement.slotSpan}`;
        wrap.appendChild(createSessionCard(originalSession, false));
        grid.appendChild(wrap);
    };

    const placeMultiRoomSession = (session) => {
        const sessionStart = parseClockMinutes(session.time);
        const sessionEnd = sessionStart + getSessionDurationMinutes(dayTimes, session);
        const placement = getPlacementForRange(sessionStart, sessionEnd);
        const targetRooms = new Set(getSessionRooms(session));
        const occupiedRooms = new Set();

        normalSessions.forEach(other => {
            if (other === session) return;
            const otherStart = parseClockMinutes(other.time);
            const otherEnd = otherStart + getSessionDurationMinutes(dayTimes, other);
            if (otherStart >= sessionEnd || otherEnd <= sessionStart) return;
            getSessionRooms(other).forEach(room => occupiedRooms.add(room));
        });

        let runStart = null;
        const placeRun = (start, end) => {
            const wrap = document.createElement('div');
            wrap.className = 'schedule-item ad-span-item';
            wrap.dataset.day = day;
            wrap.dataset.time = session.time;
            wrap.dataset.room = session.room;
            wrap.style.gridColumn = `${start + 2} / ${end + 3}`;
            wrap.style.gridRow = `${placement.startSlot} / span ${placement.slotSpan}`;
            wrap.appendChild(createSessionCard(session, false));
            grid.appendChild(wrap);
        };

        colRooms.forEach((room, index) => {
            if (targetRooms.has(room) && !occupiedRooms.has(room)) {
                if (runStart === null) runStart = index;
            } else if (runStart !== null) {
                placeRun(runStart, index - 1);
                runStart = null;
            }
        });
        if (runStart !== null) placeRun(runStart, colRooms.length - 1);
    };

    const findShortSessionCallout = (session, sessionStart, durationMinutes, sourceRoom) => {
        const sourceIndex = roomIndexMap.get(sourceRoom);
        if (sourceIndex === undefined) return null;
        const estimatedTitleLines = Math.ceil(String(session.Title || '').length / 26);
        const calloutPixels = 58 + (estimatedTitleLines * 19);
        const calloutDuration = Math.max(
            15,
            durationMinutes,
            Math.ceil(calloutPixels / 28) * SLOT_MINUTES
        );
        const offsets = [0, -calloutDuration, 5, -5, 10, -10, 15, -15, 20, -20, 25, -25, 30, -30];

        for (const offset of offsets) {
            const start = sessionStart + offset;
            const end = start + calloutDuration;
            if (start < baseSlotMetrics.dayStart) continue;
            for (let distance = 1; distance < colRooms.length; distance += 1) {
                for (const roomIndex of [sourceIndex + distance, sourceIndex - distance]) {
                    const room = colRooms[roomIndex];
                    if (!room) continue;
                    const isOccupied = normalSessions.some(other => {
                        if (other === session || !getSessionRooms(other).includes(room)) return false;
                        const otherStart = parseClockMinutes(other.time);
                        const otherEnd = otherStart + getSessionDurationMinutes(dayTimes, other);
                        return otherStart < end && otherEnd > start;
                    }) || shortCalloutReservations.some(reservation =>
                        reservation.room === room && reservation.start < end && reservation.end > start
                    );
                    if (!isOccupied) return { room, roomIndex, start, end };
                }
            }
        }
        return null;
    };

    const placeShortSessionCallout = (session, sessionStart, sessionEnd, placement) => {
        const durationMinutes = sessionEnd - sessionStart;
        const target = findShortSessionCallout(session, sessionStart, durationMinutes, session.room);
        if (!target) return false;

        const marker = document.createElement('div');
        marker.className = 'schedule-item short-session-marker';
        marker.dataset.day = day;
        marker.dataset.time = session.time;
        marker.dataset.room = session.room;
        marker.style.gridColumn = `${roomIndexMap.get(session.room) + 2}`;
        marker.style.gridRow = `${placement.startSlot} / span ${placement.slotSpan}`;
        marker.appendChild(createSessionCard(session, false));
        grid.appendChild(marker);

        const calloutPlacement = getPlacementForRange(target.start, target.end);
        const callout = document.createElement('div');
        callout.className = 'schedule-item short-session-callout';
        callout.dataset.day = day;
        callout.dataset.time = session.time;
        callout.dataset.room = target.room;
        callout.style.gridColumn = `${target.roomIndex + 2}`;
        callout.style.gridRow = `${calloutPlacement.startSlot} / span ${calloutPlacement.slotSpan}`;
        const markerCenterOffset = (placement.startSlot - calloutPlacement.startSlot + (placement.slotSpan / 2)) * 28;
        callout.style.setProperty('--short-session-leader-offset', `${markerCenterOffset}px`);
        callout.appendChild(createShortSessionCalloutCard(session, target.roomIndex < roomIndexMap.get(session.room)));
        grid.appendChild(callout);
        shortCalloutReservations.push(target);
        return true;
    };

    const placeSession = (session, overlay = false) => {
        const spanningMeal = checkIfTrainingSpansMeal(session);
        if (spanningMeal) {
            const sessionStart = parseClockMinutes(session.time);
            const sessionEnd = sessionStart + getSessionDurationMinutes(dayTimes, session);
            const mealStart = spanningMeal.start;
            const mealEnd = spanningMeal.end;

            if (sessionStart < mealStart) {
                placeSessionPart(session, sessionStart, mealStart, overlay);
            }
            if (sessionEnd > mealEnd) {
                placeSessionPart(session, mealEnd, sessionEnd, overlay);
            }
            return;
        }

        if (getSessionRooms(session).length > 1) {
            placeMultiRoomSession(session);
            return;
        }

        const sessionStart = parseClockMinutes(session.time);
        const sessionEnd = sessionStart + getSessionDurationMinutes(dayTimes, session);
        const placement = getPlacementForRange(sessionStart, sessionEnd);
        const isAdSpanSession = session.room === 'Grand Ballroom - Salons A-D';
        const sessionRooms = getSessionRooms(session);
        const spannedRoomIndexes = sessionRooms.map(room => roomIndexMap.get(room)).filter(index => index !== undefined);

        const wrap = document.createElement('div');
        wrap.className = 'schedule-item';
        if (overlay) wrap.classList.add('overlay-item');
        wrap.dataset.day = day;
        wrap.dataset.time = session.time;
        wrap.dataset.room = session.room;

        const isShortTitleSession = !overlay
            && spannedRoomIndexes.length === 1
            && placement.slotSpan <= 2;
        if (isShortTitleSession && placeShortSessionCallout(session, sessionStart, sessionEnd, placement)) return;

        if (isGlobalOverlayEvent(session)) {
            wrap.style.gridColumn = '2 / -1';
        } else if (spannedRoomIndexes.length > 1) {
            wrap.style.gridColumn = `${Math.min(...spannedRoomIndexes) + 2} / ${Math.max(...spannedRoomIndexes) + 3}`;
            wrap.classList.add('ad-span-item');
        } else if (isAdSpanSession && salonAIndex !== undefined && salonDIndex !== undefined) {
            wrap.style.gridColumn = `${salonAIndex + 2} / ${salonDIndex + 3}`;
            wrap.classList.add('ad-span-item');
        } else {
            const roomIndex = roomIndexMap.get(session.room);
            if (roomIndex === undefined) return;
            wrap.style.gridColumn = `${roomIndex + 2}`;
        }

        wrap.style.gridRow = `${placement.startSlot} / span ${placement.slotSpan}`;

        if (isGlobalOverlayEvent(session)) {
            wrap.appendChild(createFullWidthCard(session));
        } else if (session.type === 'session' || session.type === 'training' || isSessionStyleEvent(session)) {
            wrap.appendChild(createSessionCard(session, false));
        } else {
            wrap.appendChild(createFullWidthCard(session));
        }
        grid.appendChild(wrap);
    };

    // Place a break by filling consecutive runs of empty columns at that time range.
    const placeBreakSession = (session) => {
        const breakStart = parseClockMinutes(session.time);
        const breakEnd = breakStart + getSessionDurationMinutes(dayTimes, session);
        const placement = getPlacementForRange(breakStart, breakEnd);

        // Collect column indices occupied by non-break sessions during this break window.
        const occupiedIndices = new Set();
        normalSessions.forEach(other => {
            const otherStart = parseClockMinutes(other.time);
            const otherEnd = otherStart + getSessionDurationMinutes(dayTimes, other);
            if (otherStart < breakEnd && otherEnd > breakStart) {
                // A-D span sessions occupy Salon A through Salon D indices
                if (other.room === 'Grand Ballroom - Salons A-D' && salonAIndex !== undefined && salonDIndex !== undefined) {
                    for (let i = salonAIndex; i <= salonDIndex; i++) occupiedIndices.add(i);
                } else {
                    const idx = roomIndexMap.get(other.room);
                    if (idx !== undefined) occupiedIndices.add(idx);
                }
            }
        });

        // Find consecutive runs of unoccupied column indices.
        const runs = [];
        let runStart = null;
        colRooms.forEach((room, idx) => {
            if (!occupiedIndices.has(idx)) {
                if (runStart === null) runStart = idx;
            } else {
                if (runStart !== null) { runs.push({ start: runStart, end: idx - 1 }); runStart = null; }
            }
        });
        if (runStart !== null) runs.push({ start: runStart, end: colRooms.length - 1 });

        // Place one card per column (all columns for meals, only unoccupied for breaks).
        const durationMins = getSessionDurationMinutes(dayTimes, session);
        const isMeal = isMealStyleEvent(session);
        const isBanquet = isBanquetEvent(session);
        colRooms.forEach((room, idx) => {
            if (!isMeal && occupiedIndices.has(idx)) return;
            const wrap = document.createElement('div');
            wrap.className = 'schedule-item overlay-item';
            wrap.dataset.day = day;
            wrap.dataset.time = session.time;
            wrap.dataset.room = session.room;
            wrap.style.gridColumn = `${idx + 2}`;
            wrap.style.gridRow = `${placement.startSlot} / span ${placement.slotSpan}`;
            // Build a per-column single-line break marker
            const card = document.createElement('div');
            const colVariant = isBanquet ? 'banquet-col' : (isMeal ? 'meal-col' : 'break-col');
            card.className = 'event-card ' + colVariant;
            card.dataset.uid = session.uid || '';
            card.dataset.track = (session.Track || '').toLowerCase();
            card.dataset.title = (session.Title || '').toLowerCase();
            const lineEl = document.createElement('div');
            lineEl.className = isBanquet ? 'banquet-col-line' : (isMeal ? 'meal-col-line' : 'break-col-line');
            lineEl.textContent = isBanquet ? (session.Title || '') : (isMeal ? (session.Title || '') : getBreakDisplayTitle(session));
            card.appendChild(lineEl);
            if (isBanquet) {
                card.appendChild(buildTicketRequiredEl());
            }
            wrap.appendChild(card);
            grid.appendChild(wrap);
        });
    };

    normalSessions.forEach(session => placeSession(session, false));
    // Overlay events (including breakfast) use smart column-filling.
    overlaySessions.forEach(session => placeBreakSession(session));
    breakSessions.forEach(session => placeBreakSession(session));

    canvas.appendChild(grid);
    shell.appendChild(canvas);
    container.appendChild(shell);
}

// ─── Now & Next view: at-a-glance live snapshot ─────────────────────────
// Shows two short lists across the entire conference:
//   • Happening Now  — sessions whose [start, end) brackets the current time.
//   • Happening Next — earliest upcoming start time, plus any sessions sharing
//                      that start time. If "Next" is a break/meal, also show
//                      what's happening *after* the break.
// Starred (your-schedule) sessions are sorted to the top of each list and
// visually emphasized with a star ring + "On your schedule" badge.

function collectAllWindowed() {
    // Flatten every session with a resolved time window once.
    const out = [];
    Object.keys(data).forEach(day => {
        (data[day] || []).forEach(session => {
            const win = getSessionTimeWindow(day, session.time, session);
            if (!win) return;
            out.push({ session, day, win });
        });
    });
    return out;
}

function isStarredItem(item) {
    return !!(item.session.uid && starredSessions.includes(item.session.uid));
}

function sortNowNextItems(items) {
    // Starred first, then by start time, then by room, then by title.
    items.sort((a, b) => {
        const sa = isStarredItem(a) ? 0 : 1;
        const sb = isStarredItem(b) ? 0 : 1;
        if (sa !== sb) return sa - sb;
        if (a.win.start - b.win.start !== 0) return a.win.start - b.win.start;
        return (a.session.room || '').localeCompare(b.session.room || '')
            || (a.session.Title || '').localeCompare(b.session.Title || '');
    });
    return items;
}

function formatNowNextRange(items) {
    if (!items.length) return '';
    // Show the next change point: when the earliest-ending session wraps.
    // Sessions in this group don't all end together, so a range like
    // "10:00 AM – 11:00 AM" would imply they do. Instead show "until 10:30 AM"
    // for the soonest end, which is when the on-screen list will change.
    const earliestEnd = new Date(Math.min(...items.map(i => i.win.end.getTime())));
    const fmt = d => d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    return `until ${fmt(earliestEnd)}`;
}

function formatRelativeMinutes(toDate, fromDate) {
    const diffMin = Math.round((toDate - fromDate) / 60000);
    if (diffMin <= 0) return 'starting now';
    if (diffMin < 60) return `in ${diffMin} min`;
    const h = Math.floor(diffMin / 60);
    const m = diffMin % 60;
    if (h < 24) return m === 0 ? `in ${h} hr` : `in ${h} hr ${m} min`;
    const days = Math.round(h / 24);
    return `in ${days} day${days === 1 ? '' : 's'}`;
}

function collectSectionTrackColors(items, opts) {
    // Distinct (color, label) pairs for the items in a section. Each
    // becomes a small colored dot in the section header so users can
    // see at a glance which tracks are present. Only counts items the
    // user is actually attending — starred sessions and non-starrable
    // items like keynotes/plenaries. Non-starred parallel sessions are
    // already represented as dots inside the "X other sessions" branch.
    // When opts.chosenUid is set, only the dot for that session is
    // filled; the rest render as hollow rings (the user has committed
    // to one talk, so the others are "could-have-been" tracks).
    const chosenUid = (opts && opts.chosenUid) || null;
    const seen = new Map();
    (items || []).forEach(item => {
        const s = item.session;
        const isBreak = isBreakStyleEvent(s) || isMealStyleEvent(s);
        const isStarrable = !!s.uid
            && (s.type === 'session' || s.type === 'training' || isSessionStyleEvent(s));
        if (isStarrable && !isStarredItem(item)) return;
        const trackLabel = isBreak
            ? (s.Track || s.type || 'Break')
            : isKeynoteSession(s)
                ? 'Keynote'
                : (s.Track || (isSessionStyleEvent(s) ? 'General' : ''));
        if (!trackLabel) return;
        const color = getSessionAccentColor(s, trackLabel);
        if (!color && !isBreak) return;
        // Hollow when: it's a break (existing behavior), OR a
        // chosenUid is supplied and this item isn't the chosen one.
        const isChosen = chosenUid && s.uid === chosenUid;
        const hollow = isBreak || (chosenUid && !isChosen);
        const key = trackLabel + '|' + color + '|' + (hollow ? 'h' : 'f');
        if (!seen.has(key)) seen.set(key, { color, label: trackLabel, hollow });
    });
    return [...seen.values()];
}

function buildNowNextSectionHeader(title, headerMeta, items, opts) {
    const header = document.createElement('div');
    header.className = 'nn-section-header';

    const titleEl = document.createElement('span');
    titleEl.className = 'nn-section-title';
    titleEl.appendChild(document.createTextNode(title));
    header.appendChild(titleEl);

    // Track-color dots for every distinct track present in this
    // section's items. Sit immediately to the right of the label.
    const tracks = collectSectionTrackColors(items, opts);
    if (tracks.length) {
        const dots = document.createElement('span');
        dots.className = 'nn-section-dots';
        tracks.forEach(t => {
            const d = document.createElement('span');
            d.className = 'nn-section-track-dot';
            if (t.hollow) d.classList.add('is-hollow');
            if (t.color) {
                if (t.hollow) d.style.borderColor = t.color;
                else d.style.background = t.color;
            }
            d.title = t.label;
            d.setAttribute('aria-label', t.label);
            dots.appendChild(d);
        });
        header.appendChild(dots);
    }

    if (headerMeta) {
        const metaEl = document.createElement('span');
        metaEl.className = 'nn-section-time';
        metaEl.textContent = headerMeta;
        header.appendChild(metaEl);
    }

    if (title === 'Happening Now') {
        const shareBtn = document.createElement('button');
        shareBtn.type = 'button';
        shareBtn.className = 'nn-share-btn';
        shareBtn.textContent = 'Share';
        shareBtn.setAttribute('aria-label', 'Share my schedule with a QR code');
        shareBtn.onclick = shareStarredSchedule;
        header.appendChild(shareBtn);
    }
    return header;
}

// Find the session the user is "in" immediately before `time` —
// preferring a session whose window contains time-1ms, falling back
// to the most-recently-ended session on the same day. Used by node
// markers to render the "where you came from" row even when that
// session isn't on the starred path (e.g. Lunch).
function getEffectivePrevItemAt(time, opts) {
    if (!currentRenderAllItems || !currentRenderAllItems.length) return null;
    const t = time.getTime();
    const preferRoom = opts && typeof opts.preferRoom === 'string'
        ? opts.preferRoom.trim() : '';
    // 1) Containing window at t-1ms. Prefer the chunk that ENDS
    //    exactly at `time` (the immediately-preceding session the
    //    user just left). A still-running session that overlaps t
    //    isn't where the user is "coming from" at this transition.
    //    Among items ending at `time`, prefer the one the user was
    //    actually attending (starred + on path) — otherwise a
    //    parallel non-starred session in a different room can win
    //    the tie-break and produce a wrong "Stay in <Room>" verb.
    let endingHere = null;
    let containing = null;
    const isAttended = it => !!(it && it.session && it.session.uid
        && Array.isArray(starredSessions)
        && starredSessions.includes(it.session.uid));
    // A non-attended regular session (type === 'session' and not
    // starred) is unlikely to be "where the user came from": they
    // didn't choose to attend it and it isn't on their path. Treat
    // such items as low-confidence anchors so they lose to genuine
    // path anchors like breaks, meals, events, keynotes, training,
    // and starred sessions when both end at the same instant. This
    // prevents bugs like "Stay in Main Hall" right after Breakfast
    // when the user only starred a keynote in that room — the
    // intermediate non-starred Kickoff session would otherwise be
    // picked as the prior item due to the preferRoom bias.
    const isUnattendedRegularSession = it => it && it.session
        && it.session.type === 'session' && !isAttended(it);
    const matchesPreferredRoom = it => preferRoom
        && it && it.session
        && (it.session.room || '').trim() === preferRoom;
    // Score: starred (+4), is a break/meal/event/keynote/training
    // anchor i.e. NOT an unattended regular session (+2), matches
    // preferred destination room (+1). Ties broken by latest start
    // time so we still prefer a fresh chunk over a long-running
    // session. The +4/+2 spacing ensures a starred item beats a
    // non-starred-but-anchor-type item, which beats an unattended
    // session even when only the unattended session matches the
    // preferred room.
    const scoreCandidate = it => (isAttended(it) ? 4 : 0)
        + (isUnattendedRegularSession(it) ? 0 : 2)
        + (matchesPreferredRoom(it) ? 1 : 0);
    for (const it of currentRenderAllItems) {
        if (!it.win) continue;
        if (it.win.start.getTime() <= t - 1 && t - 1 < it.win.end.getTime()) {
            if (it.win.end.getTime() === t) {
                if (!endingHere) {
                    endingHere = it;
                } else {
                    const curScore = scoreCandidate(endingHere);
                    const newScore = scoreCandidate(it);
                    if (newScore > curScore) {
                        endingHere = it;
                    } else if (newScore === curScore
                        && it.win.start.getTime() > endingHere.win.start.getTime()) {
                        endingHere = it;
                    }
                }
            } else if (!containing || it.win.end.getTime() < containing.win.end.getTime()) {
                // Among non-ending overlaps, prefer the one ending
                // soonest (most "about to finish").
                containing = it;
            }
        }
    }
    // Helper: search for the most recently ended anchor before t,
    // optionally skipping unattended regular sessions. Returns null
    // if nothing is found within the 6h horizon.
    const findRecentEnded = (skipUnattendedRegular) => {
        let result = null;
        for (const it of currentRenderAllItems) {
            if (!it.win) continue;
            const endT = it.win.end.getTime();
            if (endT > t) continue;
            if (endT < t - 6 * 60 * 60 * 1000) continue; // within 6h
            if (skipUnattendedRegular && isUnattendedRegularSession(it)) continue;
            if (!result || endT > result.win.end.getTime()) result = it;
        }
        return result;
    };
    // Prefer endingHere/containing — but if the best one we found is
    // an unattended regular session (low-confidence anchor), and a
    // recently-ended anchor (break/meal/event/keynote/training/
    // starred) is available, prefer that. This keeps "from breakfast
    // → head to keynote" working when an unstarred kickoff session
    // happens to occupy the destination room in between.
    const primary = endingHere || containing;
    if (primary) {
        if (isUnattendedRegularSession(primary)) {
            const better = findRecentEnded(true);
            if (better) return better;
        }
        return primary;
    }
    // 2) Most recently ended at or before t (same day).
    let best = null;
    for (const it of currentRenderAllItems) {
        if (!it.win) continue;
        const endT = it.win.end.getTime();
        if (endT > t) continue;
        if (endT < t - 6 * 60 * 60 * 1000) continue; // within 6h
        if (!best || endT > best.win.end.getTime()) best = it;
    }
    return best;
}

// Build the inner HTML for a "node marker" — the small icon-style
// element rendered in the left gutter for any path node. Shape:
//   time
//   dot row 1 — single dot in the PRIOR session's track color in
//               column 0; remaining cells are empty placeholders
//               so columns align with row 2.
//   svg       — git-graph-style curve from the prior dot down to
//               the chosen option's column in row 2.
//   dot row 2 — every option at this node, chosen filled in its
//               track color, others as hollow rings.
// If `prevItem` is null, we resolve one from the full schedule.

// ─── OKLCH gradient sampling ──────────────────────────────────────
// SVG <linearGradient> interpolates straight-line in sRGB (or
// linearRGB), which produces a brown/olive midpoint when the
// endpoints are roughly opposite hues (e.g. red ↔ green). To get a
// hue-respecting transition we pre-sample N stops in OKLCH (taking
// the shorter arc around the hue wheel) and emit them as plain sRGB
// stops, which every browser interpolates cleanly between.
const _hex2srgb = (hex) => {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
    if (!m) return null;
    const n = parseInt(m[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => v / 255);
};
const _srgb2lin = (c) => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
const _lin2srgb = (c) => c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
const _lin2oklab = ([r, g, b]) => {
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    return [
        0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
        1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
        0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s,
    ];
};
const _oklab2lin = ([L, a, b]) => {
    const l = Math.pow(L + 0.3963377774 * a + 0.2158037573 * b, 3);
    const m = Math.pow(L - 0.1055613458 * a - 0.0638541728 * b, 3);
    const s = Math.pow(L - 0.0894841775 * a - 1.2914855480 * b, 3);
    return [
        4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
    ];
};
const _hex2oklch = (hex) => {
    const srgb = _hex2srgb(hex);
    if (!srgb) return null;
    const [L, a, b] = _lin2oklab(srgb.map(_srgb2lin));
    const C = Math.hypot(a, b);
    let h = Math.atan2(b, a) * 180 / Math.PI;
    if (h < 0) h += 360;
    return { L, C, h };
};
const _oklch2hex = ({ L, C, h }) => {
    const a = C * Math.cos(h * Math.PI / 180);
    const b = C * Math.sin(h * Math.PI / 180);
    const lin = _oklab2lin([L, a, b]);
    const to8 = (v) => {
        const s = _lin2srgb(Math.max(0, Math.min(1, v)));
        return Math.round(Math.max(0, Math.min(1, s)) * 255)
            .toString(16).padStart(2, '0');
    };
    return '#' + lin.map(to8).join('');
};
// Returns an array of {offset, color} stops along the OKLCH shorter
// hue arc between two hex colors. STOP_COUNT controls smoothness
// (5 stops = 4 segments is plenty for a 14px stroke).
function sampleOklchStops(startHex, endHex, stopCount = 5) {
    const a = _hex2oklch(startHex);
    const b = _hex2oklch(endHex);
    if (!a || !b) return [{ offset: 0, color: startHex }, { offset: 1, color: endHex }];
    // Shorter arc around the hue wheel.
    let dh = b.h - a.h;
    if (dh > 180) dh -= 360;
    else if (dh < -180) dh += 360;
    const stops = [];
    for (let i = 0; i < stopCount; i++) {
        const t = i / (stopCount - 1);
        const h = (a.h + dh * t + 360) % 360;
        stops.push({
            offset: t,
            color: _oklch2hex({
                L: a.L + (b.L - a.L) * t,
                C: a.C + (b.C - a.C) * t,
                h,
            }),
        });
    }
    return stops;
}

function buildNodeMarkerInnerHtml(items, chosenUid, time, prevItem) {
    // Sort options (row 2) alphabetically by track/room so the dot
    // ordering is stable and consistent with the "X other sessions"
    // dot preview elsewhere on the page.
    items = (items || []).slice().sort(compareItemsByTrackRoom);
    const chosenIdx = chosenUid
        ? items.findIndex(it => it.session && it.session.uid === chosenUid)
        : -1;

    // Resolve the immediate predecessor for the prior dot. The
    // prior dot represents where the user was last on their PATH —
    // i.e. the chosen session in the previous interval — so always
    // prefer `prevItem` (the path predecessor) when it's available.
    // Only fall back to the schedule-wide predecessor when the path
    // has no prior item (start of day, etc.), since that lets a
    // break/meal supply a color when there's no starred precursor.
    let resolvedPrev = null;
    if (prevItem && prevItem.session) {
        resolvedPrev = prevItem;
    } else {
        resolvedPrev = getEffectivePrevItemAt(time);
    }

    // Row 1 is the actual source of a resolved path transition. Other
    // concurrent starred sessions belong in the "other sessions" list;
    // showing them here makes an unlabeled extra dot look like the
    // transition source.
    let prevItems = getPrevPathActiveItems(currentRenderPath, time);
    if (resolvedPrev && resolvedPrev.session) {
        prevItems = [resolvedPrev];
    }
    prevItems = prevItems.slice().sort(compareItemsByTrackRoom);

    // The chosen prior is the displayed source for the connector,
    // top stub, and filled upper dot.
    const prevChosenUid = (resolvedPrev && resolvedPrev.session
        && resolvedPrev.session.uid) || null;
    let prevChosenIdx = prevChosenUid
        ? prevItems.findIndex(it => it.session && it.session.uid === prevChosenUid)
        : -1;
    // Defensive: if the resolved prev item isn't represented in
    // prevItems (e.g. break overlaps a starred path interval that
    // ended before this node) but we DO have prior items, anchor
    // the stub/curve on the first one rather than dropping the
    // stub entirely. Keeps the visuals consistent across the
    // break↔session boundary.
    if (prevChosenIdx < 0 && prevItems.length) {
        prevChosenIdx = 0;
    }

    // Column count = the wider row. Used as the SVG/container width
    // so the marker reserves enough horizontal space for the longer
    // row. Each row is then horizontally centered within that width
    // by the marker's flexbox `align-items: center`, and the SVG
    // line endpoints are computed against the same centered layout
    // so the curve always lands on the actual dots in each row.
    const cols = Math.max(1, items.length, prevItems.length);
    // Geometry shared with CSS dot/gap sizes (6px dot, 3px gap).
    const DOT = 6, GAP = 3;
    const rowWidth = cols * DOT + (cols - 1) * GAP;
    // x-center of the i-th dot in a row that has `n` total dots,
    // centered within `rowWidth`. With n=cols this collapses to the
    // original left-anchored layout (3, 12, 21, …).
    const colCenterIn = (i, n) => {
        const naturalW = n * DOT + (n - 1) * GAP;
        const leftPad = (rowWidth - naturalW) / 2;
        return leftPad + DOT / 2 + i * (DOT + GAP);
    };

    // Time label is now surfaced by the verb body ("At 1:30, Stay in
    // Salon B"), so the marker is purely visual: prior dots → curve
    // → options row.
    let html = '';

    // Geometry for the connector curve and top/bottom stubs.
    // Stubs visually attach the marker to the white card above/below
    // by extending the chosen-dot x positions vertically into the
    // gap on either side of the marker. The stubs are absolutely
    // positioned in CSS just outside the marker's top/bottom edges,
    // so they do not affect marker layout. STUB_H is intentionally
    // generous to cover the row-wrap padding + card-list gap +
    // any extra inset created when the right-hand verb body wraps
    // and the marker (vertically centered) ends up shorter than
    // the row-wrap on mobile.
    const SVG_H = 14;
    const STUB_H = 10;
    // The top dot/stub and gradient origin use the visible prior-track
    // continuity when it exists, while the lower dot is the selected
    // destination.
    const prevCol = prevChosenIdx >= 0 ? prevChosenIdx : 0;
    const prevX = colCenterIn(prevCol, Math.max(1, prevItems.length));
    const chosenCol = chosenIdx >= 0 ? chosenIdx : 0;
    const chosenX = colCenterIn(chosenCol, Math.max(1, items.length));
    const chosenColor = chosenIdx >= 0
        ? getSessionAccentColor(items[chosenIdx].session, items[chosenIdx].session.Track)
        : 'currentColor';
    const prevColor = (prevItems[prevChosenIdx] && prevItems[prevChosenIdx].session)
        ? getSessionAccentColor(prevItems[prevChosenIdx].session,
            prevItems[prevChosenIdx].session.Track)
        : null;

    // Top stub: vertical line at prev-chosen x, drawn ABOVE row 1 to
    // attach into the card sitting above this marker. Render whenever
    // there is a prior item to anchor on (any prevItems entry counts),
    // so break→session transitions still get a stub matching row 1.
    if (prevItems.length && prevColor) {
        html +=
            `<svg class="nn-node-stub nn-node-stub-top" width="${rowWidth}" height="${STUB_H}" ` +
            `viewBox="0 0 ${rowWidth} ${STUB_H}" aria-hidden="true">` +
                `<line x1="${prevX}" y1="0" x2="${prevX}" y2="${STUB_H}" ` +
                `stroke="${prevColor}" stroke-width="1.5" stroke-linecap="round"/>` +
            `</svg>`;
    }

    // Row 1: every starred session active in the prior interval. The
    // chosen-prev (the one the user was attending) is a filled dot;
    // the others (starred but not attending in the prior interval)
    // are open rings. No padding cells — flexbox centers the row.
    const row1Cells = prevItems.map(it => {
        const c = getSessionAccentColor(it.session, it.session.Track);
        const isChosenPrev = prevChosenUid && it.session
            && it.session.uid === prevChosenUid;
        if (isChosenPrev) {
            return `<span class="nn-node-dot" style="background:${c}" aria-hidden="true"></span>`;
        }
        return `<span class="nn-node-dot is-hollow" style="border-color:${c || 'currentColor'}" aria-hidden="true"></span>`;
    });
    html += `<span class="nn-node-dots">${row1Cells.join('')}</span>`;

    // Connector SVG: cubic curve from (prevX, top) to (chosenX, bottom).
    // Mimics a git-graph branch/merge: the line literally connects
    // the prior chosen dot to the chosen dot in row 2, so the user
    // sees the path. Stroke is a linear gradient from the prior
    // session's accent (top) to the chosen session's accent (bottom)
    // so the line visually expresses the handoff.
    // Fall back to the next color if there's no prior color, so the
    // line still renders sensibly at start-of-day / first node.
    const startColor = prevColor || chosenColor;
    const endColor = chosenColor;
    const cy = SVG_H / 2;
    const dPath = chosenIdx < 0
        ? ''
        : `M ${prevX} 0 C ${prevX} ${cy}, ${chosenX} ${cy}, ${chosenX} ${SVG_H}`;
    // Unique gradient id per render so multiple SVGs on the page
    // don't collide. `crypto.randomUUID` is fine in modern browsers
    // but we keep a counter fallback for safety.
    const gradId = `nn-grad-${(buildNodeMarkerInnerHtml._gid = (buildNodeMarkerInnerHtml._gid || 0) + 1)}`;
    // Pre-sample the gradient in OKLCH so the hue path goes around
    // the wheel (e.g. red→yellow→green) instead of cutting through
    // the achromatic axis (red→brown→green). SVG itself still
    // interpolates these stops in sRGB, but with enough stops the
    // visible result tracks the OKLCH path closely.
    const gradStops = sampleOklchStops(startColor, endColor, 5)
        .map(s => `<stop offset="${(s.offset * 100).toFixed(1)}%" stop-color="${s.color}"/>`)
        .join('');
    html +=
        `<svg class="nn-node-graph" width="${rowWidth}" height="${SVG_H}" ` +
        `viewBox="0 0 ${rowWidth} ${SVG_H}" aria-hidden="true">` +
        (dPath
            ? `<defs><linearGradient id="${gradId}" gradientUnits="userSpaceOnUse" ` +
                `x1="${prevX}" y1="0" x2="${chosenX}" y2="${SVG_H}">` +
                gradStops +
              `</linearGradient></defs>` +
              `<path d="${dPath}" stroke="url(#${gradId})" stroke-width="1.5" ` +
              `fill="none" stroke-linecap="round"/>`
            : '') +
        '</svg>';

    // Row 2: all options at this node. No padding — flexbox centers
    // the row within the marker's reserved width, and the SVG line's
    // chosenX was computed against this same centered layout so the
    // curve lands precisely on the chosen dot.
    const row2Cells = items.map((it, idx) => {
        const c = getSessionAccentColor(it.session, it.session.Track);
        const isChosen = idx === chosenIdx;
        const cls = isChosen ? 'nn-node-dot' : 'nn-node-dot is-hollow';
        const style = isChosen
            ? `background:${c}`
            : `border-color:${c || 'currentColor'}`;
        return `<span class="${cls}" style="${style}" aria-hidden="true"></span>`;
    });
    html += `<span class="nn-node-dots">${row2Cells.join('')}</span>`;

    // Bottom stub: vertical line at chosen x, drawn BELOW row 2 to
    // attach into the card sitting below this marker.
    if (chosenIdx >= 0) {
        html +=
            `<svg class="nn-node-stub nn-node-stub-bottom" width="${rowWidth}" height="${STUB_H}" ` +
            `viewBox="0 0 ${rowWidth} ${STUB_H}" aria-hidden="true">` +
                `<line x1="${chosenX}" y1="0" x2="${chosenX}" y2="${STUB_H}" ` +
                `stroke="${chosenColor}" stroke-width="1.5" stroke-linecap="round"/>` +
            `</svg>`;
    }

    return html;
}

function buildNowNextRow(item, { featured, joinFrom, skipped, hideTime }) {
    const { session, win } = item;
    const now = new Date();
    const trackLabel = isKeynoteSession(session)
        ? 'Keynote'
        : (session.Track || (isSessionStyleEvent(session) ? 'General' : ''));
    const color = getSessionAccentColor(session, trackLabel);
    // Mid-session: caller is committed to a prior session (joinFrom) that
    // ends after this row starts, so the user can only join this one
    // partway through. Skip if joinFrom IS this row.
    const isMidSession = !!(joinFrom && joinFrom !== item
        && joinFrom.win && joinFrom.win.end
        && joinFrom.win.end > win.start);
    const joinAtTime = isMidSession ? joinFrom.win.end : null;
    // "Live" only when the user is actually in this session right
    // now. If they're committed to a prior joinFrom session that
    // hasn't ended yet, this row is a *future* mid-session join —
    // don't show progress bar / "Not here? switch" affordances.
    const joinNotYet = !!(joinAtTime && now < joinAtTime);
    const isLive = now >= win.start && now < win.end && !joinNotYet;
    const isMeal = isMealStyleEvent(session);
    const isBreak = !isMeal && isBreakStyleEvent(session);
    const isInterlude = isMeal || isBreak;

    const wrap = document.createElement('div');
    wrap.className = 'nn-row-wrap';
    if (skipped) wrap.classList.add('nn-row-skipped');
    // Standalone (non-skipped) break/meal: dashed-outline interlude
    // styling — matches the day-schedule lunch/break cards.
    if (isInterlude && !skipped) {
        wrap.classList.add('nn-row-interlude');
        if (isMeal) wrap.classList.add('nn-row-meal');
        else wrap.classList.add('nn-row-break');
    }
    wrap.style.setProperty('--nn-color', color);

    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'nn-row';
    if (featured) row.classList.add('nn-row-featured');
    if (isLive) row.classList.add('nn-row-is-live');
    row.setAttribute('aria-expanded', 'false');

    // Legacy stripe — kept for any callers still styling against it.
    const stripe = document.createElement('span');
    stripe.className = 'nn-row-stripe';
    row.appendChild(stripe);

    // Title + meta line. Track label sits above the title as a kicker.
    const main = document.createElement('span');
    main.className = 'nn-row-main';

    if (trackLabel && !isInterlude) {
        const chip = document.createElement('span');
        chip.className = 'nn-row-chip';
        chip.textContent = trackLabel;
        chip.style.setProperty('--chip-color', color);
        main.appendChild(chip);
    }

    const title = document.createElement('span');
    title.className = 'nn-row-title';
    title.textContent = session.Title || '';
    main.appendChild(title);

    // Authors / speakers line — only on featured rows, since the
    // collapsed branch list keeps things compact.
    if (featured && session.Authors) {
        const authorsText = String(session.Authors).trim();
        if (authorsText && authorsText.toLowerCase() !== 'nan') {
            const authors = document.createElement('span');
            authors.className = 'nn-row-authors';
            authors.textContent = authorsText;
            main.appendChild(authors);
        }
    }

    const meta = document.createElement('span');
    meta.className = 'nn-row-meta';

    let timeStr = '';
    if (!hideTime) {
        try {
            // For mid-session joins, the row's time should reflect when
            // the user can actually arrive (joinAtTime), not the session's
            // original start — that's already over and would mislead.
            const displayTime = isMidSession ? joinAtTime : win.start;
            timeStr = displayTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        } catch (_) { /* leave blank */ }
    }
    if (timeStr) {
        const timeEl = document.createElement('span');
        timeEl.className = 'nn-row-time';
        timeEl.textContent = timeStr;
        meta.appendChild(timeEl);
    }
    // Duration — show the session's scheduled length right after
    // the start time so attendees know how long the talk runs.
    // SessionLength in the data is already in a friendly form
    // ("30m", "60m", "1h 30m"), so display it as-is.
    const durationStr = session && session.SessionLength
        ? String(session.SessionLength).trim() : '';
    if (durationStr) {
        if (meta.childNodes.length > 0) {
            const sep = document.createElement('span');
            sep.className = 'nn-row-sep';
            sep.textContent = '·';
            sep.setAttribute('aria-hidden', 'true');
            meta.appendChild(sep);
        }
        const durEl = document.createElement('span');
        durEl.className = 'nn-row-duration';
        durEl.textContent = durationStr;
        meta.appendChild(durEl);
    }
    if (session.room) {
        if (meta.childNodes.length > 0) {
            const sep = document.createElement('span');
            sep.className = 'nn-row-sep';
            sep.textContent = '·';
            sep.setAttribute('aria-hidden', 'true');
            meta.appendChild(sep);
        }
        const roomEl = document.createElement('span');
        roomEl.className = 'nn-row-room';
        roomEl.textContent = session.room;
        meta.appendChild(roomEl);
    }
    if (isMidSession) {
        const sep = document.createElement('span');
        sep.className = 'nn-row-sep';
        sep.textContent = '·';
        sep.setAttribute('aria-hidden', 'true');
        meta.appendChild(sep);
        const mid = document.createElement('span');
        mid.className = 'nn-row-midsession';
        const startedStr = win.start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        // If the session hasn't actually started yet at the current
        // time, frame this as a planned future join — saying
        // "in progress" reads as right-now, which is misleading.
        // Once the session has actually started, switch to the
        // present-tense "in progress (started ...)" framing.
        const hasStarted = now >= win.start;
        const label = hasStarted
            ? `in progress (started ${startedStr})`
            : `starts ${startedStr} · join in progress`;
        mid.innerHTML =
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>' +
            `<span>${label}</span>`;
        mid.title = hasStarted
            ? `Started at ${startedStr}; you\u2019ll join in progress.`
            : `Starts at ${startedStr}; you\u2019ll join after it has begun.`;
        meta.appendChild(mid);
    }
    // "Leaves at HH:MM" — when the path has the user switching out
    // of THIS session before its scheduled end (e.g. a 90-min talk
    // they bail on for a different starred session at the half).
    if (featured && session.uid && currentRenderPath
        && Array.isArray(currentRenderPath.intervals)) {
        const startT = win.start.getTime();
        const endT = win.end.getTime();
        let leaveT = null;
        for (const iv of currentRenderPath.intervals) {
            const ivT = iv.start.getTime();
            if (ivT <= startT) continue;
            if (ivT >= endT) break;
            // Path moves to a different chosen uid before this
            // session ends — that's a planned early exit.
            if (iv.chosen && iv.chosen !== session.uid) {
                leaveT = ivT;
                break;
            }
        }
        if (leaveT !== null) {
            const sep = document.createElement('span');
            sep.className = 'nn-row-sep';
            sep.textContent = '·';
            sep.setAttribute('aria-hidden', 'true');
            meta.appendChild(sep);
            const leave = document.createElement('span');
            leave.className = 'nn-row-midsession';
            const leaveStr = new Date(leaveT).toLocaleTimeString(
                [], { hour: 'numeric', minute: '2-digit' });
            leave.innerHTML =
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
                '<path d="M9 5H5v14h4"/><path d="M14 8l4 4-4 4"/><path d="M18 12H10"/></svg>' +
                `<span>leaving at ${leaveStr}</span>`;
            leave.title = `You\u2019ll leave this session at ${leaveStr}.`;
            meta.appendChild(leave);
        }
    }
    main.appendChild(meta);
    row.appendChild(main);

    // Col 3: Live indicator (progress bar + remaining time) — only on live rows.
    // Appended into the meta line so it sits *below* the title, sharing the
    // same horizontal space as room/chip and right-aligned via auto margin.
    if (isLive) {
        const total = win.end - win.start;
        const elapsed = Math.max(0, Math.min(total, now - win.start));
        const pct = total > 0 ? (elapsed / total) * 100 : 0;
        const pctStr = pct.toFixed(2) + '%';
        const minsRemaining = Math.max(0, Math.round((win.end - now) / 60000));
        const remainingStr = minsRemaining < 1
            ? 'ending'
            : `${minsRemaining} min left`;
        wrap.classList.add('nn-row-live');
        wrap.style.setProperty('--nn-progress', pctStr);

        // Ensure a meta line exists to host the live indicator.
        let metaEl = main.querySelector('.nn-row-meta');
        if (!metaEl) {
            metaEl = document.createElement('span');
            metaEl.className = 'nn-row-meta';
            main.appendChild(metaEl);
        }

        const live = document.createElement('span');
        live.className = 'nn-row-live-col';
        const remaining = document.createElement('span');
        remaining.className = 'nn-row-remaining';
        remaining.textContent = remainingStr;
        live.appendChild(remaining);
        metaEl.appendChild(live);

        // Full-width progress bar below the meta line. Hidden via CSS
        // except inside the Now hero featured row, where it gets the
        // entire row width and can't clip.
        const bar = document.createElement('span');
        bar.className = 'nn-row-progressbar';
        const fill = document.createElement('span');
        fill.style.width = pctStr;
        bar.appendChild(fill);
        main.appendChild(bar);
    }

    // Stay-through-overlap markers: when the user resolved overlaps
    // that fired during this session by staying here, surface each
    // one as a node marker in the row's LEFT gutter — the same
    // icon-style element used for move nodes between cards. This way
    // every path node has the same visual handle in the same column.
    // Stay-through-overlap decisions during this session are now
    // rendered as inline node rows BETWEEN cards in the timeline,
    // not attached to the card itself. Cards stay full-width.

    row.addEventListener('click', () => {
        openSessionDetails(session, row);
    });

    // Star toggle: visible on hover/focus and always on touch via
    // long-press. Only for starrable session-style items (skip
    // breaks/meals). Sits in the row's top-right; clicking it
    // toggles without opening the detail sheet.
    if (isStarrableSession(session)) {
        const isStarred = isStarredItem(item);
        const starBtn = document.createElement('button');
        starBtn.type = 'button';
        starBtn.className = 'nn-row-star' + (isStarred ? ' is-starred' : '');
        starBtn.innerHTML = isStarred ? '★' : '☆';
        starBtn.title = isStarred ? 'Remove from schedule' : 'Add to schedule';
        starBtn.setAttribute('aria-label', starBtn.title);
        starBtn.addEventListener('click', (ev) => {
            ev.stopPropagation();
            toggleStar(session.uid, starBtn);
        });
        wrap.appendChild(starBtn);
    }

    wrap.appendChild(row);

    // "Not here? Switch session" affordance on the live featured
    // row: lets the user re-select which talk they're currently in.
    // We surface this only when the path's interval at `now` has a
    // real overlap decision (≥2 starred sessions active) — otherwise
    // there's nothing to switch between, since switching to a
    // non-starred session is what the star toggle is for.
    if (featured && isLive && isStarrableSession(session)
        && currentRenderPath && Array.isArray(currentRenderPath.intervals)) {
        const nowMs = now.getTime();
        const ivAtNow = currentRenderPath.intervals.find(iv =>
            iv.start.getTime() <= nowMs && nowMs < iv.end.getTime());
        const decisionAtNow = ivAtNow && ivAtNow.decision ? ivAtNow.decision : null;
        if (decisionAtNow && Array.isArray(decisionAtNow.items)
            && decisionAtNow.items.length >= 2) {
            const switchBtn = document.createElement('button');
            switchBtn.type = 'button';
            switchBtn.className = 'nn-row-switch';
            switchBtn.innerHTML =
                '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" ' +
                'stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
                'stroke-linejoin="round" aria-hidden="true">' +
                '<path d="M7 7h11M7 7l3-3M7 7l3 3"/>' +
                '<path d="M17 17H6m11 0l-3-3m3 3l-3 3"/></svg>' +
                '<span>Not here? Switch session</span>';
            switchBtn.title = 'Pick a different session you\u2019re currently attending';
            switchBtn.addEventListener('click', (ev) => {
                ev.stopPropagation();
                openConflictPicker(decisionAtNow.items, {
                    title: 'Which talk are you in?',
                    desc: 'Pick the session you\u2019re attending right now. The previous choice stays starred but moves to "other sessions" during this overlap.',
                    fromItem: item,
                    conflict: decisionAtNow
                });
            });
            wrap.appendChild(switchBtn);
        }
    }

    return wrap;
}

// Track/room alphabetical comparator. Used to keep "X other sessions"
// dots+expanded list and the node-marker dot rows in a consistent,
// predictable order across views. Items missing a track or room sort
// last alphabetically (empty strings → end via a sentinel).
function compareItemsByTrackRoom(a, b) {
    const sa = (a && a.session) || {};
    const sb = (b && b.session) || {};
    const ta = (isKeynoteSession(sa) ? 'Keynote' : (sa.Track || '')).trim();
    const tb = (isKeynoteSession(sb) ? 'Keynote' : (sb.Track || '')).trim();
    const tA = ta || '\uFFFF';
    const tB = tb || '\uFFFF';
    if (tA !== tB) return tA.localeCompare(tB);
    const ra = (sa.room || '').trim() || '\uFFFF';
    const rb = (sb.room || '').trim() || '\uFFFF';
    return ra.localeCompare(rb);
}

// Returns the active starred items from the path interval immediately
// before `t` (the interval whose end ≤ t, latest such). Includes the
// chosen one. Used to render the "from" row of a node marker so all
// starred sessions running just before the transition are visible.
// Only considers intervals on the SAME calendar day — see
// getPrevPathItem for why this matters across day boundaries.
function getPrevPathActiveItems(path, t) {
    if (!path || !path.intervals) return [];
    const tt = t instanceof Date ? t.getTime() : t;
    const tDate = t instanceof Date ? t : new Date(tt);
    const tKey = `${tDate.getFullYear()}-${tDate.getMonth()}-${tDate.getDate()}`;
    for (let i = path.intervals.length - 1; i >= 0; i--) {
        const iv = path.intervals[i];
        if (iv.end.getTime() > tt) continue;
        const ivDate = iv.start instanceof Date ? iv.start : new Date(iv.start);
        const ivKey = `${ivDate.getFullYear()}-${ivDate.getMonth()}-${ivDate.getDate()}`;
        if (ivKey !== tKey) return [];
        return Array.isArray(iv.active) ? iv.active.slice() : [];
    }
    return [];
}

function buildOtherSessionsBranch(others, timeRange = '') {
    // A single timeline node representing the parallel non-starred
    // concurrent sessions. Hollow "branch" dot (ring) on the rail signals
    // these are off your path. Tap to expand into the full list of rows.
    //
    // Sort once by track/room alphabetical so the dot preview and the
    // expanded detail list always present items in the same order.
    const sortedOthers = others.slice().sort(compareItemsByTrackRoom);
    const wrap = document.createElement('div');
    wrap.className = 'nn-row-wrap nn-branch-wrap';

    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'nn-row nn-branch-row';
    row.setAttribute('aria-expanded', 'false');

    const stripeCol = document.createElement('span');
    stripeCol.className = 'nn-branch-stripe-col';
    const ring = document.createElement('span');
    ring.className = 'nn-branch-ring';
    stripeCol.appendChild(ring);
    row.appendChild(stripeCol);

    const main = document.createElement('span');
    main.className = 'nn-row-main nn-branch-main';

    const label = document.createElement('span');
    label.className = 'nn-branch-label';
    const countLabel = `${others.length} other ${others.length === 1 ? 'session' : 'sessions'}`;
    label.textContent = timeRange ? `${timeRange} · ${countLabel}` : countLabel;
    main.appendChild(label);

    // Track dots preview — unique track colors at this time slot.
    // Three-state convention used everywhere:
    //   • starred & attending  → filled circle (n/a here: the
    //     attended session lives on the path, not in "others")
    //   • starred & not attending → open ring (a starred session
    //     demoted into "other" at this slot)
    //   • not starred → small filled dot
    const seen = new Set();
    const dotsRow = document.createElement('span');
    dotsRow.className = 'nn-branch-dots';
    sortedOthers.forEach(item => {
        const s = item.session;
        const trackLabel = isKeynoteSession(s)
            ? 'Keynote'
            : (s.Track || (isSessionStyleEvent(s) ? 'General' : ''));
        const color = getSessionAccentColor(s, trackLabel);
        const starred = isStarredItem(item);
        const key = trackLabel + '|' + color + '|' + (starred ? 's' : 'u');
        if (seen.has(key)) return;
        seen.add(key);
        const d = document.createElement('span');
        if (starred) {
            // Starred but not attending → open ring.
            d.className = 'nn-branch-dot nn-branch-dot-starred-off';
            d.style.background = 'transparent';
            d.style.borderColor = color;
            d.title = `${trackLabel} (starred, not attending)`;
        } else {
            // Not starred → small filled dot in track color.
            d.className = 'nn-branch-dot nn-branch-dot-unstarred';
            d.style.background = color;
            d.title = trackLabel;
        }
        dotsRow.appendChild(d);
    });
    main.appendChild(dotsRow);
    row.appendChild(main);

    const chev = document.createElement('span');
    chev.className = 'nn-branch-chev';
    chev.innerHTML = '<svg viewBox="0 0 12 8" width="12" height="8" aria-hidden="true"><path d="M1 1.5 L6 6.5 L11 1.5" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    chev.setAttribute('aria-hidden', 'true');
    row.appendChild(chev);

    const detail = document.createElement('div');
    detail.className = 'nn-branch-detail';
    sortedOthers.forEach(item => {
        detail.appendChild(buildNowNextRow(item, { featured: false }));
    });

    row.addEventListener('click', () => {
        const isOpen = wrap.classList.toggle('open');
        row.setAttribute('aria-expanded', String(isOpen));
    });

    wrap.appendChild(row);
    wrap.appendChild(detail);
    return wrap;
}

function partitionFeaturedItems(items, demotedUids) {
    const featured = [];
    const others = [];
    const dem = demotedUids instanceof Set
        ? demotedUids
        : (currentRenderDemotedUids instanceof Set ? currentRenderDemotedUids : null);
    items.forEach(item => {
        const session = item.session;
        const isStarrable = !!session.uid
            && (session.type === 'session' || session.type === 'training' || isSessionStyleEvent(session));
        const starred = isStarrable && isStarredItem(item);
        // Demoted starred sessions: still starred (and in My Schedule),
        // but render as "other" for this view because the user resolved
        // a conflict against them at this section's reference time.
        const demoted = starred && dem && dem.has(session.uid);
        if (!isStarrable || (starred && !demoted)) {
            featured.push(item);
        } else {
            others.push(item);
        }
    });
    return { featured, others };
}
// Render-scoped fallback for partitionFeaturedItems. Set per section
// (Happening Now, Next, Thereafter) using getDemotedUidsAt(refTime).
let currentRenderDemotedUids = null;

// Render-scoped path reference. Set during a render pass so row
// builders can fetch the decisions that were merged into a session
// (chosen-by-staying), and attach an inline Edit affordance.
let currentRenderPath = null;

// Render-scoped set of node keys already emitted in this pass.
// Prevents the same decision/forced-edge from rendering twice when
// it falls inside multiple overlapping render windows
// (Now\u2192Next, Next\u2192Thereafter, timeline slot loop).
let currentRenderEmittedNodeKeys = null;

// Render-scoped full schedule. Lets node-marker rendering find a
// non-starred session that's active immediately before a node (e.g.
// the user is in Lunch right before a 2:00pm overlap), so the
// marker's "where you came from" row can show that session's color
// even when it isn't on the path.
let currentRenderAllItems = null;
function nodeEventKey(ev) {
    if (!ev) return '';
    const t = ev.t instanceof Date ? ev.t.getTime() : ev.t;
    if (ev.kind === 'decision') {
        return `d|${t}|${(ev.decision && ev.decision.key) || ''}`;
    }
    if (ev.kind === 'forced') {
        const uid = ev.item && ev.item.session && ev.item.session.uid;
        return `f|${t}|${uid || ''}`;
    }
    return `${ev.kind || '?'}|${t}`;
}

// ─── Path model ───────────────────────────────────────────────────
// Single source of truth for "what is the user attending at time T?".
//
// Treat every distinct start/end timestamp across starred sessions as
// a NODE on a per-day timeline. Between two consecutive nodes is an
// INTERVAL. Each interval has an "active" set: every starred session
// whose [start, end) covers the interval. From there:
//   - 0 active        → free time during this interval.
//   - 1 active        → that session is on the path (forced).
//   - ≥2 active       → decision point: pick one to follow.
//
// A "path segment" is the merge of consecutive intervals that share
// the same chosen UID. The path is the user's actual journey through
// the day; everything else (demotion, Now/Next/Thereafter, mid-session
// labels) derives from it.
function isStarrableSession(s) {
    return !!s && !!s.uid
        && (s.type === 'session' || s.type === 'training' || isSessionStyleEvent(s));
}
function computeStarredPath(allItems) {
    const starred = (allItems || []).filter(i =>
        isStarrableSession(i.session) && isStarredItem(i)
    );
    const byDay = {};
    starred.forEach(it => {
        const d = it.session.day || '';
        if (!byDay[d]) byDay[d] = [];
        byDay[d].push(it);
    });

    const intervals = [];
    const decisions = [];

    Object.keys(byDay).forEach(day => {
        const items = byDay[day];
        const tsSet = new Set();
        items.forEach(it => {
            tsSet.add(it.win.start.getTime());
            tsSet.add(it.win.end.getTime());
        });
        const nodes = [...tsSet].sort((a, b) => a - b);

        for (let i = 0; i < nodes.length - 1; i++) {
            const t0 = nodes[i];
            const t1 = nodes[i + 1];
            // Active = items whose [start, end) covers the entire interval.
            const active = items.filter(it =>
                it.win.start.getTime() <= t0 && it.win.end.getTime() >= t1
            );
            let chosen = null;
            let decision = null;
            if (active.length === 1) {
                chosen = active[0].session.uid;
            } else if (active.length >= 2) {
                const uids = active.map(it => it.session.uid).sort();
                const key = `${t0}|${uids.join('|')}`;
                const resolved = conflictResolutions[key] || null;
                decision = {
                    key,
                    items: active,
                    uids,
                    start: new Date(t0),
                    end: new Date(t1),
                    chosen: resolved
                };
                chosen = resolved;
                decisions.push(decision);
            }
            intervals.push({
                start: new Date(t0),
                end: new Date(t1),
                day,
                active,
                chosen,
                decision
            });
        }
    });

    return { intervals, decisions };
}

// Backwards-compatible: returns the decisions array (same shape as
// before — { key, items, uids, start, end, chosen }) so all existing
// callers keep working.
function computeStarredConflicts(allItems) {
    return computeStarredPath(allItems).decisions;
}

// Drop resolution entries whose conflict no longer exists (e.g. a
// participant was unstarred). Returns true if anything changed.
function pruneStaleConflictResolutions(conflicts) {
    const live = new Set(conflicts.map(c => c.key));
    let changed = false;
    Object.keys(conflictResolutions).forEach(k => {
        if (!live.has(k)) {
            delete conflictResolutions[k];
            changed = true;
        }
    });
    if (changed) saveConflictResolutions();
    return changed;
}

// Returns Set of starred UIDs that are active at time `t` but NOT on
// the chosen path. Looks up the single interval containing `t` and
// reads its `chosen`. No fresh-start exemptions, no looking at older
// decisions — the path already encodes the right answer at every
// instant.
function getDemotedUidsAt(path, t) {
    const out = new Set();
    if (!path || !t) return out;
    const tt = t instanceof Date ? t.getTime() : t;
    const intervals = Array.isArray(path) ? null : path.intervals;
    if (!intervals) return out;
    const iv = intervals.find(x =>
        x.start.getTime() <= tt && tt < x.end.getTime()
    );
    if (!iv || !iv.chosen) return out;
    iv.active.forEach(it => {
        if (it.session.uid !== iv.chosen) out.add(it.session.uid);
    });
    return out;
}

// At slot boundary `slotT` (a node), the chosen path session may have
// started earlier and just continues through this node. Slots only
// know about items whose actual start == slotT, so a continuing
// chosen session would otherwise vanish from the slot — leaving only
// (now-demoted) competitors and producing a phantom "free time" gap.
// Returns the chosen continuation item (one or zero) so callers can
// prepend it to the slot's items.
//
// Path intervals are bounded by *starred* start/end timestamps, so a
// non-starred slot's start (e.g. 14:00 Quick V&V while user is in
// Strategy Workshop 13:15–14:15) won't match any interval's start.
// Look up the interval *containing* slotT and surface its chosen
// session if it began before this slot.
function getContinuingItemsAt(path, slotT) {
    if (!path || !path.intervals) return [];
    const t = slotT instanceof Date ? slotT.getTime() : slotT;
    const iv = path.intervals.find(x =>
        x.start.getTime() <= t && t < x.end.getTime()
    );
    if (!iv || !iv.chosen) return [];
    const chosen = iv.active.find(it => it.session.uid === iv.chosen);
    if (!chosen || chosen.win.start.getTime() >= t) return [];
    return [chosen];
}
function withContinuing(items, path, slotT) {
    const cont = getContinuingItemsAt(path, slotT);
    if (!cont.length) return items;
    const have = new Set(items.map(it => it.session && it.session.uid).filter(Boolean));
    const add = cont.filter(c => !have.has(c.session.uid));
    return add.length ? [...add, ...items] : items;
}

// Returns the chosen path item active immediately before the given
// timestamp (the interval whose end == t). Used to label decision
// nodes with a room-aware verb (Stay/Switch). Returns null if there
// is no prior chosen path session.
//
// IMPORTANT: only considers intervals on the SAME calendar day as
// `t`. Path intervals span multiple days, so without this guard
// the day-1 last starred session would be picked as the "prev"
// for the day-2 first starred session, producing nonsensical
// verbs like "Stay in Main Hall" for breakfast → day-2 keynote
// when both keynotes happen to be in the same room across days.
function getPrevPathItem(path, t) {
    if (!path || !path.intervals) return null;
    const tt = t instanceof Date ? t.getTime() : t;
    const tDay = (() => {
        const d = t instanceof Date ? t : new Date(tt);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })();
    const ivDayKey = (iv) => {
        const d = iv.start instanceof Date ? iv.start : new Date(iv.start);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    };
    // Walk intervals in reverse to find the latest one ending at or
    // before tt with a chosen uid AND on the same calendar day.
    for (let i = path.intervals.length - 1; i >= 0; i--) {
        const iv = path.intervals[i];
        if (iv.end.getTime() > tt) continue;
        if (!iv.chosen) continue;
        if (ivDayKey(iv) !== tDay) continue;
        const item = iv.active.find(x => x.session.uid === iv.chosen);
        if (item) return item;
    }
    return null;
}

// Return an ordered list of "node events" in the time range
// (lo, hi] (inclusive of hi by default). Each event is one of:
//   { kind: 'decision', t, decision, prevPathItem }
//   { kind: 'forced',   t, item,     prevPathItem }
// "decision" = path interval starting at `t` has 2+ active items
// (real choice). "forced" = interval starting at `t` has exactly 1
// active item AND the chosen uid changed from the previous interval
// (a new session begins on the path). Forced edges with no chosen
// change (e.g. continuing the same session) are skipped — there's
// nothing actionable to show. Pass `inclusiveLo: true` for [lo, hi].
function getPathNodesBetween(path, lo, hi, opts = {}) {
    const out = [];
    if (!path || !path.intervals) return out;
    const loT = lo instanceof Date ? lo.getTime() : lo;
    const hiT = hi instanceof Date ? hi.getTime() : hi;
    const inclusiveLo = !!opts.inclusiveLo;
    const seenDecisionKeys = new Set();
    for (let i = 0; i < path.intervals.length; i++) {
        const iv = path.intervals[i];
        const t = iv.start.getTime();
        if (inclusiveLo ? t < loT : t <= loT) continue;
        if (t > hiT) break;
        // Find the previous chosen path item ending at or before t.
        const prev = getPrevPathItem(path, iv.start);
        // Find the chosen item from the IMMEDIATELY prior interval
        // (if any). This is what matters for "did the chosen uid
        // change crossing this node" — we don't want to treat a much
        // earlier Room F talk as the predecessor when the immediately
        // prior interval is e.g. an unresolved overlap.
        // Only consider it when it's on the SAME day; otherwise the
        // last starred session of the previous day leaks through and
        // the verb logic falsely concludes "Stay in <Room>" if both
        // happen to share a room across days.
        const sameDay = (a, b) => {
            const da = a instanceof Date ? a : new Date(a);
            const db = b instanceof Date ? b : new Date(b);
            return da.getFullYear() === db.getFullYear()
                && da.getMonth() === db.getMonth()
                && da.getDate() === db.getDate();
        };
        const immPrev = (i > 0 && sameDay(path.intervals[i - 1].start, iv.start))
            ? path.intervals[i - 1]
            : null;
        const immPrevItem = (immPrev && immPrev.chosen)
            ? immPrev.active.find(x => x.session.uid === immPrev.chosen) || null
            : null;
        if (iv.decision) {
            if (seenDecisionKeys.has(iv.decision.key)) continue;
            seenDecisionKeys.add(iv.decision.key);
            // Every decision (stay or switch) renders as an inline
            // node row between cards. Stays get "Stay in <Room>"
            // with an Edit affordance so the user can change their
            // mind even when the chosen session is unchanged.
            out.push({
                kind: 'decision',
                t: iv.start,
                decision: iv.decision,
                prevPathItem: prev
            });
        } else if (iv.chosen && iv.active.length === 1) {
            // Forced edge: only annotate if the chosen uid changed
            // from the IMMEDIATELY prior interval. Continuing the
            // same session through a node has nothing to say.
            const immPrevUid = immPrevItem ? immPrevItem.session.uid : null;
            if (immPrevUid !== iv.chosen) {
                const item = iv.active[0];
                out.push({
                    kind: 'forced',
                    t: iv.start,
                    item,
                    // Use the immediate predecessor for verb/room
                    // logic so we don't reach back across an
                    // unresolved overlap and pick a stale Room.
                    prevPathItem: immPrevItem
                });
            }
        }
    }
    return out;
}

// Decisions that were "merged" into a starred session row because
// the user chose to stay in (continue attending) this session
// through an overlap that fired during its window. Returned in
// chronological order. Each entry is the original decision object.
//
// A decision is considered a "stay through overlap" only when the
// chosen uid in the IMMEDIATELY PRIOR interval is also this item's
// uid — i.e. the user was already in this session and continued.
// Switching INTO a session that started earlier (mid-session join)
// is NOT a stay; that case keeps its standalone node row.
function getMergedDecisionsForItem(path, item) {
    const out = [];
    if (!path || !path.decisions || !path.intervals || !item || !item.win) return out;
    const uid = item.session && item.session.uid;
    if (!uid) return out;
    const startT = item.win.start.getTime();
    const endT = item.win.end.getTime();
    path.decisions.forEach(d => {
        if (d.chosen !== uid) return;
        const t = d.start.getTime();
        if (t <= startT || t >= endT) return;
        // Confirm the user was already in this session in the
        // immediately prior interval. Find the interval starting at
        // t (the decision interval) and read its predecessor.
        const idx = path.intervals.findIndex(iv => iv.start.getTime() === t);
        if (idx <= 0) return;
        const prev = path.intervals[idx - 1];
        if (!prev || prev.chosen !== uid) return;
        out.push(d);
    });
    out.sort((a, b) => a.start - b.start);
    return out;
}
// Find the most relevant decision among a candidate set of items
// (e.g. [fromItem, ...nextStarred]). With per-start-time decisions,
// prefer one whose decision timestamp matches the candidates' latest
// start (i.e. the moment the user is actually deciding). Falls back
// to the smallest superset, then to any decision sharing >=2 UIDs.
function findRelevantConflict(items, conflicts) {
    if (!items || !items.length || !conflicts || !conflicts.length) return null;
    const wantedItems = items.filter(it => it.session && isStarrableSession(it.session));
    if (wantedItems.length < 2) return null;
    const wantedUids = wantedItems.map(it => it.session.uid);
    const wantedSet = new Set(wantedUids);

    // Latest start among the candidates = the decision moment.
    const decisionT = Math.max(...wantedItems.map(it => it.win.start.getTime()));

    // 1) Exact decision-time match where uids ⊇ wanted.
    const exact = conflicts.filter(c => {
        if (c.start.getTime() !== decisionT) return false;
        const cset = new Set(c.uids);
        for (const u of wantedSet) if (!cset.has(u)) return false;
        return true;
    });
    if (exact.length) {
        return exact.sort((a, b) => a.uids.length - b.uids.length)[0];
    }

    // 2) Smallest superset of wanted UIDs (any decision time).
    const supersets = conflicts.filter(c => {
        const cset = new Set(c.uids);
        for (const u of wantedSet) if (!cset.has(u)) return false;
        return true;
    });
    if (supersets.length) {
        return supersets.sort((a, b) => a.uids.length - b.uids.length)[0];
    }
    // 3) Any decision sharing ≥2 candidate UIDs.
    let best = null, bestN = 0;
    conflicts.forEach(c => {
        const cset = new Set(c.uids);
        let n = 0;
        wantedSet.forEach(u => { if (cset.has(u)) n++; });
        if (n >= 2 && n > bestN) { best = c; bestN = n; }
    });
    return best;
}

function buildNowNextList(items, opts = {}) {
    // Featured (starred + non-starrable rows like breaks/meals/plenaries)
    // render on the timeline rail. Non-starred concurrent sessions are
    // collapsed into a single "branch" row on the rail with a hollow dot
    // — they exist at the same time but are off the user's path.
    sortNowNextItems(items);

    const { featured, others } = partitionFeaturedItems(items);

    const list = document.createElement('div');
    list.className = 'nn-card-list';

    // No starred / featured items, only "other" sessions. Render a
    // session-card-shaped row for the free time: title is "Free time",
    // meta line carries duration · window.
    // Caller may opt into:
    //   - opts.suppressFreeChip:  hide the chip entirely (used when an
    //     earlier section is already showing a combined free chip that
    //     covers this slot too).
    //   - opts.freeChipEndOverride: extend the chip's window end so it
    //     spans the whole run of consecutive free-only slots.
    //   - opts.freeChipStartOverride: pin the start to "now" so the
    //     window reads from the user's actual moment (not the slot's
    //     own start, which may be in the past).
    if (!featured.length && others.length && !opts.suppressFreeChip) {
        let slotStart = null, slotEnd = null;
        others.forEach(it => {
            if (!slotStart || it.win.start < slotStart) slotStart = it.win.start;
            if (!slotEnd || it.win.end > slotEnd) slotEnd = it.win.end;
        });
        if (opts.freeChipStartOverride) slotStart = opts.freeChipStartOverride;
        if (opts.freeChipEndOverride) slotEnd = opts.freeChipEndOverride;
        // Clamp end to the user's next starred/attended start: if a
        // starred session begins during this window (at a different
        // start time, so it lives in another section), the user is
        // not actually free up to slotEnd — only up to that boundary.
        if (opts.freeChipMaxEnd && slotEnd && opts.freeChipMaxEnd < slotEnd) {
            slotEnd = opts.freeChipMaxEnd;
        }
        // If the clamp made the window non-positive, skip the chip.
        if (slotStart && slotEnd && slotEnd <= slotStart) {
            // fall through without rendering
        } else {
        const totalMin = slotStart && slotEnd ? Math.max(0, Math.round((slotEnd - slotStart) / 60000)) : 0;
        const h = Math.floor(totalMin / 60);
        const m = totalMin % 60;
        const amount = totalMin <= 0 ? '' : (h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`);
        let windowStr = '';
        try {
            if (slotStart && slotEnd) {
                const fmt = d => d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                windowStr = `${fmt(slotStart)} – ${fmt(slotEnd)}`;
            }
        } catch (_) { /* ignore */ }

        const free = document.createElement('div');
        free.className = 'nn-row-wrap nn-free-wrap';

        const row = document.createElement('div');
        row.className = 'nn-row nn-free-row';

        const main = document.createElement('span');
        main.className = 'nn-row-main';

        // Title is the headline: "Free time" — that's the user's actual
        // status. The cup glyph hugs the title rather than living in a
        // kicker, so the title stays the dominant element.
        const title = document.createElement('span');
        title.className = 'nn-row-title nn-free-title';
        title.innerHTML =
            '<svg class="nn-free-cup" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<path d="M4 9h13v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V9z"/>' +
            '<path d="M17 11h2a2 2 0 0 1 0 4h-2"/>' +
            '<path d="M8 3c0 1.5 1 1.5 1 3M12 3c0 1.5 1 1.5 1 3"/>' +
            '</svg>' +
            '<span>Free time</span>';
        main.appendChild(title);

        // Meta: duration · window. Same shape as a session row (time +
        // separators), so it inherits the row's rhythm.
        const metaParts = [];
        if (amount) metaParts.push(amount);
        if (windowStr) metaParts.push(windowStr);
        if (metaParts.length) {
            const meta = document.createElement('span');
            meta.className = 'nn-row-meta';
            metaParts.forEach((part, idx) => {
                if (idx > 0) {
                    const sep = document.createElement('span');
                    sep.className = 'nn-row-sep';
                    sep.textContent = '·';
                    sep.setAttribute('aria-hidden', 'true');
                    meta.appendChild(sep);
                }
                const span = document.createElement('span');
                if (idx === 0) span.className = 'nn-row-time';
                span.textContent = part;
                meta.appendChild(span);
            });
            main.appendChild(meta);
        }

        row.appendChild(main);
        free.appendChild(row);
        list.appendChild(free);
        }
    }

    featured.forEach(item => {
        const isBreakItem = item.session
            && (isBreakStyleEvent(item.session) || isMealStyleEvent(item.session));
        const skipped = !!(opts.skipBreaks && isBreakItem);
        list.appendChild(buildNowNextRow(item, {
            featured: true,
            joinFrom: opts.joinFrom || null,
            skipped,
            hideTime: !!opts.hideRowTime
        }));
    });

    if (others.length) {
        const groups = Array.isArray(opts.otherSessionGroups)
            ? opts.otherSessionGroups
            : null;
        if (groups && groups.length) {
            groups.forEach(group => {
                list.appendChild(buildOtherSessionsBranch(group.items, group.timeRange));
            });
        } else {
            list.appendChild(buildOtherSessionsBranch(others));
        }
    }

    return list;
}

function appendNowNextSection(container, sectionClass, header, body, color) {
    const section = document.createElement('section');
    section.className = `nn-section ${sectionClass}`;
    if (color) section.style.setProperty('--nn-section-color', color);
    section.appendChild(header);
    section.appendChild(body);
    container.appendChild(section);
    return section;
}

function pickSectionColor(items) {
    // Prefer the first featured (starred or non-starrable) session's
    // color; fall back to the first item.
    if (!items.length) return '';
    const featured = items.find(item => {
        const s = item.session;
        const isStarrable = !!s.uid
            && (s.type === 'session' || s.type === 'training' || isSessionStyleEvent(s));
        return !isStarrable || isStarredItem(item);
    }) || items[0];
    const s = featured.session;
    const trackLabel = isKeynoteSession(s)
        ? 'Keynote'
        : (s.Track || (isSessionStyleEvent(s) ? 'General' : ''));
    return getSessionAccentColor(s, trackLabel);
}

function findNextStartGroup(allItems, afterDate) {
    // Find earliest start time strictly after `afterDate`, return all items
    // sharing that exact start.
    let earliest = Infinity;
    const out = [];
    allItems.forEach(it => {
        const t = it.win.start.getTime();
        if (t <= afterDate.getTime()) return;
        if (t < earliest) {
            earliest = t;
            out.length = 0;
            out.push(it);
        } else if (t === earliest) {
            out.push(it);
        }
    });
    return { items: out, startDate: out.length ? out[0].win.start : null };
}

function isAllBreakOrMeal(items) {
    if (!items.length) return false;
    return items.every(i => isBreakStyleEvent(i.session) || isMealStyleEvent(i.session));
}

function buildRoomTransitionHint(fromItem, toItems) {
    // Returns a small "Stay in this room" / "Then: <Room>" / "N starred
    // sessions" hint element, or null if no meaningful hint applies.
    // - fromItem: the starred session you're "in" (or null).
    // - toItems:  the next group's items (any list).
    if (!fromItem || !toItems || !toItems.length) return null;
    const fromRoom = (fromItem.session.room || '').trim();
    const nextStarred = partitionFeaturedItems(toItems).featured;
    if (!nextStarred.length) return null;
    const fromEnd = fromItem.win && fromItem.win.end;
    const toStart = toItems[0].win && toItems[0].win.start;
    const overlaps = fromEnd && toStart && toStart < fromEnd;
    const distinctRooms = [...new Set(
        nextStarred.map(it => (it.session.room || '').trim()).filter(Boolean)
    )];
    const hint = document.createElement('div');

    // Decision variant: next group overlaps current OR multiple
    // distinct rooms. Track-color dots + a "decision at HH:MM" line —
    // surfaces the choice without a misleading directional arrow.
    // Clickable: opens the conflict picker so the user can resolve it.
    if (overlaps || distinctRooms.length > 1) {
        const allOptions = overlaps ? [fromItem, ...nextStarred] : nextStarred;
        // Look up the conflict (if any) that involves this immediate
        // decision. The user resolves whole conflicts; the hint just
        // surfaces the pending or recorded resolution.
        const conflicts = computeStarredConflicts(collectAllWindowed());
        const conflict = findRelevantConflict(allOptions, conflicts);
        const decidedUid = conflict ? conflict.chosen : null;
        const decided = decidedUid
            ? allOptions.find(it => it.session.uid === decidedUid)
              || (conflict && conflict.items.find(it => it.session.uid === decidedUid))
            : null;

        const btn = document.createElement('button');
        btn.type = 'button';
        const openPicker = () => {
            openConflictPicker(
                conflict ? conflict.items : allOptions,
                {
                    title: overlaps ? 'Resolve overlap' : 'Pick one for this slot',
                    desc: overlaps
                        ? 'These starred sessions overlap. Pick the one to attend — the others stay starred but move to “other sessions” during the overlap.'
                        : 'These starred sessions all start at the same time. Pick the one to attend — the others stay starred but move to “other sessions” during the overlap.',
                    fromItem: overlaps ? fromItem : null,
                    conflict: conflict || null
                }
            );
        };
        btn.addEventListener('click', openPicker);

        if (decided) {
            // Confirmed decision — render in the same format as the
            // non-overlap stay/move hint: icon + colored dot + room
            // text. Titles tend to be long so we deliberately keep
            // this room-level. Edit affordance reopens the picker.
            const isStay = decided === fromItem;
            const decidedRoom = (decided.session.room || '').trim();
            const sameRoom = isStay
                || (fromRoom && decidedRoom && fromRoom.toLowerCase() === decidedRoom.toLowerCase());
            btn.className = 'nn-hero-hint is-decided ' + (sameRoom ? 'is-stay' : 'is-move');
            const decidedColor = getSessionAccentColor(decided.session, decided.session.Track);
            const decidedIsBreak = isBreakStyleEvent(decided.session) || isMealStyleEvent(decided.session);
            const dotClass = decidedIsBreak ? 'nn-hint-dot-inline is-hollow' : 'nn-hint-dot-inline';
            const dotStyle = decidedIsBreak
                ? `border-color:${decidedColor || 'currentColor'}`
                : `background:${decidedColor}`;
            const inlineDot = decidedColor || decidedIsBreak
                ? `<span class="${dotClass}" style="${dotStyle}" aria-hidden="true"></span>`
                : '';
            // When moving, surface the switch time inline so the user
            // sees the cue right in the chip. The switch moment is the
            // chosen session's start (regardless of whether it overlaps
            // the current one).
            const switchTime = (!isStay && decided.win && decided.win.start)
                ? decided.win.start
                : null;
            const switchAtStr = switchTime
                ? ` at ${switchTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
                : '';
            const iconSvg = sameRoom
                ? '<svg class="nn-hint-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9 12l2 2 4-4"/></svg>'
                : '';
            let inner;
            if (isStay) {
                inner = iconSvg +
                    `<span class="nn-hint-text">${inlineDot}Staying in this session</span>`;
            } else if (sameRoom) {
                inner = iconSvg +
                    `<span class="nn-hint-text">${inlineDot}Stay in this room for the next session</span>`;
            } else if (decidedRoom) {
                inner = `<span class="nn-hint-lead">Then${switchAtStr}:</span>` +
                    `<span class="nn-hint-text">${inlineDot}<strong>${escapeHtml(decidedRoom)}</strong></span>`;
            } else {
                inner = `<span class="nn-hint-text">${inlineDot}Switching${switchAtStr}</span>`;
            }
            btn.innerHTML =
                inner +
                '<span class="nn-hint-edit" aria-hidden="true">Edit</span>';
            btn.setAttribute('aria-label', 'Edit your decision for this overlap');
            return btn;
        }

        const dots = collectSectionTrackColors(nextStarred);
        const dotsRow = dots.map(d =>
            `<span class="nn-hint-dot" style="background:${d.color}" title="${escapeHtml(d.label)}" aria-label="${escapeHtml(d.label)}"></span>`
        ).join('');
        btn.className = 'nn-hero-hint is-overlap is-clickable';
        let text;
        if (overlaps && toStart) {
            const t = toStart.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
            text = `Decision at ${t}: stay in this session, or switch to ${nextStarred.length === 1 ? 'a starred session' : `one of ${nextStarred.length} starred sessions`}`;
        } else {
            text = `${nextStarred.length} starred next — pick one`;
        }
        btn.innerHTML =
            '<span class="nn-hint-dots">' + dotsRow + '</span>' +
            `<span class="nn-hint-text">${text}</span>` +
            '<span class="nn-hint-chev" aria-hidden="true">›</span>';
        btn.setAttribute('aria-label', 'Resolve overlap — pick one starred session to keep');
        return btn;
    }

    // Single-room transition: needs a known current room.
    if (!fromRoom || distinctRooms.length !== 1) return null;
    hint.className = 'nn-hero-hint';
    const toRoom = distinctRooms[0];
    const sameRoom = fromRoom.toLowerCase() === toRoom.toLowerCase();
    const toSession = nextStarred[0].session;
    const toColor = getSessionAccentColor(toSession, toSession.Track);
    const toIsBreak = isBreakStyleEvent(toSession) || isMealStyleEvent(toSession);
    const inlineDotClass = toIsBreak ? 'nn-hint-dot-inline is-hollow' : 'nn-hint-dot-inline';
    const inlineDotStyle = toIsBreak
        ? `border-color:${toColor || 'currentColor'}`
        : `background:${toColor}`;
    const inlineDot = (toColor || toIsBreak)
        ? `<span class="${inlineDotClass}" style="${inlineDotStyle}" aria-hidden="true"></span>`
        : '';
    if (sameRoom) {
        hint.classList.add('is-stay');
        hint.innerHTML =
            '<svg class="nn-hint-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<circle cx="12" cy="12" r="9"/><path d="M9 12l2 2 4-4"/></svg>' +
            `<span>${inlineDot}Stay in this room for the next session</span>`;
    } else {
        hint.classList.add('is-move');
        hint.innerHTML =
            '<span class="nn-hint-lead">Then:</span>' +
            `<span>${inlineDot}<strong>${escapeHtml(toRoom)}</strong></span>`;
    }
    return hint;
}

function openConflictPicker(items, opts = {}) {
    // Pick-one modal. `items` is a list of nn-items (each with .session
    // and .win). Clicking a row records a conflict resolution: the
    // chosen UID becomes the user's path through the (sorted-uids)
    // conflict key. Loser sessions stay starred — they're demoted to
    // the "other sessions" branch in section views during the overlap.
    if (!items || items.length < 2) return;
    const fromItem = opts.fromItem || null;
    // "Current" / Stay / Switch labels only make sense when the user
    // is genuinely live in a session right now. Use real-time live
    // status, not the caller-supplied anchor (which inline decision
    // rows pass as a generic "earliest item").
    const nowMs = Date.now();
    const isLiveItem = it => it.win.start.getTime() <= nowMs
        && nowMs < it.win.end.getTime();
    const liveItem = fromItem && isLiveItem(fromItem) ? fromItem : null;
    // Conflict key from passed-in conflict, or derived from items.
    // Without an explicit conflict, default the decision time to the
    // earliest item start so the key matches what computeStarredConflicts
    // produces.
    const starrableItems = items.filter(it => isStarrableSession(it.session));
    const starrableUids = starrableItems.map(it => it.session.uid).sort();
    const decisionTime = starrableItems.length
        ? Math.min(...starrableItems.map(it => it.win.start.getTime()))
        : null;
    const conflictKey = (opts.conflict && opts.conflict.key)
        || (starrableUids.length >= 2 && decisionTime !== null
            ? `${decisionTime}|${starrableUids.join('|')}`
            : null);
    const decidedUid = conflictKey ? (conflictResolutions[conflictKey] || null) : null;

    const overlay = document.createElement('div');
    overlay.className = 'pick-modal';

    const box = document.createElement('div');
    box.className = 'pick-modal-box';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-labelledby', 'pickModalTitle');

    const title = document.createElement('div');
    title.className = 'pick-modal-title';
    title.id = 'pickModalTitle';
    title.textContent = opts.title || 'Pick one to keep';
    box.appendChild(title);

    const desc = document.createElement('div');
    desc.className = 'pick-modal-desc';
    desc.textContent = opts.desc || 'Choose which session to follow through this overlap. The others stay starred but move to “other sessions” during it.';
    box.appendChild(desc);

    const list = document.createElement('div');
    list.className = 'pick-modal-list';

    items.forEach(item => {
        const s = item.session;
        const trackLabel = isKeynoteSession(s)
            ? 'Keynote'
            : (s.Track || (isSessionStyleEvent(s) ? 'General' : ''));
        const color = getSessionAccentColor(s, trackLabel);
        const starrable = isStarrableSession(s);
        const starred = starrable && isStarredItem(item);
        const isCurrent = liveItem && item === liveItem;
        const isDecided = !!decidedUid && s.uid === decidedUid;

        const row = document.createElement('button');
        row.type = 'button';
        row.className = 'pick-modal-item';
        if (starred) row.classList.add('is-starred');
        if (!starrable) row.classList.add('is-fixed');
        if (isDecided) row.classList.add('is-decided');

        const dot = document.createElement('span');
        dot.className = 'pick-modal-dot';
        if (color) dot.style.background = color;
        row.appendChild(dot);

        const main = document.createElement('span');
        main.className = 'pick-modal-main';
        const titleEl = document.createElement('span');
        titleEl.className = 'pick-modal-item-title';
        const titleText = s.Title || s.title || '(untitled)';
        titleEl.textContent = isCurrent ? `${titleText} (current)` : titleText;
        main.appendChild(titleEl);

        const meta = document.createElement('span');
        meta.className = 'pick-modal-item-meta';
        const start = item.win.start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        const end = item.win.end.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        const parts = [`${start} – ${end}`];
        if (s.room) parts.push(s.room);
        if (trackLabel) parts.push(trackLabel);
        meta.textContent = parts.join(' · ');
        main.appendChild(meta);

        // Consequence hint: if picking THIS option ends before
        // another option in the same overlap, the user will auto-
        // transition to that one mid-session. Surface that so users
        // can see "Long MBSE 1:30-3:00 → then auto-join AI Ethics
        // 3:00-3:30" without committing first to find out.
        if (starrable && items.length >= 2) {
            const myEnd = item.win.end.getTime();
            const handoff = items
                .filter(other => other !== item
                    && isStarrableSession(other.session)
                    && other.win.end.getTime() > myEnd
                    && other.win.start.getTime() < myEnd)
                .sort((a, b) => a.win.end - b.win.end)[0];
            if (handoff) {
                const handoffStart = new Date(myEnd)
                    .toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                const handoffEnd = handoff.win.end
                    .toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                const hOrigStart = handoff.win.start.getTime();
                const handoffMid = hOrigStart < myEnd;
                const handoffTitle = handoff.session.Title
                    || handoff.session.title || 'next session';
                const hint = document.createElement('span');
                hint.className = 'pick-modal-item-hint';
                hint.textContent = handoffMid
                    ? `Then auto-join ${handoffTitle} at ${handoffStart} (in progress until ${handoffEnd})`
                    : `Then continue to ${handoffTitle} at ${handoffStart}–${handoffEnd}`;
                main.appendChild(hint);
            }
        }
        row.appendChild(main);

        const action = document.createElement('span');
        action.className = 'pick-modal-keep';
        // Action label conveys STATE only (the live row already
        // carries a "(current)" suffix on its title). "Stay" was
        // redundant with "Chosen" once a decision is recorded — both
        // mean "this is the session the user is following" — so we
        // drop Stay/Switch entirely. Rows are either Locked in,
        // Chosen, or Choose.
        if (!starrable) action.textContent = 'Locked in';
        else if (isDecided) action.textContent = 'Chosen';
        else action.textContent = 'Choose';
        row.appendChild(action);

        if (!starrable) {
            row.disabled = true;
        } else {
            row.addEventListener('click', () => {
                // Record the conflict resolution. Losers remain starred
                // — they'll appear in "other sessions" within the
                // conflict's time window via the demotion logic.
                if (s.uid && conflictKey) {
                    conflictResolutions[conflictKey] = s.uid;
                    if (!starredSessions.includes(s.uid)) {
                        starredSessions.push(s.uid);
                        localStorage.setItem('incose_2026_stars', JSON.stringify(starredSessions));
                    }
                    saveConflictResolutions();
                }
                close();
                renderSchedule();
            });
        }
        list.appendChild(row);
    });
    box.appendChild(list);

    const actions = document.createElement('div');
    actions.className = 'pick-modal-actions';

    if (conflictKey && decidedUid) {
        const clear = document.createElement('button');
        clear.type = 'button';
        clear.className = 'pick-modal-clear';
        clear.textContent = 'Clear decision';
        clear.addEventListener('click', () => {
            delete conflictResolutions[conflictKey];
            saveConflictResolutions();
            close();
            renderSchedule();
        });
        actions.appendChild(clear);
    }

    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.className = 'pick-modal-cancel';
    cancel.textContent = 'Cancel';
    cancel.addEventListener('click', close);
    actions.appendChild(cancel);
    box.appendChild(actions);

    overlay.appendChild(box);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) close();
    });

    function close() {
        overlay.classList.remove('show');
        document.removeEventListener('keydown', onKey);
        setTimeout(() => overlay.remove(), 160);
    }
    function onKey(e) {
        if (e.key === 'Escape') close();
    }
    document.addEventListener('keydown', onKey);

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('show'));
}

function findNextAttendedStart(allItems, after) {
    // Earliest start strictly after `after` of an item the user is
    // actually attending: starred sessions, or non-starrable items like
    // breaks/meals/keynotes/plenaries. Used to clamp free-time chips so
    // they don't bleed past a slot where the user becomes busy again.
    let earliest = Infinity;
    allItems.forEach(it => {
        const s = it.session;
        const t = it.win.start.getTime();
        if (t <= after.getTime()) return;
        const isStarrable = !!s.uid
            && (s.type === 'session' || s.type === 'training' || isSessionStyleEvent(s));
        const attended = !isStarrable || isStarredItem(it);
        if (!attended) return;
        if (t < earliest) earliest = t;
    });
    return earliest === Infinity ? null : new Date(earliest);
}

// ─── Bottom-of-Now&Next conflict list ─────────────────────────────
// Renders one row per starred-session conflict. Unresolved rows sit
// at the top (with an amber tint) and read as a "fix this" nag;
// resolved rows show "Following <Title>" with an Edit affordance.
// Tapping any row opens the picker against that conflict.
function buildConflictListEl(conflicts) {
    if (!conflicts || !conflicts.length) return null;

    const sorted = conflicts.slice().sort((a, b) => {
        const ar = a.chosen ? 1 : 0;
        const br = b.chosen ? 1 : 0;
        if (ar !== br) return ar - br;
        return a.start - b.start;
    });

    const wrap = document.createElement('div');
    wrap.className = 'nn-conflict-list';

    const unresolved = sorted.filter(c => !c.chosen).length;
    const heading = document.createElement('div');
    heading.className = 'nn-conflict-heading';
    if (unresolved) {
        heading.textContent = `${unresolved} overlap${unresolved === 1 ? '' : 's'} to resolve`;
    } else {
        heading.textContent = 'Resolved overlaps';
    }
    wrap.appendChild(heading);

    sorted.forEach(c => {
        const startStr = c.start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        const endStr = c.end.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'nn-conflict-row' + (c.chosen ? ' is-resolved' : ' is-unresolved');

        const dotsHtml = c.items.map(it => {
            const col = getSessionAccentColor(it.session, it.session.Track);
            const isBreak = isBreakStyleEvent(it.session) || isMealStyleEvent(it.session);
            const cls = isBreak ? 'nn-conflict-dot is-hollow' : 'nn-conflict-dot';
            const style = isBreak
                ? `border-color:${col || 'currentColor'}`
                : `background:${col}`;
            return `<span class="${cls}" style="${style}" aria-hidden="true"></span>`;
        }).join('');

        let label;
        if (c.chosen) {
            const keptItem = c.items.find(it => it.session.uid === c.chosen);
            const keptTrack = (keptItem && (keptItem.session.Track || '')) || '';
            const keptRoom = (keptItem && (keptItem.session.room || '')) || '';
            const keptLabel = keptTrack || keptRoom || 'chosen session';
            label =
                `<span class="nn-conflict-time">${startStr}–${endStr}</span>` +
                `<span class="nn-conflict-text">Following <strong>${escapeHtml(keptLabel)}</strong></span>` +
                '<span class="nn-conflict-edit">Edit</span>';
        } else {
            const tracks = c.items
                .map(it => (it.session.Track || '').trim())
                .filter(Boolean);
            const summary = tracks.length >= 2
                ? `<strong>${escapeHtml(tracks[0])}</strong> vs <strong>${escapeHtml(tracks[1])}</strong>${tracks.length > 2 ? ` +${tracks.length - 2}` : ''}`
                : `${c.items.length} starred sessions overlap`;
            label =
                `<span class="nn-conflict-time">${startStr}–${endStr}</span>` +
                `<span class="nn-conflict-text">${summary}</span>` +
                '<span class="nn-conflict-chev" aria-hidden="true">›</span>';
        }
        btn.innerHTML = `<span class="nn-conflict-dots">${dotsHtml}</span>${label}`;

        btn.addEventListener('click', () => {
            // Pick the earliest item as the picker's "current" anchor
            // — purely for "Stay" labelling in the modal.
            const anchor = c.items.slice().sort((a, b) => a.win.start - b.win.start)[0];
            openConflictPicker(c.items, {
                title: c.chosen ? 'Edit decision' : 'Resolve overlap',
                desc: 'Pick the session you’ll attend through this overlap. The others stay starred but move to “other sessions” during it.',
                fromItem: anchor,
                conflict: c
            });
        });
        wrap.appendChild(btn);
    });
    return wrap;
}

function renderNowNextView(container) {
    document.getElementById('trackFilters').innerHTML = '';
    container.classList.add('now-next-view');

    const now = new Date();
    const allItems = collectAllWindowed();

    // Compute the path once. All downstream "is X demoted at time T"
    // questions read the path's interval-at-T.
    const path = computeStarredPath(allItems);
    const conflicts = path.decisions;
    pruneStaleConflictResolutions(conflicts);
    // Demotion at "now" comes straight from the path.
    currentRenderDemotedUids = getDemotedUidsAt(path, now);
    // Make path visible to row builders (for merged-decision chips).
    currentRenderPath = path;
    // Fresh per-render dedupe set for path-node events.
    currentRenderEmittedNodeKeys = new Set();
    currentRenderAllItems = allItems;

    // ─── Happening Now: every session whose window contains `now`.
    const happeningNow = allItems.filter(i => now >= i.win.start && now < i.win.end);

    // ─── "Which talk are you in?" prompt ──────────────────────────
    // If the path's interval containing `now` is an unresolved
    // overlap (≥2 starred sessions, no conflictResolutions entry),
    // surface a prompt ABOVE the Happening Now hero. Without this,
    // every downstream slot keeps treating the user as in-multiple-
    // sessions-at-once and node rows multiply. Resolving this single
    // decision collapses the path everywhere.
    const ivAtNow = path.intervals.find(iv =>
        iv.start.getTime() <= now.getTime() && now.getTime() < iv.end.getTime());
    if (ivAtNow && ivAtNow.decision && !ivAtNow.decision.chosen) {
        const promptDecision = ivAtNow.decision;
        const prompt = document.createElement('button');
        prompt.type = 'button';
        prompt.className = 'nn-now-prompt';
        const titleEl = document.createElement('span');
        titleEl.className = 'nn-now-prompt-title';
        titleEl.textContent = 'Which talk are you in?';
        const descEl = document.createElement('span');
        descEl.className = 'nn-now-prompt-desc';
        descEl.textContent = `${promptDecision.items.length} starred sessions overlap right now — tell the schedule which one you're attending.`;
        const chev = document.createElement('span');
        chev.className = 'nn-now-prompt-chev';
        chev.setAttribute('aria-hidden', 'true');
        chev.textContent = '›';
        prompt.appendChild(titleEl);
        prompt.appendChild(descEl);
        prompt.appendChild(chev);
        prompt.addEventListener('click', () => {
            const anchor = promptDecision.items
                .slice()
                .sort((a, b) => a.win.start - b.win.start)[0];
            openConflictPicker(promptDecision.items, {
                title: 'Which talk are you in?',
                desc: 'Pick the session you’re attending right now. The others stay starred but move to “other sessions” during the overlap.',
                fromItem: anchor,
                conflict: promptDecision
            });
        });
        container.appendChild(prompt);
    }

    // ─── Look ahead so we can detect a *run* of consecutive free-only
    // slots and render a single combined free-time chip on the first
    // section, suppressing duplicates on subsequent sections.
    let nextGroup = findNextStartGroup(allItems, now);

    // If the user is currently committed to a starred session that
    // continues past this next-start, the "next start" is irrelevant
    // (e.g. an 11:00 break while you're already in a 10–11:30 panel).
    // Re-anchor Happening Next on the commitment's end time:
    //   1. If a starred session is already in progress at that moment
    //      (e.g. they resolved a conflict in favor of a shorter
    //      session and the longer one is still running), surface it
    //      as Happening Next so they see "join in progress".
    //   2. Otherwise advance past the commitment's end so a break
    //      that's already covered by the commitment is skipped.
    //
    //   Exception: if the original next group has a starred session
    //   that *starts fresh* during the commitment window AND isn't
    //   already a path-loser, that's a real diverge point (e.g.
    //   you're in a 1:45–2:45 talk and a different starred talk
    //   begins at 2:15 with no decision recorded yet). Keep that
    //   group and let the user decide. If the fresh start IS already
    //   demoted by a resolved decision, the user committed to stay,
    //   so re-anchor past it — the demoted session will still surface
    //   as a branch row in the timeline, and as a "join in progress"
    //   candidate at the real transition (commitEnd).
    {
        const happeningFeatured = partitionFeaturedItems(happeningNow).featured;
        const happeningUids = new Set(
            happeningFeatured.map(i => i.session.uid).filter(Boolean)
        );
        const commitEnd = happeningFeatured.length
            ? Math.max(...happeningFeatured.map(i => i.win.end.getTime()))
            : 0;
        const nextStartT = nextGroup.startDate ? nextGroup.startDate.getTime() : null;
        const demotedAtNext = nextStartT
            ? getDemotedUidsAt(path, nextGroup.startDate)
            : new Set();
        const originalHasFreshStarred = nextGroup.items.some(it =>
            isStarrableSession(it.session)
            && isStarredItem(it)
            && !happeningUids.has(it.session.uid)
            && !(it.session.uid && demotedAtNext.has(it.session.uid))
        );
        if (commitEnd && !originalHasFreshStarred) {
            // Starred sessions in progress AT commitEnd that aren't
            // already on the Happening Now rail. These are the "join
            // in progress" candidates (e.g. a longer overlapping
            // session whose tail extends past the user's pick).
            const inProgressAtCommitEnd = allItems.filter(it => {
                if (!isStarrableSession(it.session)) return false;
                if (!isStarredItem(it)) return false;
                if (happeningUids.has(it.session.uid)) return false;
                const s = it.win.start.getTime();
                const e = it.win.end.getTime();
                return s <= commitEnd && commitEnd < e;
            });
            if (inProgressAtCommitEnd.length) {
                nextGroup = {
                    items: inProgressAtCommitEnd,
                    startDate: new Date(commitEnd)
                };
            } else if (nextGroup.startDate
                && nextGroup.startDate.getTime() < commitEnd) {
                // No mid-session handoff, but the original next-start
                // is hidden inside the commitment window (e.g. a
                // break covered by an ongoing session). Skip past it.
                nextGroup = findNextStartGroup(allItems, new Date(commitEnd - 1));
            }
        }
    }
    const nowFreeOnly = happeningNow.length > 0
        && partitionFeaturedItems(happeningNow).featured.length === 0;
    const nextFreeOnly = nextGroup.items.length > 0
        && partitionFeaturedItems(nextGroup.items).featured.length === 0;

    // Compute the end of the free run starting from "now": if Next is
    // also free-only, extend through it (and recursively, the slot after
    // that, until we hit a featured/starred slot).
    let freeRunEnd = null;
    if (nowFreeOnly) {
        let cursor = new Date();
        let runEnd = new Date(Math.max(...happeningNow.map(i => i.win.end.getTime())));
        let nextRun = nextGroup;
        let nextRunFree = nextFreeOnly;
        while (nextRunFree && nextRun.items.length) {
            const ends = nextRun.items.map(i => i.win.end.getTime());
            runEnd = new Date(Math.max(runEnd.getTime(), Math.max(...ends)));
            cursor = nextRun.startDate ? new Date(nextRun.startDate.getTime()) : cursor;
            const peek = findNextStartGroup(allItems, cursor);
            if (!peek.items.length) break;
            const peekFree = partitionFeaturedItems(peek.items).featured.length === 0;
            if (!peekFree) break;
            nextRun = peek;
            nextRunFree = true;
        }
        freeRunEnd = runEnd;
    }

    let nowMeta = '';
    let nowBody;
    let heroPrimary = null;
    if (happeningNow.length) {
        nowBody = buildNowNextList(happeningNow, nowFreeOnly ? {
            freeChipStartOverride: now,
            freeChipEndOverride: freeRunEnd,
            freeChipMaxEnd: findNextAttendedStart(allItems, now)
        } : {});

        // ── Hero footer: track current featured row for downstream
        // logic (decision nodes etc.). The previous "Then: <Room>"
        // hint is gone — decision-node rows surface the action verb.
        const heroFeatured = partitionFeaturedItems(happeningNow).featured;
        heroPrimary = heroFeatured[0] || null;
    } else {
        // Nothing in the schedule contains "now" — render the gap as a
        // free-time row so it reads like the rest of the timeline. End
        // of the gap is the next scheduled start (if any).
        nowBody = document.createElement('div');
        nowBody.className = 'nn-card-list';

        const slotEnd = nextGroup.startDate || null;
        const totalMin = slotEnd ? Math.max(0, Math.round((slotEnd - now) / 60000)) : 0;
        const h = Math.floor(totalMin / 60);
        const m = totalMin % 60;
        const amount = totalMin <= 0 ? '' : (h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`);
        let windowStr = '';
        if (slotEnd) {
            try {
                const fmt = d => d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                windowStr = `${fmt(now)} – ${fmt(slotEnd)}`;
            } catch (_) { /* ignore */ }
        }

        const free = document.createElement('div');
        free.className = 'nn-row-wrap nn-free-wrap';
        const row = document.createElement('div');
        row.className = 'nn-row nn-free-row';
        const main = document.createElement('span');
        main.className = 'nn-row-main';
        const title = document.createElement('span');
        title.className = 'nn-row-title nn-free-title';
        title.innerHTML =
            '<svg class="nn-free-cup" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<path d="M4 9h13v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V9z"/>' +
            '<path d="M17 11h2a2 2 0 0 1 0 4h-2"/>' +
            '<path d="M8 3c0 1.5 1 1.5 1 3M12 3c0 1.5 1 1.5 1 3"/>' +
            '</svg>' +
            '<span>Free time</span>';
        main.appendChild(title);

        const metaParts = [];
        if (amount) metaParts.push(amount);
        if (windowStr) metaParts.push(windowStr);
        if (!metaParts.length) metaParts.push('No sessions in progress');
        const meta = document.createElement('span');
        meta.className = 'nn-row-meta';
        metaParts.forEach((part, idx) => {
            if (idx > 0) {
                const sep = document.createElement('span');
                sep.className = 'nn-row-sep';
                sep.textContent = '·';
                sep.setAttribute('aria-hidden', 'true');
                meta.appendChild(sep);
            }
            const span = document.createElement('span');
            if (idx === 0 && amount) span.className = 'nn-row-time';
            span.textContent = part;
            meta.appendChild(span);
        });
        main.appendChild(meta);
        row.appendChild(main);
        free.appendChild(row);
        nowBody.appendChild(free);
    }
    // Resolve the path's chosen uid AT now once, up front: it both
    // controls track-dot fill in the Happening Now header (only the
    // attended track is solid) and seeds stay-bridge detection in
    // the timeline below.
    let nowChosenUid = null;
    {
        const ivAtNowForChosen = path.intervals.find(iv =>
            iv.start.getTime() <= now.getTime() && now.getTime() < iv.end.getTime());
        if (ivAtNowForChosen && ivAtNowForChosen.chosen) {
            nowChosenUid = ivAtNowForChosen.chosen;
        }
    }
    const nowSection = appendNowNextSection(container, 'is-now',
        buildNowNextSectionHeader('Happening Now', nowMeta, happeningNow,
            { chosenUid: nowChosenUid }),
        nowBody);

    // ─── Path nodes between Now and the first upcoming slot ──
    // These are emitted by the slot loop below via `seedSlotT`,
    // which lets it interleave each between-node with its
    // continuation section in chronological order. Doing it here
    // would only render the nodes (no continuation panels), so we
    // delegate entirely to renderFullDaySchedule.

    // ─── Full schedule below Happening Now ────────────────────────
    // Single timeline of every future slot. Replaces the old separate
    // Happening Next + Thereafter sections so there's exactly one
    // chronological list of upcoming slots, with no overlap or
    // duplication between hero and timeline.
    renderFullDaySchedule(container, path, now, allItems, now, new Set(), {
        seedPrevSection: nowSection,
        seedChosenUid: nowChosenUid,
        seedDay: (happeningNow[0] && happeningNow[0].session.day) || null,
        seedSlotT: now.getTime()
    });

    const updated = document.createElement('div');
    updated.className = 'nn-updated';
    updated.textContent = `Updated ${now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
    container.appendChild(updated);
    currentRenderDemotedUids = null;
    currentRenderPath = null;
    currentRenderEmittedNodeKeys = null;
    currentRenderAllItems = null;
}

function buildInlineDecisionRow(decision, opts = {}) {
    // Move-node row: a node marker in the left gutter (matching the
    // day-schedule time column) and a verb body on the right.
    // Unresolved decisions render the body as an orange nag; resolved
    // ones show "Going to / Staying in <Room>" with an Edit chip.
    const prevPathItem = opts.prevPathItem || null;
    const markerPrevItem = opts.markerPrevItem || prevPathItem;
    const wrap = document.createElement('button');
    wrap.type = 'button';
    wrap.className = 'nn-node-row-wrap'
        + (decision.chosen ? ' is-resolved' : ' is-unresolved');

    const marker = document.createElement('span');
    marker.className = 'nn-node-marker';
    marker.innerHTML = buildNodeMarkerInnerHtml(
        decision.items, decision.chosen, decision.start, markerPrevItem);
    wrap.appendChild(marker);

    const body = document.createElement('span');
    body.className = 'nn-node-row-body';

    let bodyHtml;
    if (decision.chosen) {
        const kept = decision.items.find(it => it.session.uid === decision.chosen);
        const trackLabel = (kept && kept.session.Track) || '';
        const roomLabel = (kept && kept.session.room) || '';
        // True stay: the user was already attending the chosen
        // session in the immediately prior interval. Compare uids,
        // not "is the session already running" — those differ when
        // the user is mid-session-joining a session that started
        // earlier (that's a switch, not a stay).
        const prevUid = prevPathItem && prevPathItem.session
            ? prevPathItem.session.uid : null;
        const isStaying = prevUid && prevUid === decision.chosen;
        let verb;
        if (isStaying) {
            verb = 'Stay in';
        } else {
            // Use the path's immediately-prior chosen item as the
            // authoritative "from" — that's where the user actually
            // was. Only fall back to the schedule-wide predecessor
            // (e.g. Foyer breakfast) when the path has nothing prior.
            const prevForVerb = prevPathItem
                || getEffectivePrevItemAt(decision.start, { preferRoom: roomLabel });
            const toRoom = roomLabel.trim();
            const fromRoom = (prevForVerb && prevForVerb.session
                && prevForVerb.session.room || '').trim();
            if (!fromRoom) verb = 'Head to';
            else if (fromRoom === toRoom) verb = 'Stay in';
            else verb = 'Switch to';
        }
        const subject = roomLabel
            ? `<strong>${escapeHtml(roomLabel)}</strong>`
            : `<strong>${escapeHtml(trackLabel || 'chosen session')}</strong>`;
        // "join in progress" only applies when the user is newly
        // switching INTO a session that's already running. Staying
        // in the session you're already attending isn't a join.
        const midSession = !isStaying && !!(kept && kept.win
            && kept.win.start.getTime() < decision.start.getTime());
        // "leaving early" applies when the prior session the user
        // was attending continues past this transition — i.e. they
        // walk out before it ends.
        const prevPrior = isStaying ? null
            : (prevPathItem || getEffectivePrevItemAt(decision.start));
        const leavingEarly = !!(prevPrior && prevPrior.win
            && prevPrior.win.end.getTime() > decision.start.getTime()
            && prevPrior !== kept);
        const notes = [];
        if (leavingEarly) {
            const endStr = prevPrior.win.end.toLocaleTimeString(
                [], { hour: 'numeric', minute: '2-digit' });
            notes.push(`leaving early (ends ${escapeHtml(endStr)})`);
        }
        if (midSession) {
            const startStr = kept.win.start.toLocaleTimeString(
                [], { hour: 'numeric', minute: '2-digit' });
            notes.push(`join in progress (started ${escapeHtml(startStr)})`);
        }
        const joinNote = notes.length
            ? ` <span class="nn-conflict-sub">· ${notes.join(' · ')}</span>`
            : '';
        const timeLabel = decision.start.toLocaleTimeString(
            [], { hour: 'numeric', minute: '2-digit' });
        bodyHtml =
            `<span class="nn-node-row-text">At ${escapeHtml(timeLabel)}, ${verb} ${subject}${joinNote}</span>` +
            '<span class="nn-node-row-edit">Edit</span>';
    } else {
        const tracks = decision.items
            .map(it => (it.session.Track || '').trim())
            .filter(Boolean);
        const summary = tracks.length >= 2
            ? `<strong>${escapeHtml(tracks[0])}</strong> vs <strong>${escapeHtml(tracks[1])}</strong>${tracks.length > 2 ? ` +${tracks.length - 2}` : ''}`
            : `Choose 1 of ${decision.items.length}`;
        const timeLabel = decision.start.toLocaleTimeString(
            [], { hour: 'numeric', minute: '2-digit' });
        bodyHtml =
            `<span class="nn-node-row-text">At ${escapeHtml(timeLabel)}, decide: ${summary}</span>` +
            '<span class="nn-node-row-chev" aria-hidden="true">›</span>';
    }
    body.innerHTML = bodyHtml;
    wrap.appendChild(body);

    wrap.addEventListener('click', () => {
        const anchor = decision.items.slice().sort((a, b) => a.win.start - b.win.start)[0];
        openConflictPicker(decision.items, {
            title: decision.chosen ? 'Edit decision' : 'Resolve overlap',
            desc: 'Pick the session you’ll attend through this overlap. The others stay starred but move to “other sessions” during it.',
            fromItem: anchor,
            conflict: decision
        });
    });
    return wrap;
}

// Render a forced-edge node row: the path is forced (1 active starred
// session) but the chosen session changed from the previous interval,
// so the user still needs to know what to do (stay/switch/head to).
// Same icon-on-left layout as inline decisions, but non-clickable.
function buildForcedEdgeRow(item, prevPathItem, t) {
    // Forced edges are only interactive when there's actually
    // something to choose between — i.e. at least one other
    // starrable session is active at this boundary. When the
    // chosen item is the only option, the row is non-interactive
    // and we omit the Edit affordance (nothing to edit).
    const tt = t.getTime();
    const candidates = (currentRenderAllItems || []).filter(it =>
        it.win && isStarrableSession(it.session)
        && it.win.start.getTime() <= tt && tt < it.win.end.getTime()
    );
    if (!candidates.includes(item)) candidates.unshift(item);
    const hasAlternatives = candidates.length >= 2;
    const wrap = document.createElement(hasAlternatives ? 'button' : 'div');
    if (hasAlternatives) wrap.type = 'button';
    wrap.className = 'nn-node-row-wrap is-forced is-resolved'
        + (hasAlternatives ? '' : ' is-noninteractive');

    const marker = document.createElement('span');
    marker.className = 'nn-node-marker';
    // Forced edges have a single "option" (the chosen item itself).
    marker.innerHTML = buildNodeMarkerInnerHtml(
        [item], item.session.uid, t, prevPathItem);
    wrap.appendChild(marker);

    const roomLabel = item.session.room || '';
    // Derive "from" room from the user's actual prior position in
    // the path. The immediately-prior chosen interval (prevPathItem)
    // is authoritative — that's the session the path says they
    // were in. Only fall back to the schedule-wide predecessor
    // (e.g. Foyer breakfast) when the path has nothing prior. When
    // falling back, prefer a candidate matching the destination
    // room (room-continuity) over an arbitrary parallel session.
    const prevForVerb = prevPathItem
        || getEffectivePrevItemAt(t, { preferRoom: roomLabel });
    const fromRoom = (prevForVerb && prevForVerb.session
        && prevForVerb.session.room || '').trim();
    const toRoom = roomLabel.trim();
    let verb;
    if (!fromRoom) verb = 'Head to';
    else if (fromRoom === toRoom) verb = 'Stay in';
    else verb = 'Switch to';
    const isContinuing = !!(prevPathItem && prevPathItem.session
        && prevPathItem.session.uid === item.session.uid);
    const midSession = !isContinuing && item.win
        && item.win.start.getTime() < t.getTime();
    // Leaving early: the prior session continues past this
    // transition. Skip if the predecessor IS this same item
    // (continuing, not leaving) or has no end after t.
    const leavingEarly = !!(prevForVerb && prevForVerb !== item
        && prevForVerb.win && prevForVerb.win.end.getTime() > t.getTime());
    const notes = [];
    if (leavingEarly) {
        const endStr = prevForVerb.win.end.toLocaleTimeString(
            [], { hour: 'numeric', minute: '2-digit' });
        notes.push(`leaving early (ends ${escapeHtml(endStr)})`);
    }
    if (midSession) {
        const startStr = item.win.start.toLocaleTimeString(
            [], { hour: 'numeric', minute: '2-digit' });
        notes.push(`join in progress (started ${escapeHtml(startStr)})`);
    }
    const joinNote = notes.length
        ? ` <span class="nn-conflict-sub">· ${notes.join(' · ')}</span>`
        : '';
    const subject = roomLabel
        ? `<strong>${escapeHtml(roomLabel)}</strong>`
        : `<strong>chosen session</strong>`;
    const timeLabel = t.toLocaleTimeString(
        [], { hour: 'numeric', minute: '2-digit' });

    const body = document.createElement('span');
    body.className = 'nn-node-row-body';
    body.innerHTML = `<span class="nn-node-row-text">At ${escapeHtml(timeLabel)}, ${verb} ${subject}${joinNote}</span>`
        + (hasAlternatives ? '<span class="nn-node-row-edit">Edit</span>' : '');
    wrap.appendChild(body);

    // Click to open a picker showing every starrable session active
    // at this boundary (in-progress and just-starting). Lets the
    // user switch to another in-progress starred session, or pick a
    // parallel non-starred one. Picking a non-chosen option auto-
    // stars it and records the decision.
    if (hasAlternatives) {
        wrap.addEventListener('click', () => {
            const sorted = candidates.slice().sort((a, b) => a.win.start - b.win.start);
            openConflictPicker(sorted, {
                title: 'Edit session at ' + timeLabel,
                desc: 'Pick the session you\u2019ll be in at this point. Other starred sessions stay starred but move to "other sessions" during the overlap.',
                fromItem: item
            });
        });
    }
    return wrap;
}

// Render an ordered list of node events (decisions + forced edges)
// inside the given wrapper. Used between sections and between
// timeline slots.
function renderPathNodeRows(wrap, nodes, renderedPrevItem = null) {
    nodes.forEach(n => {
        // Pass-level dedupe: a node may fall inside more than one
        // render window (Now\u2192Next, Next\u2192Thereafter, the timeline
        // slot loop). Only emit it the first time it's seen.
        const key = nodeEventKey(n);
        if (currentRenderEmittedNodeKeys) {
            if (currentRenderEmittedNodeKeys.has(key)) return;
            currentRenderEmittedNodeKeys.add(key);
        }
        if (n.kind === 'decision') {
            wrap.appendChild(buildInlineDecisionRow(n.decision, {
                prevPathItem: n.prevPathItem,
                markerPrevItem: renderedPrevItem || n.prevPathItem
            }));
        } else if (n.kind === 'forced') {
            wrap.appendChild(buildForcedEdgeRow(
                n.item, renderedPrevItem || n.prevPathItem || null, n.t));
        }
    });
}

function renderFullDaySchedule(container, path, now, allItems, startAfter, skipSlotTimes, opts) {
    const decisions = path.decisions;
    const skip = skipSlotTimes instanceof Set ? skipSlotTimes : new Set();
    const seedPrevSection = (opts && opts.seedPrevSection) || null;
    const seedChosenUid = (opts && opts.seedChosenUid) || null;
    const seedDay = (opts && opts.seedDay) || null;
    // Optional starting timestamp used as the lower bound for the
    // first slot's "between-nodes" range. Lets renderNowNextView
    // tell the slot loop "the hero already covers everything up to
    // `now`, so any nodes/intervals between now and the next slot
    // need to surface here". Without this, between-nodes that fire
    // strictly between `now` and the first slot would never render.
    const seedSlotT = (opts && typeof opts.seedSlotT === 'number')
        ? opts.seedSlotT : null;
    // Make path visible to row builders inside this render pass.
    currentRenderPath = path;
    currentRenderAllItems = allItems;
    const days = Object.keys(data);
    const cutoff = startAfter ? startAfter.getTime() : 0;
    let bannerRendered = false;
    days.forEach(day => {
        const dayItems = allItems.filter(it => it.session.day === day);
        if (!dayItems.length) return;

        // Skip days that end at or before the cutoff entirely.
        const dayMaxEnd = Math.max(...dayItems.map(it => it.win.end.getTime()));
        if (dayMaxEnd <= cutoff) return;

        // Day banner. Deferred so that on the seeded day (the day
        // the Happening Now hero already announces) we can either
        // skip the banner entirely OR delay it until after a stay-
        // bridge has linked the hero to the first slot. For other
        // days, the banner still appears once at the top of the day.
        let bannerPending = !(day === seedDay && seedPrevSection);
        const ensureBanner = () => {
            if (!bannerPending) return;
            bannerPending = false;
            const banner = document.createElement('div');
            banner.className = 'nn-day-banner';
            if (!bannerRendered) banner.classList.add('is-first');
            banner.textContent = day;
            container.appendChild(banner);
            bannerRendered = true;
        };

        // Walk every distinct start time in the day strictly after cutoff.
        let cursor = new Date(Math.max(cutoff, dayItems.reduce((min, it) =>
            !min || it.win.start < min ? it.win.start : min, null).getTime() - 1));
        // Track which chosen uid the previously-rendered slot showed,
        // so a slot whose only content is the same continuing session
        // (with no new starred starts and no path nodes) can be
        // skipped — the previous card already covers it.
        let lastShownChosenUid = null;
        let lastRenderedLeadItem = null;
        // Timestamp of the previously processed slot, used to scoop
        // up any path nodes (decisions/forced edges) that occur
        // between slot starts so they don't fall into a gap and
        // never render.
        let lastShownSlotT = null;
        // Section element of the previously appended slot, kept so
        // that when this slot is a "stay" continuation of the same
        // session we can flatten its bottom edge to bridge into the
        // node row + the next slot's card seamlessly.
        let prevSection = null;
        // Seed prev-state on the day the Happening Now hero is on,
        // so a stay-decision firing at the next slot boundary can
        // bridge directly to the hero rather than re-rendering the
        // ongoing session as a duplicate first slot card.
        if (day === seedDay) {
            if (seedPrevSection) prevSection = seedPrevSection;
            if (seedChosenUid) lastShownChosenUid = seedChosenUid;
            if (seedSlotT !== null) lastShownSlotT = seedSlotT;
        }
        let safety = 0;
        while (safety++ < 500) {
            const group = findNextStartGroup(dayItems, cursor);
            if (!group.items.length) break;

            // Demotion for this slot — straight from the path.
            const slotT = group.startDate.getTime();
            // Skip slots already rendered in the hero.
            if (skip.has(slotT)) {
                cursor = new Date(slotT);
                continue;
            }
            currentRenderDemotedUids = getDemotedUidsAt(path, group.startDate);

            // Path nodes that apply at this slot's timestamp. Computed
            // before the skip check so a continuation slot with a
            // decision/forced edge still gets its node row.
            // Use the previous slot's timestamp as the lower bound
            // so any decisions/forced edges occurring BETWEEN slot
            // starts (e.g. a starred session ending mid-block while
            // overlapping starred sessions continue) get surfaced
            // here too. Without this, such nodes never render.
            const slotNodes = getPathNodesBetween(
                path,
                lastShownSlotT !== null ? lastShownSlotT : (slotT - 1),
                slotT,
                { inclusiveLo: true });

            // Path's chosen uid at this slot — the session the user
            // is attending through the upcoming interval. Path
            // intervals are bounded only by starred start/end times,
            // so a non-starred slot (e.g. a 14:30 fresh-start while
            // the user is mid-talk) won't have an interval starting
            // exactly at slotT — look up the interval CONTAINING it.
            const ivAt = path.intervals.find(iv =>
                iv.start.getTime() <= slotT && slotT < iv.end.getTime()
            );
            const chosenAt = ivAt && ivAt.chosen ? ivAt.chosen : null;

            // Is this slot purely a continuation of the previous one?
            // Yes if: same chosen uid as last shown AND no featured
            // Pure-continuation = same chosen uid as the prior slot,
            // no fresh featured items starting here, AND no path
            // nodes (stay decisions, forced edges) to surface at
            // this timestamp. If there ARE nodes, we want the node
            // to sit chronologically BETWEEN two card instances of
            // the continuing session — so we re-render the card.
            const freshFeatured = partitionFeaturedItems(group.items).featured;
            const isPureContinuation = chosenAt
                && chosenAt === lastShownChosenUid
                && freshFeatured.length === 0
                && slotNodes.length === 0;

            if (isPureContinuation) {
                cursor = new Date(slotT);
                continue;
            }

            // Break/meal absorbed by a chosen session: if the only
            // items freshly starting at this slot are breaks or
            // meals AND the chosen path session covers this slot
            // (started earlier, continues past slotT), the user
            // opted to stay in the session through the break — so
            // hide the break entirely.
            const onlyBreaksFresh = group.items.length > 0
                && group.items.every(it => it.session
                    && (isBreakStyleEvent(it.session) || isMealStyleEvent(it.session)));
            if (onlyBreaksFresh && chosenAt) {
                const chosenItem = ivAt && ivAt.active
                    && ivAt.active.find(it => it.session.uid === chosenAt);
                const chosenStartsBefore = chosenItem && chosenItem.win
                    && chosenItem.win.start.getTime() < slotT;
                const chosenEndsAfter = chosenItem && chosenItem.win
                    && chosenItem.win.end.getTime() > slotT;
                if (chosenStartsBefore && chosenEndsAfter && slotNodes.length === 0) {
                    cursor = new Date(slotT);
                    continue;
                }
            }

            // If the chosen path session started earlier and continues
            // through this node, surface it so the slot doesn't read
            // as free time.
            const slotItems = withContinuing(group.items, path, group.startDate);
            const isFreeOnlyGroup = !chosenAt
                && freshFeatured.length === 0
                && !onlyBreaksFresh;
            let freeSlotGroups = null;
            let freeSlotEnd = null;
            let finalFreeSlotStart = group.startDate;

            if (isFreeOnlyGroup) {
                freeSlotGroups = [];
                let candidateGroup = group;
                while (candidateGroup && candidateGroup.items.length) {
                    const candidateEnd = new Date(Math.max(...candidateGroup.items.map(item => item.win.end.getTime())));
                    freeSlotGroups.push({
                        items: candidateGroup.items,
                        timeRange: `${candidateGroup.startDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} – ${candidateEnd.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
                    });
                    freeSlotEnd = !freeSlotEnd || candidateEnd > freeSlotEnd
                        ? candidateEnd
                        : freeSlotEnd;
                    finalFreeSlotStart = candidateGroup.startDate;

                    const nextGroup = findNextStartGroup(dayItems, candidateGroup.startDate);
                    if (!nextGroup.items.length) break;
                    const nextStart = nextGroup.startDate.getTime();
                    const nextInterval = path.intervals.find(interval =>
                        interval.start.getTime() <= nextStart && nextStart < interval.end.getTime());
                    const nextChosen = nextInterval && nextInterval.chosen;
                    const nextFeatured = partitionFeaturedItems(nextGroup.items).featured;
                    const nextIsBreak = nextGroup.items.every(item => item.session
                        && (isBreakStyleEvent(item.session) || isMealStyleEvent(item.session)));
                    if (nextChosen || nextFeatured.length || nextIsBreak) break;
                    candidateGroup = nextGroup;
                }
            }

            const slotEnd = Math.max(...slotItems.map(i => i.win.end.getTime()));
            const isPast = slotEnd <= now.getTime();
            const isCurrent = group.startDate.getTime() <= now.getTime() && now.getTime() < slotEnd;
            const sectionClass = 'is-day-slot'
                + (isPast ? ' is-past' : '')
                + (isCurrent ? ' is-current' : '');

            // If the chosen path session strictly covers this slot
            // (started earlier, ends later), any break/meal items in
            // this slot are being skipped — render them muted.
            const chosenItemAt = ivAt && ivAt.active && chosenAt
                ? ivAt.active.find(it => it.session.uid === chosenAt)
                : null;
            const chosenCoversSlot = !!(chosenItemAt && chosenItemAt.win
                && chosenItemAt.win.start.getTime() < slotT
                && chosenItemAt.win.end.getTime() > slotT);
            const previousChosenItem = !chosenAt && freshFeatured.length === 0
                ? getPrevPathItem(path, group.startDate)
                : null;
            const freeStartOverride = previousChosenItem
                && previousChosenItem.win.end < group.startDate
                ? previousChosenItem.win.end
                : null;
            const time = (freeStartOverride || group.startDate).toLocaleTimeString(
                [], { hour: 'numeric', minute: '2-digit' });
            if (chosenCoversSlot
                && chosenAt === lastShownChosenUid
                && freshFeatured.length === 0
                && !slotNodes.some(n => n.t.getTime() === slotT)) {
                slotNodes.push({
                    kind: 'forced',
                    item: chosenItemAt,
                    prevPathItem: chosenItemAt,
                    t: group.startDate
                });
            }
            const header = buildNowNextSectionHeader(time, '', slotItems);
            const body = buildNowNextList(slotItems, {
                freeChipMaxEnd: findNextAttendedStart(dayItems, group.startDate),
                freeChipStartOverride: freeStartOverride,
                freeChipEndOverride: freeSlotEnd,
                otherSessionGroups: freeSlotGroups,
                skipBreaks: chosenCoversSlot,
                hideRowTime: true
            });

            // Render any path nodes (decisions or forced edges) at
            // this slot's timestamp BEFORE the slot section so they
            // sit visually between the previous slot and this one.
            // Detect a "stay bridge": same chosen session before and
            // after, with a stay-decision node in between. When so,
            // the prev card and the bridge merge into one continuous
            // panel, and the slot's "bottom bun" drops the duplicate
            // session row but KEEPS the parallel "other sessions"
            // list (those change per slot).
            const isStayBridge = !!(prevSection
                && lastShownChosenUid
                && chosenAt === lastShownChosenUid
                && slotNodes.some(n =>
                    (n.kind === 'decision'
                        && n.decision.chosen === lastShownChosenUid
                        && n.decision.start.getTime() === slotT)
                    || (n.kind === 'forced'
                        && n.item?.session?.uid === lastShownChosenUid
                        && n.t.getTime() === slotT)));

            // Split nodes into "between" (occurring strictly before
            // this slot's start, i.e. at intermediate path-only
            // boundaries like a 3:00 handoff before a 3:30 slot)
            // and "at-slot" (firing exactly at slotT). Between-nodes
            // interleave with continuation cards for their intervals
            // before we get to the slot's own node + section.
            const betweenNodes = slotNodes.filter(n =>
                n.t.getTime() < slotT);
            const atSlotNodes = slotNodes.filter(n =>
                n.t.getTime() >= slotT);

            const interludeIntervals = lastShownSlotT === null
                ? []
                : (path.intervals || []).filter(iv => {
                    const ivStart = iv.start.getTime();
                    const ivEnd = iv.end.getTime();
                    return iv.day === day
                        && iv.chosen
                        && ivStart > lastShownSlotT
                        && ivStart < slotT
                        && ivEnd <= slotT;
                });

            // Emit each between-node followed by the interlude
            // interval starting at its time (if any).
            betweenNodes.forEach(n => {
                // Stay-bridge if the prior section's chosen session
                // is the same as this node's chosen session — i.e.
                // the user is staying in the same talk through this
                // mid-block decision/forced edge. Same look as the
                // at-slot stay-bridge: flush bun above + below.
                const nodeChosen = n.kind === 'decision'
                    ? (n.decision && n.decision.chosen)
                    : (n.item && n.item.session && n.item.session.uid);
                const isBetweenStayBridge = !!(prevSection
                    && lastShownChosenUid
                    && nodeChosen
                    && nodeChosen === lastShownChosenUid);
                ensureBanner();
                const nWrap = document.createElement('div');
                nWrap.className = 'nn-decision-node'
                    + (isBetweenStayBridge ? ' nn-stay-bridge' : '');
                renderPathNodeRows(nWrap, [n], lastRenderedLeadItem);
                if (!nWrap.childElementCount) return;
                container.appendChild(nWrap);
                if (isBetweenStayBridge && prevSection) {
                    prevSection.classList.add('nn-stay-flat-bottom');
                }

                const iv = interludeIntervals.find(x =>
                    x.start.getTime() === n.t.getTime());
                if (!iv) return;
                const chosenItem = iv.active.find(
                    x => x.session.uid === iv.chosen);
                if (!chosenItem) return;
                const prevIvIdx = path.intervals.indexOf(iv);
                const prevIv = prevIvIdx > 0
                    ? path.intervals[prevIvIdx - 1] : null;
                const joinFromItem = (prevIv && prevIv.chosen)
                    ? prevIv.active.find(x => x.session.uid === prevIv.chosen)
                    : null;
                const ivTime = iv.start.toLocaleTimeString(
                    [], { hour: 'numeric', minute: '2-digit' });
                ensureBanner();
                const ivHeader = buildNowNextSectionHeader(
                    ivTime, '', [chosenItem]);
                const ivBody = buildNowNextList([chosenItem], {
                    freeChipMaxEnd: findNextAttendedStart(dayItems, iv.start),
                    skipBreaks: true,
                    suppressFreeChip: true,
                    joinFrom: joinFromItem,
                    hideRowTime: true
                });
                const ivSection = document.createElement('section');
                ivSection.className = 'nn-section is-day-slot'
                    + (isBetweenStayBridge ? ' nn-stay-flat-top' : '')
                    + (iv.end.getTime() <= now.getTime() ? ' is-past' : '')
                    + (iv.start.getTime() <= now.getTime()
                        && now.getTime() < iv.end.getTime() ? ' is-current' : '');
                const ivColor = pickSectionColor([chosenItem]);
                if (ivColor) ivSection.style.setProperty('--nn-section-color', ivColor);
                ivSection.appendChild(ivHeader);
                ivSection.appendChild(ivBody);
                container.appendChild(ivSection);
                lastShownChosenUid = iv.chosen;
                lastRenderedLeadItem = chosenItem;
                prevSection = ivSection;
            });

            let nodeWrap = null;
            if (atSlotNodes.length) {
                if (!isStayBridge) ensureBanner();
                nodeWrap = document.createElement('div');
                nodeWrap.className = 'nn-decision-node'
                    + (isStayBridge ? ' nn-stay-bridge' : '');
                renderPathNodeRows(nodeWrap, atSlotNodes, lastRenderedLeadItem);
                if (!nodeWrap.childElementCount) nodeWrap = null;
                else container.appendChild(nodeWrap);
            }

            // For a stay-bridge slot, drop the chosen session from
            // slotItems so the bottom bun only renders parallel
            // others. If nothing else remains, skip the section.
            let renderItems = slotItems;
            if (isStayBridge && chosenAt) {
                renderItems = slotItems.filter(it =>
                    !it.session || it.session.uid !== chosenAt);
                if (!renderItems.length) {
                    lastShownChosenUid = chosenAt;
                    cursor = new Date(group.startDate.getTime());
                    continue;
                }
            }
            const renderHeader = isStayBridge
                ? buildNowNextSectionHeader(time, '', renderItems)
                : header;
            // In a stay-bridge slot the user is still inside the
            // chosen session — they are NOT free — so suppress the
            // synthetic "Free time" chip that buildNowNextList would
            // otherwise emit when `featured` is empty.
            const renderBody = isStayBridge
                ? buildNowNextList(renderItems, {
                    freeChipMaxEnd: findNextAttendedStart(dayItems, group.startDate),
                    suppressFreeChip: true,
                    skipBreaks: true,
                    hideRowTime: true
                })
                : body;

            // Non-bridge slots get a normal day banner before them
            // (a no-op if the bridge path above already triggered it,
            // or if we're on the seeded day where the banner is
            // suppressed entirely).
            if (!isStayBridge) ensureBanner();

            // Slot-as-interlude: every item in this slot is a break
            // or meal AND we aren't skipping them. The whole slot
            // section becomes the dashed lunch/break card — no white
            // chrome around it.
            const sectionIsInterlude = !chosenCoversSlot
                && renderItems.length > 0
                && renderItems.every(it => it.session
                    && (isBreakStyleEvent(it.session) || isMealStyleEvent(it.session)));
            const sectionInterludeKind = sectionIsInterlude
                ? (renderItems.some(it => isMealStyleEvent(it.session)) ? 'meal' : 'break')
                : null;

            const section = document.createElement('section');
            section.className = `nn-section ${sectionClass}`
                + (isStayBridge ? ' nn-stay-flat-top' : '')
                + (sectionIsInterlude ? ` nn-section-interlude nn-section-${sectionInterludeKind}` : '');
            const sectColor = pickSectionColor(renderItems);
            if (sectColor) section.style.setProperty('--nn-section-color', sectColor);
            section.appendChild(renderHeader);
            section.appendChild(renderBody);
            container.appendChild(section);

            if (isStayBridge && prevSection) {
                prevSection.classList.add('nn-stay-flat-bottom');
            }

            // Update the carry-forward chosen uid for the next slot.
            lastShownChosenUid = chosenAt;
            const displayedItems = renderItems.slice();
            sortNowNextItems(displayedItems);
            lastRenderedLeadItem = partitionFeaturedItems(displayedItems).featured[0] || null;
            lastShownSlotT = slotT;
            prevSection = section;

            cursor = new Date(finalFreeSlotStart.getTime());
        }
        // After the slot loop, emit any path nodes that occur after
        // the last rendered slot (e.g. a starred session ending and
        // handing off to other in-progress starred sessions when no
        // fresh slot starts at that boundary).
        if (lastShownSlotT !== null) {
            const trailingHi = Math.max(...dayItems.map(it => it.win.end.getTime()));
            const trailingNodes = getPathNodesBetween(
                path, lastShownSlotT, trailingHi);
            if (trailingNodes.length) {
                const nodeWrap = document.createElement('div');
                nodeWrap.className = 'nn-decision-node';
                renderPathNodeRows(nodeWrap, trailingNodes, lastRenderedLeadItem);
                if (nodeWrap.childElementCount) container.appendChild(nodeWrap);
            }
        }
    });
    currentRenderDemotedUids = null;
}
function renderMobileDayList(day, container) {
    const sessions = data[day] || [];
    const dayTimes = sessions.map(s => s.time);
    const sortedTimes = sortTimes(new Set(dayTimes));
    const timeGroups = {};

    sessions.forEach(session => {
        if (!timeGroups[session.time]) timeGroups[session.time] = [];
        timeGroups[session.time].push(session);
    });

    const list = document.createElement('div');
    list.className = 'mobile-day-list';

    sortedTimes.forEach(time => {
        const group = document.createElement('div');
        group.className = 'mobile-time-group';
        group.dataset.day = day;
        group.dataset.time = time;

        const label = document.createElement('div');
        label.className = 'time-col'; 
        label.textContent = formatStartTime(time);
        group.appendChild(label);

        const stack = document.createElement('div');
        stack.className = 'mobile-time-stack';

        (timeGroups[time] || []).forEach(session => {
            const wrap = document.createElement('div');
            wrap.className = 'mobile-card-wrap';

            if (session.type === 'session' || session.type === 'training' || isSessionStyleEvent(session)) {
                wrap.appendChild(createSessionCard(session, true));
            } else if (isBreakStyleEvent(session) || FULLWIDTH_ROOMS.has(session.room)) {
                wrap.appendChild(createFullWidthCard(session));
            } else {
                wrap.appendChild(createSessionCard(session, true));
            }
            stack.appendChild(wrap);
        });

        group.appendChild(stack);
        list.appendChild(group);
    });

    container.appendChild(list);
}

function renderGlobalSearchResults(container) {
    const isMobile = isMobileLayoutViewport();
    let hasAny = false;

    Object.keys(data).forEach(day => {
        const matching = (data[day] || [])
            .filter(session => {
                const searchableText = [
                    session.Title || '',
                    session.Authors || '',
                    session.Track || '',
                    session.room || '',
                    session.Affiliation || '',
                    session.type || ''
                ].join(' ').toLowerCase();

                if (!searchableText.includes(searchQuery)) return false;
                if (isKeynoteSession(session)) return true;
                return checkTrackMatch((session.Track || '').toLowerCase());
            })
            .sort((left, right) => parseClockMinutes(left.time) - parseClockMinutes(right.time));

        if (matching.length === 0) return;
        hasAny = true;

        const heading = document.createElement('div');
        heading.className = 'day-heading';
        heading.dataset.day = day;
        heading.textContent = day;
        container.appendChild(heading);

        const byTime = {};
        matching.forEach(session => {
            if (!byTime[session.time]) byTime[session.time] = [];
            byTime[session.time].push(session);
        });

        const sortedTimes = sortTimes(Object.keys(byTime));
        const list = document.createElement('div');
        list.className = isMobile ? 'mobile-day-list' : 'time-rows';
        list.style.width = '100%';

        sortedTimes.forEach(time => {
            if (isMobile) {
                const group = document.createElement('div');
                group.className = 'mobile-time-group';
                group.dataset.day = day;
                group.dataset.time = time;

                const label = document.createElement('div');
                label.className = 'time-col';
                label.textContent = formatStartTime(time);
                group.appendChild(label);

                const stack = document.createElement('div');
                stack.className = 'mobile-time-stack';

                (byTime[time] || []).forEach(session => {
                    const wrap = document.createElement('div');
                    wrap.className = 'mobile-card-wrap';
                    if (session.type === 'session' || session.type === 'training' || isSessionStyleEvent(session)) {
                        wrap.appendChild(createSessionCard(session, true));
                    } else {
                        wrap.appendChild(createFullWidthCard(session));
                    }
                    stack.appendChild(wrap);
                });

                group.appendChild(stack);
                list.appendChild(group);
                return;
            }

            const row = document.createElement('div');
            row.className = 'time-row';
            row.style.gridTemplateColumns = '64px 1fr';
            row.style.width = '100%';
            row.dataset.day = day;
            row.dataset.time = time;

            const tCol = document.createElement('div');
            tCol.className = 'time-col';
            tCol.textContent = formatStartTime(time);
            row.appendChild(tCol);

            const wrap = document.createElement('div');
            wrap.style.display = 'flex';
            wrap.style.flexDirection = 'column';
            wrap.style.gap = '6px';
            wrap.style.width = '100%';

            (byTime[time] || []).forEach(session => {
                const cardWrap = document.createElement('div');
                cardWrap.className = 'mobile-card-wrap';
                cardWrap.style.width = '100%';
                if (session.type === 'session' || session.type === 'training' || isSessionStyleEvent(session)) {
                    cardWrap.appendChild(createSessionCard(session, true));
                } else {
                    cardWrap.appendChild(createFullWidthCard(session));
                }
                wrap.appendChild(cardWrap);
            });

            row.appendChild(wrap);
            list.appendChild(row);
        });

        container.appendChild(list);
    });

    if (!hasAny) {
        const msg = document.createElement('div');
        msg.className = 'no-results';
        msg.textContent = `No sessions found for "${searchQuery}"`;
        container.appendChild(msg);
    }
}

function renderStarredView(container) {
    document.getElementById('trackFilters').innerHTML = '';
    const isMobile = isMobileLayoutViewport();

    // Edit toolbar — always present at top of My Schedule, controls bulk removal.
    const toolbar = document.createElement('div');
    toolbar.className = 'starred-toolbar';
    toolbar.id = 'starredToolbar';
    container.appendChild(toolbar);

    const createTransferIndicator = (transferInfo) => {
        const row = document.createElement('div');
        row.className = 'transfer-row';
        row.innerHTML = buildTransferChipHtml(transferInfo);
        return row;
    };

    const createFreeIndicator = (freeInfo) => {
        const row = document.createElement('div');
        row.className = 'free-row';
        row.innerHTML = buildFreeChipHtml(freeInfo);
        return row;
    };
    
    let hasAny = false;
    Object.keys(data).forEach(day => {
        const sessions = data[day].filter(s => s.uid && starredSessions.includes(s.uid));
        if (sessions.length === 0) return;
        hasAny = true;

        const daySection = document.createElement('section');
        daySection.className = 'starred-day-section';

        const daySessions = data[day] || [];
        const dayTimes = daySessions.map(s => s.time);
        const sortedStarred = [...sessions].sort((left, right) => parseClockMinutes(left.time) - parseClockMinutes(right.time));

        // ─── Conflict detection: build groups of starred sessions whose time ranges overlap.
        const intervals = sortedStarred.map(s => ({
            session: s,
            start: parseClockMinutes(s.time),
            end: parseClockMinutes(s.time) + getSessionDurationMinutes(dayTimes, s)
        }));
        const adj = new Map();
        intervals.forEach(it => adj.set(it.session.uid, new Set()));
        // Only flag pairs you can't reasonably attend in sequence:
        //   - same start time (must pick one), or
        //   - one fully contains the other (you'd have to leave and return).
        // Build overlap clusters: any pair of starred sessions whose intervals
        // intersect become connected; transitive closure forms a cluster. Each
        // cluster of 2+ members is rendered together in a single .overlap-group
        // container at the cluster's earliest start time, with internal boundary
        // info chips at every member's start/end transition.
        for (let i = 0; i < intervals.length; i++) {
            for (let j = i + 1; j < intervals.length; j++) {
                const a = intervals[i], b = intervals[j];
                if (a.start < b.end && b.start < a.end) {
                    adj.get(a.session.uid).add(b.session.uid);
                    adj.get(b.session.uid).add(a.session.uid);
                }
            }
        }
        const visitedConflict = new Set();
        const clusterList = [];
        const clusterByUid = new Map();
        intervals.forEach(it => {
            const uid = it.session.uid;
            if (visitedConflict.has(uid)) return;
            if (adj.get(uid).size === 0) return;
            const stack = [uid];
            const groupUids = [];
            while (stack.length) {
                const u = stack.pop();
                if (visitedConflict.has(u)) continue;
                visitedConflict.add(u);
                groupUids.push(u);
                adj.get(u).forEach(v => { if (!visitedConflict.has(v)) stack.push(v); });
            }
            if (groupUids.length >= 2) {
                const sessions = groupUids
                    .map(u => intervals.find(x => x.session.uid === u).session)
                    .sort((l, r) =>
                        parseClockMinutes(l.time) - parseClockMinutes(r.time)
                        || (l.Title || '').localeCompare(r.Title || ''));
                const startMin = parseClockMinutes(sessions[0].time);
                const endMin = Math.max(...sessions.map(s =>
                    parseClockMinutes(s.time) + getSessionDurationMinutes(dayTimes, s)));
                const idx = clusterList.length;
                clusterList.push({
                    sessions,
                    anchorTime: sessions[0].time,
                    anchorUid: sessions[0].uid,
                    startMin,
                    endMin
                });
                sessions.forEach(s => clusterByUid.set(s.uid, idx));
            }
        });
        const conflictUids = new Set([...clusterByUid.keys()]);

        const buildClusterContainer = (cluster) => {
            const overlapEl = document.createElement('div');
            overlapEl.className = 'overlap-group';
            const header = document.createElement('div');
            header.className = 'overlap-group-header';
            const dotsEl = document.createElement('div');
            dotsEl.className = 'overlap-dots';
            const seenColors = new Set();
            cluster.sessions.forEach(s => {
                const color = getSessionAccentColor(s, s.Track);
                const key = (color || '').toLowerCase();
                if (seenColors.has(key)) return;
                seenColors.add(key);
                const dot = document.createElement('span');
                dot.className = 'overlap-dot';
                dot.style.background = color;
                dot.title = s.Title || '';
                dotsEl.appendChild(dot);
            });
            header.appendChild(dotsEl);
            const labelEl = document.createElement('span');
            labelEl.className = 'overlap-group-label';
            const allSameStart = cluster.sessions.every(s => s.time === cluster.anchorTime);
            labelEl.textContent = allSameStart
                ? `${cluster.sessions.length} selected options at this time`
                : `${cluster.sessions.length} concurrent options`;
            header.appendChild(labelEl);
            overlapEl.appendChild(header);
            const innerItems = document.createElement('div');
            innerItems.className = 'overlap-group-items';
            overlapEl.appendChild(innerItems);

            // Stream of cards + internal boundary chips, sorted by time.
            // At the same minute, all end chips and start chips coalesce into a
            // single boundary chip (e.g. "5:00 PM • ends • • starts in Salon B"),
            // followed by any cards starting at that minute.
            const cardEntries = [];
            const boundaryByTime = new Map();
            cluster.sessions.forEach(s => {
                const sStart = parseClockMinutes(s.time);
                const sEnd = sStart + getSessionDurationMinutes(dayTimes, s);
                cardEntries.push({ time: sStart, session: s });
                if (sStart > cluster.startMin) {
                    if (!boundaryByTime.has(sStart)) boundaryByTime.set(sStart, { ends: [], starts: [] });
                    boundaryByTime.get(sStart).starts.push(s);
                }
                if (sEnd < cluster.endMin) {
                    if (!boundaryByTime.has(sEnd)) boundaryByTime.set(sEnd, { ends: [], starts: [] });
                    boundaryByTime.get(sEnd).ends.push(s);
                }
            });

            const allTimes = new Set();
            cardEntries.forEach(c => allTimes.add(c.time));
            boundaryByTime.forEach((_, t) => allTimes.add(t));
            const sortedTimes = [...allTimes].sort((a, b) => a - b);

            sortedTimes.forEach(t => {
                // Each time-segment of the cluster becomes its own real
                // .time-row with a sticky .time-col, so boundary times push
                // each other out exactly like the day's regular time labels.
                const innerRow = document.createElement('div');
                innerRow.className = 'time-row cluster-time-row';
                innerRow.style.gridTemplateColumns = `var(--time-col-width) 1fr`;
                innerRow.dataset.time = formatClockMinutes(t);

                const tCol = document.createElement('div');
                tCol.className = 'time-col';
                tCol.textContent = formatClockMinutes(t);
                innerRow.appendChild(tCol);

                const cellWrap = document.createElement('div');
                cellWrap.className = 'cluster-time-cell';

                const b = boundaryByTime.get(t);
                if (b && (b.ends.length || b.starts.length)) {
                    const chip = document.createElement('div');
                    chip.className = 'cluster-boundary-chip';

                    const appendSegment = (session, label, isStart) => {
                        const seg = document.createElement('span');
                        seg.className = 'cluster-boundary-seg';
                        const dot = document.createElement('span');
                        dot.className = 'cluster-boundary-dot';
                        dot.style.background = getSessionAccentColor(session, session.Track);
                        dot.title = session.Title || '';
                        seg.appendChild(dot);
                        const text = document.createElement('span');
                        if (isStart && session.room) {
                            text.appendChild(document.createTextNode('starts in '));
                            const roomEl = document.createElement('strong');
                            roomEl.textContent = session.room;
                            text.appendChild(roomEl);
                        } else {
                            text.textContent = label;
                        }
                        seg.appendChild(text);
                        chip.appendChild(seg);
                    };

                    // If a session both ends and starts at this time in the
                    // same room, collapse to one "next in <room>" segment.
                    // Sort by canonical room order so multi-segment chips read
                    // in the same left-to-right order as the day's columns.
                    const roomRank = (room) => {
                        const i = ROOM_ORDER.indexOf(room || '');
                        return i === -1 ? Number.MAX_SAFE_INTEGER : i;
                    };
                    const sortedStarts = [...b.starts].sort((a, c) => roomRank(a.room) - roomRank(c.room));
                    const sortedEnds = [...b.ends].sort((a, c) => roomRank(a.room) - roomRank(c.room));
                    const usedEnd = new Set();
                    const usedStart = new Set();
                    sortedStarts.forEach((sStart, i) => {
                        const matchIdx = sortedEnds.findIndex((sEnd, j) =>
                            !usedEnd.has(j) && (sEnd.room || '') === (sStart.room || '') && sStart.room
                        );
                        if (matchIdx >= 0) {
                            usedEnd.add(matchIdx);
                            usedStart.add(i);
                            const seg = document.createElement('span');
                            seg.className = 'cluster-boundary-seg';
                            const dot = document.createElement('span');
                            dot.className = 'cluster-boundary-dot';
                            dot.style.background = getSessionAccentColor(sStart, sStart.Track);
                            dot.title = sStart.Title || '';
                            seg.appendChild(dot);
                            const text = document.createElement('span');
                            text.appendChild(document.createTextNode('next in '));
                            const roomEl = document.createElement('strong');
                            roomEl.textContent = sStart.room;
                            text.appendChild(roomEl);
                            seg.appendChild(text);
                            chip.appendChild(seg);
                        }
                    });
                    sortedEnds.forEach((s, j) => { if (!usedEnd.has(j)) appendSegment(s, 'ends', false); });
                    sortedStarts.forEach((s, i) => { if (!usedStart.has(i)) appendSegment(s, 'starts', true); });

                    cellWrap.appendChild(chip);
                }

                cardEntries.filter(c => c.time === t).forEach(c => {
                    const cardWrap = document.createElement('div');
                    cardWrap.className = 'mobile-card-wrap';
                    cardWrap.appendChild(createSessionCard(c.session, true));
                    cellWrap.appendChild(cardWrap);
                });

                innerRow.appendChild(cellWrap);
                innerItems.appendChild(innerRow);
            });

            return overlapEl;
        };

        const breakCandidates = daySessions.filter(s => isGlobalOverlayEvent(s));
        const timeGroups = {};
        const addToTimeGroup = (time, item) => {
            if (!timeGroups[time]) timeGroups[time] = [];
            timeGroups[time].push(item);
        };

        sortedStarred.forEach((current, index) => {
            const currentItem = { kind: 'session', session: current };
            addToTimeGroup(current.time, currentItem);

            const next = sortedStarred[index + 1];
            if (!next) return;

            // Within an overlap cluster, alternates aren't a sequence — you pick
            // one or hop between them. Suppress transfer/free chips between any
            // two cluster members (the cluster container handles internal info).
            const cIdxCurrent = clusterByUid.get(current.uid);
            const cIdxNext = clusterByUid.get(next.uid);
            const inSameCluster = cIdxCurrent !== undefined && cIdxCurrent === cIdxNext;
            if (inSameCluster) return;

            // If current is part of a cluster, the cluster's effective end (for
            // free-time math) is the latest end across all cluster members.
            let currentEnd = parseClockMinutes(current.time) + getSessionDurationMinutes(dayTimes, current);
            if (cIdxCurrent !== undefined) {
                const c = clusterList[cIdxCurrent];
                if (c.endMin > currentEnd) currentEnd = c.endMin;
            }
            const nextStart = parseClockMinutes(next.time);
            const hasGap = nextStart > currentEnd;
            const isOverlap = nextStart < currentEnd;
            // If `next` enters a cluster, the destination is whichever cluster
            // members start at next.time. Build a friendly label like
            // "Salon B or Salon C" / "Salon B, C, or D" instead of picking one.
            // Build destination room entries with track-color for dot rendering.
            let nextRoomEntries;
            const roomRankGlobal = (room) => {
                const i = ROOM_ORDER.indexOf(room || '');
                return i === -1 ? Number.MAX_SAFE_INTEGER : i;
            };
            if (cIdxNext !== undefined) {
                const c = clusterList[cIdxNext];
                const startingHere = c.sessions.filter(s => s.time === next.time);
                const seen = new Set();
                nextRoomEntries = [];
                startingHere.forEach(s => {
                    if (!s.room || seen.has(s.room)) return;
                    seen.add(s.room);
                    nextRoomEntries.push({ name: s.room, color: getSessionAccentColor(s, s.Track) });
                });
                if (nextRoomEntries.length === 0 && next.room) {
                    nextRoomEntries = [{ name: next.room, color: getSessionAccentColor(next, next.Track) }];
                }
                nextRoomEntries.sort((a, b) => roomRankGlobal(a.name) - roomRankGlobal(b.name));
            } else {
                nextRoomEntries = next.room
                    ? [{ name: next.room, color: getSessionAccentColor(next, next.Track) }]
                    : [];
            }
            const nextRooms = nextRoomEntries.map(r => r.name);
            const formatRoomList = (rooms) => {
                if (rooms.length === 0) return 'next room';
                if (rooms.length === 1) return rooms[0];
                if (rooms.length === 2) return `${rooms[0]} or ${rooms[1]}`;
                return `${rooms.slice(0, -1).join(', ')}, or ${rooms[rooms.length - 1]}`;
            };
            const roomChanged = !nextRooms.includes(current.room || '');
            // When the destination is a multi-room group of alternates, surface
            // the chip even if the attendee could stay put — it represents a
            // choice between options, not just a forced transfer.
            const isMultiRoomGroup = nextRooms.length > 1;

            let transferAnchor = currentItem;
            let anchorEnd = currentEnd;
            let betweenBreaks = [];

            if (hasGap) {
                const seenBreakKeys = new Set();
                betweenBreaks = breakCandidates
                    .filter(b => {
                        const breakStart = parseClockMinutes(b.time);
                        return breakStart >= currentEnd && breakStart < nextStart;
                    })
                    .sort((left, right) => parseClockMinutes(left.time) - parseClockMinutes(right.time));

                betweenBreaks.forEach(breakSession => {
                    const breakKey = `${breakSession.time}|${breakSession.Title || ''}`;
                    if (seenBreakKeys.has(breakKey)) return;
                    seenBreakKeys.add(breakKey);

                    const breakStart = parseClockMinutes(breakSession.time);
                    const preGap = breakStart - anchorEnd;
                    if (preGap > 0) {
                        const fromLabel = formatClockMinutes(anchorEnd);
                        const toLabel = formatTime(breakSession.time);
                        transferAnchor.freeTimeInfo = {
                            amount: `${preGap} min free`,
                            window: `${fromLabel}–${toLabel}`,
                            aria: `${preGap} minutes free from ${fromLabel} to ${toLabel}`
                        };
                    }

                    const breakItem = { kind: 'break', session: breakSession };
                    addToTimeGroup(breakSession.time, breakItem);
                    transferAnchor = breakItem;
                    anchorEnd = breakStart + getSessionDurationMinutes(dayTimes, breakSession);
                });
            }

            if (!hasGap && !roomChanged && !isMultiRoomGroup) return;
            const nextRoom = formatRoomList(nextRooms);
            const endLabel = formatClockMinutes(currentEnd);
            const nextLabel = formatTime(next.time);
            let chipInfo;
            let freeInfo = null;
            if (!hasGap) {
                chipInfo = {
                    icon: '→',
                    room: nextRoom,
                    rooms: nextRoomEntries,
                    meta: `immediately at ${nextLabel}`,
                    aria: `Transfer to ${nextRoom} immediately at ${nextLabel}`
                };
            } else {
                const gapMinutes = Math.max(0, nextStart - currentEnd);
                const lastBreakSession = transferAnchor.kind === 'break' ? transferAnchor.session : null;
                const breakMinutes = lastBreakSession ? getSessionDurationMinutes(dayTimes, lastBreakSession) : gapMinutes;
                const breakEnd = lastBreakSession
                    ? parseClockMinutes(lastBreakSession.time) + breakMinutes
                    : currentEnd;
                const breakEndLabel = formatClockMinutes(breakEnd);
                const postBreakGapMinutes = Math.max(0, nextStart - breakEnd);
                const isImmediateAfterBreak = lastBreakSession
                    ? (parseClockMinutes(lastBreakSession.time) + breakMinutes) === nextStart
                    : false;
                const betweenMeal = betweenBreaks.find(b => {
                    const t = (b.Title || '').toLowerCase();
                    return t.includes('lunch') || t.includes('breakfast');
                });
                let breakLabel = betweenBreaks.length ? 'break' : '';
                if (betweenMeal) {
                    const t = (betweenMeal.Title || '').toLowerCase();
                    breakLabel = t.includes('lunch') ? 'lunch' : 'breakfast';
                }

                if (!roomChanged && betweenBreaks.length === 0) {
                    // Same room, plain gap — free chip + a quiet "return" message.
                    freeInfo = {
                        amount: `${gapMinutes} min free`,
                        window: `${endLabel}–${nextLabel}`,
                        aria: `${gapMinutes} minutes free from ${endLabel} to ${nextLabel}, same room`
                    };
                    chipInfo = {
                        iconHtml: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M20 17v-2a4 4 0 0 0-4-4H6"/><polyline points="10 7 6 11 10 15"/></svg>',
                        room: nextRoom,
                        rooms: nextRoomEntries,
                        meta: `at ${nextLabel}`,
                        aria: `Return to ${nextRoom} at ${nextLabel}`
                    };
                } else if (breakLabel) {
                    if (!isImmediateAfterBreak && postBreakGapMinutes > 0) {
                        // There's free time between the break ending and the next session.
                        // Don't say "after break" — the transfer is after the free buffer.
                        freeInfo = {
                            amount: `${postBreakGapMinutes} min free`,
                            window: `${breakEndLabel}–${nextLabel}, after ${breakLabel}`,
                            aria: `${postBreakGapMinutes} minutes free after ${breakLabel}, ${breakEndLabel} to ${nextLabel}`
                        };
                        chipInfo = {
                            icon: '→',
                            room: nextRoom,
                            rooms: nextRoomEntries,
                            meta: `at ${nextLabel}`,
                            aria: `Transfer to ${nextRoom} at ${nextLabel}`
                        };
                    } else {
                        // Transfer happens immediately when the break ends.
                        chipInfo = {
                            icon: '→',
                            room: nextRoom,
                            rooms: nextRoomEntries,
                            meta: `at ${nextLabel} after ${breakLabel}`,
                            aria: `Transfer to ${nextRoom} at ${nextLabel} after ${breakLabel}`
                        };
                    }
                } else {
                    freeInfo = {
                        amount: `${gapMinutes} min free`,
                        window: `${endLabel}–${nextLabel}`,
                        aria: `${gapMinutes} minutes free from ${endLabel} to ${nextLabel}`
                    };
                    chipInfo = {
                        icon: '→',
                        room: nextRoom,
                        rooms: nextRoomEntries,
                        meta: `at ${nextLabel}`,
                        aria: `Transfer to ${nextRoom} at ${nextLabel}`
                    };
                }
            }
            transferAnchor.transferInfo = chipInfo || null;
            transferAnchor.freeTimeInfo = freeInfo;
        });

        // Consolidate cluster member items into a single cluster item at each
        // cluster's anchor time. Transfer/free info from any member is inherited
        // by the cluster item (and emitted after the cluster's container).
        clusterList.forEach(cluster => {
            let inheritedTransferInfo = null;
            let inheritedFreeTimeInfo = null;
            cluster.sessions.forEach(s => {
                const tg = timeGroups[s.time];
                if (!tg) return;
                for (let k = tg.length - 1; k >= 0; k--) {
                    const it = tg[k];
                    if (it.kind === 'session' && it.session.uid === s.uid) {
                        if (it.transferInfo) inheritedTransferInfo = it.transferInfo;
                        if (it.freeTimeInfo) inheritedFreeTimeInfo = it.freeTimeInfo;
                        tg.splice(k, 1);
                        break;
                    }
                }
                if (tg.length === 0) delete timeGroups[s.time];
            });
            if (!timeGroups[cluster.anchorTime]) timeGroups[cluster.anchorTime] = [];
            timeGroups[cluster.anchorTime].push({
                kind: 'cluster',
                cluster,
                transferInfo: inheritedTransferInfo,
                freeTimeInfo: inheritedFreeTimeInfo
            });
        });
        
        const heading = document.createElement('div');
        heading.className = 'day-heading';
        heading.dataset.day = day;
        heading.textContent = day;
        daySection.appendChild(heading);
        
        const sortedTimes = sortTimes(Object.keys(timeGroups));
        
        const timeRowsEl = document.createElement('div');
        timeRowsEl.className = isMobile ? 'mobile-day-list' : 'time-rows';
        
        sortedTimes.forEach(time => {
            const items = timeGroups[time];
            const hasCluster = items.some(it => it.kind === 'cluster');

            if (isMobile) {
                const group = document.createElement('div');
                group.className = 'mobile-time-group';
                group.dataset.day = day;
                group.dataset.time = time;

                const label = document.createElement('div');
                label.className = 'time-col';
                if (hasCluster) {
                    label.classList.add('time-col-empty');
                } else {
                    label.textContent = formatStartTime(time);
                }
                group.appendChild(label);

                const stack = document.createElement('div');
                stack.className = 'mobile-time-stack';

                timeGroups[time].forEach(item => {
                    if (item.kind === 'cluster') {
                        stack.appendChild(buildClusterContainer(item.cluster));
                    } else {
                        const wrap = document.createElement('div');
                        wrap.className = 'mobile-card-wrap';
                        if (item.kind === 'break') {
                            wrap.appendChild(createFullWidthCard(item.session));
                        } else {
                            wrap.appendChild(createSessionCard(item.session, true));
                        }
                        stack.appendChild(wrap);
                    }

                    if (item.freeTimeInfo || item.transferInfo) {
                        const block = document.createElement('div');
                        block.className = 'transition-block';
                        if (item.freeTimeInfo) {
                            block.appendChild(createFreeIndicator(item.freeTimeInfo));
                        }
                        if (item.transferInfo) {
                            block.appendChild(createTransferIndicator(item.transferInfo));
                        }
                        stack.appendChild(block);
                    }
                });

                group.appendChild(stack);
                timeRowsEl.appendChild(group);
                return;
            }

            const row = document.createElement('div');
            row.className = 'time-row';
            row.style.gridTemplateColumns = `var(--time-col-width) 1fr`;
            row.dataset.day = day;
            row.dataset.time = time;

            const tCol = document.createElement('div');
            tCol.className = 'time-col';
            if (hasCluster) {
                tCol.classList.add('time-col-empty');
            } else {
                tCol.textContent = formatStartTime(time);
            }
            row.appendChild(tCol);

            const wrap = document.createElement('div');
            wrap.style.display = 'flex';
            wrap.style.flexDirection = 'column';
            wrap.style.gap = '10px';

            timeGroups[time].forEach(item => {
                if (item.kind === 'cluster') {
                    wrap.appendChild(buildClusterContainer(item.cluster));
                } else {
                    const cardWrap = document.createElement('div');
                    cardWrap.className = 'mobile-card-wrap';
                    if (item.kind === 'break') {
                        cardWrap.appendChild(createFullWidthCard(item.session));
                    } else {
                        cardWrap.appendChild(createSessionCard(item.session, true));
                    }
                    wrap.appendChild(cardWrap);
                }

                if (item.freeTimeInfo || item.transferInfo) {
                    const block = document.createElement('div');
                    block.className = 'transition-block';
                    if (item.freeTimeInfo) {
                        block.appendChild(createFreeIndicator(item.freeTimeInfo));
                    }
                    if (item.transferInfo) {
                        block.appendChild(createTransferIndicator(item.transferInfo));
                    }
                    wrap.appendChild(block);
                }
            });

            row.appendChild(wrap);
            timeRowsEl.appendChild(row);
        });
        
        daySection.appendChild(timeRowsEl);
        container.appendChild(daySection);
    });
    
    if (!hasAny) {
        const msg = document.createElement('div');
        msg.className = 'no-results';
        msg.textContent = 'Star sessions to build your schedule';
        container.appendChild(msg);
    }

    // Sync any pending-removal markings (in case re-render preserved state).
    pendingRemovals.forEach(uid => {
        document.querySelectorAll(`.session-card[data-uid="${uid}"]`).forEach(c => {
            const wrapEl = c.closest('.mobile-card-wrap') || c;
            wrapEl.classList.add('marked-for-removal');
        });
    });
    updateStarredEditToolbar();
}

function toggleStarredRemoval(uid, cardEl) {
    const wrapEl = cardEl.closest('.mobile-card-wrap') || cardEl;
    if (pendingRemovals.has(uid)) {
        pendingRemovals.delete(uid);
        wrapEl.classList.remove('marked-for-removal');
    } else {
        pendingRemovals.add(uid);
        wrapEl.classList.add('marked-for-removal');
    }
    updateStarredEditToolbar();
}

function updateStarredEditToolbar() {
    const toolbar = document.getElementById('starredToolbar');
    if (!toolbar) return;
    const hasAny = starredSessions.length > 0;
    toolbar.innerHTML = '';
    if (!hasAny) {
        toolbar.style.display = 'none';
        return;
    }
    toolbar.style.display = '';

    if (!isStarredEditMode) {
        const shareBtn = document.createElement('button');
        shareBtn.type = 'button';
        shareBtn.className = 'starred-edit-btn starred-edit-share';
        shareBtn.textContent = 'Share';
        shareBtn.setAttribute('aria-label', 'Share my schedule');
        shareBtn.onclick = () => shareStarredSchedule();
        toolbar.appendChild(shareBtn);

        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'starred-edit-btn';
        editBtn.textContent = 'Edit';
        editBtn.setAttribute('aria-label', 'Edit my schedule');
        editBtn.onclick = () => {
            isStarredEditMode = true;
            pendingRemovals.clear();
            renderSchedule();
        };
        toolbar.appendChild(editBtn);
        return;
    }

    const count = pendingRemovals.size;
    if (count > 0) {
        const status = document.createElement('span');
        status.className = 'starred-edit-status';
        status.textContent = `${count} selected`;
        toolbar.appendChild(status);
    }

    const actions = document.createElement('div');
    actions.className = 'starred-edit-actions';

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'starred-edit-btn starred-edit-cancel';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.onclick = () => {
        isStarredEditMode = false;
        pendingRemovals.clear();
        renderSchedule();
    };
    actions.appendChild(cancelBtn);

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'starred-edit-btn starred-edit-remove';
    removeBtn.textContent = count === 0 ? 'Remove' : `Remove (${count})`;
    removeBtn.disabled = count === 0;
    removeBtn.onclick = () => {
        if (pendingRemovals.size === 0) return;
        starredSessions = starredSessions.filter(uid => !pendingRemovals.has(uid));
        localStorage.setItem('incose_2026_stars', JSON.stringify(starredSessions));
        pendingRemovals.clear();
        isStarredEditMode = false;
        renderSchedule();
    };
    actions.appendChild(removeBtn);

    toolbar.appendChild(actions);
}

// ─── CARD BUILDERS ───
function createFullWidthCard(s) {
    const card = document.createElement('div');
    const titleLower = (s.Title || '').toLowerCase();
    const isMealEvent = /\bbreakfast\b|\blunch\b/.test(titleLower);
    const isBanquet = isBanquetEvent(s);
    const isBreak = isBreakStyleEvent(s);
    const displayTitle = isBanquet
        ? (s.Title || 'Banquet')
        : ((isBreak && !isMealEvent) ? getBreakDisplayTitle(s) : (s.Title || ''));
    let cardClass = 'event-card ';
    if (isBanquet) {
        cardClass += 'banquet-card';
    } else if (isMealEvent) {
        cardClass += 'meal-card';
    } else if (isBreak) {
        cardClass += 'break-card';
    } else {
        cardClass += 'plenary';
    }
    card.className = cardClass;
    card.dataset.uid = s.uid || '';
    card.dataset.track = (s.Track || '').toLowerCase();
    card.dataset.title = (s.Title || '').toLowerCase();
    card.dataset.authors = (s.Authors || '').toLowerCase();
    
    const labelSpan = document.createElement('span');
    labelSpan.className = 'event-card-label';
    labelSpan.textContent = displayTitle;
    card.appendChild(labelSpan);
    if (isBanquet) {
        card.appendChild(buildTicketRequiredEl());
    }
    if (s.room && !isBreak) card.title = s.room;
    if (s.Abstract || s.Authors || s.Affiliation) {
        card.style.cursor = 'pointer';
        card.onclick = () => {
            if (currentView === 'starred' && isStarredEditMode) return;
            openSessionDetails(s, card);
        };
    }
    return card;
}

function createShortSessionCalloutCard(session, pointsLeft) {
    const card = document.createElement('div');
    card.className = 'session-card short-session-callout-card' + (pointsLeft ? ' points-left' : '');
    card.dataset.uid = session.uid || '';
    card.dataset.track = (session.Track || '').toLowerCase();
    card.dataset.title = (session.Title || '').toLowerCase();
    card.dataset.authors = (session.Authors || '').toLowerCase();

    const track = document.createElement('div');
    track.className = 'track-badge';
    track.style.color = getSessionAccentColor(session, session.Track);
    track.textContent = session.Track || 'Session';

    const title = document.createElement('div');
    title.className = 'session-title';
    title.textContent = session.Title || 'Session';

    const time = document.createElement('div');
    time.className = 'short-session-callout-time';
    time.textContent = `${formatTime(session.time)} · ${session.room}`;

    card.append(track, title, time);
    card.onclick = () => openSessionDetails(session, card);
    return card;
}

function createSessionCard(s, showRoom) {
    const card = document.createElement('div');
    card.className = 'session-card' + (s.isMedtronic ? ' medtronic-highlight' : '');
    card.dataset.uid = s.uid || '';
    card.dataset.track = (s.Track || '').toLowerCase();
    card.dataset.title = (s.Title || '').toLowerCase();
    card.dataset.authors = (s.Authors || '').toLowerCase();
    if (s.isMedtronic) card.dataset.medtronic = 'true';
    if (isKeynoteSession(s)) card.dataset.special = 'keynote';
    
    const trackLabel = isKeynoteSession(s) ? 'Keynote' : (s.Track || (isSessionStyleEvent(s) ? 'General' : ''));
    const tColor = getSessionAccentColor(s, trackLabel);
    const isStarred = starredSessions.includes(s.uid);
    const isDesktopInlineKeynote = isKeynoteSession(s) && !showRoom && currentView !== 'starred';
    const hasDetails = Boolean(s.Abstract || s.Authors || s.Affiliation || s.room);
    const isWideTitle = s.room === 'Grand Ballroom - Salons A-D' || trackLabel.toLowerCase().includes('sponsor');
    const authorsText = (s.Authors && s.Authors !== 'nan') ? s.Authors : '';
    const abstractText = (s.Abstract && String(s.Abstract).toLowerCase() !== 'nan') ? String(s.Abstract).trim() : '';
    const durationText = (s.SessionLength && s.SessionLength !== 'nan') ? String(s.SessionLength) : '';
    if (hasDetails) card.classList.add('has-details');
    if (isWideTitle) card.classList.add('wide-title-card');
    if (isDesktopInlineKeynote && abstractText) card.classList.add('has-inline-keynote-abstract');
    
    // Track stripe
    const stripe = document.createElement('div');
    stripe.className = 'track-stripe';
    stripe.style.background = tColor;
    card.appendChild(stripe);
    
    // Top row: track badge + star
    const topRow = document.createElement('div');
    topRow.className = 'card-top';
    
    if (showRoom && s.room) {
        topRow.classList.add('has-room');
        const roomSpan = document.createElement('div');
        roomSpan.className = 'room-name-mobile';
        roomSpan.textContent = s.room;
        topRow.appendChild(roomSpan);
    }
    
    const trackBadge = document.createElement('span');
    trackBadge.className = 'track-badge';
    trackBadge.style.color = tColor;
    trackBadge.textContent = trackLabel;
    topRow.appendChild(trackBadge);
    
    const starBtn = document.createElement('button');
    starBtn.className = 'star-btn' + (isStarred ? ' active' : '');
    starBtn.innerHTML = isStarred ? '★' : '☆';
    starBtn.title = isStarred ? 'Remove from schedule' : 'Add to schedule';
    // Prevent the parent card's press/active animation from firing when the star is tapped.
    const stopBubble = (e) => e.stopPropagation();
    starBtn.addEventListener('mousedown', stopBubble);
    starBtn.addEventListener('pointerdown', stopBubble);
    starBtn.addEventListener('touchstart', stopBubble, { passive: true });
    starBtn.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (currentView === 'starred') {
            // In My Schedule, the star is a non-interactive indicator.
            // Selection happens via the card itself in edit mode.
            return;
        }
        toggleStar(s.uid, starBtn);
    };
    topRow.appendChild(starBtn);
    card.appendChild(topRow);
    
    // Title
    const title = document.createElement('div');
    title.className = 'session-title';
    title.dataset.fullTitle = s.Title || '';
    title.textContent = s.Title;
    card.appendChild(title);

    if (isDesktopInlineKeynote && abstractText) {
        const abstract = document.createElement('div');
        abstract.className = 'keynote-abstract';
        abstract.textContent = abstractText;
        card.appendChild(abstract);
    }
    
    if (authorsText || durationText) {
        const bottom = document.createElement('div');
        bottom.className = 'card-bottom';
        if (authorsText) bottom.classList.add('has-author-fade');

        const authors = document.createElement('div');
        authors.className = 'session-authors';
        authors.textContent = authorsText;
        bottom.appendChild(authors);

        if (durationText) {
            const dur = document.createElement('span');
            dur.className = 'duration-tag';
            dur.textContent = durationText;
            bottom.appendChild(dur);
        }
        card.appendChild(bottom);
    }

    if (hasDetails) {
        card.onclick = () => {
            if (currentView === 'starred' && isStarredEditMode) {
                toggleStarredRemoval(s.uid, card);
                return;
            }
            openSessionDetails(s, card);
        };
    }
    
    return card;
}

// ─── FILTERS ───
function applyFilters() {
    searchQuery = document.getElementById('searchBar').value.toLowerCase().trim();
    const shouldUseGlobalSearch = currentView !== 'starred' && searchQuery !== '';
    if (!suppressSearchRerender && (shouldUseGlobalSearch || (isGlobalSearchMode && !shouldUseGlobalSearch))) {
        renderSchedule();
        return;
    }

    const isDesktopTimeline = currentView !== 'starred' && !isMobileLayoutViewport();
    const shouldFadeTrackMismatches = isDesktopTimeline && activeTrackFilters.size > 0;
    
    document.querySelectorAll('.session-card, .event-card').forEach(card => {
        const track = card.dataset.track || '';
        const isKeynoteSpecial = card.dataset.special === 'keynote';
        const isMedtronicCard = card.dataset.medtronic === 'true';
        const text = (card.dataset.title || '') + ' ' + (card.dataset.authors || '') + ' ' + track;

        const medtronicFilterActive = activeTrackFilters.has('__medtronic__');
        if (medtronicFilterActive) {
            const target = card.closest('.schedule-item, .mobile-card-wrap') || card;
            if (!isMedtronicCard) {
                if (isDesktopTimeline) {
                    target.classList.add('track-faded');
                } else {
                    target.style.display = 'none';
                }
            } else {
                target.style.display = getVisibleDisplay(card);
                target.classList.remove('track-faded');
            }
            return;
        }

        const trackOk = isKeynoteSpecial || activeTrackFilters.size === 0 || activeTrackFilters.has(
            [...activeTrackFilters].find(f => f.toLowerCase() === track) || ''
        ) || activeTrackFilters.has(
            [...Object.keys(trackColors)].find(k => track.includes(k))
                ? [...activeTrackFilters].find(f => f.toLowerCase().includes(track) || track.includes(f.toLowerCase()))
                : null
        ) || checkTrackMatch(track);
        
        const searchOk = !searchQuery || text.includes(searchQuery);

        const visibleDisplay = getVisibleDisplay(card);
        const target = card.closest('.schedule-item, .mobile-card-wrap') || card;

        if (!searchOk) {
            target.style.display = 'none';
            target.classList.remove('track-faded');
            return;
        }

        target.style.display = visibleDisplay;

        if (shouldFadeTrackMismatches) {
            target.classList.toggle('track-faded', !trackOk);
        } else {
            target.classList.remove('track-faded');
            if (!trackOk) {
                target.style.display = 'none';
            }
        }
    });

    document.querySelectorAll('.mobile-time-group, .time-row').forEach(row => {
        const visibleItems = row.querySelectorAll('.session-card, .event-card');
        const hasVisible = [...visibleItems].some(item => {
            const target = item.closest('.schedule-item, .mobile-card-wrap') || item;
            return target.style.display !== 'none';
        });
        row.style.display = hasVisible ? '' : 'none';
    });
    
    document.querySelectorAll('.room-header-cell').forEach(cell => {
        const room = cell.dataset.room;
        const colCells = document.querySelectorAll(`.schedule-item[data-room="${room}"]`);
        const hasVisible = [...colCells].some(c => c.style.display !== 'none');
        cell.classList.toggle('active-room', hasVisible && searchQuery !== '');
    });

    document.querySelectorAll('.timeline-slot-label, .timeline-divider').forEach(el => {
        const slot = el.dataset.slot;
        if (!slot) return;
        const hasVisible = [...document.querySelectorAll(`.schedule-item`)].some(item => {
            if (item.style.display === 'none') return false;
            const gridRow = item.style.gridRow || '';
            return gridRow.startsWith(`${slot} /`) || gridRow === slot;
        });
        el.style.opacity = hasVisible || !searchQuery ? '1' : '0.28';
    });

    updateScrollDateTimeIndicator();
}

function updateScrollDateTimeIndicator() {
    if (!scrollDateTimeIndicator || !scrollIndicatorRow) return;
    const gridOuter = document.getElementById('gridOuter');

    const hideDayLabel = () => {
        if (scrollIndicatorDayLabel) scrollIndicatorDayLabel.classList.remove('show');
    };

    const resetScrollIndicatorAnimationState = () => {
        scrollIndicatorAnimationToken += 1;
        scrollDateTimeIndicator.classList.remove('time-push');
        const wrap = scrollDateTimeIndicator.querySelector('.scroll-indicator-time-wrap');
        if (wrap) {
            wrap.querySelectorAll('.scroll-indicator-time.next').forEach(el => el.remove());
        }
        scrollIndicatorTimeAnimating = false;
        scrollIndicatorPendingTime = null;
    };

    // Use native sticky rows for My Schedule (day headings and time labels),
    // so each new date naturally pushes the previous one.
    const isStarredDesktop = (currentView === 'starred') && !isMobileLayoutViewport();
    if (isStarredDesktop) {
        scrollDateTimeIndicator.classList.remove('show');
        scrollIndicatorRow.classList.remove('active');
        scrollIndicatorRow.classList.remove('is-starred');
        gridOuter?.classList.remove('scroll-indicator-active');
        hideDayLabel();
        resetScrollIndicatorAnimationState();
        scrollIndicatorRow.style.top = '';
        return;
    }

    // On mobile we use native sticky time labels (.mobile-time-group .time-col)
    // instead of the overlay indicator, so rows push each other naturally.
    const enabled = false;
    if (!enabled) {
        scrollDateTimeIndicator.classList.remove('show');
        scrollIndicatorRow.classList.remove('active');
        gridOuter?.classList.remove('scroll-indicator-active');
        hideDayLabel();
        resetScrollIndicatorAnimationState();
        scrollIndicatorRow.style.top = '';
        return;
    }

    const headerRect = document.querySelector('header')?.getBoundingClientRect();
    const filtersEl = document.getElementById('trackFilters');
    const filtersRect = filtersEl?.getBoundingClientRect();
    const filtersVisible = !!(filtersEl && filtersEl.childElementCount > 0 && filtersRect && filtersRect.height > 0);
    const stickyTop = Math.max(
        0,
        filtersVisible
            ? Math.round(filtersRect.bottom)
            : (headerRect ? Math.max(0, Math.round(headerRect.height) - 1) : 8)
    );
    const isStarredView = currentView === 'starred';
    scrollIndicatorRow.classList.remove('starred-floating');
    scrollDateTimeIndicator.classList.remove('starred-floating-pill');
    scrollIndicatorRow.classList.toggle('is-starred', isStarredView);
    scrollIndicatorRow.style.top = `${stickyTop}px`;
    // topAnchor: switch when a time row's top crosses the sticky zone boundary.
    // Using stickyTop directly is the most accurate — it's where the header/filter
    // ends and the sticky overlay begins, regardless of pill or indicator height.
    const topAnchor = stickyTop;
    const dayAnchor = stickyTop;

    const container = document.getElementById('scheduleContainer');
    if (!container) {
        scrollDateTimeIndicator.classList.remove('show');
        scrollIndicatorRow.classList.remove('active');
        gridOuter?.classList.remove('scroll-indicator-active');
        hideDayLabel();
        resetScrollIndicatorAnimationState();
        return;
    }

    const dayHeadings = [...container.querySelectorAll('.day-heading[data-day]')]
        .filter(el => el.style.display !== 'none');
    let activeDay = '';
    if (dayHeadings.length > 0) {
        const passedHeading = dayHeadings
            .filter(el => el.getBoundingClientRect().top <= dayAnchor)
            .pop();
        const effectiveHeading = passedHeading || (isStarredView ? dayHeadings[0] : null);
        if (!effectiveHeading) {
            scrollDateTimeIndicator.classList.remove('show');
            scrollIndicatorRow.classList.remove('active');
            gridOuter?.classList.remove('scroll-indicator-active');
            hideDayLabel();
            resetScrollIndicatorAnimationState();
            return;
        }
        activeDay = (effectiveHeading.dataset.day || effectiveHeading.textContent || '').trim();
    }

    // Desktop My Schedule: day at top comes from day headings, independent of time-row matching.
    if (isStarredView && !isMobileLayoutViewport()) {
        if (scrollIndicatorDayLabel) {
            scrollIndicatorDayLabel.textContent = activeDay;
            scrollIndicatorDayLabel.classList.toggle('show', !!activeDay);
        }
        const scrollIndicatorInner = document.getElementById('scrollIndicatorInner');
        if (scrollIndicatorInner) scrollIndicatorInner.style.paddingLeft = '';
        scrollDateTimeIndicator.style.width = '';
        scrollDateTimeIndicator.style.maxWidth = '';
        scrollDateTimeIndicator.classList.remove('show');
        resetScrollIndicatorAnimationState();
        scrollIndicatorRow.classList.add('active');
        gridOuter?.classList.remove('scroll-indicator-active');
        return;
    }

    const candidates = [...container.querySelectorAll('.mobile-time-group[data-day][data-time], .time-row[data-day][data-time]')]
        .filter(el => el.style.display !== 'none')
        .filter(el => !activeDay || (el.dataset.day || '').trim() === activeDay);
    if (candidates.length === 0) {
        scrollDateTimeIndicator.classList.remove('show');
        scrollIndicatorRow.classList.remove('active');
        gridOuter?.classList.remove('scroll-indicator-active');
        hideDayLabel();
        resetScrollIndicatorAnimationState();
        return;
    }

    // Switch only when a row has actually crossed the anchor line.
    // This avoids preemptive switching caused by score-based lookahead.
    const passedCandidate = candidates
        .filter(el => el.getBoundingClientRect().top <= topAnchor)
        .pop();
    const selected = passedCandidate || candidates[0];

    // On single-day schedules, keep the indicator hidden only while the list is still at the top.
    // Use the first visible row as the reference to avoid mid-scroll flicker when selection jumps.
    if (currentView !== 'starred' && !isGlobalSearchMode) {
        const firstVisibleTop = candidates[0].getBoundingClientRect().top;
        if (firstVisibleTop >= (dayAnchor - 1)) {
            scrollDateTimeIndicator.classList.remove('show');
            scrollIndicatorRow.classList.remove('active');
            gridOuter?.classList.remove('scroll-indicator-active');
            hideDayLabel();
            resetScrollIndicatorAnimationState();
            return;
        }
    }

    // Align the indicator horizontally to match the actual time-col position in the DOM.
    const scrollIndicatorInner = document.getElementById('scrollIndicatorInner');
    const timeColEl = selected.querySelector('.time-col');
    if (timeColEl && scrollIndicatorInner) {
        const colRect = timeColEl.getBoundingClientRect();
        scrollIndicatorInner.style.paddingLeft = Math.round(colRect.left) + 'px';
        scrollDateTimeIndicator.style.width = Math.round(colRect.width) + 'px';
        scrollDateTimeIndicator.style.maxWidth = Math.round(colRect.width) + 'px';
    } else if (scrollIndicatorInner) {
        scrollIndicatorInner.style.paddingLeft = '';
        scrollDateTimeIndicator.style.width = '';
        scrollDateTimeIndicator.style.maxWidth = '';
    }

    const dayLabel = (selected.dataset.day || '').trim();
    const timeLabel = formatStartTime((selected.dataset.time || '').trim());
    const showCompactDay = isGlobalSearchMode;
    const compactDay = showCompactDay ? formatCompactDayLabel(dayLabel) : '';
    const twoLineMode = false;
    const labelText = timeLabel || [compactDay, timeLabel].filter(Boolean).join(' | ');

    if (isStarredView && scrollIndicatorDayLabel) {
        scrollIndicatorDayLabel.textContent = dayLabel;
        scrollIndicatorDayLabel.classList.add('show');
    } else {
        hideDayLabel();
    }

    // Desktop My Schedule uses native sticky time labels in-row; keep only day at top.
    if (isStarredView && !isMobileLayoutViewport()) {
        scrollDateTimeIndicator.classList.remove('show');
        resetScrollIndicatorAnimationState();
        scrollIndicatorRow.classList.add('active');
        gridOuter?.classList.remove('scroll-indicator-active');
        return;
    }

    scrollDateTimeIndicator.classList.toggle('two-line', twoLineMode);

    if (!labelText) {
        scrollDateTimeIndicator.classList.remove('show');
        scrollIndicatorRow.classList.remove('active');
        gridOuter?.classList.remove('scroll-indicator-active');
        hideDayLabel();
        resetScrollIndicatorAnimationState();
        return;
    }

    const timeWrap = scrollDateTimeIndicator.querySelector('.scroll-indicator-time-wrap');
    let timeCurrent = scrollDateTimeIndicator.querySelector('.scroll-indicator-time.current');

    // First render should be a direct paint (no push animation), otherwise
    // rapid startup updates can briefly show two sticky times.
    if (!scrollIndicatorCurrentLabel && timeCurrent) {
        if (timeWrap) {
            timeWrap.querySelectorAll('.scroll-indicator-time.next').forEach(el => el.remove());
        }
        timeCurrent.textContent = labelText;
        scrollDateTimeIndicator.classList.remove('time-push');
        scrollIndicatorCurrentLabel = labelText;
        scrollIndicatorPendingTime = null;
        scrollIndicatorTimeAnimating = false;
    } else
    if (twoLineMode) {
        if (timeWrap) {
            timeWrap.querySelectorAll('.scroll-indicator-time.next').forEach(el => el.remove());
        }
        if (timeCurrent) {
            timeCurrent.textContent = labelText;
        }
        scrollDateTimeIndicator.classList.remove('time-push');
        scrollIndicatorCurrentLabel = labelText;
        scrollIndicatorPendingTime = null;
        scrollIndicatorTimeAnimating = false;
    } else if (labelText !== scrollIndicatorCurrentLabel) {
        if (scrollIndicatorTimeAnimating) {
            scrollIndicatorPendingTime = labelText;
        } else if (timeWrap && timeCurrent) {
            timeWrap.querySelectorAll('.scroll-indicator-time.next').forEach(el => el.remove());
            const animationToken = ++scrollIndicatorAnimationToken;
            const next = document.createElement('span');
            next.className = 'scroll-indicator-time next';
            next.textContent = labelText;
            timeWrap.appendChild(next);
            scrollIndicatorTimeAnimating = true;
            requestAnimationFrame(() => {
                if (animationToken !== scrollIndicatorAnimationToken) return;
                scrollDateTimeIndicator.classList.add('time-push');
            });
            window.setTimeout(() => {
                if (animationToken !== scrollIndicatorAnimationToken) return;
                if (timeCurrent && timeCurrent.parentElement) timeCurrent.remove();
                next.classList.remove('next');
                next.classList.add('current');
                scrollDateTimeIndicator.classList.remove('time-push');
                scrollIndicatorCurrentLabel = labelText;
                scrollIndicatorTimeAnimating = false;
                timeCurrent = next;

                if (scrollIndicatorPendingTime && scrollIndicatorPendingTime !== scrollIndicatorCurrentLabel) {
                    const pending = scrollIndicatorPendingTime;
                    scrollIndicatorPendingTime = null;
                    const pendingToken = ++scrollIndicatorAnimationToken;
                    const pendingNext = document.createElement('span');
                    pendingNext.className = 'scroll-indicator-time next';
                    pendingNext.textContent = pending;
                    timeWrap.appendChild(pendingNext);
                    scrollIndicatorTimeAnimating = true;
                    requestAnimationFrame(() => {
                        if (pendingToken !== scrollIndicatorAnimationToken) return;
                        scrollDateTimeIndicator.classList.add('time-push');
                    });
                    window.setTimeout(() => {
                        if (pendingToken !== scrollIndicatorAnimationToken) return;
                        if (timeCurrent && timeCurrent.parentElement) timeCurrent.remove();
                        pendingNext.classList.remove('next');
                        pendingNext.classList.add('current');
                        scrollDateTimeIndicator.classList.remove('time-push');
                        scrollIndicatorCurrentLabel = pending;
                        scrollIndicatorTimeAnimating = false;
                    }, 210);
                }
            }, 210);
        }
    }

    scrollIndicatorRow.classList.add('active');
    scrollDateTimeIndicator.classList.add('show');
    if (isStarredView) {
        gridOuter?.classList.remove('scroll-indicator-active');
    } else {
        gridOuter?.classList.add('scroll-indicator-active');
    }
}

function scheduleScrollDateTimeIndicatorUpdate() {
    if (scrollIndicatorRafPending) return;
    scrollIndicatorRafPending = true;
    requestAnimationFrame(() => {
        scrollIndicatorRafPending = false;
        updateScrollDateTimeIndicator();
    });
}

function checkTrackMatch(cardTrack) {
    if (activeTrackFilters.size === 0) return true;
    for (const f of activeTrackFilters) {
        const fLower = f.toLowerCase();
        if (cardTrack.includes(fLower) || fLower.includes(cardTrack)) return true;
        // check via color keys
        for (const k of Object.keys(trackColors)) {
            if (fLower.includes(k) && cardTrack.includes(k)) return true;
        }
    }
    return false;
}

// ─── HELPERS ───
function formatTime(t) {
    // Shorten for display: "8:00 AM" → "8:00"
    return t.replace(' AM', 'a').replace(' PM', 'p');
}

function formatStartTime(t) {
    const [start] = String(t || '').split(/\s*[–-]\s*/, 1);
    return formatTime(start);
}

function formatCompactDayLabel(dayLabel) {
    const trimmed = String(dayLabel || '').trim();
    if (!trimmed) return '';
    const [dayName, datePart = ''] = trimmed.split(/\s+/, 2);
    const shortDay = dayName ? dayName.slice(0, 3).toUpperCase() : '';
    return [shortDay, datePart].filter(Boolean).join(' ');
}

function formatStackedDayLabel(dayLabel) {
    const trimmed = String(dayLabel || '').trim();
    if (!trimmed) return { dayShort: '', datePart: '' };
    const [dayName = '', datePart = ''] = trimmed.split(/\s+/, 2);
    const shortUpper = dayName ? dayName.slice(0, 3).toUpperCase() : '';
    const dayShort = shortUpper ? (shortUpper[0] + shortUpper.slice(1).toLowerCase()) : '';
    return { dayShort, datePart };
}

function formatUltraCompactDayLabel(dayLabel) {
    const trimmed = String(dayLabel || '').trim();
    if (!trimmed) return '';
    const [dayNameRaw, datePart = ''] = trimmed.split(/\s+/, 2);
    const dayName = (dayNameRaw || '').toLowerCase();
    const dayMap = {
        monday: 'MO',
        tuesday: 'TU',
        wednesday: 'WE',
        thursday: 'TH',
        friday: 'FR',
        saturday: 'SA',
        sunday: 'SU'
    };
    const shortDay = dayMap[dayName] || (dayNameRaw ? dayNameRaw.slice(0, 2).toUpperCase() : '');
    return [shortDay, datePart].filter(Boolean).join(' ');
}

function toggleStar(uid, starEl) {
    const idx = starredSessions.indexOf(uid);
    const wasStarred = idx > -1;
    if (wasStarred) {
        starredSessions.splice(idx, 1);
        starEl.classList.remove('active');
        starEl.innerHTML = '☆';
        starEl.title = 'Add to schedule';
    } else {
        starredSessions.push(uid);
        starEl.classList.add('active');
        starEl.innerHTML = '★';
        starEl.title = 'Remove from schedule';
    }
    localStorage.setItem('incose_2026_stars', JSON.stringify(starredSessions));
    // Either direction (add OR remove) can change the conflict key
    // for an overlap that contains the toggled uid. If the user has
    // already resolved a sibling overlap at the same start time in
    // favor of a session that's still starred, carry that
    // resolution forward to the new key so the system doesn't lose
    // track of the choice.
    try {
        const newConflicts = computeStarredConflicts(collectAllWindowed());
        let mutated = false;
        newConflicts.forEach(c => {
            if (c.chosen) return; // already resolved at the new key
            const tStr = String(c.start.getTime());
            for (const oldKey of Object.keys(conflictResolutions)) {
                if (!oldKey.startsWith(tStr + '|')) continue;
                if (oldKey === c.key) continue;
                const chosenUid = conflictResolutions[oldKey];
                if (c.uids.includes(chosenUid)) {
                    conflictResolutions[c.key] = chosenUid;
                    mutated = true;
                    break;
                }
            }
        });
        if (mutated) saveConflictResolutions();
    } catch (_) { /* best-effort migration */ }
    if (currentView === 'starred' || currentView === 'now') renderSchedule();
}

function switchDay(viewId, btn) {
    if (currentView === 'starred' && viewId !== 'starred') {
        isStarredEditMode = false;
        pendingRemovals.clear();
    }
    currentView = viewId;
    try { localStorage.setItem('incose_2026_currentView', viewId); } catch (e) { /* ignore */ }
    activeTrackFilters.clear();
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderTrackFilters();
    renderSchedule();
}

function applyMobileLayout(skipTopbarModeCheck = false, skipViewportModeRerender = false) {
    const viewportMode = skipViewportModeRerender ? lastViewportMode : getViewportMode();
    const isMobile = viewportMode === 'mobile';

    const topbarModeChanged = skipTopbarModeCheck ? false : updateTopbarMode();
    if (topbarModeChanged) {
        // Re-measure on next frame after class/style changes settle.
        requestAnimationFrame(() => {
            applyMobileLayout();
            requestAnimationFrame(updateSessionTitleLayout);
        });
        return;
    }
    
    const stackEl = document.getElementById('headerStickyStack');
    const desktopRoomStickyTop = stackEl ? stackEl.offsetHeight : 0;
    document.documentElement.style.setProperty('--desktop-room-sticky-top', `${desktopRoomStickyTop}px`);
    document.documentElement.style.setProperty('--mobile-time-sticky-top', `${desktopRoomStickyTop}px`);

    // Keep first timeline row clear of the sticky room bar on desktop.
    document.querySelectorAll('.schedule-canvas').forEach(canvas => {
        const roomHeader = canvas.querySelector('.room-header-row');
        const grid = canvas.querySelector('.schedule-grid');
        const shell = canvas.closest('.schedule-shell');
        if (!grid) return;
        if (isMobile || !roomHeader || !shell) {
            grid.style.paddingTop = '0px';
            if (roomHeader) {
                roomHeader.style.visibility = 'hidden';
                roomHeader.style.transform = '';
                roomHeader.style.left = '';
                roomHeader.style.width = '';
            }
            return;
        }

        grid.style.paddingTop = `${roomHeader.offsetHeight + 1}px`;

        const shellRect = shell.getBoundingClientRect();
        const visibleInViewport = shellRect.bottom > (desktopRoomStickyTop + roomHeader.offsetHeight + 4) && shellRect.top < window.innerHeight;
        if (!visibleInViewport) {
            roomHeader.style.visibility = 'hidden';
            return;
        }

        roomHeader.style.visibility = 'visible';
        roomHeader.style.top = `${desktopRoomStickyTop}px`;
        const canvasRect = canvas.getBoundingClientRect();
        roomHeader.style.left = `${Math.round(canvasRect.left)}px`;
        roomHeader.style.width = `${Math.round(canvas.scrollWidth)}px`;
        roomHeader.style.transform = '';
    });

    if (activeDetailsUid && activeDetailsAnchor && document.body.contains(activeDetailsAnchor)) {
        positionDetailsPanel(activeDetailsAnchor);
        syncDetailsScrollState();
    } else if (activeDetailsUid && !activeDetailsAnchor) {
        closeSessionDetails();
    }

    if (!skipViewportModeRerender && viewportMode !== lastViewportMode) {
        lastViewportMode = viewportMode;
        renderSchedule();
        return;
    }

    updateScrollDateTimeIndicator();
}

function applyScrollLayout() {
    applyMobileLayout(true, true);
}

let viewportRefreshQueued = false;
let viewportSettlingActive = false;

function startViewportSettlingChecks() {
    if (viewportSettlingActive) return;
    viewportSettlingActive = true;

    let passesRemaining = 8;
    let lastMode = getViewportMode();
    let lastWidth = Math.round(getEffectiveViewportWidth());
    let stableCount = 0;

    const runPass = () => {
        applyMobileLayout();
        requestAnimationFrame(updateSessionTitleLayout);

        const modeNow = getViewportMode();
        const widthNow = Math.round(getEffectiveViewportWidth());
        if (modeNow === lastMode && Math.abs(widthNow - lastWidth) <= 1) {
            stableCount += 1;
        } else {
            stableCount = 0;
            lastMode = modeNow;
            lastWidth = widthNow;
        }

        passesRemaining -= 1;
        if (passesRemaining <= 0 || stableCount >= 2) {
            viewportSettlingActive = false;
            return;
        }

        requestAnimationFrame(runPass);
    };

    requestAnimationFrame(runPass);
}

function queueViewportRefresh() {
    if (viewportRefreshQueued) return;
    viewportRefreshQueued = true;
    requestAnimationFrame(() => {
        viewportRefreshQueued = false;
        lastViewportRefreshWidth = Math.round(getEffectiveViewportWidth());
        applyMobileLayout();
        requestAnimationFrame(updateSessionTitleLayout);
        startViewportSettlingChecks();
    });
}

function queueViewportRefreshIfWidthChanged() {
    const widthNow = Math.round(getEffectiveViewportWidth());
    if (Math.abs(widthNow - lastViewportRefreshWidth) <= 24) return;
    queueViewportRefresh();
}

detailsBackdrop.addEventListener('click', closeSessionDetails);
window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeSessionDetails();
});
window.addEventListener('resize', queueViewportRefresh);
window.addEventListener('orientationchange', queueViewportRefresh);
window.addEventListener('focus', queueViewportRefresh);
window.addEventListener('focus', () => {
    if (currentView === 'now') renderSchedule();
    highlightStarredCurrent();
    updateJumpToNowVisibility();
});
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        queueViewportRefresh();
        if (currentView === 'now') renderSchedule();
        highlightStarredCurrent();
        updateJumpToNowVisibility();
    }
});
if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', queueViewportRefreshIfWidthChanged);
}
window.addEventListener('scroll', applyScrollLayout, { passive: true });
window.addEventListener('scroll', scheduleScrollDateTimeIndicatorUpdate, { passive: true });
window.addEventListener('scroll', updateJumpToNowVisibility, { passive: true });

init();
// Delay to let DOM render first
requestAnimationFrame(() => requestAnimationFrame(() => {
    applyMobileLayout();
    updateSessionTitleLayout();
    updateScrollDateTimeIndicator();
}));

// ─── PWA: register service worker ───
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Use a relative URL so it works under any GitHub Pages base path.
        navigator.serviceWorker.register('sw.js').then((reg) => {
            // When a new SW is found, activate it on next load.
            reg.addEventListener('updatefound', () => {
                const sw = reg.installing;
                if (!sw) return;
                sw.addEventListener('statechange', () => {
                    if (sw.state === 'installed' && navigator.serviceWorker.controller) {
                        // New version available; will take effect after refresh.
                    }
                });
            });
        }).catch((err) => {
            console.warn('Service worker registration failed:', err);
        });
    });
}
