/**
 * formulario.js — Modal de compra + envío por WhatsApp
 * ──────────────────────────────────────────────────────
 * Compartido: index.html · terrenos.html
 *
 * Notas de implementación:
 * • En index.html los inputs tienen id (compra-nombre, etc.) → se buscan por id.
 * • En terrenos.html los inputs NO tienen id → fallback por posición dentro del form.
 * • El modal en index.html usa el atributo `hidden`; en terrenos.html usa style="display:none".
 *   Ambos casos quedan cubiertos.
 */

"use strict";

function initFormularioCompra() {
  const modal = document.getElementById("modal-compra");
  if (!modal) return;

  const closeBtn    = modal.querySelector(".close-compra");
  const cancelarBtn = modal.querySelector(".btn-cancelar");
  const spanUbicacion = document.getElementById("info-ubicacion");
  const spanArea      = document.getElementById("info-area");
  const form          = modal.querySelector(".form-compra");
  const WA_NUMBER     = "51982664102";

  // ── Visibilidad ──────────────────────────────────
  function abrirModal(ubicacion, area) {
    if (spanUbicacion) spanUbicacion.textContent = ubicacion;
    if (spanArea)      spanArea.textContent      = area;

    modal.removeAttribute("hidden");
    document.body.classList.add("body-no-scroll");

    // Foco al primer input para accesibilidad
    form?.querySelector("input, textarea")?.focus();
  }

  function cerrarModal() {
    modal.setAttribute("hidden", "");
    document.body.classList.remove("body-no-scroll");
    form?.reset();
  }

  // ── Abrir ────────────────────────────────────────
  document.querySelectorAll(".btn-comprar").forEach(btn => {
    btn.addEventListener("click", function () {
      abrirModal(
        this.dataset.ubicacion || "No especificado",
        this.dataset.area      || "No especificado"
      );
    });
  });

  // ── Cerrar ───────────────────────────────────────
  closeBtn?.addEventListener("click",    cerrarModal);
  cancelarBtn?.addEventListener("click", cerrarModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) cerrarModal();
  });

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modal.hidden) {
    cerrarModal();
  }
});

  // ── Envío ─────────────────────────────────────────
  form?.addEventListener("submit", (e) => {
    e.preventDefault();

    // Buscar por id (index.html) con fallback posicional (terrenos.html)
    const inputs   = form.querySelectorAll("input, textarea");
    const nombre   = (document.getElementById("compra-nombre")   ?? inputs[0])?.value.trim() ?? "";
    const telefono = (document.getElementById("compra-telefono") ?? inputs[1])?.value.trim() ?? "";
    const mensaje  = (document.getElementById("compra-mensaje")  ?? inputs[2])?.value.trim() ?? "";

    if (!nombre || !telefono) {
      alert("Por favor, completa tu nombre y teléfono.");
      return;
    }

    const ubicacion = spanUbicacion?.textContent || "No especificado";
    const area      = spanArea?.textContent      || "No especificado";

    const lines = [
      "Hola, quiero información sobre el siguiente inmueble:",
      "",
      `📍 Ubicación: ${ubicacion}`,
      `📐 Área: ${area}`,
      "",
      `👤 Nombre: ${nombre}`,
      `📱 Teléfono: ${telefono}`,
    ];
    if (mensaje) lines.push("", `📝 Mensaje:\n${mensaje}`);

    window.open(
      `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`,
      "_blank",
      "noopener,noreferrer"
    );

    cerrarModal();
  });
}

document.addEventListener("DOMContentLoaded", initFormularioCompra);