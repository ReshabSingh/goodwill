/* Navigation and interactive components initialization */
document.addEventListener("DOMContentLoaded", initializeComponents, { once: true });

function initializeComponents() {
  initializeNavigation();
  initializeCarousel();
  initializeAccordion();
  initializeContactForm();
  initializeLazyLoading();
}

function initializeNavigation() {
  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const navigation = document.querySelector("#primary-navigation");
  const navLinks = [...document.querySelectorAll(".nav-link")];

  if (!header || !navToggle || !navigation) return;

  const desktopQuery = window.matchMedia("(min-width: 64rem)");

  const setMenuState = (isOpen) => {
    header.dataset.menuOpen = String(isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
  };

  const closeMenu = () => {
    setMenuState(false);
  };

  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    setMenuState(!isOpen);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
      closeMenu();
      navToggle.focus();
    }
  });

  document.addEventListener("click", (event) => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    const clickedInsideHeader = header.contains(event.target);

    if (isOpen && !clickedInsideHeader) {
      closeMenu();
    }
  });

  desktopQuery.addEventListener("change", closeMenu);
  setMenuState(false);

  if (navLinks.length > 0) {
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const setActiveLink = (id) => {
    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("is-active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];

      if (visibleEntry) {
        setActiveLink(visibleEntry.target.id);
      }
    },
    {
      rootMargin: "-35% 0px -55% 0px",
      threshold: [0.1, 0.25, 0.5, 0.75],
    }
  );

  sections.forEach((section) => observer.observe(section));

  const initialHash = window.location.hash.replace("#", "");
  const initialSection = sections.find((section) => section.id === initialHash) || sections[0];

    if (initialSection) {
      setActiveLink(initialSection.id);
    }
  }
}

function initializeCarousel() {
  const carousel = document.querySelector("[data-carousel]");

  if (!carousel) return;

  const slides = [...carousel.querySelectorAll("[data-carousel-slide]")];
  const previousButton = carousel.querySelector("[data-carousel-prev]");
  const nextButton = carousel.querySelector("[data-carousel-next]");
  const status = carousel.querySelector("[data-carousel-status]");
  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const rotationDelay = 5000;
  let activeIndex = slides.findIndex((slide) => slide.classList.contains("is-active"));
  let rotationTimer;

  if (activeIndex < 0) {
    activeIndex = 0;
  }

  const updateCarousel = (nextIndex) => {
    activeIndex = (nextIndex + slides.length) % slides.length;

    slides.forEach((slide, index) => {
      const isActive = index === activeIndex;
      slide.classList.toggle("is-active", isActive);
      slide.hidden = !isActive;
    });

    if (status) {
      status.textContent = `Testimonial ${activeIndex + 1} of ${slides.length}`;
    }
  };

  const stopRotation = () => {
    window.clearInterval(rotationTimer);
  };

  const startRotation = () => {
    stopRotation();

    if (!reduceMotionQuery.matches && slides.length > 1) {
      rotationTimer = window.setInterval(() => {
        updateCarousel(activeIndex + 1);
      }, rotationDelay);
    }
  };

  previousButton?.addEventListener("click", () => {
    updateCarousel(activeIndex - 1);
    startRotation();
  });

  nextButton?.addEventListener("click", () => {
    updateCarousel(activeIndex + 1);
    startRotation();
  });

  carousel.addEventListener("mouseenter", stopRotation);
  carousel.addEventListener("mouseleave", startRotation);
  carousel.addEventListener("focusin", stopRotation);
  carousel.addEventListener("focusout", startRotation);

  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      updateCarousel(activeIndex - 1);
      startRotation();
    }

    if (event.key === "ArrowRight") {
      updateCarousel(activeIndex + 1);
      startRotation();
    }
  });

  reduceMotionQuery.addEventListener("change", startRotation);
  updateCarousel(activeIndex);
  startRotation();
}

