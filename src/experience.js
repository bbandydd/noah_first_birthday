(() => {
  const toRadians = (degrees) => (degrees * Math.PI) / 180;

  const buildFloatingAnimation = (x, y, z, distance, duration, delay) => ({
    property: "position",
    from: `${x} ${y - distance} ${z}`,
    to: `${x} ${y + distance} ${z}`,
    dir: "alternate",
    easing: "easeInOutSine",
    loop: true,
    dur: duration,
    delay,
  });

  const setEntityMaterial = (entity, materialConfig) => {
    entity.setAttribute("material", materialConfig);
  };

  AFRAME.registerComponent("media-card-interaction", {
    schema: {
      kind: {default: "photo"},
    },

    init() {
      this.baseScale = new THREE.Vector3(1, 1, 1);
      this.onTap = this.onTap.bind(this);
      this.el.addEventListener("click", this.onTap);
    },

    remove() {
      this.el.removeEventListener("click", this.onTap);
    },

    onTap(event) {
      event.stopPropagation();

      if (this.data.kind === "video") {
        this.playPopAnimation(1.08);
        const isPlaying = this.toggleVideo();
        this.el.sceneEl.emit("gallery:video-toggled", {
          isPlaying,
          videoId: this.el.getAttribute("data-video-id"),
        });
        return;
      }

      this.playPopAnimation(1.12);
      this.el.sceneEl.emit("gallery:photo-toggle-focus", {cardEl: this.el});
    },

    playPopAnimation(multiplier) {
      this.el.setAttribute("animation__tap", {
        property: "scale",
        from: `${this.baseScale.x} ${this.baseScale.y} ${this.baseScale.z}`,
        to: `${this.baseScale.x * multiplier} ${this.baseScale.y * multiplier} ${this.baseScale.z * multiplier}`,
        dir: "alternate",
        dur: window.PARTY_CONFIG.animation.popDurationMs,
        easing: "easeOutBack",
        loop: 1,
      });
    },

    flashFrame(startColor, endColor) {
      const frame = this.el.querySelector(".media-frame");
      if (!frame) return;

      frame.setAttribute("animation__frameflash", {
        property: "material.color",
        from: startColor,
        to: endColor,
        dir: "alternate",
        dur: 180,
        loop: 1,
        easing: "easeInOutSine",
      });
    },

    toggleVideo() {
      const videoId = this.el.getAttribute("data-video-id");
      if (!videoId) return false;

      const video = document.getElementById(videoId);
      if (!video) return false;

      if (video.paused) {
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {});
        }
        this.flashFrame("#f2f6ff", "#6ecbff");
        this.setPauseBadgeVisible(false);
        return true;
      }

      video.pause();
      this.flashFrame("#f2f6ff", "#ffb347");
      this.setPauseBadgeVisible(true);
      return false;
    },

    setPauseBadgeVisible(isVisible) {
      const badge = this.el.querySelector(".pause-badge");
      if (!badge) return;
      badge.setAttribute("visible", isVisible);
    },
  });

  AFRAME.registerComponent("birthday-gallery", {
    init() {
      this.config = window.PARTY_CONFIG;
      this.introConfig = this.config.intro || {countdownSeconds: 3};
      this.desktopConfig = this.config.desktopPreview || {};
      this.scene = this.el;
      this.camera = document.getElementById("camera");
      this.ground = document.getElementById("ground");
      this.assets = document.getElementById("mediaAssets");
      this.prompt = document.getElementById("promptText");
      this.status = document.getElementById("statusText");
      this.resetButton = document.getElementById("resetBtn");
      this.videoButton = document.getElementById("videoBtn");
      this.revealOverlay = document.getElementById("revealOverlay");
      this.countdownNumber = document.getElementById("countdownNumber");
      this.countdownLabel = document.getElementById("countdownLabel");

      this.galleryRoot = null;
      this.videoAssetIds = [];
      this.allVideosPlaying = false;
      this.hasPlacedGallery = false;
      this.isRevealing = false;
      this.countdownTimer = null;
      this.focusedPhotoCard = null;
      this.isDesktopPreview = this.detectDesktopPreviewMode();
      this.desktopIdleStatus = this.config.ui.desktopStatus || "Desktop preview active.";
      this.hoveredCard = null;

      this.handleGroundTap = this.handleGroundTap.bind(this);
      this.handleReset = this.handleReset.bind(this);
      this.handleToggleVideos = this.handleToggleVideos.bind(this);
      this.handlePhotoToggleFocus = this.handlePhotoToggleFocus.bind(this);
      this.handleVideoToggled = this.handleVideoToggled.bind(this);

      this.ground.addEventListener("click", this.handleGroundTap);
      this.resetButton.addEventListener("click", this.handleReset);
      this.videoButton.addEventListener("click", this.handleToggleVideos);
      this.scene.addEventListener("gallery:photo-toggle-focus", this.handlePhotoToggleFocus);
      this.scene.addEventListener("gallery:video-toggled", this.handleVideoToggled);

      this.updatePrompt(this.config.ui.prompt);
      this.setStatus("Move your phone slowly so floor detection can lock.");
      this.updateVideoButtonLabel();

      this.setupDesktopPreviewPlacement();
    },

    detectDesktopPreviewMode() {
      const hasTouchPoints = navigator.maxTouchPoints && navigator.maxTouchPoints > 0;
      const hasTouchEvents = "ontouchstart" in window;
      return !(hasTouchPoints || hasTouchEvents);
    },

    setupDesktopPreviewPlacement() {
      const isAutoPlace = this.isDesktopPreview ? this.desktopConfig.autoPlace : this.config.placement.autoPlace;
      
      if (!isAutoPlace) {
        return;
      }

      if (this.isDesktopPreview) {
        this.updatePrompt(this.config.ui.desktopPrompt || this.config.ui.prompt, true);
        this.setStatus(this.desktopIdleStatus);
      }

      const placeWhenReady = () => {
        if (this.hasPlacedGallery || this.isRevealing) {
          return;
        }

        const groundY = this.isDesktopPreview
          ? (Number.isFinite(this.desktopConfig.autoPlaceGroundY) ? this.desktopConfig.autoPlaceGroundY : -0.5)
          : (Number.isFinite(this.config.placement.autoPlaceGroundY) ? this.config.placement.autoPlaceGroundY : 0);
        this.placeGallery(groundY);
      };

      if (this.scene.hasLoaded) {
        window.setTimeout(placeWhenReady, 180);
        return;
      }

      this.scene.addEventListener("loaded", () => {
        window.setTimeout(placeWhenReady, 180);
      }, {once: true});
    },

    bindDesktopHoverHint(targetEl, hintMessage) {
      if (!this.isDesktopPreview || !targetEl) {
        return;
      }

      targetEl.addEventListener("mouseenter", () => {
        if (this.isRevealing) {
          return;
        }
        this.setCardHoverState(targetEl, true);
        this.setStatus(hintMessage);
      });

      targetEl.addEventListener("mouseleave", () => {
        if (this.isRevealing) {
          return;
        }
        this.setCardHoverState(targetEl, false);
        this.setStatus(this.desktopIdleStatus);
      });
    },

    setCardHoverState(targetEl, isHovered) {
      const card = targetEl.closest(".photo-card, .video-card");
      if (!card) {
        return;
      }

      const frame = card.querySelector(".media-frame");
      if (!frame) {
        return;
      }

      const baseEmissiveIntensity = Number(frame.dataset.baseEmissiveIntensity || 0.2);
      const activeEmissiveIntensity = baseEmissiveIntensity + 0.26;

      if (isHovered) {
        this.hoveredCard = card;
        frame.setAttribute("animation__hoverglow", {
          property: "material.emissiveIntensity",
          to: activeEmissiveIntensity,
          dur: 140,
          easing: "easeOutCubic",
        });
        frame.setAttribute("animation__hoveralpha", {
          property: "material.opacity",
          to: 1,
          dur: 140,
          easing: "easeOutCubic",
        });
        return;
      }

      if (this.hoveredCard === card) {
        this.hoveredCard = null;
      }

      frame.setAttribute("animation__hoverglow", {
        property: "material.emissiveIntensity",
        to: baseEmissiveIntensity,
        dur: 160,
        easing: "easeOutCubic",
      });
      frame.setAttribute("animation__hoveralpha", {
        property: "material.opacity",
        to: 0.92,
        dur: 160,
        easing: "easeOutCubic",
      });
    },

    remove() {
      this.stopCountdown();
      this.ground.removeEventListener("click", this.handleGroundTap);
      this.resetButton.removeEventListener("click", this.handleReset);
      this.videoButton.removeEventListener("click", this.handleToggleVideos);
      this.scene.removeEventListener("gallery:photo-toggle-focus", this.handlePhotoToggleFocus);
      this.scene.removeEventListener("gallery:video-toggled", this.handleVideoToggled);
    },

    handleGroundTap(event) {
      if (this.isRevealing) {
        this.setStatus(this.config.ui.revealingBlockedMessage);
        return;
      }

      if (
        this.isDesktopPreview &&
        this.hasPlacedGallery &&
        this.desktopConfig.relocateRequiresShift
      ) {
        const mouseEvent = event?.detail?.mouseEvent;
        if (!mouseEvent?.shiftKey) {
          this.setStatus(this.config.ui.desktopRelocateHint || "Desktop: hold Shift and click ground to reposition layout.");
          return;
        }
      }

      const point = event?.detail?.intersection?.point;
      if (!point) return;

      if (!this.hasPlacedGallery) {
        this.placeGallery(point.y);
        return;
      }

      if (!this.config.placement.allowRelocateOnGroundTap) {
        return;
      }

      this.moveGallery(point.y);
    },

    handleReset() {
      this.stopCountdown();
      this.removeGallery();
      this.hasPlacedGallery = false;
      this.allVideosPlaying = false;
      this.isRevealing = false;
      this.pauseAllVideos();
      const resetPrompt = this.isDesktopPreview
        ? (this.config.ui.desktopPrompt || this.config.ui.prompt)
        : this.config.ui.prompt;
      this.updatePrompt(resetPrompt, true);
      this.updateVideoButtonLabel();
      this.setRevealOverlayVisible(false);

      if (this.isDesktopPreview && this.desktopConfig.autoPlace) {
        this.setStatus("Layout removed. Rebuilding desktop preview...");
        window.setTimeout(() => {
          if (!this.hasPlacedGallery && !this.isRevealing) {
            const groundY = Number.isFinite(this.desktopConfig.autoPlaceGroundY)
              ? this.desktopConfig.autoPlaceGroundY
              : -0.5;
            this.placeGallery(groundY);
          }
        }, 120);
        return;
      }

      this.setStatus("Layout removed. Tap the ground to place again.");
    },

    handleToggleVideos() {
      if (this.isRevealing) {
        this.setStatus(this.config.ui.revealingBlockedMessage);
        return;
      }

      const videos = this.videoAssetIds
        .map((id) => document.getElementById(id))
        .filter(Boolean);

      if (!videos.length) {
        this.setStatus("Place the gallery first so videos are available.");
        return;
      }

      if (this.allVideosPlaying) {
        videos.forEach((video) => video.pause());
        this.allVideosPlaying = false;
        this.setStatus(this.config.ui.allVideosPausedMessage);
        this.setAllPauseBadges(true);
      } else {
        videos.forEach((video) => {
          const playPromise = video.play();
          if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(() => {});
          }
        });
        this.allVideosPlaying = true;
        this.setStatus(this.config.ui.allVideosPlayingMessage);
        this.setAllPauseBadges(false);
      }

      this.updateVideoButtonLabel();
    },

    handlePhotoToggleFocus(event) {
      if (this.isRevealing || !this.hasPlacedGallery) {
        return;
      }

      const card = event?.detail?.cardEl;
      if (!card) {
        return;
      }

      if (this.focusedPhotoCard && this.focusedPhotoCard !== card) {
        this.collapsePhotoCard(this.focusedPhotoCard);
      }

      if (this.focusedPhotoCard === card) {
        this.collapsePhotoCard(card);
        this.focusedPhotoCard = null;
        this.setStatus(this.config.ui.photoCollapsedMessage || "Photo restored.");
        return;
      }

      this.focusPhotoCard(card);
      this.focusedPhotoCard = card;
      this.setStatus(this.config.ui.photoExpandedMessage || "Photo expanded.");
    },

    handleVideoToggled(event) {
      const isPlaying = Boolean(event?.detail?.isPlaying);
      this.syncAllVideosPlayingState();
      this.updateVideoButtonLabel();

      this.setStatus(
        isPlaying
          ? (this.config.ui.videoTapPlayMessage || "Video playing.")
          : (this.config.ui.videoTapPauseMessage || "Video paused.")
      );
    },

    syncAllVideosPlayingState() {
      const videos = this.videoAssetIds
        .map((id) => document.getElementById(id))
        .filter(Boolean);

      this.allVideosPlaying = videos.length > 0 && videos.every((video) => !video.paused);
    },

    focusPhotoCard(card) {
      const moveIn = this.config.interaction?.photoFocusMoveIn ?? 0.82;
      const focusScale = this.config.interaction?.photoFocusScale ?? 1.8;
      const focusLift = this.config.interaction?.photoFocusLift ?? 0.08;

      const homeX = Number(card.dataset.homeX || 0);
      const homeY = Number(card.dataset.homeY || 0);
      const homeZ = Number(card.dataset.homeZ || 0);

      const inward = new THREE.Vector3(-homeX, 0, -homeZ);
      if (inward.lengthSq() < 0.000001) {
        inward.set(0, 0, -1);
      } else {
        inward.normalize();
      }

      const focusX = homeX + inward.x * moveIn;
      const focusY = homeY + focusLift;
      const focusZ = homeZ + inward.z * moveIn;

      card.removeAttribute("animation__float");
      card.setAttribute("animation__focusmove", {
        property: "position",
        to: `${focusX} ${focusY} ${focusZ}`,
        dur: 320,
        easing: "easeOutCubic",
      });
      card.setAttribute("animation__focusscale", {
        property: "scale",
        to: `${focusScale} ${focusScale} ${focusScale}`,
        dur: 320,
        easing: "easeOutBack",
      });
    },

    collapsePhotoCard(card) {
      const homeX = Number(card.dataset.homeX || 0);
      const homeY = Number(card.dataset.homeY || 0);
      const homeZ = Number(card.dataset.homeZ || 0);
      const floatDelay = Number(card.dataset.floatDelay || 0);

      card.setAttribute("animation__focusmove", {
        property: "position",
        to: `${homeX} ${homeY} ${homeZ}`,
        dur: 260,
        easing: "easeOutCubic",
      });
      card.setAttribute("animation__focusscale", {
        property: "scale",
        to: "1 1 1",
        dur: 260,
        easing: "easeOutCubic",
      });
      card.setAttribute(
        "animation__float",
        buildFloatingAnimation(
          homeX,
          homeY,
          homeZ,
          this.config.animation.floatDistance,
          this.config.animation.floatDurationMs,
          floatDelay
        )
      );
    },

    updatePrompt(message, visible) {
      this.prompt.textContent = message;
      this.prompt.style.display = visible === false ? "none" : "block";
    },

    updateVideoButtonLabel() {
      this.videoButton.textContent = this.allVideosPlaying
        ? this.config.ui.pauseAllLabel
        : this.config.ui.playAllLabel;
    },

    setStatus(message) {
      this.status.textContent = message;
    },

    getUserCenter(groundY) {
      const worldPosition = new THREE.Vector3();
      this.camera.object3D.getWorldPosition(worldPosition);
      return {
        x: worldPosition.x,
        y: groundY + this.config.placement.centerYOffset,
        z: worldPosition.z,
      };
    },

    placeGallery(groundY) {
      this.removeGallery();
      this.ensureVideoAssets();
      this.focusedPhotoCard = null;

      const center = this.getUserCenter(groundY);

      this.galleryRoot = document.createElement("a-entity");
      this.galleryRoot.setAttribute("id", "galleryRoot");
      this.galleryRoot.setAttribute("position", `${center.x} ${center.y} ${center.z}`);
      this.galleryRoot.setAttribute("visible", "false");
      this.galleryRoot.setAttribute("scale", "0.84 0.84 0.84");
      this.scene.appendChild(this.galleryRoot);

      this.buildPhotoLayer(this.galleryRoot);
      this.buildVideoLayer(this.galleryRoot);
      this.addDecorativeRings(this.galleryRoot);
      this.playPlacementPulse();

      this.hasPlacedGallery = true;
      this.updatePrompt(this.config.ui.revealPreparingMessage, true);
      this.setStatus(this.config.ui.revealInProgressMessage);
      this.updateVideoButtonLabel();

      this.unlockVideos();
      this.startRevealSequence();
    },

    moveGallery(groundY) {
      if (!this.galleryRoot) return;

      const center = this.getUserCenter(groundY);
      this.galleryRoot.setAttribute("position", `${center.x} ${center.y} ${center.z}`);
      this.galleryRoot.setAttribute("visible", "false");
      this.galleryRoot.setAttribute("scale", "0.84 0.84 0.84");
      this.updatePrompt(this.config.ui.revealPreparingMessage, true);
      this.setStatus(this.config.ui.relocatedWithCountdownMessage || this.config.ui.revealInProgressMessage);
      this.startRevealSequence();
    },

    removeGallery() {
      if (!this.galleryRoot) return;
      this.galleryRoot.remove();
      this.galleryRoot = null;
      this.focusedPhotoCard = null;
      this.hoveredCard = null;
      this.setAllPauseBadges(true);
    },

    setRevealOverlayVisible(visible) {
      if (!this.revealOverlay) return;

      if (visible) {
        this.revealOverlay.classList.remove("reveal-overlay--hidden");
        return;
      }

      this.revealOverlay.classList.add("reveal-overlay--hidden");
    },

    stopCountdown() {
      if (this.countdownTimer) {
        window.clearInterval(this.countdownTimer);
        this.countdownTimer = null;
      }
    },

    startRevealSequence() {
      let remaining = Math.max(1, Math.floor(this.introConfig.countdownSeconds || 3));

      this.stopCountdown();
      this.isRevealing = true;
      this.setRevealOverlayVisible(true);

      if (this.countdownLabel) {
        this.countdownLabel.textContent = this.introConfig.revealLabel || "Get ready...";
      }

      if (this.countdownNumber) {
        this.countdownNumber.textContent = String(remaining);
      }

      this.countdownTimer = window.setInterval(() => {
        remaining -= 1;

        if (remaining > 0) {
          if (this.countdownNumber) {
            this.countdownNumber.textContent = String(remaining);
          }
          return;
        }

        this.stopCountdown();
        this.revealGallery();
      }, 1000);
    },

    revealGallery() {
      if (!this.galleryRoot) {
        this.isRevealing = false;
        this.setRevealOverlayVisible(false);
        return;
      }

      this.galleryRoot.setAttribute("visible", "true");
      this.galleryRoot.setAttribute("animation__intro", {
        property: "scale",
        from: "0.84 0.84 0.84",
        to: "1 1 1",
        dur: 620,
        easing: "easeOutElastic",
      });

      if (this.countdownNumber) {
        this.countdownNumber.textContent = "GO";
      }

      if (this.countdownLabel) {
        this.countdownLabel.textContent = this.introConfig.revealDoneLabel || "Gallery live";
      }

      window.setTimeout(() => {
        this.setRevealOverlayVisible(false);
      }, 650);

      this.isRevealing = false;
      this.updatePrompt(this.config.ui.placedMessage, false);
      this.setStatus(this.config.ui.placedMessage);
      this.playPlacementPulse();
    },

    pauseAllVideos() {
      this.videoAssetIds.forEach((id) => {
        const video = document.getElementById(id);
        if (video) {
          video.pause();
          video.currentTime = 0;
        }
      });
      this.setAllPauseBadges(true);
    },

    setAllPauseBadges(isVisible) {
      if (!this.galleryRoot) return;
      const badges = this.galleryRoot.querySelectorAll(".pause-badge");
      badges.forEach((badge) => badge.setAttribute("visible", isVisible));
    },

    ensureVideoAssets() {
      this.videoAssetIds = this.config.videos.map((video, index) => {
        const id = `videoAsset${index + 1}`;
        let videoElement = document.getElementById(id);

        if (!videoElement) {
          videoElement = document.createElement("video");
          videoElement.setAttribute("id", id);
          videoElement.setAttribute("src", video.src);
          videoElement.setAttribute("crossorigin", "anonymous");
          videoElement.setAttribute("playsinline", "true");
          videoElement.setAttribute("webkit-playsinline", "true");
          videoElement.setAttribute("preload", "auto");
          videoElement.loop = video.loop !== false;
          videoElement.muted = video.muted !== false;
          this.assets.appendChild(videoElement);
        }

        return id;
      });
    },

    async unlockVideos() {
      for (const id of this.videoAssetIds) {
        const video = document.getElementById(id);
        if (!video) continue;

        try {
          await video.play();
          video.pause();
          video.currentTime = 0;
        } catch (error) {
          // iOS may still block some playback states; individual tap still works.
        }
      }

      this.setAllPauseBadges(true);
    },

    buildPhotoLayer(root) {
      const layer = this.config.layerOne;
      const items = this.config.photos;
      const angleOffset = toRadians(layer.spinOffsetDeg || 0);

      items.forEach((item, index) => {
        const angle = angleOffset + (index / items.length) * Math.PI * 2;
        const x = Math.cos(angle) * layer.radius;
        const z = Math.sin(angle) * layer.radius;
        const facingY = 270 - (angle * 180) / Math.PI;

        const card = document.createElement("a-entity");
        card.classList.add("cantap", "photo-card");
        card.setAttribute("position", `${x} ${layer.height} ${z}`);
        card.setAttribute("rotation", `0 ${facingY} 0`);
        card.setAttribute("media-card-interaction", "kind: photo");
        card.dataset.homeX = String(x);
        card.dataset.homeY = String(layer.height);
        card.dataset.homeZ = String(z);
        card.dataset.floatDelay = String(index * 90);
        card.setAttribute(
          "animation__float",
          buildFloatingAnimation(
            x,
            layer.height,
            z,
            this.config.animation.floatDistance,
            this.config.animation.floatDurationMs,
            index * 90
          )
        );

        const frame = document.createElement("a-plane");
        frame.classList.add("media-frame", "cantap");
        frame.setAttribute("position", "0 0 -0.012");
        frame.setAttribute("width", layer.itemWidth + 0.1);
        frame.setAttribute("height", layer.itemHeight + 0.1);
        setEntityMaterial(frame, {
          color: item.frameColor || "#ffd166",
          emissive: item.frameColor || "#ffd166",
          emissiveIntensity: 0.2,
          side: "double",
          transparent: true,
          opacity: 0.92,
        });
        frame.dataset.baseEmissiveIntensity = "0.2";

        const photo = document.createElement("a-plane");
        photo.classList.add("cantap");
        photo.setAttribute("position", "0 0 0");
        photo.setAttribute("width", layer.itemWidth);
        photo.setAttribute("height", layer.itemHeight);
        setEntityMaterial(photo, {
          src: item.src,
          side: "double",
          shader: "flat",
          transparent: true,
        });

        const title = document.createElement("a-text");
        title.setAttribute("value", item.title || "");
        title.setAttribute("position", `0 ${-(layer.itemHeight / 2) - 0.12} 0.02`);
        title.setAttribute("align", "center");
        title.setAttribute("width", "4");
        title.setAttribute("color", "#fffaf1");
        title.setAttribute("shader", "msdf");

        const photoHoverHint = this.config.ui.desktopHoverPhotoHint || "Photo is clickable. Left-click to expand.";
        this.bindDesktopHoverHint(photo, photoHoverHint);
        this.bindDesktopHoverHint(frame, photoHoverHint);

        card.appendChild(frame);
        card.appendChild(photo);
        card.appendChild(title);
        root.appendChild(card);
      });
    },

    buildVideoLayer(root) {
      const layer = this.config.layerTwo;
      const items = this.config.videos;
      const angleOffset = toRadians(layer.spinOffsetDeg || 0);

      items.forEach((item, index) => {
        const angle = angleOffset + (index / items.length) * Math.PI * 2;
        const x = Math.cos(angle) * layer.radius;
        const z = Math.sin(angle) * layer.radius;
        const facingY = 270 - (angle * 180) / Math.PI;

        const card = document.createElement("a-entity");
        card.classList.add("cantap", "video-card");
        card.setAttribute("position", `${x} ${layer.height} ${z}`);
        card.setAttribute("rotation", `0 ${facingY} 0`);
        card.setAttribute("media-card-interaction", "kind: video");
        card.setAttribute("data-video-id", this.videoAssetIds[index]);
        card.setAttribute(
          "animation__float",
          buildFloatingAnimation(
            x,
            layer.height,
            z,
            this.config.animation.floatDistance * 1.25,
            this.config.animation.floatDurationMs + 400,
            index * 140
          )
        );

        const frame = document.createElement("a-plane");
        frame.classList.add("media-frame", "cantap");
        frame.setAttribute("position", "0 0 -0.014");
        frame.setAttribute("width", layer.itemWidth + 0.1);
        frame.setAttribute("height", layer.itemHeight + 0.1);
        setEntityMaterial(frame, {
          color: item.frameColor || "#6ecbff",
          emissive: item.frameColor || "#6ecbff",
          emissiveIntensity: 0.24,
          side: "double",
          transparent: true,
          opacity: 0.92,
        });
        frame.dataset.baseEmissiveIntensity = "0.24";

        const screen = document.createElement("a-video");
        screen.classList.add("cantap");
        screen.setAttribute("position", "0 0 0");
        screen.setAttribute("src", `#${this.videoAssetIds[index]}`);
        screen.setAttribute("width", layer.itemWidth);
        screen.setAttribute("height", layer.itemHeight);

        const pauseBadge = document.createElement("a-circle");
        pauseBadge.classList.add("pause-badge", "cantap");
        pauseBadge.setAttribute("radius", "0.11");
        pauseBadge.setAttribute("position", `${(layer.itemWidth / 2) - 0.12} ${-(layer.itemHeight / 2) + 0.12} 0.03`);
        setEntityMaterial(pauseBadge, {
          color: "#10131a",
          emissive: "#10131a",
          emissiveIntensity: 0.1,
          opacity: 0.85,
          transparent: true,
        });

        const pauseText = document.createElement("a-text");
        pauseText.setAttribute("value", "II");
        pauseText.setAttribute("align", "center");
        pauseText.setAttribute("width", "2");
        pauseText.setAttribute("color", "#ffffff");
        pauseText.setAttribute("position", "0 0 0.01");
        pauseText.setAttribute("shader", "msdf");

        const title = document.createElement("a-text");
        title.setAttribute("value", item.title || "");
        title.setAttribute("position", `0 ${-(layer.itemHeight / 2) - 0.12} 0.03`);
        title.setAttribute("align", "center");
        title.setAttribute("width", "4");
        title.setAttribute("color", "#f4fbff");
        title.setAttribute("shader", "msdf");

        const videoHoverHint = this.config.ui.desktopHoverVideoHint || "Video is clickable. Left-click to play or pause.";
        this.bindDesktopHoverHint(screen, videoHoverHint);
        this.bindDesktopHoverHint(frame, videoHoverHint);

        pauseBadge.appendChild(pauseText);
        card.appendChild(frame);
        card.appendChild(screen);
        card.appendChild(pauseBadge);
        card.appendChild(title);
        root.appendChild(card);
      });
    },

    addDecorativeRings(root) {
      const lowerRing = document.createElement("a-torus");
      lowerRing.setAttribute("position", `0 ${this.config.layerOne.height - 0.52} 0`);
      lowerRing.setAttribute("rotation", "90 0 0");
      lowerRing.setAttribute("radius", this.config.layerOne.radius + 0.02);
      lowerRing.setAttribute("radius-tubular", 0.01);
      setEntityMaterial(lowerRing, {
        color: "#ffe2b0",
        emissive: "#ffcf8f",
        emissiveIntensity: 0.2,
        transparent: true,
        opacity: 0.65,
      });
      lowerRing.setAttribute("animation__spin", {
        property: "rotation",
        to: "90 360 0",
        dur: 22000,
        easing: "linear",
        loop: true,
      });

      const upperRing = document.createElement("a-torus");
      upperRing.setAttribute("position", `0 ${this.config.layerTwo.height - 0.46} 0`);
      upperRing.setAttribute("rotation", "90 0 0");
      upperRing.setAttribute("radius", this.config.layerTwo.radius + 0.02);
      upperRing.setAttribute("radius-tubular", 0.01);
      setEntityMaterial(upperRing, {
        color: "#cae9ff",
        emissive: "#cae9ff",
        emissiveIntensity: 0.24,
        transparent: true,
        opacity: 0.55,
      });
      upperRing.setAttribute("animation__spin", {
        property: "rotation",
        to: "90 -360 0",
        dur: 18000,
        easing: "linear",
        loop: true,
      });

      root.appendChild(lowerRing);
      root.appendChild(upperRing);
    },

    playPlacementPulse() {
      if (!this.galleryRoot) return;
      this.galleryRoot.setAttribute("animation__pulse", {
        property: "scale",
        from: "0.94 0.94 0.94",
        to: "1 1 1",
        dur: 320,
        easing: "easeOutBack",
      });
    },
  });
})();
