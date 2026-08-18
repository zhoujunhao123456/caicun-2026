/* 月湾竹韵 · 智绘蔡村 — 交互脚本 */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  var hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ---------- 拆字：逐字包 .ch  span ---------- */
  function splitChars(el) {
    var text = el.textContent;
    el.textContent = "";
    Array.prototype.forEach.call(Array.from(text), function (chr) {
      var s = document.createElement("span");
      s.className = "ch";
      s.textContent = chr === " " ? " " : chr;
      el.appendChild(s);
    });
    return $$(".ch", el);
  }

  /* ---------- 数字计数兜底 ---------- */
  function finalCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var dec = parseInt(el.getAttribute("data-decimals") || "0", 10);
    el.textContent = target.toFixed(dec);
  }

  /* ---------- 灯箱（全模式可用） ---------- */
  var items = $$(".g-item");
  var lightbox = $("#lightbox");
  var lbImg = $("#lbImg");
  var lbCap = $("#lbCap");
  var lbCount = $("#lbCount");
  var lbClose = $("#lbClose");
  var idx = 0;
  var lastTrigger = null;
  var lenis = null;

  function preloadAround(i) {
    [i - 1, i + 1].forEach(function (n) {
      var t = items[(n + items.length) % items.length];
      if (t) { var im = new Image(); im.src = t.querySelector("img").src; }
    });
  }

  function fillLb() {
    var img = items[idx].querySelector("img");
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbCap.textContent = items[idx].getAttribute("data-cap") || img.alt;
    lbCount.textContent = (idx + 1) + " / " + items.length;
    preloadAround(idx);
  }

  function slideLb(dir) {
    idx = (idx + dir + items.length) % items.length;
    if (hasGsap && !prefersReduced) {
      gsap.to([lbImg, lbCap], {
        opacity: 0, x: -30 * dir, duration: 0.22, ease: "power2.in",
        onComplete: function () {
          fillLb();
          gsap.fromTo([lbImg, lbCap], { opacity: 0, x: 30 * dir }, { opacity: 1, x: 0, duration: 0.42, ease: "power3.out" });
        }
      });
    } else {
      fillLb();
    }
  }

  function openLb(i, trigger) {
    idx = (i + items.length) % items.length;
    lastTrigger = trigger || lastTrigger;
    fillLb();
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    if (lenis) lenis.stop();
    if (hasGsap && !prefersReduced) {
      gsap.fromTo(lbImg, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.45, ease: "power3.out" });
      gsap.fromTo(lbCap, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" });
    }
    // .lightbox.open 的 transition 省略 visibility，打开瞬间即可聚焦
    lbClose.focus();
  }

  function closeLb() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lenis) lenis.start();
    if (lastTrigger) { lastTrigger.focus(); lastTrigger = null; }
  }

  items.forEach(function (item, i) {
    item.setAttribute("tabindex", "0");
    item.setAttribute("role", "button");
    item.setAttribute("aria-label", "查看大图：" + (item.getAttribute("data-cap") || ""));
    item.addEventListener("click", function () { openLb(i, item); });
    item.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLb(i, item); }
    });
  });
  lbClose.addEventListener("click", closeLb);
  $("#lbPrev").addEventListener("click", function (e) { e.stopPropagation(); slideLb(-1); });
  $("#lbNext").addEventListener("click", function (e) { e.stopPropagation(); slideLb(1); });
  lightbox.addEventListener("click", function (e) { if (e.target === lightbox) closeLb(); });
  document.addEventListener("keydown", function (e) {
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") { closeLb(); return; }
    if (e.key === "ArrowLeft") { slideLb(-1); return; }
    if (e.key === "ArrowRight") { slideLb(1); return; }
    if (e.key === "Tab") {
      var focusables = [lbClose, $("#lbPrev"), $("#lbNext")].filter(Boolean);
      if (!focusables.length) return;
      var first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* 灯箱滑动手势 */
  var swipeX = null;
  var lbStage = $(".lb-stage");
  lbStage.addEventListener("pointerdown", function (e) { swipeX = e.clientX; });
  lbStage.addEventListener("pointerup", function (e) {
    if (swipeX === null) return;
    var d = e.clientX - swipeX;
    swipeX = null;
    if (Math.abs(d) > 48) slideLb(d < 0 ? 1 : -1);
  });

  /* ---------- 移动端菜单 ---------- */
  var burger = $("#navBurger");
  var mobileMenu = $("#mobileMenu");

  function setMenu(open) {
    document.body.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
    mobileMenu.setAttribute("aria-hidden", String(!open));
    if (lenis) { open ? lenis.stop() : lenis.start(); }
    if (open) {
      var first = mobileMenu.querySelector(".mm-links a");
      if (first) {
        void mobileMenu.offsetWidth; // 强制样式回排，使菜单 visibility:visible 后再聚焦
        first.focus();
      }
    } else {
      burger.focus();
    }
  }
  burger.addEventListener("click", function () {
    setMenu(!document.body.classList.contains("menu-open"));
  });
  document.addEventListener("keydown", function (e) {
    if (document.body.classList.contains("menu-open")) {
      if (e.key === "Escape") { setMenu(false); return; }
      if (e.key === "Tab") {
        var links = mobileMenu.querySelectorAll(".mm-links a");
        if (!links.length) return;
        var first = links[0], last = links[links.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
  });

  /* ---------- 回到卷首 ---------- */
  var toTop = $("#toTop");
  var navProgress = $("#navProgress");

  function scrollToTop() {
    if (lenis) lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
  }
  toTop.addEventListener("click", scrollToTop);

  /* ---------- 锚点跳转 ---------- */
  function bindAnchors() {
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (id.length > 1 && $(id)) {
          e.preventDefault();
          if (document.body.classList.contains("menu-open")) setMenu(false);
          if (lenis) lenis.scrollTo(id, { offset: -20 });
          else $(id).scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth" });
          if (a.classList.contains("skip-link")) $(id).focus();
        }
      });
    });
  }

  /* ---------- 无动画 / 无 GSAP 模式 ---------- */
  if (!hasGsap || prefersReduced) {
    document.querySelectorAll(".stat-num, .ind-num").forEach(finalCount);
    var pre0 = $("#preloader");
    if (pre0) pre0.style.display = "none";

    var nav = $("#nav");
    var onScroll = function () {
      var y = window.scrollY;
      nav.classList.toggle("scrolled", y > window.innerHeight * 0.72);
      toTop.classList.toggle("show", y > window.innerHeight * 1.2);
      var max = document.documentElement.scrollHeight - window.innerHeight;
      navProgress.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    bindAnchors();
    return;
  }

  /* ============================================================
     GSAP 动画模式
     ============================================================ */
  document.documentElement.classList.add("js-anim");
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Lenis 平滑滚动 ---------- */
  if (typeof window.Lenis !== "undefined") {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  bindAnchors();

  /* ---------- Hero 标题拆字 ---------- */
  var heroChars = [];
  $$(".hero-title-line").forEach(function (line) {
    line.classList.remove("reveal-hero");
    heroChars = heroChars.concat(splitChars(line));
  });
  gsap.set(heroChars, { opacity: 0, y: "0.55em", rotate: 5, filter: "blur(8px)" });

  /* ---------- Hero 入场时间线（预加载结束后播放） ---------- */
  var heroIn = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
  heroIn
    .fromTo("#heroBg img", { scale: 1.14 }, { scale: 1.02, duration: 3.2, ease: "power2.out" }, 0)
    .to(".hero-eyebrow", { opacity: 1, y: 0, duration: 1.0 }, 0.4)
    .to(heroChars, { opacity: 1, y: 0, rotate: 0, filter: "blur(0px)", duration: 1.1, stagger: 0.08 }, 0.65)
    .to(".hero-title-dot", { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "back.out(2.5)" }, 1.55)
    .to(".hero-sub", { opacity: 1, y: 0, duration: 1.0 }, 1.7)
    .to(".hero-date", { opacity: 1, y: 0, duration: 1.0 }, 1.85)
    .to(".hero-latin", { opacity: 1, y: 0, duration: 1.0 }, 2.0);

  /* ---------- 开场预加载 ---------- */
  var pre = $("#preloader");
  var preCount = $("#preCount");
  var cnt = { v: 0 };
  function renderCnt() { preCount.textContent = String(Math.round(cnt.v)).padStart(2, "0"); }

  document.body.style.overflow = "hidden";
  if (lenis) lenis.stop();

  gsap.timeline()
    .fromTo("#preSeal", { opacity: 0, scale: 1.7, rotate: -16 }, { opacity: 1, scale: 1, rotate: -6, duration: 0.7, ease: "power3.out" }, 0.1)
    .fromTo(".pre-title", { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.8 }, 0.4)
    .fromTo(".pre-count", { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.6)
    .to(cnt, { v: 90, duration: 1.6, ease: "power1.inOut", onUpdate: renderCnt }, 0.3);

  var pageReady = Promise.all([
    document.fonts
      ? Promise.race([document.fonts.ready, new Promise(function (r) { setTimeout(r, 2000); })])
      : Promise.resolve(),
    new Promise(function (res) {
      if (document.readyState === "complete") res();
      else window.addEventListener("load", res, { once: true });
      setTimeout(res, 2800);
    })
  ]);

  pageReady.then(function () {
    gsap.timeline()
      .to(cnt, { v: 100, duration: 0.45, ease: "power2.out", onUpdate: renderCnt })
      .to(".pre-inner", { opacity: 0, y: -26, duration: 0.5, ease: "power2.in" }, "+=0.15")
      .to(".pre-vertical", { opacity: 0, duration: 0.4 }, "<")
      .to(pre, { clipPath: "inset(0 0 100% 0)", duration: 0.9, ease: "power4.inOut" }, "-=0.12")
      .add(function () {
        pre.style.display = "none";
        document.body.style.overflow = "";
        if (lenis) lenis.start();
        heroIn.play();
      }, "-=0.1");
  });

  /* ---------- Hero 背景滚动视差 ---------- */
  gsap.to("#heroBg", {
    yPercent: 16,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
  });

  /* ---------- Hero 鼠标视差（仅桌面） ---------- */
  if (finePointer) {
    gsap.set("#heroSide", { yPercent: -50 });
    var layers = $$("[data-depth]").map(function (el) {
      return {
        depth: parseFloat(el.getAttribute("data-depth")),
        xTo: gsap.quickTo(el, "x", { duration: 0.9, ease: "power3.out" }),
        yTo: gsap.quickTo(el, "y", { duration: 0.9, ease: "power3.out" })
      };
    });
    $("#hero").addEventListener("mousemove", function (e) {
      var rx = e.clientX / window.innerWidth - 0.5;
      var ry = e.clientY / window.innerHeight - 0.5;
      layers.forEach(function (l) {
        l.xTo(-rx * l.depth * 2.2);
        l.yTo(-ry * l.depth * 1.3);
      });
    });
  }

  /* ---------- 自定义墨点光标（仅桌面） ---------- */
  if (finePointer) {
    document.documentElement.classList.add("has-cursor");
    var cursor = $("#cursor");
    var cDot = $(".cursor-dot");
    var cRing = $(".cursor-ring");
    gsap.set([cDot, cRing], { xPercent: -50, yPercent: -50, x: window.innerWidth / 2, y: window.innerHeight / 2 });
    var dX = gsap.quickTo(cDot, "x", { duration: 0.12, ease: "power2.out" });
    var dY = gsap.quickTo(cDot, "y", { duration: 0.12, ease: "power2.out" });
    var rX = gsap.quickTo(cRing, "x", { duration: 0.45, ease: "power2.out" });
    var rY = gsap.quickTo(cRing, "y", { duration: 0.45, ease: "power2.out" });
    window.addEventListener("mousemove", function (e) {
      dX(e.clientX); dY(e.clientY); rX(e.clientX); rY(e.clientY);
    });
    document.addEventListener("mouseover", function (e) {
      var view = !!(e.target.closest && e.target.closest(".g-item, .day-photos figure, .red-photo"));
      var link = !!(e.target.closest && e.target.closest("a, button"));
      cursor.classList.toggle("is-view", view);
      cursor.classList.toggle("is-link", link && !view);
    });
    document.addEventListener("mousedown", function () { cursor.classList.add("is-down"); });
    document.addEventListener("mouseup", function () { cursor.classList.remove("is-down"); });
    document.documentElement.addEventListener("mouseleave", function () { gsap.to(cursor, { opacity: 0, duration: 0.25 }); });
    document.documentElement.addEventListener("mouseenter", function () { gsap.to(cursor, { opacity: 1, duration: 0.25 }); });
  }

  /* ---------- 章节标题逐字入场 ---------- */
  $$(".section-title[data-split]").forEach(function (title) {
    var chars = splitChars(title);
    gsap.set(chars, { opacity: 0, y: "0.6em", filter: "blur(6px)" });
    ScrollTrigger.create({
      trigger: title,
      start: "top 86%",
      once: true,
      onEnter: function () {
        gsap.to(chars, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.9, stagger: 0.05, ease: "power3.out" });
      }
    });
  });

  /* ---------- 水印大字视差 ---------- */
  $$(".watermark").forEach(function (wm) {
    gsap.fromTo(wm, { yPercent: 16 }, {
      yPercent: -16,
      ease: "none",
      scrollTrigger: { trigger: wm.parentElement, start: "top bottom", end: "bottom top", scrub: true }
    });
  });

  /* ---------- 通用 reveal（足迹区除外，单独处理） ---------- */
  var outerReveals = $$(".reveal").filter(function (el) { return !el.closest(".journey-track"); });
  ScrollTrigger.batch(outerReveals, {
    start: "top 88%",
    once: true,
    onEnter: function (batch) {
      gsap.to(batch, { opacity: 1, y: 0, duration: 1.0, ease: "power3.out", stagger: 0.09 });
    }
  });

  /* ---------- 图片揭幕：图集 + 红色记忆 ---------- */
  gsap.set(".g-item", { clipPath: "inset(0 0 100% 0)", y: 26 });
  ScrollTrigger.batch(".g-item", {
    start: "top 92%",
    once: true,
    onEnter: function (batch) {
      gsap.to(batch, {
        clipPath: "inset(0 0 0% 0)", y: 0, duration: 1.1, ease: "power3.out", stagger: 0.07,
        onComplete: function () { gsap.set(batch, { clearProps: "clipPath,transform" }); }
      });
    }
  });
  $$(".red-photo").forEach(function (fig) {
    gsap.fromTo(fig, { clipPath: "inset(0 0 100% 0)", y: 26 }, {
      clipPath: "inset(0 0 0% 0)", y: 0, duration: 1.2, ease: "power3.out",
      scrollTrigger: { trigger: fig, start: "top 85%", once: true },
      onComplete: function () { gsap.set(fig, { clearProps: "clipPath,transform" }); }
    });
  });

  /* ---------- 非遗段落背景视差 ---------- */
  gsap.fromTo("#heritageBg", { yPercent: -8 }, {
    yPercent: 8,
    ease: "none",
    scrollTrigger: { trigger: ".heritage", start: "top bottom", end: "bottom top", scrub: true }
  });

  /* ---------- 实践足迹：横向长卷（桌面）/ 竖排时间线（窄屏与触屏） ---------- */
  var journeySection = $("#journey");
  var track = $("#journeyTrack");
  var jpBar = $("#jpBar");
  var mm = gsap.matchMedia();

  mm.add("(min-width: 861px) and (pointer: fine)", function () {
    journeySection.classList.add("is-horizontal");

    var getAmount = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
    var scrollTween = gsap.to(track, {
      x: function () { return -getAmount(); },
      ease: "none",
      scrollTrigger: {
        trigger: "#journeyBody",
        start: "top top",
        end: function () { return "+=" + (getAmount() + window.innerHeight * 0.1); },
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: function (self) { jpBar.style.transform = "scaleX(" + self.progress + ")"; }
      }
    });

    $$(".journey-track .day").forEach(function (day) {
      var text = $(".day-text", day);
      var figs = $$("figure", day);
      var ghost = $(".day-ghost", day);
      gsap.set(figs, { clipPath: "inset(0 0 100% 0)", y: 26 });

      var tl = gsap.timeline({
        scrollTrigger: { trigger: day, containerAnimation: scrollTween, start: "left 75%", once: true }
      });
      tl.to(text, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" }, 0)
        .to(figs, {
          clipPath: "inset(0 0 0% 0)", y: 0, duration: 1.1, stagger: 0.12, ease: "power3.out",
          onComplete: function () { gsap.set(figs, { clearProps: "clipPath,transform" }); }
        }, 0.15);

      if (ghost) {
        gsap.fromTo(ghost, { xPercent: 24 }, {
          xPercent: -24,
          ease: "none",
          scrollTrigger: { trigger: day, containerAnimation: scrollTween, start: "left right", end: "right left", scrub: true }
        });
      }
    });

    return function () { journeySection.classList.remove("is-horizontal"); };
  });

  mm.add("(max-width: 860px), (pointer: coarse)", function () {
    /* 竖排：时间线生长 */
    gsap.fromTo("#timelineLine", { scaleY: 0 }, {
      scaleY: 1,
      ease: "none",
      scrollTrigger: { trigger: "#journeyTrack", start: "top 75%", end: "bottom 60%", scrub: 0.6 }
    });
    /* 竖排：文字 reveal */
    ScrollTrigger.batch($$(".journey-track .reveal"), {
      start: "top 88%",
      once: true,
      onEnter: function (batch) {
        gsap.to(batch, { opacity: 1, y: 0, duration: 1.0, ease: "power3.out", stagger: 0.09 });
      }
    });
    /* 竖排：照片揭幕 */
    $$(".journey-track .day-photos figure").forEach(function (fig) {
      gsap.fromTo(fig, { clipPath: "inset(0 0 100% 0)", y: 26 }, {
        clipPath: "inset(0 0 0% 0)", y: 0, duration: 1.1, ease: "power3.out",
        scrollTrigger: { trigger: fig, start: "top 88%", once: true },
        onComplete: function () { gsap.set(fig, { clearProps: "clipPath,transform" }); }
      });
    });
  });

  /* ---------- 数字计数 ---------- */
  $$(".stat-num, .ind-num").forEach(function (el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var dec = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var obj = { v: 0 };
    gsap.to(obj, {
      v: target,
      duration: 2.0,
      ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
      onUpdate: function () { el.textContent = obj.v.toFixed(dec); },
      onComplete: function () { el.textContent = target.toFixed(dec); }
    });
  });

  /* ---------- 导航：变色 / 进度 / 当前章节 / 回到卷首 ---------- */
  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: function (self) {
      var y = self.scroll();
      $("#nav").classList.toggle("scrolled", y > window.innerHeight * 0.72);
      toTop.classList.toggle("show", y > window.innerHeight * 1.2);
      navProgress.style.transform = "scaleX(" + self.progress + ")";
    }
  });

  $$(".nav-links a").forEach(function (a) {
    var target = a.getAttribute("href");
    ScrollTrigger.create({
      trigger: target,
      start: "top 55%",
      end: "bottom 55%",
      onToggle: function (self) { a.classList.toggle("active", self.isActive); }
    });
  });
})();
