/**
 * Débora Andrade Camargo da Silva — Psicologia Jurídica e Clínica (CRP 09/17439)
 * Interações em JavaScript puro (Vanilla JS):
 * - Menu hambúrguer acessível no mobile
 * - Elevação do cabeçalho e destaque da seção ativa na rolagem
 * - Animações suaves de entrada (IntersectionObserver + prefers-reduced-motion)
 * - Fallback visual elegante para imagens locais ausentes ou com erro
 * - Rastreamento de cliques no WhatsApp compatível com Google Tag Manager / gtag.js
 */
(function () {
  "use strict";

  document.documentElement.classList.add("js-enabled");

  /* =========================================================================
     1. Menu Mobile Acessível
     ========================================================================= */
  function initMobileMenu() {
    var toggleBtn = document.getElementById("menu-toggle");
    var nav = document.getElementById("menu-principal");

    if (!toggleBtn || !nav) {
      return;
    }

    function setMenuState(isOpen) {
      nav.classList.toggle("is-open", isOpen);
      toggleBtn.setAttribute("aria-expanded", String(isOpen));
      toggleBtn.setAttribute(
        "aria-label",
        isOpen ? "Fechar menu de navegação" : "Abrir menu de navegação"
      );
    }

    toggleBtn.addEventListener("click", function () {
      var isCurrentlyOpen = toggleBtn.getAttribute("aria-expanded") === "true";
      setMenuState(!isCurrentlyOpen);
    });

    // Fecha o menu ao selecionar qualquer link de navegação ou CTA
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        setMenuState(false);
      }
    });

    // Fecha o menu ao clicar fora do cabeçalho
    document.addEventListener("click", function (event) {
      if (
        nav.classList.contains("is-open") &&
        !nav.contains(event.target) &&
        !toggleBtn.contains(event.target)
      ) {
        setMenuState(false);
      }
    });

    // Fecha com tecla Escape e devolve o foco ao botão
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        setMenuState(false);
        toggleBtn.focus();
      }
    });

    // Garante fechamento ao alternar para desktop
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 1024 && nav.classList.contains("is-open")) {
        setMenuState(false);
      }
    });
  }

  /* =========================================================================
     2. Cabeçalho em Rolagem e Destaque de Seção Ativa (Scroll-Spy)
     ========================================================================= */
  function initHeaderAndScrollSpy() {
    var header = document.querySelector(".site-header");
    var navLinks = Array.prototype.slice.call(
      document.querySelectorAll('.nav-link[href^="#"]')
    );

    function updateHeaderShadow() {
      if (!header) {
        return;
      }
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    }

    updateHeaderShadow();
    window.addEventListener("scroll", updateHeaderShadow, { passive: true });

    if (!("IntersectionObserver" in window) || navLinks.length === 0) {
      return;
    }

    var sectionMap = new Map();
    navLinks.forEach(function (link) {
      var targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") {
        return;
      }
      var section = document.querySelector(targetId);
      if (section) {
        sectionMap.set(section, link);
      }
    });

    var spyObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }
          navLinks.forEach(function (link) {
            link.removeAttribute("aria-current");
          });
          var activeLink = sectionMap.get(entry.target);
          if (activeLink) {
            activeLink.setAttribute("aria-current", "location");
          }
        });
      },
      {
        rootMargin: "-30% 0px -55% 0px",
        threshold: 0,
      }
    );

    sectionMap.forEach(function (_link, section) {
      spyObserver.observe(section);
    });
  }

  /* =========================================================================
     3. Animações Suaves de Entrada
     ========================================================================= */
  function initScrollReveal() {
    var elements = Array.prototype.slice.call(
      document.querySelectorAll("[data-reveal]")
    );

    if (elements.length === 0) {
      return;
    }

    var prefersReducedMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      elements.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.08,
      }
    );

    elements.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  /* =========================================================================
     4. Fallback Elegante para Imagens Locais
     ========================================================================= */
  function initImageFallbacks() {
    var frames = Array.prototype.slice.call(
      document.querySelectorAll("[data-image-frame]")
    );

    frames.forEach(function (frame) {
      var img = frame.querySelector("img");
      if (!img) {
        return;
      }

      function markAsMissing() {
        frame.classList.add("is-missing");
      }

      function markAsLoaded() {
        frame.classList.remove("is-missing");
      }

      img.addEventListener("error", markAsMissing);
      img.addEventListener("load", function () {
        if (img.naturalWidth > 0) {
          markAsLoaded();
        } else {
          markAsMissing();
        }
      });

      // Verifica imagens que já terminaram antes do script executar
      if (img.complete && img.naturalWidth === 0) {
        markAsMissing();
      }
    });
  }

  /* =========================================================================
     5. Rastreamento de Conversões (GTM dataLayer / Google Ads gtag)
     ========================================================================= */
  function initConversionTracking() {
    document.addEventListener("click", function (event) {
      var trigger = event.target.closest('[data-gtm-event="whatsapp_click"]');
      if (!trigger) {
        return;
      }

      var leadType = trigger.getAttribute("data-lead-type") || "nao_especificado";
      var buttonLabel = (trigger.textContent || "").trim();

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "whatsapp_click",
        lead_type: leadType,
        cta_label: buttonLabel,
      });

      if (typeof window.gtag === "function") {
        window.gtag("event", "whatsapp_click", {
          event_category: "conversion",
          event_label: leadType,
          cta_label: buttonLabel,
        });
      }
    });
  }

  /* Inicialização */
  document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initHeaderAndScrollSpy();
    initScrollReveal();
    initImageFallbacks();
    initConversionTracking();
  });
})();
