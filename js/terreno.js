/**
 * terreno.js — Buscador de inmuebles + Carruseles de cards
 * ──────────────────────────────────────────────────────────
 * Compartido: index.html · terrenos.html
 * Cada módulo tiene su propio guard; si el elemento no existe, sale en silencio.
 */

"use strict";

// ─────────────────────────────────────────────
// 1. BUSCADOR DE INMUEBLES
// ─────────────────────────────────────────────
function initBuscador() {
  const form  = document.getElementById("form-buscador");
  const input = document.getElementById("texto-busqueda");

  // Ninguno de los dos → esta página no tiene buscador
  if (!form && !input) return;

  const selectTipo = document.getElementById("tipo-inmueble");
  const CARDS_SEL  = ".card, .cardd, .terreno-card";
  const DELAY_MS   = 400;
  let   searchTimer;

  function realizarBusqueda() {
    const tipo  = (selectTipo?.value ?? "").toLowerCase();
    const texto = (input?.value ?? "").trim().toLowerCase();
    const palabras = texto ? texto.split(/\s+/) : [];

    let totalVisible = 0;

    document.querySelectorAll(CARDS_SEL).forEach(card => {
      const cardTipo     = card.dataset.tipo?.toLowerCase()     ?? "";
      const cardUbicacion= card.dataset.ubicacion?.toLowerCase() ?? "";
      const cardTitulo   = card.querySelector("h2, h3")?.textContent.toLowerCase() ?? "";

      const pasaTipo  = !tipo  || cardTipo === tipo;
      const pasaTexto = !palabras.length ||
        palabras.some(p => cardUbicacion.includes(p) || cardTitulo.includes(p));

      const visible = pasaTipo && pasaTexto;
      card.style.display = visible ? "" : "none";
      if (visible) totalVisible++;
    });

    // Mensaje de sin resultados
    document.querySelector(".mensaje-busqueda")?.remove();

    if (totalVisible === 0) {
      const wrapper = document.querySelector(".terrenos-wrapper, .cards-wrapper, #terrenos-disponibles .container");
      if (wrapper) {
        const msg = Object.assign(document.createElement("div"), {
          className: "mensaje-busqueda",
          innerHTML: `<div style="text-align:center;margin-top:2rem;">
                        <h3>No se encontraron inmuebles</h3>
                        <p>Intenta ajustar los filtros de búsqueda</p>
                      </div>`,
        });
        wrapper.appendChild(msg);
      }
    }
  }

  // Búsqueda en tiempo real con debounce
  input?.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      const len = input.value.length;
      if (len === 0 || len >= 2) realizarBusqueda();
    }, DELAY_MS);
  });

  selectTipo?.addEventListener("change", realizarBusqueda);

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    realizarBusqueda();
  });
}

// ─────────────────────────────────────────────
// 2. CARRUSELES DE CARDS (.carrusel-chorrillos)
// ─────────────────────────────────────────────
function initCarruseles() {

  document.querySelectorAll(".carrusel-chorrillos").forEach((carrusel) => {

    const container = carrusel.querySelector(".carrusel-container");
    const slides = carrusel.querySelectorAll(".carrusel-slide");
    const indicadores = carrusel.querySelectorAll(".indicador");

    if (!slides.length || !container) return;

    const INTERVAL_MS = 3000;

    let index = 0;
    let timer = null;

    let startX = 0;

    function actualizarCarrusel() {

      container.style.transform =
        `translateX(-${index * 100}%)`;

      indicadores.forEach((ind, i) => {
        ind.classList.toggle("active", i === index);
      });

    }

    function mostrarSlide(i) {

      index =
        ((i % slides.length) + slides.length) %
        slides.length;

      actualizarCarrusel();

    }

    function startTimer() {

      clearInterval(timer);

      timer = setInterval(() => {
        mostrarSlide(index + 1);
      }, INTERVAL_MS);

    }

    indicadores.forEach((ind, i) => {

      ind.addEventListener("click", () => {
        mostrarSlide(i);
        startTimer();
      });

    });

    /* Swipe móvil */

    carrusel.addEventListener("touchstart", (e) => {

      startX = e.touches[0].clientX;

    }, { passive: true });

    carrusel.addEventListener("touchend", (e) => {

      const endX = e.changedTouches[0].clientX;

      const distancia = startX - endX;

      if (Math.abs(distancia) < 50) return;

      if (distancia > 0) {
        mostrarSlide(index + 1);
      } else {
        mostrarSlide(index - 1);
      }

      startTimer();

    }, { passive: true });

    carrusel.addEventListener("mouseenter", () => {
      clearInterval(timer);
    });

    carrusel.addEventListener("mouseleave", startTimer);

    actualizarCarrusel();
    startTimer();

  });

}
// ─────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initBuscador();
  initCarruseles();
});