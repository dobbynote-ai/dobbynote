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
