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
