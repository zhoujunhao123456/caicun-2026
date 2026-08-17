/* 月湾竹韵 · 智绘蔡村 — 交互脚本 */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";

  /* ---------- 数字计数（无 GSAP 时的兜底） ---------- */
  function finalCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var dec = parseInt(el.getAttribute("data-decimals") || "0", 10);
    el.textContent = target.toFixed(dec);
  }

  if (!hasGsap || prefersReduced) {
    // 不使用动画：内容直接可见，数字直接落定
    document.querySelectorAll(".stat-num, .ind-num").forEach(finalCount);
  }

  if (hasGsap && !prefersReduced) {
    document.documentElement.classList.add("js-anim");
    gsap.registerPlugin(ScrollTrigger);

    /* ---------- Lenis 平滑滚动 ---------- */
    var lenis = null;
    if (typeof window.Lenis !== "undefined") {
      lenis = new Lenis({ duration: 1.15, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    }

    // 锚点跳转交给 Lenis
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (id.length > 1 && document.querySelector(id)) {
          e.preventDefault();
          if (lenis) lenis.scrollTo(id, { offset: -20 });
          else document.querySelector(id).scrollIntoView({ behavior: "smooth" });
        }
      });
    });

    /* ---------- Hero 入场 ---------- */
    var heroIn = gsap.timeline({ defaults: { ease: "power3.out" } });
    heroIn
      .fromTo("#heroBg img", { scale: 1.14 }, { scale: 1.02, duration: 3.2, ease: "power2.out" }, 0)
      .to(".hero-eyebrow", { opacity: 1, y: 0, duration: 1.0 }, 0.5)
      .to(".hero-title-line", { opacity: 1, y: 0, duration: 1.15, stagger: 0.22 }, 0.75)
      .to(".hero-title-dot", { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "back.out(2.5)" }, 1.35)
      .to(".hero-sub", { opacity: 1, y: 0, duration: 1.0 }, 1.5)
      .to(".hero-date", { opacity: 1, y: 0, duration: 1.0 }, 1.7);

    // Hero 背景视差
    gsap.to("#heroBg", {
      yPercent: 16,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });

    /* ---------- 通用 reveal ---------- */
    ScrollTrigger.batch(".reveal", {
      start: "top 88%",
      once: true,
      onEnter: function (batch) {
        gsap.to(batch, { opacity: 1, y: 0, duration: 1.0, ease: "power3.out", stagger: 0.09 });
      }
    });

    /* ---------- 时间轴线生长 ---------- */
    gsap.fromTo("#timelineLine", { scaleY: 0 }, {
      scaleY: 1,
      ease: "none",
      scrollTrigger: { trigger: ".timeline", start: "top 75%", end: "bottom 60%", scrub: 0.6 }
    });

    /* ---------- 非遗段落背景视差 ---------- */
    gsap.fromTo("#heritageBg", { yPercent: -8 }, {
      yPercent: 8,
      ease: "none",
      scrollTrigger: { trigger: ".heritage", start: "top bottom", end: "bottom top", scrub: true }
    });

    /* ---------- 数字计数 ---------- */
    document.querySelectorAll(".stat-num, .ind-num").forEach(function (el) {
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

    /* ---------- 导航显隐与变色 ---------- */
    ScrollTrigger.create({
      start: "top -80",
      onUpdate: function (self) {
        document.getElementById("nav").classList.toggle("scrolled", self.scroll() > window.innerHeight * 0.72);
      }
    });
  } else {
    /* ---------- 无动画模式：导航变色用原生滚动 ---------- */
    var nav = document.getElementById("nav");
    var onScroll = function () {
      nav.classList.toggle("scrolled", window.scrollY > window.innerHeight * 0.72);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- 灯箱 ---------- */
  var items = Array.prototype.slice.call(document.querySelectorAll(".g-item"));
  var lightbox = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var lbCap = document.getElementById("lbCap");
  var idx = 0;

  function openLb(i) {
    idx = (i + items.length) % items.length;
    var img = items[idx].querySelector("img");
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbCap.textContent = items[idx].getAttribute("data-cap") || img.alt;
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeLb() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  items.forEach(function (item, i) {
    item.addEventListener("click", function () { openLb(i); });
  });
  document.getElementById("lbClose").addEventListener("click", closeLb);
  document.getElementById("lbPrev").addEventListener("click", function (e) { e.stopPropagation(); openLb(idx - 1); });
  document.getElementById("lbNext").addEventListener("click", function (e) { e.stopPropagation(); openLb(idx + 1); });
  lightbox.addEventListener("click", function (e) { if (e.target === lightbox) closeLb(); });
  document.addEventListener("keydown", function (e) {
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowLeft") openLb(idx - 1);
    if (e.key === "ArrowRight") openLb(idx + 1);
  });
})();
