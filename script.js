document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const deviceMemory = Number(navigator.deviceMemory || 8);
  const cpuCores = Number(navigator.hardwareConcurrency || 8);
  const lowEndDevice = deviceMemory <= 4 || cpuCores <= 4 || coarsePointer;
  const sceneToast = document.getElementById("sceneToast");
  let sceneToastTimer = null;

  if (lowEndDevice) {
    document.body.classList.add("perf-lite");
  }

  const announceSceneToast = (text) => {
    if (!sceneToast) return;

    sceneToast.textContent = text;
    sceneToast.classList.add("is-visible");

    if (sceneToastTimer) {
      clearTimeout(sceneToastTimer);
    }

    sceneToastTimer = window.setTimeout(() => {
      sceneToast.classList.remove("is-visible");
    }, 1300);
  };

  const cursorOrb = document.getElementById("cursorOrb");
  if (cursorOrb && !coarsePointer && !prefersReducedMotion && !lowEndDevice) {
    window.addEventListener("pointermove", (event) => {
      cursorOrb.style.opacity = "1";
      cursorOrb.style.left = `${event.clientX}px`;
      cursorOrb.style.top = `${event.clientY}px`;
    });

    window.addEventListener("pointerleave", () => {
      cursorOrb.style.opacity = "0";
    });
  }

  const tiltTargets = [
    ...document.querySelectorAll(
      ".metric-card, .cap-card, .price-card, .tab-panel, .testimonial-slider, .contact-form, .contact-card"
    ),
  ];

  tiltTargets.forEach((target) => {
    target.classList.add("tilt-card");
  });

  if (!coarsePointer && !prefersReducedMotion && !lowEndDevice) {
    tiltTargets.forEach((target) => {
      target.addEventListener("mousemove", (event) => {
        const rect = target.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width;
        const py = (event.clientY - rect.top) / rect.height;
        const tiltX = (0.5 - py) * 8;
        const tiltY = (px - 0.5) * 10;
        target.style.transform = `perspective(920px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
      });

      target.addEventListener("mouseleave", () => {
        target.style.transform = "";
      });
    });
  }

  const magneticNodes = [
    ...document.querySelectorAll(".btn, .header-cta, .price-card button, .card-copy button, .contact-form button"),
  ];

  if (!coarsePointer && !prefersReducedMotion && !lowEndDevice) {
    magneticNodes.forEach((node) => {
      node.classList.add("magnetic");

      node.addEventListener("mousemove", (event) => {
        const rect = node.getBoundingClientRect();
        const dx = event.clientX - (rect.left + rect.width / 2);
        const dy = event.clientY - (rect.top + rect.height / 2);
        node.style.transform = `translate(${dx * 0.12}px, ${dy * 0.14}px)`;
      });

      node.addEventListener("mouseleave", () => {
        node.style.transform = "";
      });
    });
  }

  const scrollProgress = document.getElementById("scrollProgress");
  const backToTop = document.getElementById("backToTop");
  const allSections = [...document.querySelectorAll("main section[id]")];
  const navLinks = [...document.querySelectorAll(".desktop-nav a")];

  const updateScrollState = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    if (scrollProgress) {
      scrollProgress.style.width = `${Math.min(100, Math.max(0, ratio))}%`;
    }

    if (backToTop) {
      backToTop.classList.toggle("is-visible", scrollTop > 680);
    }

    if (allSections.length && navLinks.length) {
      const marker = scrollTop + window.innerHeight * 0.28;
      let activeId = allSections[0].id;

      allSections.forEach((section) => {
        if (marker >= section.offsetTop) {
          activeId = section.id;
        }
      });

      navLinks.forEach((link) => {
        const href = link.getAttribute("href") || "";
        const isActive = href === `#${activeId}`;
        link.classList.toggle("is-active", isActive);
        if (isActive) {
          link.setAttribute("aria-current", "page");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }
  };

  let scrollTicking = false;
  const queueScrollUpdate = () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      scrollTicking = false;
      updateScrollState();
    });
  };

  window.addEventListener("scroll", queueScrollUpdate, { passive: true });
  window.addEventListener("resize", queueScrollUpdate);
  updateScrollState();

  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const menuToggle = document.getElementById("menuToggle");
  const mobilePanel = document.getElementById("mobilePanel");

  if (menuToggle && mobilePanel) {
    const setMenuOpen = (open) => {
      document.body.classList.toggle("menu-open", open);
      menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
      mobilePanel.hidden = !open;
    };

    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      setMenuOpen(!isOpen);
    });

    mobilePanel.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenuOpen(false));
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    });

    document.addEventListener("click", (event) => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      if (!isOpen) return;

      const clickedInside = mobilePanel.contains(event.target) || menuToggle.contains(event.target);
      if (!clickedInside) {
        setMenuOpen(false);
      }
    });
  }

  const revealItems = [...document.querySelectorAll(".reveal")];

  if (revealItems.length) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -6% 0px",
      }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  }

  const counterNodes = [...document.querySelectorAll("[data-counter]")];

  if (counterNodes.length) {
    const runCounter = (node) => {
      const target = Number.parseFloat(node.dataset.counter || "0");
      const suffix = node.dataset.suffix || "";
      const hasDecimal = `${target}`.includes(".");
      const duration = 1200;
      const start = performance.now();

      const tick = (time) => {
        const progress = Math.min((time - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = target * eased;
        const text = hasDecimal ? value.toFixed(1) : Math.round(value).toString();
        node.textContent = `${text}${suffix}`;

        if (progress < 1) {
          requestAnimationFrame(tick);
        }
      };

      requestAnimationFrame(tick);
    };

    const counterAnchor = document.getElementById("results") || counterNodes[0];
    let didRun = false;

    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !didRun) {
            didRun = true;
            counterNodes.forEach((node) => runCounter(node));
            observer.disconnect();
          }
        });
      },
      { threshold: 0.35 }
    );

    counterObserver.observe(counterAnchor);
  }

  const pricingSwitch = document.getElementById("pricingSwitch");
  const priceValues = [...document.querySelectorAll(".price-value")];
  const pricePeriods = [...document.querySelectorAll(".period")];

  if (pricingSwitch && priceValues.length) {
    const updatePricing = () => {
      const yearly = pricingSwitch.checked;

      priceValues.forEach((node) => {
        const value = yearly ? node.dataset.yearly : node.dataset.monthly;
        node.textContent = value || "0";
      });

      pricePeriods.forEach((node) => {
        node.textContent = yearly ? "/mo annual" : "/mo";
      });
    };

    pricingSwitch.addEventListener("change", updatePricing);
    updatePricing();
  }

  let refreshShowcaseMedia = () => { };
  const tabButtons = [...document.querySelectorAll(".tab-btn")];
  const tabPanels = [...document.querySelectorAll(".tab-panel")];

  if (tabButtons.length && tabPanels.length) {
    const setActiveTab = (tabKey) => {
      tabButtons.forEach((button) => {
        const active = button.dataset.tab === tabKey;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-selected", active ? "true" : "false");
      });

      tabPanels.forEach((panel) => {
        const active = panel.id === `tab-${tabKey}`;
        panel.classList.toggle("is-active", active);
        panel.hidden = !active;
      });

      refreshShowcaseMedia();
    };

    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        setActiveTab(button.dataset.tab || "");
      });
    });
  }

  const showcaseSection = document.getElementById("showcase");
  const showcaseVideos = [...document.querySelectorAll(".panel-media video")];
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const allowVideoAutoplay = !prefersReducedMotion && !connection?.saveData;

  if (showcaseVideos.length) {
    let showcaseVisible = false;

    refreshShowcaseMedia = () => {
      showcaseVideos.forEach((video) => {
        video.classList.add("is-paused");
        video.pause();
      });

      if (!allowVideoAutoplay || !showcaseVisible) return;

      const activeVideo = document.querySelector(".tab-panel.is-active video");
      if (activeVideo) {
        activeVideo.classList.remove("is-paused");
        activeVideo.play().catch(() => { });
      }
    };

    if (showcaseSection) {
      const showcaseObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            showcaseVisible = entry.isIntersecting;
          });
          refreshShowcaseMedia();
        },
        { threshold: 0.25 }
      );
      showcaseObserver.observe(showcaseSection);
    }

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        refreshShowcaseMedia();
      } else {
        showcaseVideos.forEach((video) => {
          video.classList.add("is-paused");
          video.pause();
        });
      }
    });

    refreshShowcaseMedia();
  }

  const testimonialTrack = document.getElementById("testimonialTrack");
  const testimonialPrev = document.getElementById("testimonialPrev");
  const testimonialNext = document.getElementById("testimonialNext");
  const testimonialDots = [...document.querySelectorAll(".dot")];

  if (testimonialTrack && testimonialDots.length) {
    const totalSlides = testimonialDots.length;
    let currentSlide = 0;
    let autoplayTimer = null;

    const renderSlide = () => {
      testimonialTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
      testimonialDots.forEach((dot, index) => {
        dot.classList.toggle("is-active", index === currentSlide);
      });
    };

    const setSlide = (index) => {
      currentSlide = (index + totalSlides) % totalSlides;
      renderSlide();
    };

    const startAutoplay = () => {
      if (autoplayTimer) return;
      autoplayTimer = window.setInterval(() => {
        setSlide(currentSlide + 1);
      }, 5200);
    };

    const stopAutoplay = () => {
      if (!autoplayTimer) return;
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    };

    testimonialPrev?.addEventListener("click", () => {
      setSlide(currentSlide - 1);
    });

    testimonialNext?.addEventListener("click", () => {
      setSlide(currentSlide + 1);
    });

    testimonialDots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const index = Number.parseInt(dot.dataset.slide || "0", 10);
        setSlide(index);
      });
    });

    [testimonialTrack, testimonialPrev, testimonialNext, ...testimonialDots].forEach((node) => {
      node?.addEventListener("mouseenter", stopAutoplay);
      node?.addEventListener("mouseleave", startAutoplay);
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stopAutoplay();
      } else {
        startAutoplay();
      }
    });

    renderSlide();
    startAutoplay();
  }

  const faqQuestions = [...document.querySelectorAll(".faq-question")];

  if (faqQuestions.length) {
    const setFaqOpen = (button, open) => {
      const answer = button.nextElementSibling;
      button.setAttribute("aria-expanded", open ? "true" : "false");
      if (answer) {
        answer.hidden = !open;
      }
    };

    faqQuestions.forEach((button) => {
      button.addEventListener("click", () => {
        const willOpen = button.getAttribute("aria-expanded") !== "true";

        faqQuestions.forEach((otherButton) => {
          if (otherButton !== button) {
            setFaqOpen(otherButton, false);
          }
        });

        setFaqOpen(button, willOpen);
      });
    });
  }

  const contactForm = document.getElementById("contactForm");
  const formMessage = document.getElementById("formMessage");

  if (contactForm && formMessage) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const formData = new FormData(contactForm);
      const name = String(formData.get("name") || "").trim();
      const email = String(formData.get("email") || "").trim();
      const message = String(formData.get("message") || "").trim();

      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!name || !email || !message) {
        formMessage.textContent = "Please fill in name, email, and project goal before submitting.";
        return;
      }

      if (!emailValid) {
        formMessage.textContent = "Please enter a valid work email address.";
        return;
      }

      formMessage.textContent = "Request received. Our team will respond with a scoped plan within 24 business hours.";
      contactForm.reset();
    });
  }

  window.setTimeout(() => {
    const webglCanvas = document.getElementById("webglScene");
    const sceneModeButtons = [...document.querySelectorAll("[data-scene-mode]")];
    const sceneIntensityInput = document.getElementById("sceneIntensity");
    const sceneModes = ["pulse", "flux", "wire"];

    if (webglCanvas && window.THREE && !prefersReducedMotion && !lowEndDevice) {
      const THREE = window.THREE;
      const container = webglCanvas.parentElement;
      const renderer = new THREE.WebGLRenderer({
        canvas: webglCanvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.4));

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 120);
      camera.position.set(0, 0, 10);

      const root = new THREE.Group();
      scene.add(root);

      const ambientLight = new THREE.AmbientLight(0xffc28f, 0.8);
      const warmLight = new THREE.PointLight(0xff7f39, 1.4, 38);
      warmLight.position.set(5.5, 4, 8);
      const coolLight = new THREE.PointLight(0x66cfff, 1.1, 44);
      coolLight.position.set(-6.2, -3, 10);
      scene.add(ambientLight, warmLight, coolLight);

      const coreGeometry = new THREE.TorusKnotGeometry(1.45, 0.42, 160, 24);
      const coreMaterial = new THREE.MeshStandardMaterial({
        color: 0xff9858,
        metalness: 0.66,
        roughness: 0.24,
        emissive: 0x411707,
        emissiveIntensity: 0.65,
      });
      const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);

      const shellGeometry = new THREE.IcosahedronGeometry(2.65, 1);
      const shellMaterial = new THREE.MeshBasicMaterial({
        color: 0x7ad8ff,
        wireframe: true,
        transparent: true,
        opacity: 0.24,
      });
      const shellMesh = new THREE.Mesh(shellGeometry, shellMaterial);

      const ringGeometry = new THREE.TorusGeometry(3.35, 0.03, 18, 160);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xffcaa3,
        transparent: true,
        opacity: 0.34,
      });
      const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
      ringMesh.rotation.x = 1.08;

      root.add(coreMesh, shellMesh, ringMesh);

      const particleCount = deviceMemory >= 8 ? 860 : 640;
      const particlePositions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i += 1) {
        const i3 = i * 3;
        const radius = 4 + Math.random() * 8.2;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        particlePositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        particlePositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        particlePositions[i3 + 2] = radius * Math.cos(phi);
      }

      const particleGeometry = new THREE.BufferGeometry();
      particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
      const particleMaterial = new THREE.PointsMaterial({
        color: 0xffcfab,
        size: 0.043,
        transparent: true,
        opacity: 0.62,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const particleField = new THREE.Points(particleGeometry, particleMaterial);
      scene.add(particleField);

      const pointerTarget = { x: 0, y: 0 };
      let currentSceneMode = "pulse";
      let intensity = Number.parseInt(sceneIntensityInput?.value || "88", 10) / 100;
      let sceneVisible = false;
      let pageVisible = !document.hidden;
      let rafId = 0;
      let isAnimating = false;

      const resizeRenderer = () => {
        const width = Math.max(240, container?.clientWidth || window.innerWidth);
        const height = Math.max(240, container?.clientHeight || Math.floor(window.innerHeight * 0.75));
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };

      const updateModeStyles = (mode) => {
        sceneModeButtons.forEach((button) => {
          button.classList.toggle("is-active", button.dataset.sceneMode === mode);
        });

        document.body.classList.toggle("scene-wire", mode === "wire");

        if (mode === "wire") {
          coreMaterial.color.setHex(0x88dbff);
          coreMaterial.emissive.setHex(0x0f2642);
          coreMaterial.wireframe = true;
          shellMaterial.opacity = 0.5;
          shellMaterial.color.setHex(0x93e3ff);
          ringMaterial.color.setHex(0x8ad6ff);
          particleMaterial.color.setHex(0xb8ebff);
        } else if (mode === "flux") {
          coreMaterial.color.setHex(0xffaa63);
          coreMaterial.emissive.setHex(0x53210a);
          coreMaterial.wireframe = false;
          shellMaterial.opacity = 0.3;
          shellMaterial.color.setHex(0x7dd7ff);
          ringMaterial.color.setHex(0xffd6b3);
          particleMaterial.color.setHex(0xffcda8);
        } else {
          coreMaterial.color.setHex(0xff9858);
          coreMaterial.emissive.setHex(0x411707);
          coreMaterial.wireframe = false;
          shellMaterial.opacity = 0.24;
          shellMaterial.color.setHex(0x7ad8ff);
          ringMaterial.color.setHex(0xffcaa3);
          particleMaterial.color.setHex(0xffcfab);
        }
      };

      const setSceneMode = (mode, notify = true) => {
        if (!sceneModes.includes(mode)) return;
        currentSceneMode = mode;
        updateModeStyles(mode);
        if (notify) {
          announceSceneToast(`3D mode: ${mode.toUpperCase()}`);
        }
      };

      sceneModeButtons.forEach((button) => {
        button.addEventListener("click", () => {
          setSceneMode(button.dataset.sceneMode || "pulse");
        });
      });

      if (sceneIntensityInput) {
        sceneIntensityInput.addEventListener("input", () => {
          intensity = Number.parseInt(sceneIntensityInput.value || "88", 10) / 100;
          announceSceneToast(`Intensity ${Math.round(intensity * 100)}%`);
        });
      }

      window.addEventListener("keydown", (event) => {
        if (event.key.toLowerCase() !== "g") return;

        const activeTag = document.activeElement?.tagName;
        if (activeTag === "INPUT" || activeTag === "TEXTAREA") return;

        const currentIndex = sceneModes.indexOf(currentSceneMode);
        const nextMode = sceneModes[(currentIndex + 1) % sceneModes.length];
        setSceneMode(nextMode);
      });

      if (!coarsePointer) {
        window.addEventListener("pointermove", (event) => {
          pointerTarget.x = (event.clientX / window.innerWidth) * 2 - 1;
          pointerTarget.y = (event.clientY / window.innerHeight) * 2 - 1;
        });
      }

      const shouldAnimateScene = () => sceneVisible && pageVisible;
      let isDisposed = false;
      const animateScene = (now) => {
        if (isDisposed) return;
        if (!shouldAnimateScene()) {
          isAnimating = false;
          return;
        }

        const t = now * 0.001;
        const pulse = 0.5 + 0.5 * Math.sin(t * 1.8);
        const modeMultiplier = currentSceneMode === "flux" ? 1.55 : currentSceneMode === "wire" ? 1.22 : 1;
        const speed = (0.85 + intensity * 1.15) * modeMultiplier;

        root.position.x += (pointerTarget.x * 0.75 - root.position.x) * 0.045;
        root.position.y += (-pointerTarget.y * 0.52 - root.position.y) * 0.045;

        coreMesh.rotation.x += 0.0035 * speed;
        coreMesh.rotation.y += 0.0046 * speed;
        coreMesh.rotation.z += 0.0016 * speed;
        coreMesh.scale.setScalar(1 + pulse * 0.05 * intensity);

        shellMesh.rotation.x -= 0.0013 * speed;
        shellMesh.rotation.y += 0.0019 * speed;
        shellMesh.scale.setScalar(1.02 + pulse * 0.035);

        ringMesh.rotation.z += 0.002 * speed;
        ringMesh.rotation.y = Math.sin(t * 0.5) * 0.4;

        particleField.rotation.y += 0.0008 * speed;
        particleField.rotation.x -= 0.00035 * speed;
        particleMaterial.size = 0.032 + intensity * 0.02;
        particleMaterial.opacity = 0.36 + intensity * 0.35;

        renderer.render(scene, camera);
        rafId = requestAnimationFrame(animateScene);
      };

      const startScene = () => {
        if (isAnimating || isDisposed || !shouldAnimateScene()) return;
        isAnimating = true;
        rafId = requestAnimationFrame(animateScene);
      };

      const stopScene = () => {
        if (!isAnimating) return;
        cancelAnimationFrame(rafId);
        isAnimating = false;
      };

      resizeRenderer();
      setSceneMode(currentSceneMode, false);
      window.addEventListener("resize", resizeRenderer);
      if (container) {
        const sceneObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              sceneVisible = entry.isIntersecting;
            });
            if (shouldAnimateScene()) {
              startScene();
            } else {
              stopScene();
            }
          },
          { threshold: 0.12 }
        );
        sceneObserver.observe(container);
      }

      document.addEventListener("visibilitychange", () => {
        pageVisible = !document.hidden;
        if (shouldAnimateScene()) {
          startScene();
        } else {
          stopScene();
        }
      });

      window.addEventListener("beforeunload", () => {
        isDisposed = true;
        stopScene();
        renderer.dispose();
        coreGeometry.dispose();
        coreMaterial.dispose();
        shellGeometry.dispose();
        shellMaterial.dispose();
        ringGeometry.dispose();
        ringMaterial.dispose();
        particleGeometry.dispose();
        particleMaterial.dispose();
      });
    } else if (webglCanvas && !prefersReducedMotion && !lowEndDevice) {
      const ctx = webglCanvas.getContext("2d");

      if (ctx) {
        const container = webglCanvas.parentElement;
        const fallbackModes = ["pulse", "flux", "wire"];
        const fallbackPointCount = lowEndDevice ? 280 : 520;
        const points = Array.from({ length: fallbackPointCount }, () => ({
          x: (Math.random() - 0.5) * 10,
          y: (Math.random() - 0.5) * 8,
          z: Math.random() * 12 + 1,
          seed: Math.random() * Math.PI * 2,
          size: Math.random() * 1.4 + 0.45,
        }));

        const pointerTarget = { x: 0, y: 0 };
        let mode = "pulse";
        let intensity = Number.parseInt(sceneIntensityInput?.value || "88", 10) / 100;
        let width = 0;
        let height = 0;
        let sceneVisible = false;
        let pageVisible = !document.hidden;
        let rafId = 0;
        let isAnimating = false;

        const resizeCanvas = () => {
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          width = Math.max(260, container?.clientWidth || window.innerWidth);
          height = Math.max(260, container?.clientHeight || Math.floor(window.innerHeight * 0.7));
          webglCanvas.width = Math.floor(width * dpr);
          webglCanvas.height = Math.floor(height * dpr);
          webglCanvas.style.width = `${width}px`;
          webglCanvas.style.height = `${height}px`;
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        const updateFallbackModeStyles = (nextMode) => {
          sceneModeButtons.forEach((button) => {
            button.classList.toggle("is-active", button.dataset.sceneMode === nextMode);
          });
          document.body.classList.toggle("scene-wire", nextMode === "wire");
        };

        const setFallbackMode = (nextMode, notify = true) => {
          if (!fallbackModes.includes(nextMode)) return;
          mode = nextMode;
          updateFallbackModeStyles(nextMode);
          if (notify) {
            announceSceneToast(`3D mode: ${nextMode.toUpperCase()}`);
          }
        };

        sceneModeButtons.forEach((button) => {
          button.addEventListener("click", () => {
            setFallbackMode(button.dataset.sceneMode || "pulse");
          });
        });

        if (sceneIntensityInput) {
          sceneIntensityInput.addEventListener("input", () => {
            intensity = Number.parseInt(sceneIntensityInput.value || "88", 10) / 100;
            announceSceneToast(`Intensity ${Math.round(intensity * 100)}%`);
          });
        }

        window.addEventListener("keydown", (event) => {
          if (event.key.toLowerCase() !== "g") return;

          const activeTag = document.activeElement?.tagName;
          if (activeTag === "INPUT" || activeTag === "TEXTAREA") return;

          const currentIndex = fallbackModes.indexOf(mode);
          setFallbackMode(fallbackModes[(currentIndex + 1) % fallbackModes.length]);
        });

        if (!coarsePointer) {
          window.addEventListener("pointermove", (event) => {
            pointerTarget.x = (event.clientX / window.innerWidth) * 2 - 1;
            pointerTarget.y = (event.clientY / window.innerHeight) * 2 - 1;
          });
        }

        const drawCore = (time, speed) => {
          const cx = width * 0.52 + pointerTarget.x * 34;
          const cy = height * 0.46 - pointerTarget.y * 24;
          const ringPulse = 0.82 + Math.sin(time * 2.2) * 0.11;
          const ringRadius = 58 + ringPulse * 32 * intensity;

          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(time * 0.45 * speed);
          ctx.strokeStyle = mode === "wire" ? "rgba(148, 222, 255, 0.75)" : "rgba(255, 184, 122, 0.8)";
          ctx.lineWidth = mode === "wire" ? 1.2 : 1.7;
          ctx.beginPath();
          ctx.ellipse(0, 0, ringRadius, ringRadius * 0.55, 0, 0, Math.PI * 2);
          ctx.stroke();

          ctx.rotate(time * 0.24 * speed);
          ctx.beginPath();
          ctx.ellipse(0, 0, ringRadius * 0.66, ringRadius * 0.28, Math.PI / 2, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = mode === "wire" ? "rgba(114, 214, 255, 0.55)" : "rgba(255, 146, 72, 0.58)";
          ctx.beginPath();
          ctx.arc(0, 0, 14 + ringPulse * 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        };

        const shouldAnimateFallback = () => sceneVisible && pageVisible;
        const animateFallback = (now) => {
          if (!shouldAnimateFallback()) {
            isAnimating = false;
            return;
          }

          const time = now * 0.001;
          const modeSpeed = mode === "flux" ? 1.62 : mode === "wire" ? 1.26 : 1;
          const speed = (0.88 + intensity * 1.18) * modeSpeed;

          ctx.clearRect(0, 0, width, height);
          const gradient = ctx.createRadialGradient(
            width * 0.52,
            height * 0.45,
            20,
            width * 0.52,
            height * 0.45,
            width * 0.68
          );
          if (mode === "wire") {
            gradient.addColorStop(0, "rgba(96, 188, 255, 0.24)");
            gradient.addColorStop(0.55, "rgba(24, 89, 156, 0.11)");
            gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
          } else {
            gradient.addColorStop(0, "rgba(255, 151, 84, 0.24)");
            gradient.addColorStop(0.56, "rgba(255, 128, 62, 0.08)");
            gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
          }
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, width, height);

          const baseRotY = time * 0.16 * speed + pointerTarget.x * 0.85;
          const baseRotX = pointerTarget.y * 0.5 + Math.sin(time * 0.43) * 0.09;
          const cosY = Math.cos(baseRotY);
          const sinY = Math.sin(baseRotY);
          const cosX = Math.cos(baseRotX);
          const sinX = Math.sin(baseRotX);

          for (let i = 0; i < points.length; i += 1) {
            const point = points[i];
            point.z -= 0.028 * speed;

            if (point.z < 0.3) {
              point.x = (Math.random() - 0.5) * 10;
              point.y = (Math.random() - 0.5) * 8;
              point.z = 12;
              point.seed = Math.random() * Math.PI * 2;
              point.size = Math.random() * 1.4 + 0.45;
            }

            let x = point.x;
            let y = point.y;
            let z = point.z;

            if (mode === "flux") {
              x += Math.cos(time * 1.5 + point.seed) * 0.45;
              y += Math.sin(time * 1.25 + point.seed) * 0.32;
            } else if (mode === "wire") {
              x += Math.sin(time * 1.75 + point.seed) * 0.26;
            }

            const rx = x * cosY - z * sinY;
            const rz = x * sinY + z * cosY;
            const ry = y * cosX - rz * sinX;
            const rz2 = y * sinX + rz * cosX + 8;
            const perspective = 260 / rz2;

            const sx = width * 0.52 + rx * perspective * 0.88;
            const sy = height * 0.46 + ry * perspective * 0.88;
            if (sx < -80 || sx > width + 80 || sy < -80 || sy > height + 80) continue;

            const radius = Math.max(0.46, point.size * perspective * 0.03);
            const alpha = Math.min(0.86, (1 / rz2) * (6.6 + intensity * 1.8));
            if (mode === "wire") {
              ctx.fillStyle = `rgba(151, 222, 255, ${alpha})`;
            } else {
              ctx.fillStyle = `rgba(255, 202, 160, ${alpha})`;
            }

            ctx.beginPath();
            ctx.arc(sx, sy, radius, 0, Math.PI * 2);
            ctx.fill();
          }

          drawCore(time, speed);
          rafId = requestAnimationFrame(animateFallback);
        };

        const startFallback = () => {
          if (isAnimating || !shouldAnimateFallback()) return;
          isAnimating = true;
          rafId = requestAnimationFrame(animateFallback);
        };

        const stopFallback = () => {
          if (!isAnimating) return;
          cancelAnimationFrame(rafId);
          isAnimating = false;
        };

        resizeCanvas();
        setFallbackMode(mode, false);
        window.addEventListener("resize", resizeCanvas);
        if (container) {
          const fallbackObserver = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                sceneVisible = entry.isIntersecting;
              });
              if (shouldAnimateFallback()) {
                startFallback();
              } else {
                stopFallback();
              }
            },
            { threshold: 0.12 }
          );
          fallbackObserver.observe(container);
        }

        document.addEventListener("visibilitychange", () => {
          pageVisible = !document.hidden;
          if (shouldAnimateFallback()) {
            startFallback();
          } else {
            stopFallback();
          }
        });
      } else if (sceneModeButtons.length) {
        sceneModeButtons.forEach((button) => {
          button.disabled = true;
        });
      }
    } else if (sceneModeButtons.length) {
      sceneModeButtons.forEach((button) => {
        button.disabled = true;
      });
    }
  }, 420);

  const textCarousel = document.getElementById("textCarousel");
  const carouselItems = textCarousel ? [...textCarousel.querySelectorAll(".carousel-item")] : [];

  if (textCarousel && carouselItems.length > 1) {
    let carouselIndex = 0;
    let carouselTimer = null;
    let typingTimer = null;

    const stopTyping = () => {
      if (typingTimer) {
        clearInterval(typingTimer);
        typingTimer = null;
      }
    };

    const runTyping = (item) => {
      if (!item) return;

      const fullText = (item.dataset.fulltext || item.textContent || "").trim();
      item.dataset.fulltext = fullText;
      stopTyping();

      carouselItems.forEach((carouselItem) => {
        carouselItem.classList.remove("is-typing");
        carouselItem.textContent = carouselItem.dataset.fulltext || carouselItem.textContent;
      });

      let cursor = 0;
      item.textContent = "";
      item.classList.add("is-typing");

      typingTimer = setInterval(() => {
        cursor += 1;
        item.textContent = fullText.slice(0, cursor);
        if (cursor >= fullText.length) {
          stopTyping();
          item.classList.remove("is-typing");
        }
      }, 28);
    };

    const setCarouselIndex = (index) => {
      carouselIndex = (index + carouselItems.length) % carouselItems.length;
      carouselItems.forEach((item, i) => item.classList.toggle("is-active", i === carouselIndex));
      runTyping(carouselItems[carouselIndex]);
    };

    const startCarousel = () => {
      if (carouselTimer) return;
      carouselTimer = setInterval(() => {
        setCarouselIndex(carouselIndex + 1);
      }, 3600);
    };

    const stopCarousel = () => {
      if (!carouselTimer) return;
      clearInterval(carouselTimer);
      carouselTimer = null;
    };

    textCarousel.addEventListener("mouseenter", stopCarousel);
    textCarousel.addEventListener("mouseleave", startCarousel);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stopCarousel();
        stopTyping();
      } else {
        startCarousel();
      }
    });

    setCarouselIndex(0);
    startCarousel();
  }

  const hero = document.querySelector(".hero");
  const stage = document.getElementById("model3d");
  const canvas = document.getElementById("modelCanvas");

  if (hero && stage && canvas) {
    const fallbackCtx = {
      setTransform: () => { },
      clearRect: () => { },
      drawImage: () => { },
    };
    const ctx = canvas.getContext("2d", { alpha: true }) || fallbackCtx;

    const sourceFrames = 250;
    const frameStride = lowEndDevice ? 2 : 1;
    const totalFrames = Math.ceil(sourceFrames / frameStride);
    const maxCachedFrames = lowEndDevice ? 32 : 120;
    const preloadRadius = lowEndDevice ? 3 : 6;
    const idle = window.requestIdleCallback
      ? window.requestIdleCallback.bind(window)
      : (cb) => window.setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 0 }), 1);
    const pad = (num) => String(num).padStart(3, "0");
    const framePath = (index) => {
      const sourceIndex = Math.min(sourceFrames - 1, index * frameStride);
      return `background-remover/ezgif-frame-${pad(sourceIndex + 1)}.png`;
    };

    const images = new Map();
    const loading = new Map();
    const cacheOrder = [];

    let targetFrame = 0;
    let currentFrame = 0;
    let lastDrawn = -1;
    let interactive = false;
    let heroVisible = false;
    let pageVisible = !document.hidden;
    let rafId = 0;
    let isAnimating = false;
    let didPrime = false;
    let primeScheduled = false;

    const touchCache = (index) => {
      const existing = cacheOrder.indexOf(index);
      if (existing >= 0) {
        cacheOrder.splice(existing, 1);
      }
      cacheOrder.push(index);
    };

    const evictCache = () => {
      let guard = cacheOrder.length + 2;
      while (cacheOrder.length > maxCachedFrames && guard > 0) {
        guard -= 1;
        const oldest = cacheOrder.shift();
        const protectedFrames = new Set([Math.round(currentFrame), Math.round(targetFrame), lastDrawn]);
        if (protectedFrames.has(oldest)) {
          cacheOrder.push(oldest);
          continue;
        }
        images.delete(oldest);
      }
    };

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, lowEndDevice ? 1.25 : 2);
      const width = stage.clientWidth;
      const height = stage.clientHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      drawFrame(Math.round(currentFrame));
    };

    const loadFrame = (index) => {
      if (index < 0 || index >= totalFrames) return Promise.resolve(null);
      if (images.has(index)) {
        touchCache(index);
        return Promise.resolve(images.get(index));
      }
      if (loading.has(index)) return loading.get(index);

      const promise = new Promise((resolve) => {
        const img = new Image();
        img.decoding = "async";
        img.src = framePath(index);
        img.onload = () => {
          images.set(index, img);
          touchCache(index);
          evictCache();
          loading.delete(index);
          resolve(img);
        };
        img.onerror = () => {
          loading.delete(index);
          resolve(null);
        };
      });

      loading.set(index, promise);
      return promise;
    };

    const drawFrame = (index) => {
      const img = images.get(index);
      if (!img) return;

      const width = stage.clientWidth;
      const height = stage.clientHeight;

      ctx.clearRect(0, 0, width, height);

      const scale = Math.min(width / img.width, height / img.height);
      const drawWidth = img.width * scale;
      const drawHeight = img.height * scale;
      const drawX = (width - drawWidth) / 2;
      const drawY = (height - drawHeight) / 2;

      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      lastDrawn = index;
    };

    const ensureNeighborhood = (center, radius) => {
      for (let i = center - radius; i <= center + radius; i += 1) {
        if (i >= 0 && i < totalFrames) {
          loadFrame(i);
        }
      }
    };

    const primeLoads = async () => {
      if (didPrime) return;
      didPrime = true;

      await loadFrame(0);
      drawFrame(0);

      for (let i = 1; i < totalFrames; i += lowEndDevice ? 8 : 4) {
        loadFrame(i);
      }

      idle(() => {
        ensureNeighborhood(0, preloadRadius + 2);
      });
    };

    const shouldAnimateFrames = () => heroVisible && pageVisible;
    const animate = () => {
      if (!shouldAnimateFrames()) {
        isAnimating = false;
        return;
      }

      currentFrame += (targetFrame - currentFrame) * 0.14;
      const roundedFrame = Math.round(currentFrame);

      if (!images.has(roundedFrame)) {
        loadFrame(roundedFrame).then(() => drawFrame(roundedFrame));
        ensureNeighborhood(roundedFrame, preloadRadius);
      } else if (roundedFrame !== lastDrawn) {
        drawFrame(roundedFrame);
        ensureNeighborhood(roundedFrame, Math.max(1, preloadRadius - 1));
      }

      rafId = requestAnimationFrame(animate);
    };

    const startFrameLoop = () => {
      if (isAnimating || !shouldAnimateFrames()) return;
      isAnimating = true;
      rafId = requestAnimationFrame(animate);
    };

    const stopFrameLoop = () => {
      if (!isAnimating) return;
      cancelAnimationFrame(rafId);
      isAnimating = false;
    };

    const clampFrame = (value) => Math.max(0, Math.min(totalFrames - 1, value));

    const onWheel = (event) => {
      if (!interactive) return;
      targetFrame = clampFrame(targetFrame + event.deltaY * 0.13);
    };

    hero.addEventListener("mouseenter", () => {
      interactive = true;
    });

    hero.addEventListener("mouseleave", () => {
      interactive = false;
    });

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("resize", resizeCanvas);
    document.addEventListener("visibilitychange", () => {
      pageVisible = !document.hidden;
      if (shouldAnimateFrames()) {
        startFrameLoop();
      } else {
        stopFrameLoop();
      }
    });

    const heroObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          heroVisible = entry.isIntersecting;
        });

        if (heroVisible && !primeScheduled) {
          primeScheduled = true;
          window.setTimeout(() => {
            primeLoads();
          }, lowEndDevice ? 260 : 520);
        }

        if (shouldAnimateFrames()) {
          startFrameLoop();
        } else {
          stopFrameLoop();
        }
      },
      { threshold: 0.14 }
    );
    heroObserver.observe(hero);

    resizeCanvas();
    if (shouldAnimateFrames()) {
      startFrameLoop();
    }
  }

  const heroCta = document.getElementById("heroAddToCart");
  if (heroCta) {
    heroCta.addEventListener("click", () => {
      const contactSection = document.getElementById("contact");
      contactSection?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
});
