/**
 * ubicacion.js — Botones "Ver ubicación" con geolocalización
 * ────────────────────────────────────────────────────────────
 * Compartido: index.html · terrenos.html
 *
 * Flujo:
 *   1. Si el botón tiene clase "disabled" → alerta y sale.
 *   2. Si el navegador no soporta geolocalización → Maps en modo búsqueda.
 *   3. Si el usuario acepta → Maps con ruta desde su posición actual.
 *   4. Si el usuario deniega / falla → Maps en modo búsqueda.
 */

"use strict";

function initUbicacion() {
  const botones = document.querySelectorAll(".btn-ubicacion");
  if (!botones.length) return;

  function abrirMaps(destino, origen = null) {
    const base = "https://www.google.com/maps/";
    const url  = origen
      ? `${base}dir/?api=1&origin=${origen}&destination=${encodeURIComponent(destino)}`
      : `${base}search/?api=1&query=${encodeURIComponent(destino)}`;

    window.open(url, "_blank", "noopener,noreferrer");
  }

  botones.forEach(btn => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();

      if (this.classList.contains("disabled")) {
        alert("Ubicación aún no disponible para este inmueble.");
        return;
      }

      const destino = this.dataset.destino?.trim();
      if (!destino) {
        alert("No se ha configurado la ubicación de este inmueble.");
        return;
      }

      if (!navigator.geolocation) {
        abrirMaps(destino);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          abrirMaps(destino, `${coords.latitude},${coords.longitude}`);
        },
        () => abrirMaps(destino),
        { timeout: 8000, maximumAge: 60_000 }
      );
    });
  });
}

document.addEventListener("DOMContentLoaded", initUbicacion);