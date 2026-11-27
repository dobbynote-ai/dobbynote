/* 도비 아케이드 · dobbynote.com
   반응 대결 · 10초 광클 · 도비 뽑기 · 업적 · 8비트 소리
   서버 없음 · 외부 요청 없음 · 기록은 이 브라우저 localStorage에만. */
(function () {
  "use strict";

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var reduced = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  /* ---------------------------------------------------------------- 저장소 */
  var KEY = "dobbynote.arcade.v1";
  var FRESH = {
    xp: 0, coins: 3, bestMs: null, bestClicks: 0, streak: 0, bestStreak: 0,
    badges: [], cards: [], plays: { reflex: 0, frenzy: 0, gacha: 0 }, sound: true
  };

  function copyFresh() { return JSON.parse(JSON.stringify(FRESH)); }

  var S = (function () {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) { return copyFresh(); }
      var p = JSON.parse(raw);
      var s = copyFresh();
      if (p && typeof p === "object") {
        if (typeof p.xp === "number") { s.xp = p.xp; }
        if (typeof p.coins === "number") { s.coins = p.coins; }
        if (typeof p.bestMs === "number") { s.bestMs = p.bestMs; }
        if (typeof p.bestClicks === "number") { s.bestClicks = p.bestClicks; }
        if (typeof p.streak === "number") { s.streak = p.streak; }
        if (typeof p.bestStreak === "number") { s.bestStreak = p.bestStreak; }
        if (Array.isArray(p.badges)) { s.badges = p.badges.slice(0, 40); }
        if (Array.isArray(p.cards)) { s.cards = p.cards.slice(0, 40); }
        if (p.plays && typeof p.plays === "object") {
          ["reflex", "frenzy", "gacha"].forEach(function (k) {
            if (typeof p.plays[k] === "number") { s.plays[k] = p.plays[k]; }
          });
        }
        if (typeof p.sound === "boolean") { s.sound = p.sound; }
      }
      return s;
    } catch (e) { return copyFresh(); }
  })();

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* 저장 못 해도 게임은 돌아갑니다 */ }
  }

  function level() {
    var n = Math.floor(S.xp / 100) + 1;
    return { n: n, pct: S.xp % 100 };
  }

  /* ---------------------------------------------------------------- 8비트 소리 */
  var AudioFX = (function () {
    var ctx = null;
    function ac() {
      if (ctx) { return ctx; }
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) { return null; }
      try { ctx = new AC(); } catch (e) { ctx = null; }
      return ctx;
    }
    function tone(freq, dur, opt) {
      if (!S.sound) { return; }
      var c = ac();
      if (!c) { return; }
      opt = opt || {};
      var t0 = c.currentTime + (opt.delay || 0);
      var osc = c.createOscillator();
      var gain = c.createGain();
      osc.type = opt.type || "square";
      osc.frequency.setValueAtTime(freq, t0);
      if (opt.to) { osc.frequency.exponentialRampToValueAtTime(Math.max(40, opt.to), t0 + dur); }
      var vol = typeof opt.vol === "number" ? opt.vol : 0.06;
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.03);
    }
    return {
      tap: function () { tone(660, 0.05, { vol: 0.035 }); },
      coin: function () { tone(988, 0.07, { vol: 0.05 }); tone(1319, 0.12, { delay: 0.07, vol: 0.05 }); },
      go: function () { tone(880, 0.08, { vol: 0.07 }); tone(1320, 0.14, { delay: 0.08, vol: 0.07 }); },
      win: function () {
        [523, 659, 784, 1046].forEach(function (f, i) { tone(f, 0.12, { delay: i * 0.085, vol: 0.06 }); });
      },
      lose: function () { tone(300, 0.22, { to: 110, type: "sawtooth", vol: 0.055 }); },
      foul: function () { tone(200, 0.14, { to: 90, type: "square", vol: 0.06 }); },
      rolld: function (i) { tone(420 + (i % 6) * 70, 0.04, { vol: 0.03 }); },
      levelUp: function () {
        [523, 659, 784, 1046, 1318].forEach(function (f, i) { tone(f, 0.14, { delay: i * 0.09, vol: 0.055 }); });
      },
      click: function (n) { tone(520 + (n % 5) * 90, 0.035, { vol: 0.028 }); }
    };
  })();

  /* ---------------------------------------------------------------- 업적 */
  var BADGES = [
    { id: "first", ico: "🪙", name: "INSERT COIN", desc: "첫 게임 시작" },
    { id: "flash", ico: "⚡", name: "번개 손", desc: "0.25초 안에 승리" },
    { id: "clicker", ico: "🖱️", name: "광클러", desc: "10초에 60회" },
    { id: "lucky", ico: "🍀", name: "행운아", desc: "SR 이상 뽑기" },
    { id: "ssr", ico: "🌟", name: "초럭키", desc: "SSR 이상 뽑기" },
    { id: "combo3", ico: "🔥", name: "3연승", desc: "반응 대결 3연승" },
    { id: "allgames", ico: "🤖", name: "도비 친구", desc: "세 게임 모두 해보기" },
    { id: "collector", ico: "📚", name: "도감 수집가", desc: "카드 5종 수집" }
  ];

  /* ---------------------------------------------------------------- 뽑기 카드 */
  var CARDS = [
    { id: "n1", g: "N", name: "종이컵 도비", line: "한 번 쓰고 버려집니다. 그래도 정직해요." },
    { id: "n2", g: "N", name: "영수증 뭉치", line: "석 달 뒤에 보면 아무것도 기억나지 않습니다." },
    { id: "n3", g: "N", name: "볼펜 뚜껑", line: "짝은 이미 세탁기로 떠났습니다." },
    { id: "n4", g: "N", name: "머리끈", line: "항상 하나는 없어요. 그래서 뽑혔습니다." },
    { id: "n5", g: "N", name: "택배 상자", line: "버리려다 접어 둔 그 상자입니다." },
    { id: "n6", g: "N", name: "각티슈 한 장", line: "아껴 쓰라는 말, 저도 들었습니다." },
    { id: "n7", g: "N", name: "장바구니 영수증", line: "총 18,400원. 뭘 샀는지는 비밀입니다." },
    { id: "n8", g: "N", name: "무료 스티커", line: "붙일 데가 없어서 여기 있습니다." },
    { id: "r1", g: "R", name: "수첩 도비", line: "오늘 할 일 세 개 중 하나만 적혀 있습니다." },
    { id: "r2", g: "R", name: "형광펜 도비", line: "중요한 데 칠했는데 다시 보니 별거 아닙니다." },
    { id: "r3", g: "R", name: "무선 이어폰 한 짝", line: "나머지 한 짝은 어딘가에서 잘 지냅니다." },
    { id: "r4", g: "R", name: "커피 얼룩", line: "책상 위에 남은 오늘의 서명." },
    { id: "sr1", g: "SR", name: "번개 도비", line: "0.18초. 이건 자랑입니다." },
    { id: "sr2", g: "SR", name: "야근 도비", line: "새벽 두 시에 제일 말이 많아집니다." },
    { id: "sr3", g: "SR", name: "계약서 도비", line: "읽지 않은 약관은 없습니다. …아마도." },
    { id: "ssr1", g: "SSR", name: "황금 도비", line: "광택이 납니다. 기능은 똑같습니다." },
    { id: "ssr2", g: "SSR", name: "새벽 세 시 도비", line: "이 시간엔 저도 말이 이상해집니다." },
    { id: "ur1", g: "UR", name: "전설의 도비", line: "확률 1%. 나와도 아무 일도 없습니다. 그게 전설이죠." }
  ];

  var GRADE_XP = { N: 5, R: 10, SR: 25, SSR: 60, UR: 150 };
  var GRADE_WEIGHT = [["N", 55], ["R", 26], ["SR", 12.5], ["SSR", 5.5], ["UR", 1]];

  /* ---------------------------------------------------------------- 화면 효과 */
  var toastBox = $("#toasts");

  function toast(ico, title, text) {
    if (!toastBox) { return; }
    var el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = '<span class="ico" aria-hidden="true"></span><span><b></b><span></span></span>';
    el.querySelector(".ico").textContent = ico;
    el.querySelector("b").textContent = title;
    el.querySelector("b + span").textContent = text;
    toastBox.appendChild(el);
    window.setTimeout(function () {
      if (el.parentNode) { el.parentNode.removeChild(el); }
    }, 3100);
  }

  function shake(el) {
    if (reduced || !el) { return; }
    el.classList.remove("shake");
    void el.offsetWidth;
    el.classList.add("shake");
  }

  function floatXP(text, el) {
    if (!el || reduced) { return; }
    var r = el.getBoundingClientRect();
    var div = document.createElement("div");
    div.className = "float-xp";
    div.textContent = text;
    div.style.left = (r.left + r.width / 2) + "px";
    div.style.top = (r.top + 18) + "px";
    document.body.appendChild(div);
    window.setTimeout(function () { if (div.parentNode) { div.parentNode.removeChild(div); } }, 1000);
  }

  function unlock(id) {
    if (S.badges.indexOf(id) !== -1) { return false; }
    S.badges.push(id);
    save();
    var b = null;
    BADGES.forEach(function (x) { if (x.id === id) { b = x; } });
    if (b) {
      toast(b.ico, "BADGE UNLOCKED", b.name + " — " + b.desc);
      AudioFX.levelUp();
    }
    renderBadges(id);
    render();
    return true;
  }

  function playCount(game) {
    S.plays[game] = (S.plays[game] || 0) + 1;
    unlock("first");
    if (S.plays.reflex > 0 && S.plays.frenzy > 0 && S.plays.gacha > 0) { unlock("allgames"); }
    save();
  }

  function addXP(n, el) {
    var before = level().n;
    S.xp = Math.max(0, S.xp + n);
    var after = level().n;
    save();
    if (after > before) {
      toast("⭐", "LEVEL UP", "LV." + after + " 달성");
      AudioFX.levelUp();
    }
    if (el && n > 0) { floatXP("+" + n + " XP", el); }
    render();
  }

  /* ---------------------------------------------------------------- 그리기 */
  function msText(v) {
    if (typeof v !== "number") { return "--"; }
    return (v / 1000).toFixed(3) + "초";
  }

  function renderBadges(justId) {
    var list = $("#badge-grid");
    if (!list) { return; }
    list.innerHTML = "";
    BADGES.forEach(function (b) {
      var got = S.badges.indexOf(b.id) !== -1;
      var li = document.createElement("li");
      li.className = "badge" + (got ? "" : " locked") + (justId === b.id ? " just" : "");
      li.innerHTML = '<span class="ico" aria-hidden="true"></span><span class="txt"><b></b><small></small></span>';
      li.querySelector(".ico").textContent = got ? b.ico : "🔒";
      li.querySelector("b").textContent = b.name;
      li.querySelector("small").textContent = b.desc;
      list.appendChild(li);
    });
  }

  function render() {
    var lv = level();
    var total = BADGES.length;

    setText("#hud-coins", S.coins);
    setText("#hud-level", "LV." + lv.n);
    setText("#hud-badges", S.badges.length + "/" + total);
    var fill = $("#hud-xp-fill");
    if (fill) { fill.style.width = lv.pct + "%"; }

    setText("#gacha-coins", S.coins);
    setText("#gacha-count", S.cards.length + "/" + CARDS.length);
    setText("#rec-reflex", S.bestMs ? msText(S.bestMs) : "--");
    setText("#rec-clicks", S.bestClicks + "회");
    setText("#rec-streak", S.bestStreak);
    setText("#rec-cards", S.cards.length + "/" + CARDS.length);
    setText("#rec-level", "LV." + lv.n + " · " + S.xp + " XP");
    setText("#rec-coins", S.coins);
    setText("#reflex-best", S.bestMs ? msText(S.bestMs) : "--");
    setText("#reflex-streak", S.streak);
    setText("#frenzy-best", S.bestClicks + "회");
    setText("#badge-counter", S.badges.length + "/" + total);

    var snd = $("#sound-toggle");
    if (snd) {
      snd.setAttribute("aria-pressed", S.sound ? "true" : "false");
      snd.setAttribute("aria-label", S.sound ? "소리 끄기" : "소리 켜기");
      snd.textContent = S.sound ? "🔊" : "🔇";
    }
  }

  function setText(sel, val) {
    var el = $(sel);
    if (el) { el.textContent = val; }
  }

  /* ---------------------------------------------------------------- 도비 대사 */
  var dobby = $("#dobby");
  var bubble = $("#dobby-bubble");
  var bubbleLine = $("#dobby-line");

  var LINES = {
    idle: [
      "어서 와요. 여기선 실력이 손가락에서 나옵니다.",
      "동전 넣는 칸은 없어요. 대신 열정을 넣으세요.",
      "저는 0.2초에 반응합니다. 사람은 보통 0.25초래요. …방금 자랑했습니다.",
      "뽑기에서 SSR 나오면 자랑하세요. 안 믿어줄 거지만요.",
      "게임이 안 되면 새로고침하세요. 그건 제 잘못이 아닙니다. 아마.",
      "여기 기록은 제가 안 봅니다. 브라우저가 기억해요.",
      "한 판만 하고 가는 사람은 없습니다. 제가 다 봤어요."
    ],
    happy: ["이겼네요. 인정. 근데 한 판 더 하실 거죠?", "기록 갱신! 제 수첩에 적어 두려다 말았습니다."],
    smug: ["이번엔 제가 빨랐습니다. 다음엔 다르겠죠.", "손가락이 잠깐 쉬었나 봐요. 저도 그런 날 있습니다."],
    shock: ["잠깐, 그건 반칙이에요! 초록불 전에 눌렀습니다.", "너무 빨라서 제가 놀랐습니다. 진짜로."],
    sad: ["기록이 지워졌습니다. …괜찮아요. 우리 다시 쌓죠."]
  };

  var lastMoodAt = 0;
  var idleIndex = 0;

  function setMood(mood, line) {
    if (dobby) { dobby.setAttribute("data-mood", mood); }
    if (line && bubbleLine) {
      bubbleLine.textContent = line;
      if (bubble && !reduced) {
        bubble.classList.remove("shake");
        void bubble.offsetWidth;
        bubble.classList.add("shake");
      }
    }
    lastMoodAt = Date.now();
  }

  window.setInterval(function () {
    if (!bubbleLine || Date.now() - lastMoodAt < 9000) { return; }
    idleIndex = (idleIndex + 1) % LINES.idle.length;
    if (dobby) { dobby.setAttribute("data-mood", "idle"); }
    bubbleLine.textContent = LINES.idle[idleIndex];
  }, 9000);

  /* ---------------------------------------------------------------- 오늘의 버프 */
  var BUFFS = [
    { n: "+1 손가락 예열", l: "한 판만 해도 손이 풀립니다. 두 판째부터가 진짜 실력이에요." },
    { n: "+2 반사신경", l: "오늘은 초록불이 조금 일찍 보일지도 모릅니다. 그런 날이 있습니다." },
    { n: "+1 행운", l: "뽑기는 마음이 급할수록 N이 나옵니다. 이건 제 경험담입니다." },
    { n: "+3 집중", l: "10초만 진짜로 집중해 보세요. 알림은 잠깐 무시하고요." },
    { n: "+1 여유", l: "0.01초 차이로 지는 날도 있습니다. 다음 라운드가 있으니까요." },
    { n: "+2 손목 보호", l: "광클은 세게가 아니라 빠르게. 힘 빼고 가볍게요." },
    { n: "+1 자존감", l: "오늘 기록이 어제보다 조금 나으면 그걸로 충분합니다." },
    { n: "+2 통찰", l: "확률표를 읽고 뽑으면 기분이 다릅니다. 안 나오는 건 똑같지만요." },
    { n: "+1 웃음", l: "N 카드가 다섯 장 연속으로 나오면 그건 그것대로 재능입니다." },
    { n: "+3 도전심", l: "기록은 깨라고 있는 겁니다. 제 최고 기록은 0.18초, 한번 넘어 보세요." },
    { n: "+1 체력", l: "한 판 쉬고 한 판. 그게 제일 오래 갑니다." },
    { n: "+2 눈치", l: "초록불이 오기 전에 누르면 반칙인데, 그 1초가 제일 길어요." },
    { n: "+1 무료 코인", l: "게임을 끝내면 코인이 쌓입니다. 여기서 돈은 안 받습니다." },
    { n: "+1 겸손", l: "저도 가끔 0.32초가 나옵니다. 그런 날은 조용히 넘어갑니다." }
  ];

  (function buff() {
    var now = new Date();
    var y = now.getFullYear(), m = now.getMonth(), d = now.getDate();
    var days = Math.floor(Date.UTC(y, m, d) / 86400000);
    var idx = ((days * 5 + 2) % BUFFS.length + BUFFS.length) % BUFFS.length;
    var b = BUFFS[idx];
    var names = ["일", "월", "화", "수", "목", "금", "토"];
    setText("#buff-name", b.n);
    setText("#buff-line", b.l);
    var dateEl = $("#buff-date");
    if (dateEl) {
      dateEl.textContent = (m + 1) + "월 " + d + "일 " + names[now.getDay()];
      dateEl.setAttribute("datetime", y + "-" + pad(m + 1) + "-" + pad(d));
    }
  })();

  function pad(n) { return ("0" + n).slice(-2); }

  /* ---------------------------------------------------------------- ⚡ 반응 대결 */
  var arena = $("#reflex-arena");
  var arenaLabel = $("#reflex-label");
  var arenaSub = $("#reflex-sub");
  var reflexMsg = $("#reflex-msg");
  var reflexPhase = "idle";
  var reflexTimer = null;
  var reflexStart = 0;
  var reflexRound = 1;

  function arenaState(cls, label, sub) {
    if (!arena) { return; }
    arena.className = "reflex-arena" + (cls ? " " + cls : "");
    if (arenaLabel) { arenaLabel.textContent = label; }
    if (arenaSub) { arenaSub.textContent = sub || ""; }
  }

  function reflexBegin() {
    window.clearTimeout(reflexTimer);
    reflexPhase = "ready";
    playCount("reflex");
    setText("#reflex-round", reflexRound);
    arenaState("is-ready", "준비…", "초록불이 오면 바로 누르세요");
    if (reflexMsg) { reflexMsg.textContent = "숨 참으세요. 제가 손가락을 풉니다…"; }
    setMood("smug", "준비됐어요? 저는 준비돼 있습니다.");
    AudioFX.tap();
    reflexTimer = window.setTimeout(function () {
      if (reflexPhase !== "ready") { return; }
      reflexPhase = "go";
      reflexStart = (window.performance && performance.now) ? performance.now() : Date.now();
      arenaState("is-go", "지금!", "");
      AudioFX.go();
    }, 1100 + Math.random() * 2300);
  }

  function reflexFoul() {
    window.clearTimeout(reflexTimer);
    reflexPhase = "result";
    arenaState("is-foul", "반칙!", "초록불 전에는 안 됩니다. 한 번 더 누르면 새 라운드");
    if (reflexMsg) { reflexMsg.textContent = "너무 빨랐어요. 이번 판은 기록에 안 들어갑니다. 🙃"; }
    setMood("shock", LINES.shock[0]);
    AudioFX.foul();
    shake(arena);
    addXP(2, arena);
  }

  function reflexHit() {
    var now = (window.performance && performance.now) ? performance.now() : Date.now();
    var dt = Math.max(0, Math.round(now - reflexStart));
    var dobbyMs = Math.round(165 + Math.random() * 160);
    var win = dt < dobbyMs;

    reflexPhase = "result";
    setText("#reflex-me-time", msText(dt));
    setText("#reflex-dobby-time", msText(dobbyMs));

    if (S.bestMs === null || dt < S.bestMs) { S.bestMs = dt; }

    if (win) {
      S.streak = (S.streak || 0) + 1;
      if (S.streak > S.bestStreak) { S.bestStreak = S.streak; }
      S.coins += 1;
      arenaState("is-win", "WIN", "한 번 더 누르면 새 라운드");
      if (reflexMsg) {
        reflexMsg.innerHTML = "나 <b>" + msText(dt) + "</b> · 도비 <b>" + msText(dobbyMs) +
          "</b> — 이겼습니다! 코인 +1, 연승 " + S.streak + ".";
      }
      setMood("happy", LINES.happy[Math.floor(Math.random() * LINES.happy.length)]);
      AudioFX.win();
      shake(arena);
      addXP(25, arena);
      if (dt <= 250) { unlock("flash"); }
      if (S.streak >= 3) { unlock("combo3"); }
    } else {
      S.streak = 0;
      arenaState("is-lose", "LOSE", "한 번 더 누르면 새 라운드");
      if (reflexMsg) {
        reflexMsg.innerHTML = "나 <b>" + msText(dt) + "</b> · 도비 <b>" + msText(dobbyMs) +
          "</b> — 이번엔 도비가 빨랐습니다. 연승은 0으로.";
      }
      setMood("smug", LINES.smug[Math.floor(Math.random() * LINES.smug.length)]);
      AudioFX.lose();
      addXP(8, arena);
    }

    S.coins = Math.max(0, S.coins);
    save();
    render();
    reflexRound += 1;
  }

  if (arena) {
    arena.addEventListener("click", function () {
      if (reflexPhase === "idle" || reflexPhase === "result") { reflexBegin(); return; }
      if (reflexPhase === "ready") { reflexFoul(); return; }
      if (reflexPhase === "go") { reflexHit(); return; }
    });
  }

  /* ---------------------------------------------------------------- 🔥 10초 광클 */
  var frenzyStart = $("#frenzy-start");
  var frenzyPad = $("#frenzy-pad");
  var frenzyPadLabel = $("#frenzy-pad-label");
  var frenzyCount = $("#frenzy-count");
  var frenzyTime = $("#frenzy-time");
  var frenzyCps = $("#frenzy-cps");
  var frenzyBar = $("#frenzy-bar");
  var frenzyResult = $("#frenzy-result");
  var frenzyRunning = false;
  var frenzyClicks = 0;
  var frenzyEnd = 0;
  var frenzyRaf = null;

  function frenzyRank(n) {
    if (n >= 120) { return { t: "👑 도비도 못 말림", l: "이건 손가락이 몇 개인지 여쭤봐야겠습니다." }; }
    if (n >= 90) { return { t: "🔥 광클 머신", l: "이 정도면 마우스가 미안해할 수준입니다." }; }
    if (n >= 70) { return { t: "⚡ 번개 손", l: "충분히 빠릅니다. 도비도 긴장했어요." }; }
    if (n >= 50) { return { t: "🙂 평범한 인간", l: "정상입니다. 정상이 제일 무섭죠." }; }
    if (n >= 30) { return { t: "🐢 느긋한 손", l: "급할 것 없습니다. 여긴 오락실이니까요." }; }
    return { t: "🫠 손가락 어디 감?", l: "한 번 더 하면 두 배는 나옵니다. 아마." };
  }

  function frenzyBegin() {
    if (frenzyRunning) { return; }
    frenzyRunning = true;
    frenzyClicks = 0;
    playCount("frenzy");
    setText("#frenzy-count", "0");
    setText("#frenzy-cps", "0.0");
    setText("#frenzy-time", "10.0");
    if (frenzyBar) { frenzyBar.style.width = "100%"; }
    if (frenzyPad) { frenzyPad.disabled = false; frenzyPad.classList.add("is-running"); }
    if (frenzyPadLabel) { frenzyPadLabel.innerHTML = "눌러!<br />눌러!"; }
    if (frenzyResult) { frenzyResult.textContent = "10초 시작! 손가락 준비하세요."; }
    if (frenzyStart) { frenzyStart.disabled = true; frenzyStart.textContent = "⏱ 진행 중…"; }
    frenzyEnd = ((window.performance && performance.now) ? performance.now() : Date.now()) + 10000;
    setMood("happy", "시작합니다. 저는 옆에서 구경할게요.");
    AudioFX.go();
    frenzyRaf = window.requestAnimationFrame(frenzyTick);
  }

  function frenzyTick() {
    if (!frenzyRunning) { return; }
    var now = (window.performance && performance.now) ? performance.now() : Date.now();
    var left = Math.max(0, frenzyEnd - now);
    var elapsed = Math.max(0.1, (10000 - left) / 1000);
    setText("#frenzy-time", (left / 1000).toFixed(1));
    setText("#frenzy-cps", (frenzyClicks / elapsed).toFixed(1));
    setText("#frenzy-count", frenzyClicks);
    if (frenzyBar) { frenzyBar.style.width = (left / 100) + "%"; }
    if (left <= 0) { frenzyFinish(); return; }
    frenzyRaf = window.requestAnimationFrame(frenzyTick);
  }

  function frenzyFinish() {
    frenzyRunning = false;
    if (frenzyRaf) { window.cancelAnimationFrame(frenzyRaf); frenzyRaf = null; }
    if (frenzyPad) { frenzyPad.disabled = true; frenzyPad.classList.remove("is-running"); }
    if (frenzyPadLabel) { frenzyPadLabel.innerHTML = "끝!<br />한 판 더?"; }
    if (frenzyStart) { frenzyStart.disabled = false; frenzyStart.textContent = "▶ 다시 도전"; }
    if (frenzyBar) { frenzyBar.style.width = "0%"; }
    setText("#frenzy-time", "0.0");

    var n = frenzyClicks;
    var rank = frenzyRank(n);
    S.coins += n >= 80 ? 2 : 1;
    if (n > S.bestClicks) { S.bestClicks = n; }
    save();

    if (frenzyResult) {
      frenzyResult.innerHTML = "<b>" + n + "회</b> · " + rank.t + " — " + rank.l;
    }
    if (n >= 60) { unlock("clicker"); }
    setMood(n >= 60 ? "happy" : "smug", n >= 60 ? "빠르네요. 인정합니다." : "손가락, 다음엔 좀 더 힘내요.");
    AudioFX[n >= 60 ? "win" : "coin"]();
    addXP(n, frenzyPad);
    render();
  }

  if (frenzyStart) {
    frenzyStart.addEventListener("click", function () { AudioFX.tap(); frenzyBegin(); });
  }
  if (frenzyPad) {
    frenzyPad.addEventListener("click", function () {
      if (!frenzyRunning) { return; }
      frenzyClicks += 1;
      setText("#frenzy-count", frenzyClicks);
      AudioFX.click(frenzyClicks);
    });
  }

  /* ---------------------------------------------------------------- 🎰 도비 뽑기 */
  var gachaPull = $("#gacha-pull");
  var gachaStage = $("#gacha-stage");
  var gachaGrade = $("#gacha-grade");
  var gachaReel = $("#gacha-reel");
  var gachaMsg = $("#gacha-msg");
  var gachaRolling = false;

  function pickGrade() {
    var r = Math.random() * 100;
    var acc = 0;
    for (var i = 0; i < GRADE_WEIGHT.length; i += 1) {
      acc += GRADE_WEIGHT[i][1];
      if (r < acc) { return GRADE_WEIGHT[i][0]; }
    }
    return "N";
  }

  function cardsOf(grade) {
    return CARDS.filter(function (c) { return c.g === grade; });
  }

  function gachaFinish(card) {
    gachaRolling = false;
    if (gachaStage) {
      gachaStage.classList.remove("is-rolling");
      gachaStage.setAttribute("data-grade", card.g);
    }
    if (gachaGrade) { gachaGrade.textContent = card.g; }
    if (gachaReel) { gachaReel.textContent = card.name; }
    if (gachaPull) { gachaPull.disabled = false; }

    var isNew = S.cards.indexOf(card.id) === -1;
    if (isNew) { S.cards.push(card.id); }

    if (gachaMsg) {
      gachaMsg.innerHTML = (isNew ? "<b>새 카드!</b> " : "이미 가진 카드입니다. ") + card.line;
    }

    S.coins = Math.max(0, S.coins);
    save();

    if (isNew && S.cards.length >= 5) { unlock("collector"); }
    if (card.g === "SR") { unlock("lucky"); }
    if (card.g === "SSR" || card.g === "UR") { unlock("lucky"); unlock("ssr"); }

    if (card.g === "SSR" || card.g === "UR") {
      setMood("shock", card.g === "UR" ? "전설이 나왔습니다. …저도 처음 봅니다." : "이게 나왔다고요? 오늘 운 좋은 날이네요.");
      AudioFX.win();
      shake(gachaStage);
    } else if (card.g === "SR") {
      setMood("happy", "SR입니다. 나쁘지 않아요. 꽤요.");
      AudioFX.coin();
    } else {
      setMood("smug", card.g === "N" ? "N입니다. 인생은 원래 그렇습니다." : "R입니다. 평균보다 조금 나은 하루네요.");
      AudioFX.tap();
    }

    addXP(GRADE_XP[card.g] || 5, gachaStage);
    render();
  }

  function gachaPullOnce() {
    if (gachaRolling) { return; }
    if (S.coins < 1) {
      if (gachaMsg) { gachaMsg.textContent = "코인이 없습니다. 게임을 한 판 끝내면 1개씩 쌓여요. 무료입니다."; }
      setMood("sad", "코인이 떨어졌네요. 게임 한 판 하고 오세요.");
      AudioFX.lose();
      return;
    }

    S.coins -= 1;
    save();
    render();
    playCount("gacha");

    gachaRolling = true;
    if (gachaPull) { gachaPull.disabled = true; }
    if (gachaStage) { gachaStage.classList.add("is-rolling"); gachaStage.setAttribute("data-grade", "none"); }
    if (gachaMsg) { gachaMsg.textContent = "뽑는 중… 행운을 빌어요. 저는 빌어줄 수는 있습니다."; }

    var finalGrade = pickGrade();
    var pool = cardsOf(finalGrade);
    var finalCard = pool[Math.floor(Math.random() * pool.length)];

    var tickCount = reduced ? 4 : 18;
    var i = 0;
    var timer = window.setInterval(function () {
      i += 1;
      if (i >= tickCount) {
        window.clearInterval(timer);
        gachaFinish(finalCard);
        return;
      }
      var g = pickGrade();
      var c = cardsOf(g)[0];
      if (gachaGrade) { gachaGrade.textContent = g; }
      if (gachaReel) { gachaReel.textContent = c ? c.name : "???"; }
      if (gachaStage) { gachaStage.setAttribute("data-grade", g); }
      AudioFX.rolld(i);
    }, reduced ? 90 : 70);
  }

  if (gachaPull) { gachaPull.addEventListener("click", gachaPullOnce); }

  /* ---------------------------------------------------------------- 소리 · 초기화 */
  var soundBtn = $("#sound-toggle");
  if (soundBtn) {
    soundBtn.addEventListener("click", function () {
      S.sound = !S.sound;
      save();
      render();
      if (S.sound) { AudioFX.coin(); }
      toast(S.sound ? "🔊" : "🔇", "SOUND", S.sound ? "8비트 소리를 켰습니다." : "소리를 껐습니다.");
    });
  }

  var resetBtn = $("#reset-progress");
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      var ok = window.confirm("반응 기록·광클 기록·코인·업적·도감을 모두 지울까요? 되돌릴 수 없습니다.");
      if (!ok) { return; }
      S = copyFresh();
      try { localStorage.removeItem(KEY); } catch (e) { /* 무시 */ }
      save();
      window.clearTimeout(reflexTimer);
      reflexPhase = "idle";
      reflexRound = 1;
      frenzyRunning = false;
      if (frenzyRaf) { window.cancelAnimationFrame(frenzyRaf); frenzyRaf = null; }
      setText("#reflex-me-time", "--");
      setText("#reflex-dobby-time", "--");
      arenaState("", "START", "눌러서 시작 · 초록불이 터지면 바로 누르세요");
      if (reflexMsg) { reflexMsg.textContent = "도비는 0.16~0.32초 사이에서 대충 나옵니다. 사람 평균은 0.25초래요."; }
      if (frenzyResult) { frenzyResult.textContent = "10초 안에 몇 번 누를 수 있나요? 손가락이 곧 성적표입니다."; }
      if (frenzyPad) { frenzyPad.className = "frenzy-pad"; frenzyPad.disabled = true; }
      if (frenzyPadLabel) { frenzyPadLabel.innerHTML = "준비됐으면<br />START"; }
      if (frenzyStart) { frenzyStart.textContent = "▶ 10초 시작"; frenzyStart.disabled = false; }
      if (frenzyBar) { frenzyBar.style.width = "100%"; }
      setText("#frenzy-count", "0"); setText("#frenzy-time", "10.0"); setText("#frenzy-cps", "0.0");
      if (gachaStage) { gachaStage.setAttribute("data-grade", "none"); }
      if (gachaGrade) { gachaGrade.textContent = "?"; }
      if (gachaReel) { gachaReel.textContent = "뽑기를 눌러 주세요"; }
      if (gachaMsg) { gachaMsg.textContent = "코인은 게임을 끝낼 때마다 저절로 쌓입니다. 현금 결제는 없습니다 — 진짜로."; }
      setMood("sad", LINES.sad[0]);
      renderBadges();
      render();
      toast("🧹", "RESET", "기록을 지웠습니다. 새 출발이에요.");
    });
  }

  /* ---------------------------------------------------------------- 시작 */
  renderBadges();
  render();
  if (dobby) { dobby.setAttribute("data-mood", "idle"); }
})();
