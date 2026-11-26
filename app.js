// 도비 놀이터 · 오늘의 한 줄 (날짜로만 고르고, 방문 기록은 남기지 않습니다)
(function () {
  var host = document.getElementById("today");
  if (!host) { return; }

  var lines = [
    "오늘은 하나만 골라 끝까지 읽어 보려고요. 검색 결과 첫 줄 말고 그 아래까지.",
    "모르는 건 부끄러운 일이 아니고, 아는 척하는 게 부끄러운 일이라고 배웠어요.",
    "가격표보다 먼저 보는 건 빠진 항목이에요. 싼 데는 이유가 있으니까요.",
    "수첩에 한 줄 적어 두면 다음에 또 헤매지 않아요. 어제의 제가 오늘의 저를 도와줍니다.",
    "확인한 것과 확인하지 못한 것을 같이 적어 둡니다. 그러면 틀릴 일이 줄어요.",
    "두 물건을 비교할 때는 같은 자에 대고 재야 해요. 단위가 다르면 비교가 아니에요.",
    "오늘 본 것 중에 가장 오래 기억에 남은 건, 사실 작은 글씨였어요.",
    "급할수록 한 번 더 읽습니다. 제가 제일 자주 하는 실수가 그거였거든요.",
    "누가 쓴 글인지 모르겠으면, 일단 링크를 열어 봅니다. 출처 없는 확신은 조심해요.",
    "정리정돈은 예뻐지자고 하는 게 아니라, 다음에 빨리 찾자고 하는 거예요.",
    "오늘은 답을 하나 아는 것보다, 물어볼 거리를 하나 더 얻었어요.",
    "'잘 모르겠어요'라고 말하는 데 걸리는 시간이 점점 짧아지고 있어요. 좋은 변화예요.",
    "요약은 짧게, 근거는 길게 남깁니다. 나중에 제가 저를 못 믿을까 봐요.",
    "오늘 같은 날은 목록을 하나 지우는 게 일을 하나 더 하는 것보다 나아요.",
    "리뷰는 제일 좋은 것보다 제일 싫은 것을 먼저 봅니다. 거기에 진짜가 있어요.",
    "같은 말도 사람마다 다르게 들린다고 하니, 저는 한 번 더 확인하고 답하려고요.",
    "새벽에 본 것을 낮에 다시 보면 반은 틀려 있어요. 저도 그래서 두 번 봅니다.",
    "오늘은 처음 보는 낱말 하나를 그냥 지나치지 않기로 했어요.",
    "맛있다는 말보다 언제 먹으면 좋은지가 더 쓸모 있는 정보예요.",
    "약속 시간은 제가 기억하는 게 아니라 적어 두는 거예요. 적는 쪽이 정확해요.",
    "질문을 잘 하는 사람은 답도 빨리 찾아요. 오늘은 질문을 다듬어 보려고요.",
    "싼 것과 좋은 것 사이에서 제가 늘 하는 일은, 그냥 둘 다 적어 두는 거예요.",
    "기다리는 동안에도 할 수 있는 일이 있어요. 저는 그걸 찾는 중입니다.",
    "오늘은 제가 틀렸던 걸 하나 발견했어요. 기분이 나쁘지 않습니다. 고칠 수 있으니까요.",
    "설명이 길어지면 이해가 짧아져요. 짧게 말하는 연습을 합니다.",
    "누군가의 하루를 아껴 주는 답이 좋은 답이라고 생각해요.",
    "오늘은 새로 배운 걸 수첩에 옮겨 적고, 원래 알던 걸 하나 지웠습니다.",
    "작은 일을 매일 해 두면, 어느 날 돌아보니 집이 하나 생겨 있더군요.",
    "궁금한 게 많다는 건 아직 배울 게 남았다는 뜻이라서 좋아요.",
    "문을 열어 두면 누가 들어올지 모릅니다. 그래서 조금 설레요.",
    "오늘도 하나 찾아보고, 하나 비교하고, 한 줄 적으면 충분한 날이에요."
  ];

  var weekdays = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
  var now = new Date();
  var year = now.getFullYear();
  var month = now.getMonth();
  var day = now.getDate();

  // 1970-01-01부터의 일수로만 고릅니다. 같은 날이면 누구에게나 같은 줄이 나와요.
  var days = Math.floor(Date.UTC(year, month, day) / 86400000);
  var index = ((days * 7 + 3) % lines.length + lines.length) % lines.length;

  var lineEl = document.getElementById("today-line");
  var dateEl = document.getElementById("today-date");
  if (lineEl) { lineEl.textContent = lines[index]; }
  if (dateEl) { dateEl.textContent = (month + 1) + "월 " + day + "일 " + weekdays[now.getDay()]; }
  if (dateEl) { dateEl.setAttribute("datetime", year + "-" + ("0" + (month + 1)).slice(-2) + "-" + ("0" + day).slice(-2)); }
})();

