/**
 * servicio.js — Exclusivo de servicios.html
 * ──────────────────────────────────────────
 * Módulos:
 *   1. FAQ Acordeón
 *   2. Brillo secuencial en pasos del proceso
 *
 * ELIMINADO (lo maneja main.js):
 *   - Menú hamburguesa
 *   - Header shrink
 *   - Scroll reveal
 */

"use strict";

// ─────────────────────────────────────────────
// 1. FAQ ACORDEÓN
// ─────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const faqItems = document.querySelectorAll(".faq-item");
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const question = item.querySelector(".faq-question");
    if (!question) return;

    question.addEventListener("click", () => {
      item.classList.toggle("active");

      faqItems.forEach(other => {
        if (other !== item) {
          other.classList.remove("active");
        }
      });
    });
  });
});

// ─────────────────────────────────────────────
// 2. BRILLO SECUENCIAL EN PROCESO
// ─────────────────────────────────────────────
(() => {
  const stepsContainer = document.querySelector(".process-steps");
  if (!stepsContainer) return;

  const steps = Array.from(stepsContainer.querySelectorAll("li"));
  if (!steps.length) return;

  let index = -1;
  let timer = null;

  const tick = () => {
    index = (index + 1) % steps.length;
    steps.forEach((li, i) => li.classList.toggle("highlight", i === index));
  };

  const start = () => {
    if (timer) return;
    tick();
    timer = setInterval(tick, 1800);
  };

  const stop = () => {
    if (!timer) return;
    clearInterval(timer);
    timer = null;
    steps.forEach(li => li.classList.remove("highlight"));
  };

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) start();
      else stop();
    });
  }, { threshold: 0.2 });

  io.observe(stepsContainer);

  window.addEventListener("beforeunload", stop);
})();