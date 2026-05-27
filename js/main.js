/**
 * main.js — Global
 * ──────────────────────────────────────────────────────────────
 * Corre en: TODAS las páginas
 */

"use strict";

// ─────────────────────────────────────────────
// 1. SCROLL REVEAL
// ─────────────────────────────────────────────
function initScrollAnimaciones() {
  const elements = document.querySelectorAll(".reveal");
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.15 });

  elements.forEach(el => observer.observe(el));
}

// ─────────────────────────────────────────────
// 2. MODAL IMAGEN (zoom) — REUTILIZABLE
// ─────────────────────────────────────────────
function abrirModal(src, alt, caption) {
  const modalExistente = document.querySelector(".modal-imagen");
  if (modalExistente) modalExistente.remove();

  const modal = document.createElement("div");
  modal.className = "modal-imagen";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");

  const img = document.createElement("img");
  img.src = src;
  img.alt = alt || "Imagen ampliada";
  modal.appendChild(img);

  if (caption) {
    const captionEl = document.createElement("div");
    captionEl.className = "modal-caption";
    captionEl.textContent = caption;
    modal.appendChild(captionEl);
  }

  document.body.appendChild(modal);
  modal.getBoundingClientRect();
  modal.classList.add("activo");

  function cerrar() {
    modal.classList.remove("activo");
    setTimeout(() => modal.remove(), 300);
    document.removeEventListener("keydown", onKeyDown);
  }

  function onKeyDown(e) {
    if (e.key === "Escape") cerrar();
  }

  modal.addEventListener("click", cerrar);
  document.addEventListener("keydown", onKeyDown);
}

function initModalImagen() {
  const images = document.querySelectorAll(".img-container img, .galeria img");
  images.forEach(img => {
    img.style.cursor = "zoom-in";
    img.addEventListener("click", (e) => {
      e.stopPropagation();
      abrirModal(img.src, img.alt);
    });
  });
}

// ─────────────────────────────────────────────
// 3. GUÍA COMPRADORES — Zoom cards
// ─────────────────────────────────────────────
function initGuiaCompradores() {
  const cards = document.querySelectorAll(".guia-card");
  if (!cards.length) return;

  cards.forEach(card => {
    const img = card.querySelector("img");
    if (!img) return;

    card.style.cursor = "pointer";
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");

    const caption = card.dataset.caption || "";

    function abrir(e) {
      if (e.target.closest("a")) return;
      e.stopPropagation();
      abrirModal(img.src, img.alt, caption);
    }

    card.addEventListener("click", abrir);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        abrir(e);
      }
    });
  });
}

// ─────────────────────────────────────────────
// 4. MENÚ HAMBURGUESA
// ─────────────────────────────────────────────
function initMenuHamburguesa() {
  const menuToggle = document.getElementById("menuToggle");
  const nav = document.querySelector("nav");
  const navMenu = nav?.querySelector("ul");

  if (!menuToggle || !nav || !navMenu) return;

  let abierto = false;

  function setMenu(open) {
    abierto = open;
    menuToggle.classList.toggle("active", open);
    navMenu.classList.toggle("active", open);
    nav.classList.toggle("show", open);
    document.body.classList.toggle("menu-abierto", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    if (open) history.pushState({ menuOpen: true }, "", "");
  }

  menuToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    setMenu(!abierto);
  });

  navMenu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => setMenu(false));
  });

  document.addEventListener("click", (e) => {
    if (abierto && !nav.contains(e.target) && !menuToggle.contains(e.target)) {
      setMenu(false);
      history.back();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && abierto) setMenu(false);
  });

  window.addEventListener("popstate", () => {
    if (abierto) setMenu(false);
  });
}

// ─────────────────────────────────────────────
// 5. HEADER SHRINK ON SCROLL
// ─────────────────────────────────────────────
function initHeaderScroll() {
  const header = document.querySelector("header");
  if (!header) return;

  let ticking = false;

  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      header.classList.toggle("shrink", window.scrollY > 50);
      ticking = false;
    });
  }, { passive: true });
}

