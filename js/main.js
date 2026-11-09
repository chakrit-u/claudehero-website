/* ==========================================================
   ClaudeHero — Interactions
   ========================================================== */
(() => {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Year ---------- */
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Navbar ---------- */
  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const toggle = $("#navToggle");
  const menu = $("#navMenu");
  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "ปิดเมนู" : "เปิดเมนู");
    menu.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
  };
  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  /* ---------- Hero title split ---------- */
  const title = $("[data-split]");
  if (title) {
    let i = 0;
    const wrap = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
          const w = document.createElement("span");
          w.className = "word";
          const inner = document.createElement("span");
          inner.style.setProperty("--i", i++);
          inner.textContent = part;
          w.appendChild(inner);
          frag.appendChild(w);
        });
        node.replaceWith(frag);
      } else {
        Array.from(node.childNodes).forEach(wrap);
      }
    };
    Array.from(title.childNodes).forEach(wrap);
    requestAnimationFrame(() => requestAnimationFrame(() => title.classList.add("is-in")));
  }

  /* ---------- Reveal on scroll ---------- */
  const reveals = $$(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  /* ---------- Count up ---------- */
  const counters = $$("[data-count]");
  const runCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    if (reduceMotion) { el.textContent = target.toFixed(decimals); return; }
    const duration = 2000;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      el.textContent = (target * eased).toFixed(decimals);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ("IntersectionObserver" in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { runCount(entry.target); cio.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => cio.observe(el));
  } else {
    counters.forEach(runCount);
  }

  /* ---------- Hero canvas: particle network ---------- */
  const canvas = $("#heroCanvas");
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext("2d");
    const hero = canvas.parentElement;
    const mouse = { x: -9999, y: -9999 };
    let w, h, dpr, particles = [], rafId = null, visible = true;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = hero.clientWidth;
      h = hero.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(110, (w * h) / (w < 700 ? 16000 : 11000)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.4 + 0.4,
      }));
      if (reduceMotion) draw();
    };

    const LINK = 130;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (!reduceMotion) {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;
          // gentle mouse repel
          const mx = p.x - mouse.x, my = p.y - mouse.y;
          const md = mx * mx + my * my;
          if (md < 14400) {
            const f = (1 - Math.sqrt(md) / 120) * 0.6;
            p.x += (mx / (Math.sqrt(md) || 1)) * f;
            p.y += (my / (Math.sqrt(md) || 1)) * f;
          }
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const d = dx * dx + dy * dy;
          if (d < LINK * LINK) {
            ctx.strokeStyle = `rgba(255,255,255,${(1 - Math.sqrt(d) / LINK) * 0.16})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
        // links to mouse
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const d = dx * dx + dy * dy;
        if (d < 180 * 180) {
          ctx.strokeStyle = `rgba(255,255,255,${(1 - Math.sqrt(d) / 180) * 0.35})`;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    };

    const loop = () => {
      draw();
      rafId = visible ? requestAnimationFrame(loop) : null;
    };

    resize();
    let resizeT;
    window.addEventListener("resize", () => { clearTimeout(resizeT); resizeT = setTimeout(resize, 150); });
    hero.addEventListener("mousemove", (e) => {
      const r = hero.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    });
    hero.addEventListener("mouseleave", () => { mouse.x = mouse.y = -9999; });

    if (!reduceMotion) {
      new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !rafId) loop();
      }).observe(hero);
      loop();
    }
  }

  /* ---------- Custom cursor ---------- */
  if (finePointer && !reduceMotion) {
    const ring = $(".cursor");
    const dot = $(".cursor-dot");
    let x = 0, y = 0, rx = 0, ry = 0;
    document.body.classList.add("has-cursor");
    window.addEventListener("mousemove", (e) => {
      x = e.clientX; y = e.clientY;
      dot.style.transform = `translate(${x}px, ${y}px)`;
    });
    const follow = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(follow);
    };
    follow();
    document.addEventListener("mouseover", (e) => {
      ring.classList.toggle("is-hover", !!e.target.closest("a, button, .card, input, textarea, select"));
    });
    document.addEventListener("mouseleave", () => document.body.classList.remove("has-cursor"));
    document.addEventListener("mouseenter", () => document.body.classList.add("has-cursor"));
  }

  /* ---------- Card spotlight ---------- */
  $$(".card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  /* ---------- Magnetic buttons ---------- */
  if (finePointer && !reduceMotion) {
    $$(".magnetic").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const mx = e.clientX - r.left - r.width / 2;
        const my = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${mx * 0.2}px, ${my * 0.3}px)`;
      });
      btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
    });
  }

  /* ---------- Pricing toggle ---------- */
  const billingSwitch = $("#billingSwitch");
  if (billingSwitch) {
    billingSwitch.addEventListener("click", () => {
      const yearly = billingSwitch.getAttribute("aria-checked") !== "true";
      billingSwitch.setAttribute("aria-checked", String(yearly));
      $$("[data-billing-label]").forEach((l) =>
        l.classList.toggle("is-active", (l.dataset.billingLabel === "yearly") === yearly)
      );
      $$(".amount[data-monthly]").forEach((el) => {
        el.classList.add("is-swapping");
        setTimeout(() => {
          el.textContent = yearly ? el.dataset.yearly : el.dataset.monthly;
          el.classList.remove("is-swapping");
        }, 220);
      });
    });
  }

  /* ---------- Testimonial slider ---------- */
  const slider = $("#slider");
  if (slider) {
    const slides = $$(".quote", slider);
    const dotsWrap = $(".slider__dots", slider);
    let index = 0, timer = null;
    const INTERVAL = 6000;

    const dots = slides.map((_, i) => {
      const b = document.createElement("button");
      b.setAttribute("role", "tab");
      b.setAttribute("aria-label", `รีวิวที่ ${i + 1}`);
      b.addEventListener("click", () => { go(i); restart(); });
      dotsWrap.appendChild(b);
      return b;
    });

    const go = (i) => {
      index = (i + slides.length) % slides.length;
      slides.forEach((s, k) => {
        s.classList.toggle("is-active", k === index);
        s.setAttribute("aria-hidden", String(k !== index));
      });
      dots.forEach((d, k) => {
        d.classList.remove("is-active");
        d.setAttribute("aria-selected", String(k === index));
      });
      void dots[index].offsetWidth; // restart fill animation
      dots[index].classList.add("is-active");
    };
    const restart = () => {
      clearInterval(timer);
      if (!reduceMotion) timer = setInterval(() => go(index + 1), INTERVAL);
    };

    $$(".slider__btn", slider).forEach((b) =>
      b.addEventListener("click", () => { go(index + Number(b.dataset.dir)); restart(); })
    );
    slider.addEventListener("mouseenter", () => { clearInterval(timer); slider.classList.add("is-paused"); });
    slider.addEventListener("mouseleave", () => { slider.classList.remove("is-paused"); restart(); });

    // swipe
    let startX = null;
    slider.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener("touchend", (e) => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) { go(index + (dx < 0 ? 1 : -1)); restart(); }
      startX = null;
    });

    go(0);
    restart();
  }

  /* ---------- FAQ accordion ---------- */
  $$(".acc").forEach((acc) => {
    const head = $(".acc__head", acc);
    head.addEventListener("click", () => {
      const open = !acc.classList.contains("is-open");
      $$(".acc.is-open").forEach((o) => {
        o.classList.remove("is-open");
        $(".acc__head", o).setAttribute("aria-expanded", "false");
      });
      acc.classList.toggle("is-open", open);
      head.setAttribute("aria-expanded", String(open));
    });
  });

  /* ---------- Contact form ---------- */
  const form = $("#contactForm");
  if (form) {
    const select = $("#service", form);
    const syncSelect = () => select.classList.toggle("has-value", !!select.value);
    select.addEventListener("change", syncSelect);
    syncSelect();

    const rules = {
      name: (v) => (v.trim().length >= 2 ? "" : "กรุณากรอกชื่อ-นามสกุล"),
      email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "กรุณากรอกอีเมลให้ถูกต้อง"),
      service: (v) => (v ? "" : "กรุณาเลือกบริการที่สนใจ"),
      message: (v) => (v.trim().length >= 10 ? "" : "กรุณาระบุรายละเอียดอย่างน้อย 10 ตัวอักษร"),
    };

    const validate = (field) => {
      const rule = rules[field.name];
      if (!rule) return true;
      const msg = rule(field.value);
      const wrap = field.closest(".field");
      wrap.classList.toggle("is-invalid", !!msg);
      $(".field__error", wrap).textContent = msg;
      field.setAttribute("aria-invalid", String(!!msg));
      return !msg;
    };

    $$("input, textarea, select", form).forEach((f) => {
      f.addEventListener("blur", () => validate(f));
      f.addEventListener("input", () => { if (f.closest(".field").classList.contains("is-invalid")) validate(f); });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fields = $$("input, textarea, select", form);
      const results = fields.map(validate);
      const success = $(".form__success", form);
      if (results.every(Boolean)) {
        const btn = $("button[type=submit]", form);
        btn.disabled = true;
        btn.firstChild.textContent = "กำลังส่ง... ";
        setTimeout(() => {
          form.reset();
          syncSelect();
          btn.disabled = false;
          btn.firstChild.textContent = "ส่งข้อความ ";
          success.textContent = "✓ ขอบคุณครับ ทีมงานจะติดต่อกลับภายใน 24 ชั่วโมง";
          setTimeout(() => (success.textContent = ""), 6000);
        }, 900);
      } else {
        success.textContent = "";
        const firstInvalid = fields[results.indexOf(false)];
        if (firstInvalid) firstInvalid.focus();
      }
    });
  }
})();
