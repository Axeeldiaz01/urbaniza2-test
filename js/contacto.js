/**
 * contacto.js — Exclusivo de contacto.html
 * ──────────────────────────────────────────
 * Módulos:
 *   1. Apertura segura de links WhatsApp
 *   2. Formulario de contacto multi-paso
 *      — Captcha aritmético simple
 *      — Validación en tiempo real por campo
 *      — Resumen de datos antes de enviar
 *      — Envío por WhatsApp
 *      — Modal de política de privacidad
 *
 * ELIMINADO (lo maneja main.js):
 *   - Menú hamburguesa
 *   - Header shrink
 *
 * ELIMINADO (función muerta — nunca se llamaba):
 *   - mejorarWhatsApp() — solo tenía un console.log
 */

"use strict";

document.addEventListener("DOMContentLoaded", function () {

  // ── 1. APERTURA SEGURA DE LINKS WHATSAPP ────────────────────
  document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const url = this.getAttribute("href");
      const newWindow = window.open(url, "_blank", "noopener,noreferrer");
      if (!newWindow) window.location.href = url;
    });
  });

  // ── 2. FORMULARIO MULTI-PASO ─────────────────────────────────
  let currentStep   = 1;
  const totalSteps  = 3;
  let captchaAnswer = 0;

  // Función global para copiar al portapapeles
  window.copyToClipboard = function (text) {
    navigator.clipboard.writeText(text).then(function () {
      const notification = document.createElement("div");
      notification.textContent = "Copiado al portapapeles!";
      notification.className   = "notification-success";
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 2000);
    });
  };

  // Elementos del formulario
  const abrirFormulario  = document.getElementById("abrir-formulario");
  const modalFormulario  = document.getElementById("modal-formulario-mejorado");
  const cerrarFormulario = document.getElementById("cerrar-formulario-mejorado");
  const btnAnterior      = document.getElementById("btn-anterior");
  const btnSiguiente     = document.getElementById("btn-siguiente");
  const btnEnviar        = document.getElementById("btn-enviar");
  const formulario       = document.getElementById("formulario-contacto-mejorado");

  if (!abrirFormulario || !modalFormulario || !formulario) {
    console.warn("Elementos principales del formulario no encontrados");
    return;
  }

  // Abrir modal
  abrirFormulario.addEventListener("click", function () {
    modalFormulario.classList.remove("oculto");
    currentStep = 1;
    updateStepDisplay();
    generateCaptcha();

    const scrollToHomeBtn = document.querySelector(".scrollToHome");
    if (scrollToHomeBtn) {
      scrollToHomeBtn.style.display    = "none";
      scrollToHomeBtn.style.visibility = "hidden";
      scrollToHomeBtn.style.opacity    = "0";
    }
  });

  // Cerrar modal (botón X)
  cerrarFormulario?.addEventListener("click", function () {
    modalFormulario.classList.add("oculto");
    resetForm();

    const scrollToHomeBtn = document.querySelector(".scrollToHome");
    if (scrollToHomeBtn && window.scrollY > 100) {
      scrollToHomeBtn.style.display    = "block";
      scrollToHomeBtn.style.visibility = "visible";
      scrollToHomeBtn.style.opacity    = "1";
    }
  });

  // Cerrar modal (clic fuera)
  window.addEventListener("click", function (event) {
    if (event.target === modalFormulario) {
      modalFormulario.classList.add("oculto");
      resetForm();

      const scrollToHomeBtn = document.querySelector(".scrollToHome");
      if (scrollToHomeBtn && window.scrollY > 100) {
        scrollToHomeBtn.style.display    = "block";
        scrollToHomeBtn.style.visibility = "visible";
        scrollToHomeBtn.style.opacity    = "1";
      }
    }
  });

  // Navegación entre pasos
  btnSiguiente?.addEventListener("click", nextStep);
  btnAnterior?.addEventListener("click",  prevStep);

  // Validación en tiempo real
  setupRealTimeValidation();

  // Contador de caracteres para mensaje
  const mensajeTextarea = document.getElementById("mensaje");
  const mensajeCounter  = document.getElementById("mensaje-counter");
  if (mensajeTextarea && mensajeCounter) {
    mensajeTextarea.addEventListener("input", function () {
      const length = this.value.length;
      mensajeCounter.textContent = length;
      if (length > 500) {
        this.value             = this.value.substring(0, 500);
        mensajeCounter.textContent = 500;
      }
    });
  }

  // Formateo de teléfono (solo dígitos, máx. 9)
  const telefonoInput = document.getElementById("telefono");
  if (telefonoInput) {
    telefonoInput.addEventListener("input", function () {
      let value = this.value.replace(/\D/g, "");
      if (value.length > 9) value = value.substring(0, 9);
      this.value = value;
    });
  }

  // Modal de política de privacidad
  const verPolitica    = document.getElementById("ver-politica-privacidad");
  const modalPolitica  = document.getElementById("modal-politica-privacidad");
  const cerrarPolitica = document.getElementById("cerrar-politica-privacidad");

  verPolitica?.addEventListener("click", function (e) {
    e.preventDefault();
    modalPolitica.classList.remove("oculto");
  });

  cerrarPolitica?.addEventListener("click", function () {
    modalPolitica.classList.add("oculto");
  });

  modalPolitica?.addEventListener("click", function (e) {
    if (e.target === modalPolitica) modalPolitica.classList.add("oculto");
  });

  // Envío del formulario
  formulario.addEventListener("submit", async function (e) {
    e.preventDefault();
    if (validateStep(2)) await submitForm();
  });

  // ── FUNCIONES INTERNAS ───────────────────────────────────────

  function nextStep() {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        currentStep++;
        updateStepDisplay();
        if (currentStep === 3) mostrarResumenDatos();
      }
    }
  }

  function prevStep() {
    if (currentStep > 1) {
      currentStep--;
      updateStepDisplay();
    }
  }

  function updateStepDisplay() {
    // Indicador de progreso
    document.querySelectorAll(".step").forEach((step, index) => {
      step.classList.toggle("active", index + 1 <= currentStep);
    });

    // Pasos del formulario
    document.querySelectorAll(".form-step").forEach((step, index) => {
      step.classList.toggle("active", index + 1 === currentStep);
    });

    // Botones de navegación
    const _btnAnterior  = document.getElementById("btn-anterior");
    const _btnSiguiente = document.getElementById("btn-siguiente");
    const _btnEnviar    = document.getElementById("btn-enviar");

    if (currentStep === 1) {
      _btnAnterior.style.display = "none";
      _btnAnterior.classList.add("btn-nav-hidden");
    } else {
      _btnAnterior.style.display = "inline-flex";
      _btnAnterior.classList.remove("btn-nav-hidden");
    }

    if (currentStep === totalSteps) {
      _btnSiguiente.style.display = "none";
      _btnSiguiente.classList.add("btn-nav-hidden");
      _btnEnviar.style.display = "inline-flex";
      _btnEnviar.classList.remove("btn-nav-hidden");
    } else {
      _btnSiguiente.style.display = "inline-flex";
      _btnSiguiente.classList.remove("btn-nav-hidden");
      _btnEnviar.style.display = "none";
      _btnEnviar.classList.add("btn-nav-hidden");
    }
  }

  function setupRealTimeValidation() {
    const nombre          = document.getElementById("nombre");
    const email           = document.getElementById("email");
    const telefono        = document.getElementById("telefono");
    const mensaje         = document.getElementById("mensaje");
    const tipoConsulta    = document.getElementById("tipo-consulta");
    const presupuesto     = document.getElementById("presupuesto");
    const ubicacionInteres = document.getElementById("ubicacion-interes");
    const captchaInput    = document.getElementById("captcha-input");

    nombre?.addEventListener("blur",  () => validateField("nombre"));
    nombre?.addEventListener("input", () => clearValidation("nombre"));

    email?.addEventListener("blur",  () => validateField("email"));
    email?.addEventListener("input", () => clearValidation("email"));

    telefono?.addEventListener("blur",  () => validateField("telefono"));
    telefono?.addEventListener("input", () => clearValidation("telefono"));

    mensaje?.addEventListener("blur",  () => validateField("mensaje"));
    mensaje?.addEventListener("input", () => clearValidation("mensaje"));

    tipoConsulta?.addEventListener("change", () => validateField("tipo-consulta"));
    presupuesto?.addEventListener("change",  () => validateField("presupuesto"));

    ubicacionInteres?.addEventListener("blur",  () => validateField("ubicacion-interes"));
    ubicacionInteres?.addEventListener("input", () => clearValidation("ubicacion-interes"));

    captchaInput?.addEventListener("blur",  () => validateField("captcha-input"));
    captchaInput?.addEventListener("input", () => clearValidation("captcha-input"));
  }

  function validateField(fieldName) {
    const field      = document.getElementById(fieldName);
    const validation = document.getElementById(fieldName + "-validation");
    if (!field || !validation) return true;

    let isValid = true;
    let message = "";

    switch (fieldName) {
      case "nombre":
        if (field.value.trim().length < 2) {
          isValid = false; message = "El nombre debe tener al menos 2 caracteres";
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(field.value.trim())) {
          isValid = false; message = "El nombre solo puede contener letras y espacios";
        } else { message = "Nombre válido"; }
        break;

      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim())) {
          isValid = false; message = "Por favor ingresa un email válido";
        } else { message = "Email válido"; }
        break;

      case "telefono":
        if (field.value.trim().length < 9) {
          isValid = false; message = "El teléfono debe tener 9 dígitos";
        } else if (!/^9\d{8}$/.test(field.value.trim())) {
          isValid = false; message = "El teléfono debe comenzar con 9 y tener 9 dígitos";
        } else { message = "Teléfono válido"; }
        break;

      case "mensaje":
        if (field.value.trim().length < 10) {
          isValid = false; message = "El mensaje debe tener al menos 10 caracteres";
        } else { message = "Mensaje válido"; }
        break;

      case "captcha-input":
        const userInput    = field.value.trim();
        const captchaValue = parseInt(userInput);
        if (userInput === "" || isNaN(captchaValue)) {
          isValid = false; message = "Por favor ingresa un número";
        } else if (captchaValue === captchaAnswer) {
          isValid = true;  message = "Respuesta correcta ✓";
        } else {
          isValid = false; message = "Respuesta incorrecta. Inténtalo de nuevo";
        }
        break;
    }

    field.classList.remove("valid", "invalid");
    field.classList.add(isValid ? "valid" : "invalid");
    validation.textContent = message;
    validation.classList.remove("success", "error");
    validation.classList.add(isValid ? "success" : "error");

    return isValid;
  }

  function clearValidation(fieldName) {
    const field      = document.getElementById(fieldName);
    const validation = document.getElementById(fieldName + "-validation");
    if (field && validation) {
      field.classList.remove("valid", "invalid");
      validation.textContent = "";
      validation.classList.remove("success", "error");
    }
  }

  function validateStep(step) {
    switch (step) {
      case 1:
        return validateField("nombre") &&
               validateField("email")  &&
               validateField("telefono");

      case 2: {
        const tipoConsulta = document.getElementById("tipo-consulta");
        if (!tipoConsulta.value) {
          alert("Por favor selecciona un tipo de consulta");
          return false;
        }
        if (!validateField("mensaje")) {
          alert("Por favor completa el mensaje de tu consulta");
          return false;
        }
        const captchaField = document.getElementById("captcha-input");
        const captchaValue = parseInt(captchaField.value.trim());
        if (!captchaField.value.trim() || isNaN(captchaValue) || captchaValue !== captchaAnswer) {
          if (!captchaField.value.trim()) {
            alert("Por favor responde la pregunta de seguridad");
          } else if (isNaN(captchaValue)) {
            alert("Por favor ingresa un número válido");
          } else {
            alert("Respuesta incorrecta. La respuesta correcta es " + captchaAnswer + ". Se generará una nueva pregunta.");
            generateCaptcha();
          }
          captchaField.focus();
          return false;
        }
        const politicaCheckbox = document.getElementById("politica-privacidad");
        if (!politicaCheckbox.checked) {
          alert("Debes aceptar la política de privacidad para continuar");
          return false;
        }
        return true;
      }

      case 3:
        updateSummary();
        return true;

      default:
        return true;
    }
  }

  function generateCaptcha() {
    const num1 = Math.floor(Math.random() * 9) + 1;
    const num2 = Math.floor(Math.random() * 9) + 1;
    captchaAnswer = num1 + num2;

    const captchaQuestion = document.getElementById("captcha-question");
    if (captchaQuestion) captchaQuestion.textContent = `¿Cuánto es ${num1} + ${num2}?`;

    const captchaInput = document.getElementById("captcha-input");
    if (captchaInput) {
      captchaInput.value = "";
      captchaInput.classList.remove("valid", "invalid");
    }

    const captchaValidation = document.getElementById("captcha-validation");
    if (captchaValidation) {
      captchaValidation.textContent = "";
      captchaValidation.classList.remove("success", "error");
    }
  }

  function updateSummary() {
    const resumenContenido = document.getElementById("resumen-contenido");
    if (!resumenContenido) return;

    const nombre      = document.getElementById("nombre").value;
    const email       = document.getElementById("email").value;
    const telefono    = document.getElementById("telefono").value;
    const tipoConsulta = document.getElementById("tipo-consulta");
    const presupuesto = document.getElementById("presupuesto");
    const ubicacion   = document.getElementById("ubicacion-interes").value;
    const mensaje     = document.getElementById("mensaje").value;

    const tipoTexto       = tipoConsulta.options[tipoConsulta.selectedIndex].text;
    const presupuestoTexto = presupuesto.value
      ? presupuesto.options[presupuesto.selectedIndex].text
      : "No especificado";

    resumenContenido.innerHTML = `
      <div class="resumen-header">
        <h4><i class="fas fa-clipboard-list"></i> Resumen de tu consulta</h4>
        <p class="resumen-subtitle">Revisa que todos los datos sean correctos antes de enviar</p>
      </div>
      <div class="resumen-datos">
        <div class="dato-item">
          <span class="dato-label"><i class="fas fa-user"></i> Nombre:</span>
          <span class="dato-valor">${nombre}</span>
        </div>
        <div class="dato-item">
          <span class="dato-label"><i class="fas fa-envelope"></i> Email:</span>
          <span class="dato-valor">${email}</span>
        </div>
        <div class="dato-item">
          <span class="dato-label"><i class="fas fa-phone"></i> Teléfono:</span>
          <span class="dato-valor">${telefono}</span>
        </div>
        <div class="dato-item">
          <span class="dato-label"><i class="fas fa-question-circle"></i> Tipo de consulta:</span>
          <span class="dato-valor">${tipoTexto}</span>
        </div>
        <div class="dato-item">
          <span class="dato-label"><i class="fas fa-dollar-sign"></i> Presupuesto:</span>
          <span class="dato-valor">${presupuestoTexto}</span>
        </div>
        <div class="dato-item">
          <span class="dato-label"><i class="fas fa-map-marker-alt"></i> Ubicación de interés:</span>
          <span class="dato-valor">${ubicacion || "No especificada"}</span>
        </div>
        <div class="dato-item mensaje-item">
          <span class="dato-label"><i class="fas fa-comment"></i> Mensaje:</span>
          <span class="dato-valor mensaje-completo">${mensaje}</span>
        </div>
      </div>
      <div class="resumen-footer">
        <div class="info-envio">
          <i class="fas fa-info-circle"></i>
          <span>Al enviar, serás redirigido a WhatsApp para completar tu consulta</span>
        </div>
      </div>
    `;
  }

  async function submitForm() {
    const _modalFormulario = document.getElementById("modal-formulario-mejorado");
    const _btnEnviar       = document.getElementById("btn-enviar");

    _btnEnviar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    _btnEnviar.disabled  = true;

    try {
      const formData = {
        nombre:           document.getElementById("nombre").value,
        email:            document.getElementById("email").value,
        telefono:         document.getElementById("telefono").value,
        tipoConsulta:     document.getElementById("tipo-consulta").value,
        presupuesto:      document.getElementById("presupuesto").value,
        ubicacionInteres: document.getElementById("ubicacion-interes").value,
        mensaje:          document.getElementById("mensaje").value
      };

      const tipoConsultaTexto  = document.getElementById("tipo-consulta").selectedOptions[0]?.text  || "No especificado";
      const presupuestoTexto   = document.getElementById("presupuesto").selectedOptions[0]?.text    || "No especificado";

      const mensajeWhatsApp =
        `Hola! Quiero hacer una consulta desde la web Urbaniza2:\n\n` +
        `Nombre: ${formData.nombre}\n` +
        `Email: ${formData.email}\n` +
        `Teléfono: ${formData.telefono}\n` +
        `Tipo de consulta: ${tipoConsultaTexto}\n` +
        `Presupuesto: ${presupuestoTexto}\n` +
        `Ubicación de interés: ${formData.ubicacionInteres || "No especificado"}\n` +
        `Mensaje: ${formData.mensaje || "Sin mensaje adicional"}\n`;

      const url = `https://wa.me/51982664102?text=${encodeURIComponent(mensajeWhatsApp)}`;

      _modalFormulario.classList.add("oculto");
      showSuccessNotificationOutside();
      resetForm();

      setTimeout(() => window.open(url, "_blank"), 2000);

      const scrollToHomeBtn = document.querySelector(".scrollToHome");
      if (scrollToHomeBtn && window.scrollY > 100) {
        scrollToHomeBtn.style.display    = "block";
        scrollToHomeBtn.style.visibility = "visible";
        scrollToHomeBtn.style.opacity    = "1";
      }

    } catch (error) {
      console.error("Error:", error);
      showErrorMessage("No se pudo abrir WhatsApp. Por favor, intenta nuevamente.");
    } finally {
      _btnEnviar.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Consulta';
      _btnEnviar.disabled  = false;
    }
  }

  function showSuccessNotificationOutside() {
    const notification = document.createElement("div");
    notification.className = "success-notification-outside";

    notification.innerHTML = `
      <div class="notification-container">
        <div class="notification-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="notification-content">
          <h3>¡Formulario Enviado Exitosamente!</h3>
          <p>Tu consulta ha sido procesada correctamente y será redirigida a WhatsApp.</p>
          <div class="notification-details">
            <div class="detail-item">
              <i class="fas fa-clock"></i>
              <span>Tiempo de respuesta: Menos de 24 horas</span>
            </div>
            <div class="detail-item">
              <i class="fab fa-whatsapp"></i>
              <span>¿Urgente? WhatsApp: <a href="https://wa.me/51982664102" target="_blank">982 664 102</a></span>
            </div>
          </div>
        </div>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;

    if (!document.querySelector("#success-notification-styles")) {
      const style = document.createElement("style");
      style.id = "success-notification-styles";
      style.textContent = `
        .success-notification-outside {
          position: fixed; top: 20px; right: 20px; z-index: 10000;
          max-width: 400px; background: linear-gradient(135deg, #27ae60, #2ecc71);
          color: white; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          animation: slideInRight 0.5s ease-out; font-family: 'Poppins', sans-serif;
        }
        .notification-container {
          padding: 20px; position: relative; display: flex; align-items: flex-start; gap: 15px;
        }
        .notification-icon { font-size: 2.5rem; color: #fff; flex-shrink: 0; }
        .notification-content h3 { margin: 0 0 8px 0; font-size: 1.2rem; font-weight: 600; }
        .notification-content p  { margin: 0 0 15px 0; font-size: 0.95rem; opacity: 0.9; line-height: 1.4; }
        .notification-details { display: flex; flex-direction: column; gap: 8px; }
        .detail-item { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; }
        .detail-item i { width: 16px; text-align: center; }
        .detail-item a { color: #fff; text-decoration: underline; font-weight: 500; }
        .notification-close {
          position: absolute; top: 10px; right: 10px;
          background: rgba(255,255,255,0.2); border: none; color: white;
          width: 30px; height: 30px; border-radius: 50%; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.3s ease;
        }
        .notification-close:hover { background: rgba(255,255,255,0.3); }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @media (max-width: 768px) {
          .success-notification-outside { top: 10px; right: 10px; left: 10px; max-width: none; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = "slideInRight 0.5s ease-out reverse";
        setTimeout(() => notification.remove(), 500);
      }
    }, 8000);
  }

  function showErrorMessage(message) {
    const _formulario = document.getElementById("formulario-contacto-mejorado");
    const errorDiv    = document.createElement("div");
    errorDiv.style.cssText = `
      background: #e74c3c; color: white; padding: 15px;
      border-radius: 5px; margin: 20px 0; text-align: center;
    `;
    errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
    _formulario.insertBefore(errorDiv, _formulario.firstChild);
    setTimeout(() => errorDiv.remove(), 5000);
  }

  function mostrarResumenDatos() {
    const nombre           = document.getElementById("nombre").value;
    const email            = document.getElementById("email").value;
    const telefono         = document.getElementById("telefono").value;
    const ubicacionInteres = document.getElementById("ubicacion-interes").value;
    const mensaje          = document.getElementById("mensaje").value;
    const tipoConsultaTexto = document.getElementById("tipo-consulta").selectedOptions[0]?.text || "No especificado";
    const presupuestoTexto  = document.getElementById("presupuesto").selectedOptions[0]?.text   || "No especificado";

    document.getElementById("resumen-nombre").textContent     = nombre           || "-";
    document.getElementById("resumen-email").textContent      = email            || "-";
    document.getElementById("resumen-telefono").textContent   = telefono         || "-";
    document.getElementById("resumen-ubicacion").textContent  = ubicacionInteres || "-";
    document.getElementById("resumen-presupuesto").textContent = presupuestoTexto || "-";
    document.getElementById("resumen-tiempo").textContent     = tipoConsultaTexto || "-";
    document.getElementById("resumen-mensaje").textContent    = mensaje           || "Sin mensaje adicional";
  }

  function mostrarConfirmacionEnvio() {
    document.getElementById("resumen-datos").style.display    = "none";
    document.getElementById("confirmacion-envio").style.display = "block";
    document.querySelector(".resumen-note").style.display     = "none";
    document.getElementById("btn-enviar").style.display       = "none";

    setTimeout(() => {
      const loadingWhatsapp = document.querySelector(".loading-whatsapp");
      if (loadingWhatsapp) {
        loadingWhatsapp.innerHTML = `
          <i class="fab fa-whatsapp"></i>
          <span>¡Listo! Puedes contactarnos por WhatsApp cuando gustes.</span>
        `;
      }
    }, 3000);
  }

  function resetForm() {
    currentStep = 1;
    updateStepDisplay();

    const _formulario = document.getElementById("formulario-contacto-mejorado");
    if (_formulario?.reset) _formulario.reset();

    ["nombre", "email", "telefono", "mensaje"].forEach(field => clearValidation(field));

    const mensajeCounter = document.getElementById("mensaje-counter");
    if (mensajeCounter) mensajeCounter.textContent = "0";

    const captchaValidation = document.getElementById("captcha-validation");
    if (captchaValidation) {
      captchaValidation.textContent = "";
      captchaValidation.classList.remove("success", "error");
    }

    generateCaptcha();
  }

}); // fin DOMContentLoaded