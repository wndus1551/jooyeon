(() => {
  const $ = (id) => document.getElementById(id);
  const quizzes = CONFIG.quizzes;
  let current = 0;
  let locked = false;

  function show(screenId) {
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    $(screenId).classList.add("active");
  }

  function vibrate(pattern) {
    if (navigator.vibrate) navigator.vibrate(pattern);
  }

  const HEART_PATH = "M32 54C14 41 5 31 5 19 5 10 12 4 20 4c5 0 9 3 12 7 3-4 7-7 12-7 8 0 15 6 15 15 0 12-9 22-27 35z";

  // 정답일 때 눌린 버튼에서 작은 하트 몇 개가 톡 튀어 올라요
  function popHearts(fromEl, count = 6) {
    const layer = $("pop-layer");
    const r = fromEl.getBoundingClientRect();
    for (let i = 0; i < count; i++) {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 64 58");
      svg.setAttribute("class", "pop-heart");
      svg.innerHTML = `<path d="${HEART_PATH}"/>`;
      svg.style.left = r.left + r.width * (0.2 + Math.random() * 0.6) + "px";
      svg.style.top = r.top + "px";
      svg.style.setProperty("--dx", (Math.random() * 60 - 30).toFixed(0) + "px");
      svg.style.animationDelay = (i * 0.06).toFixed(2) + "s";
      layer.appendChild(svg);
      svg.addEventListener("animationend", () => svg.remove());
    }
  }

  function renderProgress() {
    $("dots").innerHTML = quizzes
      .map((_, i) => `<span class="dot${i < current ? " done" : i === current ? " now" : ""}"></span>`)
      .join("");
    $("step").textContent = `${current + 1} / ${quizzes.length}`;
  }

  function shuffle(list) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  let typedAnswer = "";

  function renderQuiz() {
    const q = quizzes[current];
    locked = false;
    typedAnswer = "";
    renderProgress();
    $("q-num").textContent = current + 1;
    $("question").textContent = q.question;
    $("feedback").textContent = "";
    const box = $("choices");
    box.innerHTML = "";
    if (q.type === "text") renderTextInput(box, q);
    else {
      // 정답과 오답을 섞어서 매번 다른 위치에 나오게 해요
      shuffle([q.answer, ...q.wrong]).forEach((text) => {
        const btn = document.createElement("button");
        btn.className = "choice";
        btn.textContent = text;
        btn.addEventListener("click", () => pick(btn, text === q.answer));
        box.appendChild(btn);
      });
    }
    show("screen-quiz");
  }

  // 직접 입력하는 문제: 뭐라고 쓰든 정답
  function renderTextInput(box, q) {
    const form = document.createElement("form");
    form.className = "text-answer";
    form.innerHTML =
      '<input id="answer-input" class="answer-input" type="text" maxlength="20" autocomplete="off" />' +
      '<button class="choice" type="submit">확인</button>';
    const input = form.querySelector("input");
    const btn = form.querySelector("button");
    input.placeholder = q.placeholder || "여기에 써 줘";
    input.addEventListener("input", () => { $("feedback").textContent = ""; });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (locked) return;
      const value = input.value.trim();
      if (!value) {
        $("feedback").textContent = "한 글자라도 써 줘.";
        input.focus();
        return;
      }
      typedAnswer = value;
      input.blur();
      input.readOnly = true;
      pick(btn, true);
    });
    box.appendChild(form);
  }

  function pick(btn, isRight) {
    if (locked || btn.classList.contains("wrong")) return;
    const q = quizzes[current];

    if (isRight) {
      locked = true;
      btn.classList.add("right");
      vibrate([40, 40, 40]);
      popHearts(btn);
      setTimeout(showMemory, 700);
      return;
    }

    btn.classList.add("wrong");
    vibrate(200);
    const msgs = CONFIG.wrongMessages;
    const msg = msgs[Math.floor(Math.random() * msgs.length)];
    const fb = $("feedback");
    fb.textContent = msg;
    if (q.hint) {
      const hint = document.createElement("b");
      hint.textContent = `\n힌트: ${q.hint}`;
      fb.appendChild(hint);
    }
    const card = $("card");
    card.classList.remove("shake");
    void card.offsetWidth;
    card.classList.add("shake");
  }

  function showMemory() {
    const q = quizzes[current];
    const box = $("photo-box");
    box.innerHTML = "";
    const fallback = () => { box.textContent = q.emoji || "❤️"; };
    if (q.photo) {
      const img = new Image();
      img.alt = "우리의 추억";
      img.onerror = fallback;
      img.src = q.photo;
      box.appendChild(img);
    } else {
      fallback();
    }
    $("memory").textContent = (q.memory || "").replace("{answer}", typedAnswer);
    const isLast = current === quizzes.length - 1;
    $("btn-next").textContent = isLast ? "마지막 선물 보기" : "다음 문제";
    // 다시 들어올 때 애니메이션이 재생되도록
    const polaroid = document.querySelector(".polaroid");
    polaroid.style.animation = "none";
    void polaroid.offsetWidth;
    polaroid.style.animation = "";
    show("screen-memory");
  }

  function next() {
    current++;
    if (current < quizzes.length) renderQuiz();
    else showLetterScreen();
  }

  function showLetterScreen() {
    $("envelope").classList.remove("open", "hidden");
    $("letter-hint").classList.remove("hidden");
    $("letter").classList.add("hidden");
    show("screen-letter");
  }

  function openLetter() {
    const env = $("envelope");
    if (env.classList.contains("open")) return;
    env.classList.add("open");
    vibrate([60, 60, 60, 60, 120]);
    setTimeout(() => {
      env.classList.add("hidden");
      $("letter-hint").classList.add("hidden");
      $("letter").classList.remove("hidden");
    }, 700);
  }

  // ---------- 초기화 ----------
  document.title = CONFIG.title;
  $("title").textContent = CONFIG.title;
  $("greeting").textContent = `${CONFIG.herName}, 안녕`;
  $("subtitle").textContent = CONFIG.subtitle.replace("{count}", quizzes.length);
  $("letter-text").textContent = CONFIG.letter;
  $("letter-sign").textContent = `- ${CONFIG.myName}`;
  $("final-surprise").textContent = CONFIG.finalSurprise || "";

  $("btn-start").addEventListener("click", () => { current = 0; renderQuiz(); });
  $("btn-next").addEventListener("click", next);
  $("envelope").addEventListener("click", openLetter);
  $("btn-replay").addEventListener("click", () => show("screen-start"));

})();