// ─────────────────────────────────────────────
// 6. SCROLL TO TOP
// ─────────────────────────────────────────────
function initScrollToTop() {
  const btn = document.querySelector(".scrollToHome");
  if (!btn) return;

  btn.style.display = "none";
  btn.style.opacity = "0";

  function toggleButton() {
    if (window.scrollY > 100) {
      btn.style.display = "flex";
      requestAnimationFrame(() => {
        btn.style.opacity = "1";
      });
    } else {
      btn.style.opacity = "0";
      setTimeout(() => {
        if (window.scrollY <= 100) {
          btn.style.display = "none";
        }
      }, 300);
    }
  }

  toggleButton();
  window.addEventListener("scroll", toggleButton, { passive: true });

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// ─────────────────────────────────────────────
// 7. CALCULADORA (solo index.html)
// ─────────────────────────────────────────────
function initCalculadora() {
  const precioInput = document.getElementById("precio-terreno");
  if (!precioInput) return;

  const cuotaRange = document.getElementById("cuota-inicial");
  const cuotaValor = document.getElementById("cuota-inicial-valor");
  const plazoSelect = document.getElementById("plazo-pago");
  const interesSelect = document.getElementById("tasa-interes");
  const formCalculadora = document.getElementById("form-calculadora");

  const elCuotaIni = document.getElementById("cuota-inicial-resultado");
  const elMonto = document.getElementById("monto-financiar");
  const elMensual = document.getElementById("cuota-mensual");
  const elInteres = document.getElementById("interes-total");
  const elTotal = document.getElementById("total-pagar");

  const fmt = (n) =>
    "S/ " + n.toLocaleString("es-PE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

  formCalculadora?.addEventListener("submit", function (e) {
    e.preventDefault();
    precioInput.value = "";
    cuotaRange.value = 20;
    plazoSelect.value = 4;
    interesSelect.value = 10;
    updateRangeProgress();
    if (cuotaValor) cuotaValor.textContent = "S/ 0";
    if (elCuotaIni) elCuotaIni.textContent = "S/ 0";
    if (elMonto) elMonto.textContent = "S/ 0";
    if (elMensual) elMensual.textContent = "S/ 0";
    if (elInteres) elInteres.textContent = "S/ 0";
    if (elTotal) elTotal.textContent = "S/ 0";
    document.getElementById("calculadora")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
    history.replaceState(null, "", "#calculadora");
  });

  function updateRangeProgress() {
    if (!cuotaRange) return;
    const min = parseFloat(cuotaRange.min) || 0;
    const max = parseFloat(cuotaRange.max) || 100;
    const value = parseFloat(cuotaRange.value) || 0;
    const percent = ((value - min) / (max - min)) * 100;
    cuotaRange.style.setProperty("--progress", `${percent}%`);
  }

  function calcular() {
    const precio = parseFloat(precioInput.value) || 0;
    if (precio <= 0) return;

    const pct = parseFloat(cuotaRange?.value) || 10;
    const años = parseInt(plazoSelect?.value) || 10;
    const tasa = parseFloat(interesSelect?.value) || 12;

    const inicial = (precio * pct) / 100;
    const gastosNotariales = precio * 0.02;
    const gastosRegistrales = precio * 0.01;

    const monto = precio - inicial + gastosNotariales + gastosRegistrales;
    const meses = años * 12;
    const tasaMes = tasa / 100 / 12;

    let cuota = 0;
    let total = 0;
    let interesTotal = 0;

    if (tasaMes > 0 && meses > 0) {
      cuota = (monto * tasaMes) / (1 - Math.pow(1 + tasaMes, -meses));
      total = cuota * meses;
      interesTotal = total - monto;
    } else if (meses > 0) {
      cuota = monto / meses;
      total = monto;
    }

    updateRangeProgress();

    if (cuotaValor) cuotaValor.textContent = fmt(inicial);
    if (elCuotaIni) elCuotaIni.textContent = fmt(inicial);
    if (elMonto) elMonto.textContent = fmt(monto);
    if (elMensual) elMensual.textContent = fmt(cuota);
    if (elInteres) elInteres.textContent = fmt(interesTotal);
    if (elTotal) elTotal.textContent = fmt(total);
  }

  let debounceId;
  function debouncedCalc() {
    clearTimeout(debounceId);
    debounceId = setTimeout(() => {
      requestAnimationFrame(calcular);
    }, 300);
  }

  [precioInput, cuotaRange, plazoSelect, interesSelect].forEach(el => {
    el?.addEventListener("input", debouncedCalc);
    el?.addEventListener("change", debouncedCalc);
  });

  updateRangeProgress();
  calcular();
}

// ─────────────────────────────────────────────
// 8. SERVICIOS: TAP táctil en móvil (flip cards)
// ─────────────────────────────────────────────
function initServiciosTap() {
  const serviceCards = document.querySelectorAll('.service-card');
  if (!serviceCards.length) return;

  let isMobile = window.matchMedia('(max-width: 767px)').matches;

  function toggleCard(e) {
    e.stopPropagation();
    const isFlipped = this.classList.contains('flipped');
    serviceCards.forEach(card => card.classList.remove('flipped'));
    if (!isFlipped) this.classList.add('flipped');
  }

  function attachEvents() {
    serviceCards.forEach(card => {
      card.removeEventListener('click', toggleCard);
      if (isMobile) {
        card.addEventListener('click', toggleCard);
      }
    });
  }

  function handleResize() {
    isMobile = window.matchMedia('(max-width: 767px)').matches;
    attachEvents();
    if (!isMobile) {
      serviceCards.forEach(card => card.classList.remove('flipped'));
    }
  }

  attachEvents();
  window.addEventListener('resize', handleResize);
}

// ─────────────────────────────────────────────
// INIT GLOBAL
// ─────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initScrollAnimaciones();
  initModalImagen();
  initMenuHamburguesa();
  initHeaderScroll();
  initScrollToTop();
  initCalculadora();
  initServiciosTap();
  initGuiaCompradores();
});