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

  const form = document.getElementById("form-buscador");
  const input = document.getElementById("texto-busqueda");

  // Si no existe el buscador, salir
  if (!form) return;

  const selectTipo = document.getElementById("tipo-inmueble");

  const CARDS_SEL =
    ".card, .cardd, .terreno-card";

  const DELAY_MS = 400;

  let searchTimer;

  function realizarBusqueda() {

    const tipo =
      (selectTipo?.value ?? "")
        .toLowerCase();

    const texto =
      (input?.value ?? "")
        .trim()
        .toLowerCase();

    const palabras =
      texto ? texto.split(/\s+/) : [];

    let totalVisible = 0;

    // Buscar cards
    document
      .querySelectorAll(CARDS_SEL)
      .forEach(card => {

        const cardTipo =
          card.dataset.tipo
            ?.toLowerCase() ?? "";

        const cardUbicacion =
          card.dataset.ubicacion
            ?.toLowerCase() ?? "";

        const cardTitulo =
          card.querySelector("h2, h3")
            ?.textContent
            .toLowerCase() ?? "";

        const pasaTipo =
          !tipo || cardTipo === tipo;

        const pasaTexto =
          !palabras.length ||
          palabras.some(p =>
            cardUbicacion.includes(p) ||
            cardTitulo.includes(p)
          );

        const visible =
          pasaTipo && pasaTexto;

        card.style.display =
          visible ? "" : "none";

        if (visible) {
          totalVisible++;
        }

      });

    // Eliminar mensaje anterior
    document
      .querySelector(".mensaje-busqueda")
      ?.remove();

    // Título y subtítulo
    const titulo =
      document.querySelector(
        ".terrdis-titulo"
      );

    const subtitulo =
      document.querySelector(
        "#terrenos-disponibles .section-subtitle"
      );

    // Mostrar / ocultar
    if (titulo) {
      titulo.style.display =
        totalVisible === 0
          ? "none"
          : "";
    }

    if (subtitulo) {
      subtitulo.style.display =
        totalVisible === 0
          ? "none"
          : "";
    }

    // Sin resultados
    if (totalVisible === 0) {

      const wrapper =
        document.querySelector(
          "#terrenos-disponibles .container"
        );

      if (wrapper) {

        const msg =
          document.createElement("div");

        msg.className =
          "mensaje-busqueda";

        msg.innerHTML = `
          <div style="
            text-align:center;
            margin:3rem auto;
          ">
            <h2>
              No se encontraron inmuebles
            </h2>

            <p>
              Intenta ajustar los filtros
              de búsqueda
            </p>
          </div>
        `;

        wrapper.appendChild(msg);
      }
    }
  }

  // ─────────────────────────────
  // INPUT BUSCADOR (debounce)
  // ─────────────────────────────
  input?.addEventListener("input", () => {

    clearTimeout(searchTimer);

    searchTimer = setTimeout(() => {

      const len = input.value.length;

      if (
        len === 0 ||
        len >= 2
      ) {
        realizarBusqueda();
      }

    }, DELAY_MS);

  });

  // ─────────────────────────────
  // TABS DEL BUSCADOR
  // ─────────────────────────────
  document
    .querySelectorAll(".tab")
    .forEach(tab => {

      tab.addEventListener(
        "click",
        () => {

          document
            .querySelectorAll(".tab")
            .forEach(t =>
              t.classList.remove(
                "active"
              )
            );

          tab.classList.add(
            "active"
          );

          // Actualizar hidden input
          if (selectTipo) {
            selectTipo.value =
              tab.dataset.value;
          }

          // Buscar automáticamente
          realizarBusqueda();

        }
      );

    });

  // ─────────────────────────────
  // SUBMIT FORM
  // ─────────────────────────────
  form.addEventListener(
    "submit",
    (e) => {

      e.preventDefault();

      realizarBusqueda();

    }
  );
}

// ─────────────────────────────────────────────
// 2. CARRUSELES DE CARDS
// ─────────────────────────────────────────────
function initCarruseles() {

  document
    .querySelectorAll(
      ".carrusel-chorrillos"
    )
    .forEach((carrusel) => {

      const container =
        carrusel.querySelector(
          ".carrusel-container"
        );

      const slides =
        carrusel.querySelectorAll(
          ".carrusel-slide"
        );

      const indicadores =
        carrusel.querySelectorAll(
          ".indicador"
        );

      if (
        !slides.length ||
        !container
      ) return;

      const INTERVAL_MS = 3000;

      let index = 0;
      let timer = null;
      let startX = 0;

      function actualizarCarrusel() {

        container.style.transform =
          `translateX(-${index * 100}%)`;

        indicadores.forEach(
          (ind, i) => {

            ind.classList.toggle(
              "active",
              i === index
            );

          }
        );
      }

      function mostrarSlide(i) {

        index =
          (
            (i % slides.length) +
            slides.length
          ) % slides.length;

        actualizarCarrusel();
      }

      function startTimer() {

        clearInterval(timer);

        timer = setInterval(() => {

          mostrarSlide(index + 1);

        }, INTERVAL_MS);
      }

      // Indicadores
      indicadores.forEach(
        (ind, i) => {

          ind.addEventListener(
            "click",
            () => {

              mostrarSlide(i);

              startTimer();

            }
          );

        }
      );

      // Swipe móvil
      carrusel.addEventListener(
        "touchstart",
        (e) => {

          startX =
            e.touches[0].clientX;

        },
        { passive: true }
      );

      carrusel.addEventListener(
        "touchend",
        (e) => {

          const endX =
            e.changedTouches[0]
              .clientX;

          const distancia =
            startX - endX;

          if (
            Math.abs(distancia)
            < 50
          ) return;

          if (distancia > 0) {
            mostrarSlide(index + 1);
          } else {
            mostrarSlide(index - 1);
          }

          startTimer();

        },
        { passive: true }
      );

      carrusel.addEventListener(
        "mouseenter",
        () => {
          clearInterval(timer);
        }
      );

      carrusel.addEventListener(
        "mouseleave",
        startTimer
      );

      actualizarCarrusel();
      startTimer();

    });
}

// ─────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────
document.addEventListener(
  "DOMContentLoaded",
  () => {

    initBuscador();
    initCarruseles();

  }
);