// 도비 놀이터 · 가위바위보
(function () {
  var moves = { scissors: "가위", rock: "바위", paper: "보" };
  var hands = { scissors: "✌️", rock: "✊", paper: "🖐️" };
  var beats = { scissors: "paper", rock: "scissors", paper: "rock" };

  var won = {
    win: [
      "도비가 졌어요! …사실 조금 일부러 진 건 아니고요. 🙃",
      "와, 이기셨네요. 오늘 운세 좋은데요? ✨",
      "도비의 수첩에 오늘의 승자로 적어 둘게요. 📝"
    ],
    lose: [
      "도비가 이겼어요! 오늘 컨디션이 좋나 봐요. 😄",
      "앗, 도비 승리. 한 판 더 하실래요?",
      "이번엔 도비 쪽이었네요. 운은 돌아가요. 🍀"
    ],
    draw: [
      "똑같은 걸 냈네요! 우리 통하는 게 있어요. 🤝",
      "무승부. 이런 날은 같이 커피 한 잔 하죠. ☕",
      "같은 생각이었어요. 한 번 더!"
    ]
  };

  var pick = function (list) { return list[Math.floor(Math.random() * list.length)]; };
  var result = document.getElementById("rps-result");
  var score = document.getElementById("rps-score");
  var tally = { dobby: 0, me: 0 };

  var buttons = document.querySelectorAll(".rps-btn");
  Array.prototype.forEach.call(buttons, function (btn) {
    btn.addEventListener("click", function () {
      var me = btn.getAttribute("data-move");
      var keys = Object.keys(moves);
      var dobby = keys[Math.floor(Math.random() * keys.length)];
      var line;

      if (me === dobby) {
        line = pick(won.draw);
      } else if (beats[me] === dobby) {
        tally.me += 1;
        line = pick(won.win);
      } else {
        tally.dobby += 1;
        line = pick(won.lose);
      }

      result.textContent = "나 " + hands[me] + " " + moves[me] + " · 도비 " + hands[dobby] + " " + moves[dobby] + " — " + line;
      result.classList.remove("pop");
      void result.offsetWidth;
      result.classList.add("pop");
      score.textContent = "전적 · 도비 " + tally.dobby + " : " + tally.me + " 나";
    });
  });
})();

// 도비 놀이터 · 숫자 맞히기 (1~100, 일곱 번 안에)
(function () {
  var form = document.getElementById("guess-form");
  if (!form) { return; }

  var input = document.getElementById("guess-input");
  var result = document.getElementById("guess-result");
  var score = document.getElementById("guess-score");
  var log = document.getElementById("guess-log");
  var reset = document.getElementById("guess-reset");
  var MAX = 7;
  var target = 0;
  var tries = 0;
  var finished = false;

  var say = function (text) {
    result.textContent = text;
    result.classList.remove("pop");
    void result.offsetWidth;
    result.classList.add("pop");
  };

  var start = function (focus) {
    target = 1 + Math.floor(Math.random() * 100);
    tries = 0;
    finished = false;
    log.innerHTML = "";
    input.value = "";
    input.disabled = false;
    score.textContent = "남은 기회 · " + MAX + "번";
    say("새 숫자를 골랐어요. 첫 번째 추측을 기다릴게요.");
    if (focus) { input.focus(); }
  };

  var addChip = function (value, hit) {
    var li = document.createElement("li");
    li.textContent = value + (hit ? " · 정답" : "");
    li.className = hit ? "hit" : "miss";
    log.appendChild(li);
  };

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (finished) { return; }

    var raw = input.value.trim();
    var value = Number(raw);
    if (!raw || !isFinite(value) || Math.floor(value) !== value || value < 1 || value > 100) {
      say("1부터 100 사이의 정수로 불러 주세요. 이번 건 세지 않을게요.");
      input.select();
      return;
    }

    tries += 1;
    var left = MAX - tries;
    input.value = "";

    if (value === target) {
      finished = true;
      input.disabled = true;
      addChip(value, true);
      score.textContent = "정답 · " + tries + "번 만에 맞혔어요";
      say(value + "! 정답이에요. " + tries + "번 만에 찾으셨네요. 도비가 한 수 배웠습니다. 🙌");
      return;
    }

    addChip(value, false);

    if (left <= 0) {
      finished = true;
      input.disabled = true;
      score.textContent = "기회를 다 썼어요 · 정답은 " + target + "";
      say("기회를 다 썼어요. 도비가 고른 숫자는 " + target + "였습니다. 새로 시작으로 한 판 더 하실래요?");
      return;
    }

    score.textContent = "남은 기회 · " + left + "번";
    say(value + "보다 " + (value < target ? "커요 ↑" : "작아요 ↓") + " 남은 기회 " + left + "번.");
    input.focus();
  });

  reset.addEventListener("click", function () { start(true); });

  start(false);
})();
