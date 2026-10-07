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

  function burstHearts(count = 18) {
    const layer = $("floating-hearts");
    const icons = ["💖", "💕", "💗", "💓", "💘", "✨"];
    for (let i = 0; i < count; i++) {
      const h = document.createElement("span");
      h.className = "float-heart";
      h.textContent = icons[Math.floor(Math.random() * icons.length)];
      h.style.left = Math.random() * 100 + "vw";
      h.style.fontSize = 18 + Math.random() * 26 + "px";
      h.style.setProperty("--r", Math.random() * 360 - 180 + "deg");
      h.style.animationDuration = 2.5 + Math.random() * 2.5 + "s";
      h.style.animationDelay = Math.random() * 0.8 + "s";
      layer.appendChild(h);
      h.addEventListener("animationend", () => h.remove());
    }
  }

  function renderHearts() {
    $("hearts").innerHTML = quizzes
      .map((_, i) => (i < current ? '<span class="on">❤️</span>' : "🤍"))
      .join("");
    $("step").textContent = `${current + 1} / ${quizzes.length}`;
  }

  function renderQuiz() {
    const q = quizzes[current];
    locked = false;
    renderHearts();
    $("q-num").textContent = current + 1;
    $("question").textContent = q.question;
    $("feedback").textContent = "";
    const box = $("choices");
    box.innerHTML = "";
    q.choices.forEach((text, i) => {
      const btn = document.createElement("button");
      btn.className = "choice";
      btn.textContent = text;
      btn.addEventListener("click", () => pick(btn, i));
      box.appendChild(btn);
    });
    show("screen-quiz");
  }

  function pick(btn, index) {
    if (locked || btn.classList.contains("wrong")) return;
    const q = quizzes[current];

    if (index === q.answer) {
      locked = true;
      btn.classList.add("right");
      vibrate([40, 40, 40]);
      burstHearts(14);
      setTimeout(showMemory, 700);
      return;
    }

    btn.classList.add("wrong");
    vibrate(200);
    const msgs = CONFIG.wrongMessages;
    const msg = msgs[Math.floor(Math.random() * msgs.length)];
    $("feedback").textContent = q.hint ? `${msg}\n힌트: ${q.hint}` : msg;
    $("feedback").style.whiteSpace = "pre-line";
    const card = $("card");
    card.classList.remove("shake");
    void card.offsetWidth;
    card.classList.add("shake");
  }

  function showMemory() {
    const q = quizzes[current];
    const box = $("photo-box");
    box.innerHTML = "";
    const fallback = () => { box.textContent = q.emoji || "💖"; };
    if (q.photo) {
      const img = new Image();
      img.alt = "우리의 추억";
      img.onerror = fallback;
      img.src = q.photo;
      box.appendChild(img);
    } else {
      fallback();
    }
    $("memory").textContent = q.memory || "";
    const isLast = current === quizzes.length - 1;
    $("btn-next").textContent = isLast ? "마지막 선물 받기 🎁" : "다음 문제 ➜";
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
    burstHearts(30);
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
      burstHearts(40);
    }, 700);
  }

  // ---------- 초기화 ----------
  document.title = `💌 ${CONFIG.title}`;
  $("title").textContent = CONFIG.title;
  $("greeting").textContent = `${CONFIG.herName}, 안녕 👋`;
  $("subtitle").textContent = CONFIG.subtitle;
  $("letter-text").textContent = CONFIG.letter;
  $("letter-sign").textContent = `- ${CONFIG.myName} 💕`;
  $("final-surprise").textContent = CONFIG.finalSurprise || "";

  $("btn-start").addEventListener("click", () => { current = 0; renderQuiz(); });
  $("btn-next").addEventListener("click", next);
  $("envelope").addEventListener("click", openLetter);
  $("btn-replay").addEventListener("click", () => show("screen-start"));

  setInterval(() => burstHearts(2), 3000);
})();
