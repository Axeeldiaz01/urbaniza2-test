/**
 * slider.js — Hero Slider (index.html únicamente)
 * ─────────────────────────────────────────────────
 * • Guard de doble inicialización via dataset
 * • Autoplay pausado cuando la pestaña está oculta (Page Visibility API)
 * • Soporte táctil (swipe) y teclado (←/→)
 * • Sin dependencias externas
 */

"use strict";

(function initHeaderSlider() {
  const container = document.querySelector(".slider-container");
  if (!container || container.dataset.sliderInit) return;
  container.dataset.sliderInit = "1";

  const slides     = container.querySelectorAll(".slide");
  const indicators = container.querySelectorAll(".indicator");
  const prevBtn    = document.getElementById("prevBtn");
  const nextBtn    = document.getElementById("nextBtn");

  if (!slides.length) return;

  const AUTOPLAY_MS  = 5000;
  const SWIPE_MIN_PX = 50;

  let current  = 0;
  let timer    = null;
  let touchX   = 0;

  // ── Core ──────────────────────────────────────────
  function goTo(index) {
    slides[current].classList.remove("active");
    indicators[current]?.classList.remove("active");

    current = ((index % slides.length) + slides.length) % slides.length;

    slides[current].classList.add("active");
    indicators[current]?.classList.add("active");
  }

  const next = () => goTo(current + 1);
  const prev = () => goTo(current - 1);

  // ── Autoplay ──────────────────────────────────────
  function startAutoplay() {
    stopAutoplay();
    if (!document.hidden) timer = setInterval(next, AUTOPLAY_MS);
  }

  function stopAutoplay() {
    clearInterval(timer);
    timer = null;
  }

  // ── Eventos ───────────────────────────────────────
  prevBtn?.addEventListener("click", () => { prev(); startAutoplay(); });
  nextBtn?.addEventListener("click", () => { next(); startAutoplay(); });

  indicators.forEach((dot, i) => {
    dot.addEventListener("click", () => { goTo(i); startAutoplay(); });
  });

  container.addEventListener("mouseenter", stopAutoplay);
  container.addEventListener("mouseleave", startAutoplay);

  // Swipe táctil
  container.addEventListener("touchstart", (e) => {
    touchX = e.changedTouches[0].clientX;
  }, { passive: true });

  container.addEventListener("touchend", (e) => {
    const diff = touchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > SWIPE_MIN_PX) {
      diff > 0 ? next() : prev();
      startAutoplay();
    }
  }, { passive: true });

  // Teclado
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { next(); startAutoplay(); }
    else if (e.key === "ArrowLeft") { prev(); startAutoplay(); }
  });

  // Pausa al cambiar de pestaña
  document.addEventListener("visibilitychange", () => {
    document.hidden ? stopAutoplay() : startAutoplay();
  });

  startAutoplay();
})();