function initializeAccordion() {
  const accordion = document.querySelector("[data-accordion]");

  if (!accordion) return;

  const triggers = [...accordion.querySelectorAll("[data-accordion-trigger]")];
  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  const getPanel = (trigger) => document.getElementById(trigger.getAttribute("aria-controls"));

  const setPanelHeight = (panel, isOpen) => {
    if (!panel) {
      return;
    }

    if (reduceMotionQuery.matches) {
      panel.hidden = !isOpen;
      panel.style.blockSize = "";
      return;
    }

    if (isOpen) {
      panel.hidden = false;
      panel.style.blockSize = "0px";
      window.requestAnimationFrame(() => {
        panel.style.blockSize = `${panel.scrollHeight}px`;
      });

      panel.addEventListener(
        "transitionend",
        () => {
          if (!panel.hidden) {
            panel.style.blockSize = "auto";
          }
        },
        { once: true }
      );
      return;
    }

    panel.style.blockSize = `${panel.scrollHeight}px`;
    window.requestAnimationFrame(() => {
      panel.style.blockSize = "0px";
    });

    panel.addEventListener(
      "transitionend",
      () => {
        panel.hidden = true;
        panel.style.blockSize = "";
      },
      { once: true }
    );
  };

  const setAccordionItem = (trigger, isOpen) => {
    trigger.setAttribute("aria-expanded", String(isOpen));
    setPanelHeight(getPanel(trigger), isOpen);
  };

  const openItem = (activeTrigger) => {
    triggers.forEach((trigger) => {
      setAccordionItem(trigger, trigger === activeTrigger);
    });
  };

  triggers.forEach((trigger, index) => {
    trigger.addEventListener("click", () => {
      const isOpen = trigger.getAttribute("aria-expanded") === "true";

      if (!isOpen) {
        openItem(trigger);
      }
    });

    trigger.addEventListener("keydown", (event) => {
      const lastIndex = triggers.length - 1;
      let nextIndex = index;

      if (event.key === "ArrowDown") {
        nextIndex = index === lastIndex ? 0 : index + 1;
      } else if (event.key === "ArrowUp") {
        nextIndex = index === 0 ? lastIndex : index - 1;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = lastIndex;
      } else {
        return;
      }

      event.preventDefault();
      triggers[nextIndex].focus();
    });
  });

  triggers.forEach((trigger) => {
    const panel = getPanel(trigger);
    const isOpen = trigger.getAttribute("aria-expanded") === "true";

    if (panel) {
      panel.hidden = !isOpen;
      panel.style.blockSize = "";
    }
  });
}

function initializeContactForm() {
  const contactForm = document.querySelector("[data-contact-form]");

  if (!contactForm) return;

  const successMessage = contactForm.querySelector("[data-form-success]");
  const fields = [...contactForm.querySelectorAll("input, select, textarea")];

  const messages = {
    "full-name": {
      valueMissing: "Enter your full name.",
      tooShort: "Name must be at least 2 characters.",
    },
    phone: {
      valueMissing: "Enter your phone number.",
      patternMismatch: "Enter a valid phone number.",
    },
    email: {
      valueMissing: "Enter your email address.",
      typeMismatch: "Enter a valid email address.",
    },
    "service-type": {
      valueMissing: "Select a service type.",
    },
    message: {
      valueMissing: "Enter your message.",
      tooShort: "Message must be at least 10 characters.",
    },
  };

  const getErrorElement = (field) =>
    contactForm.querySelector(`[data-error-for="${field.name}"]`);

  const getErrorMessage = (field) => {
    const fieldMessages = messages[field.name] || {};
    const validity = field.validity;

    if (validity.valueMissing) {
      return fieldMessages.valueMissing || "This field is required.";
    }

    if (validity.typeMismatch) {
      return fieldMessages.typeMismatch || "Enter a valid value.";
    }

    if (validity.patternMismatch) {
      return fieldMessages.patternMismatch || "Enter a valid value.";
    }

    if (validity.tooShort) {
      return fieldMessages.tooShort || "This value is too short.";
    }

    return "";
  };

  const validateField = (field) => {
    const errorElement = getErrorElement(field);
    const errorMessage = getErrorMessage(field);
    const isValid = errorMessage === "";

    field.setAttribute("aria-invalid", String(!isValid));

    if (errorElement) {
      errorElement.textContent = errorMessage;
    }

    return isValid;
  };

  fields.forEach((field) => {
    field.addEventListener("blur", () => {
      validateField(field);
    });

    field.addEventListener("input", () => {
      if (field.getAttribute("aria-invalid") === "true") {
        validateField(field);
      }

      if (successMessage) {
        successMessage.textContent = "";
      }
    });
  });

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const isValid = fields.every((field) => validateField(field));

    if (!isValid) {
      fields.find((field) => field.getAttribute("aria-invalid") === "true")?.focus();
      return;
    }

    contactForm.reset();

    fields.forEach((field) => {
      field.setAttribute("aria-invalid", "false");
      const errorElement = getErrorElement(field);

      if (errorElement) {
        errorElement.textContent = "";
      }
    });

    if (successMessage) {
      successMessage.textContent =
        "Thank you. Your inquiry has been received and our team will contact you shortly.";
    }
  });
}

function initializeLazyLoading() {
  if (!("IntersectionObserver" in window)) {
    document.querySelectorAll("img[loading='lazy']").forEach((img) => {
      img.loading = "eager";
    });
    return;
  }

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute("data-src");
        }
        observer.unobserve(img);
      }
    });
  }, {
    rootMargin: "50px"
  });

  document.querySelectorAll("img[data-src]").forEach((img) => {
    imageObserver.observe(img);
  });
}
