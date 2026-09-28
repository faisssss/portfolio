(() => {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  $("#year").textContent = new Date().getFullYear();

  /* ---------- Split hero name into animated characters ---------- */
  $$("[data-split]").forEach((el, wordIndex) => {
    const text = el.textContent;
    el.textContent = "";
    el.style.setProperty("--d", `${wordIndex * 180}ms`);
    [...text].forEach((ch, i) => {
      const wrap = document.createElement("span");
      wrap.className = "char-wrap";
      const c = document.createElement("span");
      c.className = "char";
      c.textContent = ch;
      c.style.setProperty("--i", i);
      wrap.appendChild(c);
      el.appendChild(wrap);
    });
  });

  // Stagger the voice wave bars
  $$(".wave span").forEach((s, i) => s.style.setProperty("--i", i));

  // Duplicate marquee content for a seamless loop
  const track = $(".marquee__track");
  if (track) track.innerHTML += track.innerHTML;

  /* ---------- Loader ---------- */
  const loader = $("#loader");
  const loaderText = $("#loaderText");
  const bootMsg = "booting portfolio...";
  document.body.classList.add("loading");

  const finishLoading = () => {
    loader.classList.add("done");
    document.body.classList.remove("loading");
    document.body.classList.add("ready");
    startTyping();
    revealHero();
  };

  if (reduceMotion) {
    finishLoading();
  } else {
    let k = 0;
    const t = setInterval(() => {
      loaderText.textContent = bootMsg.slice(0, ++k);
      if (k >= bootMsg.length) clearInterval(t);
    }, 45);
    window.addEventListener("load", () => setTimeout(finishLoading, 1300));
    // Safety net in case "load" is slow (fonts, etc.)
    setTimeout(() => { if (!document.body.classList.contains("ready")) finishLoading(); }, 3500);
  }

  function revealHero() {
    $$(".hero .reveal").forEach((el, i) => {
      el.style.setProperty("--delay", `${400 + i * 120}ms`);
      el.classList.add("in");
    });
  }

  /* ---------- Typing effect ---------- */
  const roles = [
    "full-stack developer.",
    "Python & Flask enthusiast.",
    "cybersecurity learner.",
    "backend problem-solver.",
    "CS graduate, class of 2026.",
  ];
  let typingStarted = false;
  function startTyping() {
    if (typingStarted) return;
    typingStarted = true;
    const el = $("#typed");
    if (reduceMotion) { el.textContent = roles[0]; return; }
    let r = 0, c = 0, deleting = false;
    const tick = () => {
      const word = roles[r];
      c += deleting ? -1 : 1;
      el.textContent = word.slice(0, c);
      let delay = deleting ? 35 : 70;
      if (!deleting && c === word.length) { delay = 1800; deleting = true; }
      else if (deleting && c === 0) { deleting = false; r = (r + 1) % roles.length; delay = 350; }
      setTimeout(tick, delay);
    };
    setTimeout(tick, 900);
  }

  /* ---------- Scroll reveal ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      // Stagger siblings that enter together
      const siblings = $$(".reveal:not(.in)", el.parentElement).filter((s) => s.parentElement === el.parentElement);
      const idx = Math.max(0, siblings.indexOf(el));
      el.style.setProperty("--delay", `${Math.min(idx, 6) * 90}ms`);
      el.classList.add("in");
      io.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });
  $$(".reveal").forEach((el) => { if (!el.closest(".hero")) io.observe(el); });

  /* ---------- Count-up stats ---------- */
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseFloat(el.dataset.count);
      const decimals = parseInt(el.dataset.decimals || "0", 10);
      const suffix = el.dataset.suffix || "";
      const start = target > 1000 ? target - 30 : 0;
      const dur = 1600;
      const t0 = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 4);
        el.textContent = (start + (target - start) * eased).toFixed(decimals) + (p === 1 ? suffix : "");
        if (p < 1) requestAnimationFrame(step);
      };
      reduceMotion ? (el.textContent = target.toFixed(decimals) + suffix) : requestAnimationFrame(step);
      countIO.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$("[data-count]").forEach((el) => countIO.observe(el));

  /* ---------- Nav: scroll state, hide on scroll down, active link, progress ---------- */
  const nav = $("#nav");
  const progress = $("#progress");
  const timelineFill = $("#timelineFill");
  const timeline = $(".timeline");
  const navLinks = $$(".nav__links a[href^='#']");
  const sections = navLinks.map((a) => $(a.getAttribute("href")));
  let lastY = 0;

  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    nav.classList.toggle("scrolled", y > 30);
    nav.classList.toggle("hidden", y > lastY && y > 400 && !navMenu.classList.contains("open"));
    lastY = y;

    // Active section
    let current = null;
    sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top < innerHeight * 0.4) current = i; });
    navLinks.forEach((a, i) => a.classList.toggle("active", i === current));

    // Timeline fill
    if (timeline) {
      const r = timeline.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.7 - r.top) / r.height));
      timelineFill.style.transform = `scaleY(${p})`;
    }
  };

  /* ---------- Mobile menu ---------- */
  const navToggle = $("#navToggle");
  const navMenu = $("#navLinks");
  navToggle.addEventListener("click", () => {
    const open = navMenu.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", open);
    document.body.style.overflow = open ? "hidden" : "";
  });
  $$("a", navMenu).forEach((a) => a.addEventListener("click", () => {
    navMenu.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }));

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Custom cursor ---------- */
  if (finePointer && !reduceMotion) {
    const cursor = $("#cursor");
    const dot = $("#cursorDot");
    let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
    window.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px)`;
      document.body.classList.add("has-cursor");
    });
    document.addEventListener("mouseleave", () => document.body.classList.remove("has-cursor"));
    const loop = () => {
      cx += (mx - cx) * 0.18; cy += (my - cy) * 0.18;
      cursor.style.transform = `translate(${cx}px, ${cy}px)`;
      requestAnimationFrame(loop);
    };
    loop();
    $$("a, button, .chips span, .lang, input").forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
    });
  }

  /* ---------- Magnetic buttons ---------- */
  if (finePointer && !reduceMotion) {
    $$(".magnetic").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    });
  }

  /* ---------- Spotlight follow + 3D tilt ---------- */
  $$(".spotlight").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  if (finePointer && !reduceMotion) {
    $$(".tilt").forEach((el) => {
      const max = parseFloat(el.dataset.tiltMax || "7");
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transition = "transform .1s linear, border-color .4s";
        el.style.transform = `perspective(900px) rotateX(${-py * max}deg) rotateY(${px * max}deg) translateY(-4px)`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transition = "";
        el.style.transform = "";
      });
    });
  }

  /* ---------- Copy email ---------- */
  const toast = $("#toast");
  let toastTimer;
  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  };
  $("#copyEmail").addEventListener("click", async (e) => {
    const email = e.currentTarget.dataset.email;
    try {
      await navigator.clipboard.writeText(email);
      showToast("✓ Email copied to clipboard");
    } catch {
      window.location.href = `mailto:${email}`;
    }
  });

  /* ---------- Hero network canvas ---------- */
  const canvas = $("#network");
  const ctx = canvas.getContext("2d");
  let W, H, DPR, nodes = [], pointer = { x: -9999, y: -9999 }, heroVisible = true;

  const initNodes = () => {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const count = Math.round(Math.min(90, (W * H) / 16000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.6 + 0.6,
      hue: Math.random() < 0.7 ? "124,245,196" : "122,162,255",
    }));
  };

  const LINK = 130;
  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      if (!reduceMotion) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
        // gentle pull toward pointer
        const dx = pointer.x - n.x, dy = pointer.y - n.y;
        const d = Math.hypot(dx, dy);
        if (d < 180 && d > 0.1) { n.x += (dx / d) * 0.35; n.y += (dy / d) * 0.35; }
      }
      for (let j = i + 1; j < nodes.length; j++) {
        const m = nodes[j];
        const dist = Math.hypot(n.x - m.x, n.y - m.y);
        if (dist < LINK) {
          ctx.strokeStyle = `rgba(${n.hue},${(1 - dist / LINK) * 0.22})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(m.x, m.y); ctx.stroke();
        }
      }
      const pd = Math.hypot(pointer.x - n.x, pointer.y - n.y);
      if (pd < 180) {
        ctx.strokeStyle = `rgba(124,245,196,${(1 - pd / 180) * 0.45})`;
        ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(pointer.x, pointer.y); ctx.stroke();
      }
      ctx.fillStyle = `rgba(${n.hue},0.85)`;
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
    }
  };

  const animate = () => {
    if (heroVisible) draw();
    if (!reduceMotion) requestAnimationFrame(animate);
  };

  initNodes();
  animate();
  let resizeT;
  window.addEventListener("resize", () => { clearTimeout(resizeT); resizeT = setTimeout(() => { initNodes(); if (reduceMotion) draw(); }, 150); });
  const hero = $(".hero");
  hero.addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect();
    pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top;
  });
  hero.addEventListener("pointerleave", () => { pointer.x = pointer.y = -9999; });
  new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; }).observe(hero);

  /* ---------- Interactive terminal ---------- */
  const out = $("#termOut");
  const body = $("#termBody");
  const input = $("#termInput");
  const form = $("#termForm");
  const history = [];
  let hIndex = 0;

  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const print = (html, cls = "") => {
    const row = document.createElement("div");
    row.className = `row ${cls}`;
    row.innerHTML = html;
    out.appendChild(row);
    body.scrollTop = body.scrollHeight;
  };
  const prompt = '<span class="t-green">faisal@portfolio</span>:<span class="t-blue">~</span>$ ';

  const commands = {
    help: () => [
      '<span class="t-dim">available commands:</span>',
      '  <span class="t-green">whoami</span>      who is this guy?',
      '  <span class="t-green">skills</span>      tech I work with',
      '  <span class="t-green">projects</span>    things I\'ve built',
      '  <span class="t-green">experience</span>  where I\'ve worked',
      '  <span class="t-green">education</span>   where I studied',
      '  <span class="t-green">contact</span>     how to reach me',
      '  <span class="t-green">resume</span>      open my resume (PDF)',
      '  <span class="t-green">clear</span>       clear the screen',
    ].join("\n"),
    whoami: () =>
      'Mohammed Faisal — B.Tech CS grad (2026).\nI build full-stack apps with <span class="t-blue">Python/Flask + SQL</span>,\nand I\'m into <span class="t-purple">networking &amp; cybersecurity</span>.\n<span class="t-dim">status:</span> <span class="t-green">● open to work</span>',
    skills: () => [
      '<span class="t-purple">languages</span>  Python · C++ · Java · JavaScript · SQL · PHP',
      '<span class="t-purple">web</span>        HTML · CSS · Flask · React · Bootstrap',
      '<span class="t-purple">data/ml</span>    MySQL · Pandas · TensorFlow · Keras · OpenCV',
      '<span class="t-purple">tools</span>      Git · VS Code · XAMPP · Packet Tracer · Power BI',
    ].join("\n"),
    projects: () => [
      '<span class="t-blue">drwxr-x</span>  voice-to-code/        NLP → executable code',
      '<span class="t-blue">drwxr-x</span>  attendance-app/       auto-email low attendance',
      '<span class="t-blue">drwxr-x</span>  currency-detection/   CV model + React <span class="t-warn">[wip]</span>',
      '<span class="t-blue">drwxr-x</span>  invoice-manager/      Flask · ZIP · SMTP',
      '<span class="t-dim">→ scroll to #projects for details</span>',
    ].join("\n"),
    experience: () => '<span class="t-green">Orion Informatics</span> — Full-Stack Intern <span class="t-dim">(Apr–Jul 2025)</span>\n  ▹ Flask invoice file management app\n  ▹ multi-file upload, ZIP archiving, SMTP delivery',
    education: () => '<span class="t-green">Jyothi Engineering College</span>, Thrissur\n  B.Tech Computer Science · 2022–2026 · CGPA 7.42\n<span class="t-green">St. Mary\'s E.M. School</span>, Kozhikode\n  ICSE 94.5% · ISC 82.5%',
    contact: () => 'email   <a class="t-blue" href="mailto:mhdfaisal9061@gmail.com">mhdfaisal9061@gmail.com</a>\ngithub  <a class="t-blue" href="https://github.com/faisssss" target="_blank" rel="noopener">github.com/faisssss</a>',
    resume: () => { window.open("assets/Mohammed-Faisal-Resume.pdf", "_blank", "noopener"); return "opening resume..."; },
    clear: () => { out.innerHTML = ""; return null; },
    ls: () => '<span class="t-blue">about/</span>  <span class="t-blue">experience/</span>  <span class="t-blue">projects/</span>  <span class="t-blue">skills/</span>  <span class="t-blue">contact/</span>  resume.pdf',
    pwd: () => "/home/faisal/portfolio",
    date: () => new Date().toString(),
    echo: (args) => esc(args.join(" ")),
    hello: () => "hey there 👋 — type <span class=\"t-green\">help</span> to look around.",
    hi: () => commands.hello(),
    sudo: (args) => {
      const cmd = args.join(" ").toLowerCase();
      if (cmd.startsWith("hire")) {
        setTimeout(() => $("#contact").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" }), 900);
        return '<span class="t-dim">[sudo] password for recruiter: ********</span>\n<span class="t-green">✓ access granted.</span> excellent decision.\nredirecting you to #contact...';
      }
      return '<span class="t-red">nice try.</span> this incident will be reported. 😄';
    },
    rm: () => '<span class="t-red">rm: permission denied</span> — let\'s not do that.',
    exit: () => "there is no escape. try <span class=\"t-green\">contact</span> instead.",
  };

  const run = (raw) => {
    const line = raw.trim();
    print(prompt + esc(line));
    if (!line) return;
    history.push(line); hIndex = history.length;
    const [name, ...args] = line.split(/\s+/);
    const fn = commands[name.toLowerCase()];
    const result = fn ? fn(args) : `<span class="t-red">command not found:</span> ${esc(name)}. type <span class="t-green">help</span>.`;
    if (result) print(result);
  };

  // Boot message, typed out when the terminal first scrolls into view
  const bootLines = [
    '<span class="t-dim">Last login: ' + new Date().toDateString() + ' on ttys001</span>',
    'Welcome! This terminal is <span class="t-green">interactive</span>.',
    'Type <span class="t-green">help</span> to see what you can do.',
    "",
  ];
  let booted = false;
  new IntersectionObserver(([e], obs) => {
    if (!e.isIntersecting || booted) return;
    booted = true; obs.disconnect();
    bootLines.forEach((l, i) => setTimeout(() => print(l || "&nbsp;"), reduceMotion ? 0 : i * 220));
    setTimeout(() => run("whoami"), reduceMotion ? 0 : bootLines.length * 220 + 200);
  }, { threshold: 0.4 }).observe(body);

  form.addEventListener("submit", (e) => { e.preventDefault(); run(input.value); input.value = ""; });
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" && history.length) { hIndex = Math.max(0, hIndex - 1); input.value = history[hIndex]; e.preventDefault(); }
    else if (e.key === "ArrowDown") { hIndex = Math.min(history.length, hIndex + 1); input.value = history[hIndex] || ""; e.preventDefault(); }
    else if (e.key === "Tab") {
      e.preventDefault();
      const match = Object.keys(commands).find((c) => c.startsWith(input.value.trim().toLowerCase()));
      if (match && input.value.trim()) input.value = match;
    } else if (e.key === "l" && e.ctrlKey) { e.preventDefault(); commands.clear(); }
  });
  body.addEventListener("click", (e) => { if (!e.target.closest("a")) input.focus({ preventScroll: true }); });
  $$(".terminal__hint button").forEach((b) => b.addEventListener("click", () => {
    run(b.dataset.cmd);
    input.focus({ preventScroll: true });
  }));
})();
