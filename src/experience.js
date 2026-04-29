(() => {
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const randomBetween = (min, max) => min + Math.random() * (max - min);
  const pickRandom = (items, fallback) => {
    if (!Array.isArray(items) || items.length === 0) {
      return fallback;
    }

    return items[Math.floor(Math.random() * items.length)];
  };
  const getCardKind = (cardEl) => {
    if (!cardEl) {
      return "photo";
    }

    return cardEl.classList.contains("video-card") ? "video" : "photo";
  };
  const getCardTilt = (index, kind = "photo") => {
    const photoTiltPattern = [-6, -3.5, 2.5, 5, -2, 4.5];
    const videoTiltPattern = [4, -5, 3, -3.5, 2.5, -4.5];
    const pattern = kind === "video" ? videoTiltPattern : photoTiltPattern;
    return pattern[index % pattern.length];
  };

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

  const markEntityTreeCantap = (entity) => {
    entity.classList.add("cantap");
    Array.from(entity.children).forEach((child) => {
      markEntityTreeCantap(child);
    });
  };

  const drawRoundedRect = (ctx, x, y, width, height, radius) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  const drawStar = (ctx, centerX, centerY, outerRadius, innerRadius, color) => {
    ctx.save();
    ctx.beginPath();

    for (let pointIndex = 0; pointIndex < 10; pointIndex += 1) {
      const angle = Math.PI / 5 * pointIndex - Math.PI / 2;
      const radius = pointIndex % 2 === 0 ? outerRadius : innerRadius;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      if (pointIndex === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  };

  const drawMiniCardIllustration = (ctx, accentColor) => {
    ctx.save();
    ctx.globalAlpha = 0.95;
    drawStar(ctx, 104, 92, 18, 8, accentColor);
    drawStar(ctx, 610, 328, 13, 6, "#ffd98c");

    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(584, 118);
    ctx.bezierCurveTo(564, 78, 612, 66, 618, 108);
    ctx.stroke();

    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.ellipse(620, 126, 24, 30, -0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.28)";
    ctx.beginPath();
    ctx.ellipse(611, 116, 7, 10, -0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffd7a8";
    ctx.fillRect(92, 308, 70, 52);
    ctx.fillStyle = "#fff5ee";
    ctx.fillRect(120, 308, 14, 52);
    ctx.fillRect(92, 328, 70, 12);
    drawStar(ctx, 127, 334, 12, 5, "#ffb8c6");
    ctx.restore();
  };

  const toPositionString = (x, y, z) =>
    `${x.toFixed(2)} ${y.toFixed(2)} ${z.toFixed(2)}`;

  const spreadFloorPosition = (position, index) => {
    const [rawX, rawY, rawZ] = position.split(" ").map(Number);
    const angleOffsets = [-0.28, 0.18, -0.12, 0.24, -0.2, 0.14, 0.3, -0.16];
    const radiusOffsets = [0.78, 0.56, 0.92, 0.64, 0.46, 0.84, 0.6, 0.72];
    const baseRadius = Math.hypot(rawX, rawZ);
    const baseAngle = Math.atan2(rawZ, rawX);
    const angleOffset = angleOffsets[index % angleOffsets.length];
    const radiusOffset = radiusOffsets[index % radiusOffsets.length];
    const targetRadius = Math.min(
      3.02,
      Math.max(1.72, baseRadius + radiusOffset + (baseRadius < 1.2 ? 0.34 : 0)),
    );
    const targetAngle = baseAngle + angleOffset;

    return toPositionString(
      Math.cos(targetAngle) * targetRadius,
      rawY,
      Math.sin(targetAngle) * targetRadius,
    );
  };

  const drawCenteredWrappedText = ({
    ctx,
    text,
    centerX,
    startY,
    maxWidth,
    lineHeight,
    maxLines = 2,
  }) => {
    if (!text) {
      return 0;
    }

    const characters = Array.from(text);
    const lines = [];
    let currentLine = "";

    characters.forEach((character) => {
      const candidate = currentLine + character;
      if (
        currentLine &&
        ctx.measureText(candidate).width > maxWidth &&
        lines.length < maxLines - 1
      ) {
        lines.push(currentLine);
        currentLine = character;
      } else {
        currentLine = candidate;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    lines.slice(0, maxLines).forEach((line, index) => {
      ctx.fillText(line, centerX, startY + lineHeight * index);
    });

    return Math.min(lines.length, maxLines);
  };

  const createMiniCardTexture = ({ title, subtitle, color }) => {
    const canvas = document.createElement("canvas");
    canvas.width = 720;
    canvas.height = 420;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return null;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(255, 251, 244, 0.95)";
    drawRoundedRect(ctx, 24, 24, 672, 372, 28);
    ctx.fill();
    drawMiniCardIllustration(ctx, color);

    ctx.fillStyle = color;
    drawRoundedRect(ctx, 236, 34, 248, 56, 24);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "700 26px 'Noto Sans TC', 'Microsoft JhengHei', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("月齡卡", canvas.width / 2, 62);

    ctx.fillStyle = "#514235";
    ctx.font = "700 72px 'Noto Sans TC', 'Microsoft JhengHei', sans-serif";
    ctx.fillText(title || "", canvas.width / 2, 184);

    ctx.fillStyle = color;
    ctx.globalAlpha = 0.8;
    ctx.fillRect(250, 236, 220, 6);
    ctx.globalAlpha = 1;

    ctx.fillStyle = "#77685a";
    ctx.font = "600 42px 'Noto Sans TC', 'Microsoft JhengHei', sans-serif";
    drawCenteredWrappedText({
      ctx,
      text: subtitle || "成長紀念",
      centerX: canvas.width / 2,
      startY: 300,
      maxWidth: 560,
      lineHeight: 54,
      maxLines: 2,
    });

    return canvas.toDataURL("image/png");
  };

  const createBadgeTexture = ({ label, title, subtitle, color }) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1280;
    canvas.height = 640;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return null;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(255, 248, 238, 0.92)";
    drawRoundedRect(ctx, 100, 22, 1080, 580, 34);
    ctx.fill();

    ctx.fillStyle = "rgba(210, 194, 176, 0.45)";
    ctx.fillRect(186, 286, 908, 2);

    ctx.fillStyle = color;
    drawRoundedRect(ctx, 412, 28, 456, 96, 32);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "700 38px 'Noto Sans TC', 'Microsoft JhengHei', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label || "MEMORY", canvas.width / 2, 76);

    ctx.fillStyle = "#43372c";
    ctx.font = "800 82px 'Noto Sans TC', 'Microsoft JhengHei', sans-serif";
    ctx.fillText(title || "", canvas.width / 2, 206);

    ctx.fillStyle = color;
    ctx.globalAlpha = 0.82;
    ctx.fillRect(430, 252, 420, 8);
    ctx.globalAlpha = 1;

    ctx.fillStyle = "#5f5143";
    ctx.font = "700 66px 'Noto Sans TC', 'Microsoft JhengHei', sans-serif";
    drawCenteredWrappedText({
      ctx,
      text: subtitle || "",
      centerX: canvas.width / 2,
      startY: 344,
      maxWidth: 1084,
      lineHeight: 72,
      maxLines: 2,
    });

    return canvas.toDataURL("image/png");
  };

  const createDecorativeFrame = ({
    width,
    height,
    frameColor,
    frameDepth,
    emissiveIntensity,
    frameClass,
  }) => {
    const root = document.createElement("a-entity");

    const shadow = document.createElement("a-plane");
    shadow.setAttribute("position", `0 0 ${frameDepth - 0.01}`);
    setEntityMaterial(shadow, {
      color: "#151826",
      transparent: true,
      opacity: 0.2,
      side: "double",
    });

    const paperShadow = document.createElement("a-plane");
    paperShadow.setAttribute("position", `0.03 -0.03 ${frameDepth - 0.014}`);
    setEntityMaterial(paperShadow, {
      color: "#6f6256",
      transparent: true,
      opacity: 0.12,
      side: "double",
    });

    const frame = document.createElement("a-plane");
    frame.classList.add(frameClass, "cantap");
    frame.setAttribute("position", `0 0 ${frameDepth}`);
    setEntityMaterial(frame, {
      color: "#fff9ef",
      emissive: "#fff4e4",
      emissiveIntensity: Math.max(0.05, emissiveIntensity * 0.35),
      side: "double",
      transparent: true,
      opacity: 0.98,
    });

    const innerBorder = document.createElement("a-plane");
    innerBorder.setAttribute("position", `0 0 ${frameDepth + 0.003}`);
    setEntityMaterial(innerBorder, {
      color: "#f6efe4",
      emissive: "#f6efe4",
      emissiveIntensity: 0.03,
      side: "double",
      transparent: true,
      opacity: 0.96,
    });

    const paperAging = document.createElement("a-plane");
    paperAging.setAttribute("position", `0.01 -0.02 ${frameDepth + 0.002}`);
    setEntityMaterial(paperAging, {
      color: "#fff0d9",
      emissive: "#fff0d9",
      emissiveIntensity: 0.02,
      side: "double",
      transparent: true,
      opacity: 0.2,
    });

    const tapeLeft = document.createElement("a-plane");
    tapeLeft.setAttribute("height", "0.15");
    tapeLeft.setAttribute("rotation", "0 0 -14");
    tapeLeft.setAttribute("position", `0 0 ${frameDepth + 0.009}`);
    setEntityMaterial(tapeLeft, {
      color: frameColor,
      emissive: frameColor,
      emissiveIntensity: 0.12,
      side: "double",
      transparent: true,
      opacity: 0.7,
    });

    const tapeRight = document.createElement("a-plane");
    tapeRight.setAttribute("height", "0.15");
    tapeRight.setAttribute("rotation", "0 0 12");
    tapeRight.setAttribute("position", `0 0 ${frameDepth + 0.009}`);
    setEntityMaterial(tapeRight, {
      color: frameColor,
      emissive: frameColor,
      emissiveIntensity: 0.1,
      side: "double",
      transparent: true,
      opacity: 0.56,
    });

    const footerTint = document.createElement("a-plane");
    footerTint.setAttribute("position", `0 0 ${frameDepth + 0.006}`);
    setEntityMaterial(footerTint, {
      color: "#fff6ea",
      emissive: frameColor,
      emissiveIntensity: 0.04,
      side: "double",
      transparent: true,
      opacity: 0.95,
    });

    const footerEdge = document.createElement("a-plane");
    footerEdge.setAttribute("position", `0 0 ${frameDepth + 0.008}`);
    setEntityMaterial(footerEdge, {
      color: "#efe1cf",
      emissive: "#efe1cf",
      emissiveIntensity: 0.02,
      side: "double",
      transparent: true,
      opacity: 0.72,
    });

    const topHighlight = document.createElement("a-plane");
    topHighlight.setAttribute("position", `0 0 ${frameDepth + 0.007}`);
    setEntityMaterial(topHighlight, {
      color: "#ffffff",
      emissive: "#ffffff",
      emissiveIntensity: 0.03,
      side: "double",
      transparent: true,
      opacity: 0.16,
    });

    root.appendChild(shadow);
    root.appendChild(paperShadow);
    root.appendChild(frame);
    root.appendChild(innerBorder);
    root.appendChild(paperAging);
    root.appendChild(footerTint);
    root.appendChild(footerEdge);
    root.appendChild(topHighlight);
    root.appendChild(tapeLeft);
    root.appendChild(tapeRight);

    const updateLayout = (nextWidth, nextHeight) => {
      shadow.setAttribute("width", nextWidth + 0.18);
      shadow.setAttribute("height", nextHeight + 0.16);
      paperShadow.setAttribute("width", nextWidth + 0.2);
      paperShadow.setAttribute("height", nextHeight + 0.18);
      frame.setAttribute("width", nextWidth + 0.18);
      frame.setAttribute("height", nextHeight + 0.16);
      innerBorder.setAttribute("width", nextWidth + 0.08);
      innerBorder.setAttribute("height", nextHeight + 0.03);
      innerBorder.setAttribute("position", `0 0.05 ${frameDepth + 0.003}`);
      paperAging.setAttribute("width", nextWidth + 0.1);
      paperAging.setAttribute("height", nextHeight + 0.06);
      footerTint.setAttribute("width", nextWidth + 0.1);
      footerTint.setAttribute("height", "0.14");
      footerTint.setAttribute(
        "position",
        `0 ${-(nextHeight / 2) - 0.026} ${frameDepth + 0.006}`,
      );
      footerEdge.setAttribute("width", nextWidth + 0.06);
      footerEdge.setAttribute("height", "0.02");
      footerEdge.setAttribute(
        "position",
        `0 ${-(nextHeight / 2) - 0.004} ${frameDepth + 0.008}`,
      );
      topHighlight.setAttribute("width", nextWidth + 0.02);
      topHighlight.setAttribute("height", "0.05");
      topHighlight.setAttribute(
        "position",
        `0 ${nextHeight / 2 + 0.01} ${frameDepth + 0.007}`,
      );
      tapeLeft.setAttribute("width", Math.max(0.16, nextWidth * 0.22));
      tapeLeft.setAttribute(
        "position",
        `${-(nextWidth * 0.22)} ${nextHeight / 2 + 0.055} ${frameDepth + 0.009}`,
      );
      tapeRight.setAttribute("width", Math.max(0.16, nextWidth * 0.2));
      tapeRight.setAttribute(
        "position",
        `${nextWidth * 0.24} ${nextHeight / 2 + 0.05} ${frameDepth + 0.009}`,
      );
    };

    updateLayout(width, height);

    return {
      root,
      frame,
      updateLayout,
    };
  };

  const createTitleBadge = ({
    title,
    subtitle,
    color,
    label,
    zOffset = 0.024,
    scale = 1,
  }) => {
    const root = document.createElement("a-entity");
    root.setAttribute("position", `0 0 ${zOffset}`);
    root.setAttribute("scale", `${scale} ${scale} ${scale}`);

    const plate = document.createElement("a-plane");
    plate.setAttribute("position", "0 -0.03 0");
    setEntityMaterial(plate, {
      src: createBadgeTexture({ label, title, subtitle, color }),
      transparent: true,
      shader: "flat",
      side: "double",
    });

    root.appendChild(plate);

    const updateLayout = (mediaWidth, mediaHeight) => {
      const contentWidth = Math.min(2.28, Math.max(1.3, mediaWidth + 0.24));
      root.setAttribute("position", `0 ${-(mediaHeight / 2) - 0.092} ${zOffset}`);
      plate.setAttribute("width", Math.max(1.3, contentWidth));
      plate.setAttribute("height", "0.44");
    };

    return {
      root,
      updateLayout,
    };
  };

  const createBabyBottleProp = () => {
    const prop = document.createElement("a-entity");

    const body = document.createElement("a-cylinder");
    body.setAttribute("radius", "0.08");
    body.setAttribute("height", "0.24");
    body.setAttribute("position", "0 0.12 0");
    setEntityMaterial(body, {
      color: "#fffdf9",
      emissive: "#fffdf9",
      emissiveIntensity: 0.04,
      transparent: true,
      opacity: 0.95,
    });

    const lid = document.createElement("a-cylinder");
    lid.setAttribute("radius", "0.055");
    lid.setAttribute("height", "0.05");
    lid.setAttribute("position", "0 0.255 0");
    setEntityMaterial(lid, {
      color: "#9fdcf6",
      emissive: "#9fdcf6",
      emissiveIntensity: 0.08,
    });

    const nipple = document.createElement("a-sphere");
    nipple.setAttribute("radius", "0.035");
    nipple.setAttribute("scale", "0.8 1.2 0.8");
    nipple.setAttribute("position", "0 0.31 0");
    setEntityMaterial(nipple, {
      color: "#f8d8b7",
      emissive: "#f8d8b7",
      emissiveIntensity: 0.05,
      transparent: true,
      opacity: 0.92,
    });

    const stripe = document.createElement("a-box");
    stripe.setAttribute("depth", "0.005");
    stripe.setAttribute("width", "0.08");
    stripe.setAttribute("height", "0.018");
    stripe.setAttribute("position", "0 0.11 0.076");
    setEntityMaterial(stripe, {
      color: "#ffb8c6",
      emissive: "#ffb8c6",
      emissiveIntensity: 0.08,
    });

    prop.appendChild(body);
    prop.appendChild(lid);
    prop.appendChild(nipple);
    prop.appendChild(stripe);
    return prop;
  };

  const createToyBlockProp = (color) => {
    const prop = document.createElement("a-entity");
    const block = document.createElement("a-box");
    block.setAttribute("width", "0.16");
    block.setAttribute("height", "0.16");
    block.setAttribute("depth", "0.16");
    block.setAttribute("position", "0 0.08 0");
    block.setAttribute("rotation", `${randomBetween(-8, 8)} ${randomBetween(12, 40)} ${randomBetween(-10, 10)}`);
    setEntityMaterial(block, {
      color,
      emissive: color,
      emissiveIntensity: 0.1,
      roughness: 0.5,
    });

    const letter = document.createElement("a-text");
    letter.setAttribute("value", pickRandom(["N", "O", "A", "H"], "N"));
    letter.setAttribute("align", "center");
    letter.setAttribute("width", "1.4");
    letter.setAttribute("color", "#fffdf8");
    letter.setAttribute("position", "0 0 0.085");
    letter.setAttribute("shader", "msdf");

    block.appendChild(letter);
    prop.appendChild(block);
    return prop;
  };

  const createRingToyProp = () => {
    const prop = document.createElement("a-entity");
    const base = document.createElement("a-cylinder");
    base.setAttribute("radius", "0.12");
    base.setAttribute("height", "0.03");
    base.setAttribute("position", "0 0.015 0");
    setEntityMaterial(base, {
      color: "#ffe6b0",
      emissive: "#ffe6b0",
      emissiveIntensity: 0.06,
    });

    const pole = document.createElement("a-cylinder");
    pole.setAttribute("radius", "0.018");
    pole.setAttribute("height", "0.24");
    pole.setAttribute("position", "0 0.14 0");
    setEntityMaterial(pole, {
      color: "#fff8ef",
      emissive: "#fff8ef",
      emissiveIntensity: 0.04,
    });

    const ringColors = ["#ffb3c7", "#ffd166", "#8ad6ff"];
    ringColors.forEach((ringColor, index) => {
      const ring = document.createElement("a-torus");
      ring.setAttribute("radius", `${0.05 + index * 0.018}`);
      ring.setAttribute("radius-tubular", "0.012");
      ring.setAttribute("rotation", "90 0 0");
      ring.setAttribute("position", `0 ${0.06 + index * 0.055} 0`);
      setEntityMaterial(ring, {
        color: ringColor,
        emissive: ringColor,
        emissiveIntensity: 0.1,
      });
      prop.appendChild(ring);
    });

    prop.appendChild(base);
    prop.appendChild(pole);
    return prop;
  };

  const createDuckProp = () => {
    const prop = document.createElement("a-entity");
    const body = document.createElement("a-sphere");
    body.setAttribute("radius", "0.09");
    body.setAttribute("scale", "1.15 0.9 1");
    body.setAttribute("position", "0 0.09 0");
    setEntityMaterial(body, {
      color: "#ffe066",
      emissive: "#ffe066",
      emissiveIntensity: 0.08,
    });

    const head = document.createElement("a-sphere");
    head.setAttribute("radius", "0.055");
    head.setAttribute("position", "0.08 0.16 0");
    setEntityMaterial(head, {
      color: "#ffe066",
      emissive: "#ffe066",
      emissiveIntensity: 0.08,
    });

    const beak = document.createElement("a-cone");
    beak.setAttribute("radius-bottom", "0.025");
    beak.setAttribute("radius-top", "0.005");
    beak.setAttribute("height", "0.05");
    beak.setAttribute("rotation", "0 0 90");
    beak.setAttribute("position", "0.135 0.15 0");
    setEntityMaterial(beak, {
      color: "#ffb347",
      emissive: "#ffb347",
      emissiveIntensity: 0.08,
    });

    prop.appendChild(body);
    prop.appendChild(head);
    prop.appendChild(beak);
    return prop;
  };

  const createGiftBoxProp = (boxColor, ribbonColor) => {
    const prop = document.createElement("a-entity");
    const box = document.createElement("a-box");
    box.setAttribute("width", "0.18");
    box.setAttribute("height", "0.15");
    box.setAttribute("depth", "0.18");
    box.setAttribute("position", "0 0.075 0");
    setEntityMaterial(box, {
      color: boxColor,
      emissive: boxColor,
      emissiveIntensity: 0.08,
      roughness: 0.45,
    });

    const ribbonV = document.createElement("a-box");
    ribbonV.setAttribute("width", "0.035");
    ribbonV.setAttribute("height", "0.16");
    ribbonV.setAttribute("depth", "0.182");
    ribbonV.setAttribute("position", "0 0.08 0");
    setEntityMaterial(ribbonV, {
      color: ribbonColor,
      emissive: ribbonColor,
      emissiveIntensity: 0.1,
    });

    const ribbonH = document.createElement("a-box");
    ribbonH.setAttribute("width", "0.182");
    ribbonH.setAttribute("height", "0.16");
    ribbonH.setAttribute("depth", "0.035");
    ribbonH.setAttribute("position", "0 0.08 0");
    setEntityMaterial(ribbonH, {
      color: ribbonColor,
      emissive: ribbonColor,
      emissiveIntensity: 0.1,
    });

    const bowLeft = document.createElement("a-torus");
    bowLeft.setAttribute("radius", "0.035");
    bowLeft.setAttribute("radius-tubular", "0.01");
    bowLeft.setAttribute("rotation", "90 0 32");
    bowLeft.setAttribute("position", "-0.03 0.16 0");
    setEntityMaterial(bowLeft, {
      color: ribbonColor,
      emissive: ribbonColor,
      emissiveIntensity: 0.1,
    });

    const bowRight = document.createElement("a-torus");
    bowRight.setAttribute("radius", "0.035");
    bowRight.setAttribute("radius-tubular", "0.01");
    bowRight.setAttribute("rotation", "90 0 -32");
    bowRight.setAttribute("position", "0.03 0.16 0");
    setEntityMaterial(bowRight, {
      color: ribbonColor,
      emissive: ribbonColor,
      emissiveIntensity: 0.1,
    });

    prop.appendChild(box);
    prop.appendChild(ribbonV);
    prop.appendChild(ribbonH);
    prop.appendChild(bowLeft);
    prop.appendChild(bowRight);
    return prop;
  };

  const createMonthCardProp = (title, subtitle, color) => {
    const prop = document.createElement("a-entity");
    const card = document.createElement("a-plane");
    card.setAttribute("width", "0.34");
    card.setAttribute("height", "0.24");
    card.setAttribute("position", "0 0.12 0");
    card.setAttribute("rotation", `-76 ${randomBetween(-10, 10)} ${randomBetween(-12, 12)}`);
    setEntityMaterial(card, {
      src: createMiniCardTexture({ title, subtitle, color }),
      transparent: true,
      shader: "flat",
      side: "double",
    });
    prop.appendChild(card);
    return prop;
  };

  const createSoftBookProp = (coverColor) => {
    const prop = document.createElement("a-entity");
    const book = document.createElement("a-box");
    book.setAttribute("width", "0.24");
    book.setAttribute("height", "0.03");
    book.setAttribute("depth", "0.2");
    book.setAttribute("position", "0 0.018 0");
    book.setAttribute("rotation", `${randomBetween(-6, 6)} ${randomBetween(-12, 12)} ${randomBetween(-4, 4)}`);
    setEntityMaterial(book, {
      color: coverColor,
      emissive: coverColor,
      emissiveIntensity: 0.08,
      roughness: 0.55,
    });

    const stripe = document.createElement("a-box");
    stripe.setAttribute("width", "0.03");
    stripe.setAttribute("height", "0.032");
    stripe.setAttribute("depth", "0.202");
    stripe.setAttribute("position", "-0.085 0.018 0");
    setEntityMaterial(stripe, {
      color: "#fff8ef",
      emissive: "#fff8ef",
      emissiveIntensity: 0.04,
    });

    prop.appendChild(book);
    prop.appendChild(stripe);
    return prop;
  };

  const createBlockStackProp = (colors) => {
    const prop = document.createElement("a-entity");
    colors.forEach((color, index) => {
      const block = document.createElement("a-box");
      const size = 0.11 - index * 0.012;
      block.setAttribute("width", `${size}`);
      block.setAttribute("height", `${size}`);
      block.setAttribute("depth", `${size}`);
      block.setAttribute("position", `${randomBetween(-0.02, 0.02)} ${size / 2 + index * 0.09} ${randomBetween(-0.02, 0.02)}`);
      block.setAttribute("rotation", `${randomBetween(-10, 10)} ${randomBetween(0, 45)} ${randomBetween(-10, 10)}`);
      setEntityMaterial(block, {
        color,
        emissive: color,
        emissiveIntensity: 0.08,
        roughness: 0.5,
      });
      prop.appendChild(block);
    });
    return prop;
  };

  const createFloorDecor = () => {
    const decorRoot = document.createElement("a-entity");
    decorRoot.classList.add("floor-decor-root");

    const props = [
      {
        entity: createBabyBottleProp(),
        position: "-1.72 0.01 1.28",
        rotation: "0 16 0",
        scale: "1.18 1.18 1.18",
        kind: "bottle",
      },
      {
        entity: createToyBlockProp("#8ad6ff"),
        position: "1.58 0.01 1.12",
        rotation: "0 -18 0",
        scale: "1.12 1.12 1.12",
        kind: "block",
      },
      {
        entity: createRingToyProp(),
        position: "-1.46 0.01 -1.08",
        rotation: "0 34 0",
        scale: "1.02 1.02 1.02",
        kind: "stacker",
      },
      {
        entity: createDuckProp(),
        position: "1.42 0.01 -1.04",
        rotation: "0 -26 0",
        scale: "1.08 1.08 1.08",
        kind: "duck",
      },
      {
        entity: createToyBlockProp("#ffb8c6"),
        position: "0.28 0.01 1.42",
        rotation: "0 24 0",
        scale: "0.96 0.96 0.96",
        kind: "block",
      },
      {
        entity: createDuckProp(),
        position: "-0.84 0.01 1.62",
        rotation: "0 14 0",
        scale: "0.82 0.82 0.82",
        kind: "duck",
      },
      {
        entity: createBabyBottleProp(),
        position: "2.06 0.01 0.18",
        rotation: "0 -12 0",
        scale: "0.92 0.92 0.92",
        kind: "bottle",
      },
      {
        entity: createToyBlockProp("#ffd166"),
        position: "-1.96 0.01 0.26",
        rotation: "0 22 0",
        scale: "0.94 0.94 0.94",
        kind: "block",
      },
      {
        entity: createRingToyProp(),
        position: "0.22 0.01 -1.62",
        rotation: "0 10 0",
        scale: "0.9 0.9 0.9",
        kind: "stacker",
      },
      {
        entity: createDuckProp(),
        position: "-1.42 0.01 1.94",
        rotation: "0 40 0",
        scale: "0.78 0.78 0.78",
        kind: "duck",
      },
      {
        entity: createToyBlockProp("#b8f2b2"),
        position: "1.02 0.01 1.76",
        rotation: "0 34 0",
        scale: "0.84 0.84 0.84",
        kind: "block",
      },
      {
        entity: createBabyBottleProp(),
        position: "-0.18 0.01 -1.88",
        rotation: "0 8 0",
        scale: "0.86 0.86 0.86",
        kind: "bottle",
      },
      {
        entity: createToyBlockProp("#cdb4ff"),
        position: "-0.56 0.01 0.74",
        rotation: "0 28 0",
        scale: "0.92 0.92 0.92",
        kind: "block",
      },
      {
        entity: createToyBlockProp("#ffd166"),
        position: "0.62 0.01 0.52",
        rotation: "0 -24 0",
        scale: "0.9 0.9 0.9",
        kind: "block",
      },
      {
        entity: createToyBlockProp("#8ad6ff"),
        position: "-0.92 0.01 -0.18",
        rotation: "0 18 0",
        scale: "0.84 0.84 0.84",
        kind: "block",
      },
      {
        entity: createToyBlockProp("#ffb8c6"),
        position: "1.04 0.01 -0.12",
        rotation: "0 -16 0",
        scale: "0.82 0.82 0.82",
        kind: "block",
      },
      {
        entity: createToyBlockProp("#b8f2b2"),
        position: "0.18 0.01 0.96",
        rotation: "0 12 0",
        scale: "0.76 0.76 0.76",
        kind: "block",
      },
      {
        entity: createToyBlockProp("#ffd7a8"),
        position: "-1.18 0.01 0.92",
        rotation: "0 32 0",
        scale: "0.88 0.88 0.88",
        kind: "block",
      },
      {
        entity: createToyBlockProp("#a0e7e5"),
        position: "1.54 0.01 -0.58",
        rotation: "0 -30 0",
        scale: "0.86 0.86 0.86",
        kind: "block",
      },
      {
        entity: createRingToyProp(),
        position: "0.92 0.01 1.02",
        rotation: "0 -10 0",
        scale: "0.78 0.78 0.78",
        kind: "stacker",
      },
      {
        entity: createGiftBoxProp("#ffd7e7", "#ff8fab"),
        position: "-0.22 0.01 0.34",
        rotation: "0 12 0",
        scale: "0.92 0.92 0.92",
        kind: "gift",
      },
      {
        entity: createGiftBoxProp("#d8f5ff", "#8ad6ff"),
        position: "1.32 0.01 0.42",
        rotation: "0 -16 0",
        scale: "0.88 0.88 0.88",
        kind: "gift",
      },
      {
        entity: createGiftBoxProp("#fff1b3", "#ffd166"),
        position: "-1.52 0.01 -0.42",
        rotation: "0 28 0",
        scale: "0.86 0.86 0.86",
        kind: "gift",
      },
      {
        entity: createGiftBoxProp("#e8dcff", "#cdb4ff"),
        position: "0.54 0.01 -0.86",
        rotation: "0 -20 0",
        scale: "0.82 0.82 0.82",
        kind: "gift",
      },
      {
        entity: createMonthCardProp("6 個月", "笑容收藏", "#ffd166"),
        position: "-0.34 0.01 1.06",
        rotation: "0 10 0",
        scale: "0.86 0.86 0.86",
        kind: "month-card",
      },
      {
        entity: createMonthCardProp("9 個月", "開始探索", "#8ad6ff"),
        position: "1.18 0.01 0.76",
        rotation: "0 -16 0",
        scale: "0.82 0.82 0.82",
        kind: "month-card",
      },
      {
        entity: createMonthCardProp("12 個月", "一歲快樂", "#ffb8c6"),
        position: "-1.04 0.01 -0.76",
        rotation: "0 18 0",
        scale: "0.8 0.8 0.8",
        kind: "month-card",
      },
      {
        entity: createMonthCardProp("3 個月", "小手有力", "#b8f2b2"),
        position: "0.22 0.01 -1.22",
        rotation: "0 -8 0",
        scale: "0.78 0.78 0.78",
        kind: "month-card",
      },
      {
        entity: createSoftBookProp("#ffcf8f"),
        position: "-0.74 0.01 0.24",
        rotation: "0 22 0",
        scale: "0.92 0.92 0.92",
        kind: "book",
      },
      {
        entity: createSoftBookProp("#b8f2b2"),
        position: "1.52 0.01 -0.2",
        rotation: "0 -18 0",
        scale: "0.84 0.84 0.84",
        kind: "book",
      },
      {
        entity: createSoftBookProp("#cdb4ff"),
        position: "-1.74 0.01 0.82",
        rotation: "0 34 0",
        scale: "0.8 0.8 0.8",
        kind: "book",
      },
      {
        entity: createSoftBookProp("#8ad6ff"),
        position: "0.88 0.01 1.46",
        rotation: "0 -24 0",
        scale: "0.78 0.78 0.78",
        kind: "book",
      },
      {
        entity: createBlockStackProp(["#ffd166", "#8ad6ff", "#ffb8c6"]),
        position: "-0.14 0.01 -0.24",
        rotation: "0 20 0",
        scale: "0.92 0.92 0.92",
        kind: "block",
      },
      {
        entity: createBlockStackProp(["#b8f2b2", "#ffd7a8", "#cdb4ff"]),
        position: "1.76 0.01 0.94",
        rotation: "0 -26 0",
        scale: "0.86 0.86 0.86",
        kind: "block",
      },
      {
        entity: createBlockStackProp(["#8ad6ff", "#ffd166", "#a0e7e5"]),
        position: "-1.26 0.01 1.32",
        rotation: "0 16 0",
        scale: "0.84 0.84 0.84",
        kind: "block",
      },
      {
        entity: createBlockStackProp(["#ffb8c6", "#ffd166", "#b8f2b2"]),
        position: "0.74 0.01 -1.38",
        rotation: "0 -12 0",
        scale: "0.82 0.82 0.82",
        kind: "block",
      },
      {
        entity: createToyBlockProp("#8ad6ff"),
        position: "2.06 0.01 -0.94",
        rotation: "0 -18 0",
        scale: "0.82 0.82 0.82",
        kind: "block",
      },
      {
        entity: createToyBlockProp("#ffd166"),
        position: "-2.02 0.01 -0.96",
        rotation: "0 18 0",
        scale: "0.8 0.8 0.8",
        kind: "block",
      },
      {
        entity: createToyBlockProp("#ffb8c6"),
        position: "0.18 0.01 1.88",
        rotation: "0 30 0",
        scale: "0.72 0.72 0.72",
        kind: "block",
      },
      {
        entity: createToyBlockProp("#b8f2b2"),
        position: "-0.26 0.01 -1.56",
        rotation: "0 -10 0",
        scale: "0.78 0.78 0.78",
        kind: "block",
      },
      {
        entity: createToyBlockProp("#cdb4ff"),
        position: "1.12 0.01 1.94",
        rotation: "0 24 0",
        scale: "0.76 0.76 0.76",
        kind: "block",
      },
      {
        entity: createToyBlockProp("#ffd7a8"),
        position: "-1.48 0.01 -1.44",
        rotation: "0 -22 0",
        scale: "0.76 0.76 0.76",
        kind: "block",
      },
      {
        entity: createToyBlockProp("#a0e7e5"),
        position: "1.64 0.01 1.66",
        rotation: "0 12 0",
        scale: "0.74 0.74 0.74",
        kind: "block",
      },
      {
        entity: createRingToyProp(),
        position: "-0.92 0.01 1.18",
        rotation: "0 4 0",
        scale: "0.68 0.68 0.68",
        kind: "stacker",
      },
      {
        entity: createRingToyProp(),
        position: "1.26 0.01 -0.76",
        rotation: "0 18 0",
        scale: "0.7 0.7 0.7",
        kind: "stacker",
      },
      {
        entity: createDuckProp(),
        position: "-0.42 0.01 1.92",
        rotation: "0 12 0",
        scale: "0.68 0.68 0.68",
        kind: "duck",
      },
      {
        entity: createBabyBottleProp(),
        position: "0.96 0.01 -1.92",
        rotation: "0 -8 0",
        scale: "0.72 0.72 0.72",
        kind: "bottle",
      },
      {
        entity: createGiftBoxProp("#ffe7b8", "#ffb86b"),
        position: "-0.88 0.01 -1.06",
        rotation: "0 14 0",
        scale: "0.74 0.74 0.74",
        kind: "gift",
      },
      {
        entity: createMonthCardProp("8 個月", "到處看看", "#cdb4ff"),
        position: "0.42 0.01 0.22",
        rotation: "0 -10 0",
        scale: "0.72 0.72 0.72",
        kind: "month-card",
      },
      {
        entity: createToyBlockProp("#ffd166"),
        position: "-1.82 0.01 1.62",
        rotation: "0 26 0",
        scale: "0.72 0.72 0.72",
        kind: "block",
      },
    ];

    props.forEach(({ entity, position, rotation, scale, kind }, index) => {
      entity.classList.add("toy-prop");
      markEntityTreeCantap(entity);
      const finalPosition = spreadFloorPosition(position, index);
      entity.setAttribute("position", finalPosition);
      entity.setAttribute("rotation", rotation);
      entity.setAttribute("scale", scale);
      entity.dataset.homePosition = finalPosition;
      entity.dataset.homeRotation = rotation;
      entity.dataset.toyKind = kind;
      entity.setAttribute("toy-prop-interaction", `kind: ${kind}`);
      decorRoot.appendChild(entity);
    });

    return decorRoot;
  };

  AFRAME.registerComponent("toy-prop-interaction", {
    schema: {
      kind: { default: "toy" },
    },

    init() {
      this.onTap = this.onTap.bind(this);
      this.el.addEventListener("click", this.onTap);
    },

    remove() {
      this.el.removeEventListener("click", this.onTap);
    },

    onTap(event) {
      event.stopPropagation();

      const homePosition = this.el.dataset.homePosition || "0 0 0";
      const homeRotation = this.el.dataset.homeRotation || "0 0 0";
      const positionParts = homePosition.split(" ").map(Number);
      const rotationParts = homeRotation.split(" ").map(Number);
      const hopX = positionParts[0] + randomBetween(-0.16, 0.16);
      const hopY = positionParts[1] + randomBetween(0.12, 0.2);
      const hopZ = positionParts[2] + randomBetween(-0.16, 0.16);

      this.el.setAttribute("animation__toyhop", {
        property: "position",
        from: homePosition,
        to: `${hopX} ${hopY} ${hopZ}`,
        dir: "alternate",
        dur: 420,
        easing: "easeOutBack",
        loop: 1,
      });
      this.el.setAttribute("animation__toyspin", {
        property: "rotation",
        from: homeRotation,
        to: `${rotationParts[0] + randomBetween(-18, 18)} ${rotationParts[1] + randomBetween(80, 160)} ${rotationParts[2] + randomBetween(-22, 22)}`,
        dir: "alternate",
        dur: 440,
        easing: "easeInOutSine",
        loop: 1,
      });
      this.el.setAttribute("animation__toysquash", {
        property: "scale",
        from: this.el.getAttribute("scale") || "1 1 1",
        to: "1.16 0.82 1.16",
        dir: "alternate",
        dur: 320,
        easing: "easeOutBack",
        loop: 1,
      });
      this.el.setAttribute("animation__toyjitter", {
        property: "rotation",
        from: `${rotationParts[0] + randomBetween(-6, 6)} ${rotationParts[1] + randomBetween(-18, 18)} ${rotationParts[2] + randomBetween(-8, 8)}`,
        to: `${rotationParts[0]} ${rotationParts[1]} ${rotationParts[2]}`,
        dur: 220,
        easing: "easeOutElastic",
      });

      this.el.sceneEl.emit("gallery:celebrate", {
        kind: this.data.kind,
        mode: "button",
      });
    },
  });

  AFRAME.registerComponent("celebration-effects", {
    init() {
      this.scene = this.el.sceneEl || this.el;
      this.effectsConfig = window.PARTY_CONFIG.effects || {};
      this.effectRoot = null;
      this.overlayRoot = null;
      this.balloonInterval = null;
      this.hudInterval = null;

      this.handleGalleryPlaced = this.handleGalleryPlaced.bind(this);
      this.handleGalleryRevealed = this.handleGalleryRevealed.bind(this);
      this.handleGalleryRemoved = this.handleGalleryRemoved.bind(this);
      this.handleCelebrate = this.handleCelebrate.bind(this);
      this.handleVideoToggled = this.handleVideoToggled.bind(this);
      this.handleAllVideosToggled = this.handleAllVideosToggled.bind(this);

      this.scene.addEventListener("gallery:placed", this.handleGalleryPlaced);
      this.scene.addEventListener(
        "gallery:revealed",
        this.handleGalleryRevealed,
      );
      this.scene.addEventListener("gallery:removed", this.handleGalleryRemoved);
      this.scene.addEventListener("gallery:celebrate", this.handleCelebrate);
      this.scene.addEventListener("gallery:video-toggled", this.handleVideoToggled);
      this.scene.addEventListener(
        "gallery:all-videos-toggled",
        this.handleAllVideosToggled,
      );
    },

    remove() {
      this.stopBalloonCycle();
      this.stopHudCycle();
      this.removeEffectRoot();
      this.removeOverlayRoot();
      this.scene.removeEventListener("gallery:placed", this.handleGalleryPlaced);
      this.scene.removeEventListener(
        "gallery:revealed",
        this.handleGalleryRevealed,
      );
      this.scene.removeEventListener(
        "gallery:removed",
        this.handleGalleryRemoved,
      );
      this.scene.removeEventListener("gallery:celebrate", this.handleCelebrate);
      this.scene.removeEventListener(
        "gallery:video-toggled",
        this.handleVideoToggled,
      );
      this.scene.removeEventListener(
        "gallery:all-videos-toggled",
        this.handleAllVideosToggled,
      );
    },

    handleGalleryPlaced(event) {
      const galleryRoot = event?.detail?.galleryRoot;
      if (!galleryRoot) {
        return;
      }

      this.ensureEffectRoot(galleryRoot);
      this.ensureOverlayRoot();
      this.startBalloonCycle();
    },

    handleGalleryRevealed() {
      this.spawnBalloonCluster(1);
      this.spawnConfettiBurst();
      this.startHudCycle();
      this.spawnHudCelebration(true);
      this.triggerGalleryPulse("strong");
    },

    handleGalleryRemoved() {
      this.stopBalloonCycle();
      this.stopHudCycle();
      this.removeEffectRoot();
      this.removeOverlayRoot();
    },

    handleCelebrate(event) {
      if (!this.effectRoot) {
        return;
      }

      const card = event?.detail?.cardEl;
      const origin = card?.getAttribute?.("position");
      const mode = event?.detail?.mode || "tap";
      const burstConfig =
        mode === "hover"
          ? this.effectsConfig.hoverBurst || {}
          : this.effectsConfig.tapBurst || {};

      if (!burstConfig.enabled) {
        return;
      }

      this.spawnCardAura(card, {
        sourceKind: event?.detail?.kind || getCardKind(card),
        scale: burstConfig.waveScale,
        durationMs: burstConfig.waveDurationMs,
        isSoft: mode === "hover",
      });

      this.spawnConfettiBurst({
        origin,
        burstCount: burstConfig.burstCount || 10,
        radius: burstConfig.radius || 0.82,
        durationMs: burstConfig.durationMs || 1500,
        burstHeight: (origin?.y || 0) + (burstConfig.lift || 0.72),
      });
      this.spawnHudCelebration(mode === "button", event?.detail?.kind, mode);
      this.triggerGalleryPulse(mode === "button" ? "strong" : "soft");

      if ((event?.detail?.kind || getCardKind(card)) === "photo" && mode === "tap") {
        this.triggerPhotoSweep(card);
      }
    },

    handleVideoToggled(event) {
      const card = event?.detail?.cardEl;
      const isPlaying = Boolean(event?.detail?.isPlaying);
      if (!card) {
        return;
      }

      if (isPlaying) {
        this.attachVideoTrail(card);
      } else {
        this.removeVideoTrail(card);
      }
    },

    handleAllVideosToggled(event) {
      const isPlaying = Boolean(event?.detail?.isPlaying);
      const cards = this.scene.querySelectorAll(".video-card");

      cards.forEach((card) => {
        if (isPlaying) {
          this.attachVideoTrail(card);
          return;
        }

        this.removeVideoTrail(card);
      });
    },

    triggerGalleryPulse(mode = "soft") {
      const pulseConfig = this.effectsConfig.galleryPulse || {};
      const galleryRoot = this.effectRoot?.parentNode;
      if (!pulseConfig.enabled || !galleryRoot) {
        return;
      }

      const targetScale =
        mode === "strong"
          ? pulseConfig.strongScale || 1.07
          : pulseConfig.softScale || 1.03;
      const duration = pulseConfig.durationMs || 380;

      galleryRoot.setAttribute("animation__celebratepulse", {
        property: "scale",
        from: galleryRoot.getAttribute("scale") || "1 1 1",
        to: `${targetScale} ${targetScale} ${targetScale}`,
        dir: "alternate",
        dur: duration,
        easing: "easeOutBack",
        loop: 1,
      });

      const rings = galleryRoot.querySelectorAll(".decorative-ring");
      rings.forEach((ring) => {
        const baseOpacity = Number(ring.dataset.baseOpacity || 0.6);
        const baseEmissive = Number(ring.dataset.baseEmissiveIntensity || 0.2);
        ring.setAttribute("animation__ringalpha", {
          property: "material.opacity",
          from: baseOpacity,
          to: Math.min(1, baseOpacity + (pulseConfig.ringOpacityBoost || 0.22)),
          dir: "alternate",
          dur: duration,
          easing: "easeOutCubic",
          loop: 1,
        });
        ring.setAttribute("animation__ringglow", {
          property: "material.emissiveIntensity",
          from: baseEmissive,
          to: baseEmissive + (pulseConfig.ringEmissiveBoost || 0.24),
          dir: "alternate",
          dur: duration,
          easing: "easeOutCubic",
          loop: 1,
        });
      });
    },

    triggerPhotoSweep(sourceCard) {
      const sweepConfig = this.effectsConfig.photoSweep || {};
      const galleryRoot = this.effectRoot?.parentNode;
      if (!sweepConfig.enabled || !galleryRoot || !sourceCard) {
        return;
      }

      const photoCards = Array.from(galleryRoot.querySelectorAll(".photo-card"));
      if (!photoCards.length) {
        return;
      }

      const sourceIndex = Number(sourceCard.dataset.photoIndex || 0);
      const duration = sweepConfig.durationMs || 320;
      const delayStep = sweepConfig.delayStepMs || 42;

      photoCards.forEach((card, index) => {
        const frame = card.querySelector(".media-frame");
        if (!frame) {
          return;
        }

        const cardIndex = Number(card.dataset.photoIndex || index);
        const directDistance = Math.abs(cardIndex - sourceIndex);
        const circularDistance = Math.min(
          directDistance,
          photoCards.length - directDistance,
        );
        const delay = circularDistance * delayStep;
        const baseEmissive = Number(frame.dataset.baseEmissiveIntensity || 0.2);

        frame.setAttribute("animation__sweepglow", {
          property: "material.emissiveIntensity",
          from: baseEmissive,
          to: baseEmissive + (sweepConfig.glowBoost || 0.28),
          dir: "alternate",
          dur: duration,
          delay,
          easing: "easeOutCubic",
          loop: 1,
        });
        frame.setAttribute("animation__sweepalpha", {
          property: "material.opacity",
          from: 0.92,
          to: Math.min(1, 0.92 + (sweepConfig.opacityBoost || 0.08)),
          dir: "alternate",
          dur: duration,
          delay,
          easing: "easeOutCubic",
          loop: 1,
        });
        card.setAttribute("animation__sweepscale", {
          property: "scale",
          from: "1 1 1",
          to: `${sweepConfig.scaleBoost || 1.06} ${sweepConfig.scaleBoost || 1.06} ${sweepConfig.scaleBoost || 1.06}`,
          dir: "alternate",
          dur: duration,
          delay,
          easing: "easeOutBack",
          loop: 1,
        });
      });
    },

    attachVideoTrail(card) {
      const trailConfig = this.effectsConfig.videoTrail || {};
      if (!trailConfig.enabled || !card) {
        return;
      }

      const existingTrail = card.querySelector(".video-trail");
      if (existingTrail) {
        return;
      }

      const frame = card.querySelector(".media-frame");
      const frameWidth = Number(frame?.getAttribute("width") || 1.05);
      const frameHeight = Number(frame?.getAttribute("height") || 0.66);
      const trail = document.createElement("a-entity");
      trail.classList.add("video-trail");

      const glow = document.createElement("a-plane");
      glow.setAttribute("position", "0 0 -0.03");
      glow.setAttribute("width", `${frameWidth * (trailConfig.glowScale || 1.18)}`);
      glow.setAttribute("height", `${frameHeight * (trailConfig.glowScale || 1.18)}`);
      setEntityMaterial(glow, {
        color: "#7bdff2",
        emissive: "#7bdff2",
        emissiveIntensity: 0.22,
        transparent: true,
        opacity: trailConfig.glowOpacity || 0.34,
        side: "double",
      });
      glow.setAttribute("animation__trailpulse", {
        property: "material.opacity",
        from: Math.max(0.12, (trailConfig.glowOpacity || 0.34) - 0.14),
        to: trailConfig.glowOpacity || 0.34,
        dir: "alternate",
        dur: 900,
        easing: "easeInOutSine",
        loop: true,
      });

      trail.appendChild(glow);

      const orbit = document.createElement("a-entity");
      orbit.classList.add("video-trail-orbit");
      orbit.setAttribute("position", "0 0 0.03");
      orbit.setAttribute("animation__orbitspin", {
        property: "rotation",
        to: "0 0 360",
        dur: 4600,
        easing: "linear",
        loop: true,
      });

      const orbitRadiusX = frameWidth * (trailConfig.orbitScale || 1.26) * 0.52;
      const orbitRadiusY = frameHeight * (trailConfig.orbitScale || 1.26) * 0.52;
      const orbitStars = Math.max(3, trailConfig.orbitStars || 4);

      for (let index = 0; index < orbitStars; index += 1) {
        const angle = (index / orbitStars) * Math.PI * 2;
        const orbitStar = document.createElement("a-circle");
        orbitStar.setAttribute("radius", `${randomBetween(0.014, 0.026)}`);
        orbitStar.setAttribute(
          "position",
          `${Math.cos(angle) * orbitRadiusX} ${Math.sin(angle) * orbitRadiusY} 0`,
        );
        setEntityMaterial(orbitStar, {
          color: pickRandom(["#d9f7ff", "#7bdff2", "#b8f2b2"], "#d9f7ff"),
          emissive: "#d9f7ff",
          emissiveIntensity: 0.32,
          transparent: true,
          opacity: randomBetween(0.48, 0.88),
          side: "double",
        });
        orbitStar.setAttribute("animation__orbitpulse", {
          property: "material.opacity",
          from: randomBetween(0.2, 0.45),
          to: randomBetween(0.68, 0.96),
          dir: "alternate",
          dur: randomBetween(720, 1280),
          easing: "easeInOutSine",
          loop: true,
          delay: index * 120,
        });
        orbit.appendChild(orbitStar);
      }

      trail.appendChild(orbit);

      const sparkleCount = Math.max(2, trailConfig.sparkleCount || 4);
      for (let index = 0; index < sparkleCount; index += 1) {
        const sparkle = document.createElement("a-circle");
        sparkle.setAttribute("radius", `${randomBetween(0.018, 0.032)}`);
        sparkle.setAttribute(
          "position",
          `${randomBetween(-frameWidth * 0.48, frameWidth * 0.48)} ${randomBetween(-frameHeight * 0.42, frameHeight * 0.42)} 0.024`,
        );
        setEntityMaterial(sparkle, {
          color: pickRandom(["#7bdff2", "#d9f7ff", "#b8f2b2"], "#7bdff2"),
          emissive: "#d9f7ff",
          emissiveIntensity: 0.3,
          transparent: true,
          opacity: randomBetween(0.35, 0.75),
          side: "double",
        });
        sparkle.setAttribute("animation__twinkle", {
          property: "material.opacity",
          from: randomBetween(0.12, 0.3),
          to: randomBetween(0.55, 0.92),
          dir: "alternate",
          dur: randomBetween(650, 1200),
          easing: "easeInOutSine",
          loop: true,
          delay: index * 120,
        });
        sparkle.setAttribute("animation__drift", {
          property: "position",
          to: `${randomBetween(-frameWidth * 0.4, frameWidth * 0.4)} ${randomBetween(-frameHeight * 0.36, frameHeight * 0.36)} 0.024`,
          dir: "alternate",
          dur: randomBetween(1400, 2200),
          easing: "easeInOutSine",
          loop: true,
          delay: index * 90,
        });
        trail.appendChild(sparkle);
      }

      card.appendChild(trail);
    },

    removeVideoTrail(card) {
      const trail = card?.querySelector(".video-trail");
      if (!trail) {
        return;
      }

      trail.remove();
    },

    spawnCardAura(card, options = {}) {
      if (!card) {
        return;
      }

      const sourceKind = options.sourceKind || getCardKind(card);
      const colorMap = {
        photo: "#ffd166",
        video: "#7bdff2",
        button: "#ff8fab",
      };
      const color = colorMap[sourceKind] || "#ffd166";
      const duration = Math.max(220, options.durationMs || 520);
      const scale = options.scale || 1.6;

      const ring = document.createElement("a-ring");
      ring.setAttribute("position", "0 0 0.035");
      ring.setAttribute("radius-inner", options.isSoft ? "0.16" : "0.2");
      ring.setAttribute("radius-outer", options.isSoft ? "0.22" : "0.28");
      setEntityMaterial(ring, {
        color,
        emissive: color,
        emissiveIntensity: options.isSoft ? 0.16 : 0.24,
        transparent: true,
        opacity: options.isSoft ? 0.72 : 0.94,
        side: "double",
      });
      ring.setAttribute("animation__pulse", {
        property: "scale",
        from: "0.2 0.2 0.2",
        to: `${scale} ${scale} ${scale}`,
        dur: duration,
        easing: "easeOutCubic",
      });
      ring.setAttribute("animation__fade", {
        property: "material.opacity",
        to: 0,
        dur: duration,
        easing: "easeOutCubic",
      });

      const flare = document.createElement("a-circle");
      flare.setAttribute("position", "0 0 0.02");
      flare.setAttribute("radius", options.isSoft ? "0.12" : "0.16");
      setEntityMaterial(flare, {
        color,
        emissive: color,
        emissiveIntensity: options.isSoft ? 0.08 : 0.14,
        transparent: true,
        opacity: options.isSoft ? 0.18 : 0.24,
        side: "double",
      });
      flare.setAttribute("animation__flare", {
        property: "scale",
        from: "0.4 0.4 0.4",
        to: `${scale * 1.08} ${scale * 1.08} ${scale * 1.08}`,
        dur: duration,
        easing: "easeOutQuad",
      });
      flare.setAttribute("animation__fade", {
        property: "material.opacity",
        to: 0,
        dur: duration,
        easing: "easeOutCubic",
      });

      card.appendChild(flare);
      card.appendChild(ring);
      window.setTimeout(() => {
        flare.remove();
        ring.remove();
      }, duration + 80);
    },

    ensureEffectRoot(galleryRoot) {
      if (this.effectRoot?.parentNode === galleryRoot) {
        return;
      }

      this.removeEffectRoot();
      this.effectRoot = document.createElement("a-entity");
      this.effectRoot.setAttribute("class", "celebration-effects-root");
      galleryRoot.appendChild(this.effectRoot);
    },

    removeEffectRoot() {
      if (!this.effectRoot) {
        return;
      }

      this.effectRoot.remove();
      this.effectRoot = null;
    },

    ensureOverlayRoot() {
      if (this.overlayRoot?.isConnected) {
        return;
      }

      this.overlayRoot = document.createElement("div");
      this.overlayRoot.className = "celebration-overlay";
      document.body.appendChild(this.overlayRoot);
    },

    removeOverlayRoot() {
      if (!this.overlayRoot) {
        return;
      }

      this.overlayRoot.remove();
      this.overlayRoot = null;
    },

    startBalloonCycle() {
      const balloonConfig = this.effectsConfig.balloons || {};
      if (!balloonConfig.enabled || !this.effectRoot) {
        return;
      }

      this.stopBalloonCycle();
      this.balloonInterval = window.setInterval(() => {
        this.spawnBalloonCluster();
      }, Math.max(1200, balloonConfig.spawnIntervalMs || 3200));
    },

    stopBalloonCycle() {
      if (!this.balloonInterval) {
        return;
      }

      window.clearInterval(this.balloonInterval);
      this.balloonInterval = null;
    },

    startHudCycle() {
      const hudConfig = this.effectsConfig.hud || {};
      if (!hudConfig.enabled || !this.overlayRoot) {
        return;
      }

      this.stopHudCycle();
      this.hudInterval = window.setInterval(() => {
        this.spawnHudCelebration();
      }, Math.max(2200, hudConfig.cycleIntervalMs || 4600));
    },

    stopHudCycle() {
      if (!this.hudInterval) {
        return;
      }

      window.clearInterval(this.hudInterval);
      this.hudInterval = null;
    },

    spawnBalloonCluster(multiplier = 1) {
      const balloonConfig = this.effectsConfig.balloons || {};
      if (!balloonConfig.enabled || !this.effectRoot) {
        return;
      }

      const spawnCount = Math.max(
        1,
        Math.round((balloonConfig.spawnCount || 2) * multiplier),
      );

      for (let index = 0; index < spawnCount; index += 1) {
        this.spawnBalloon(balloonConfig, index);
      }
    },

    spawnBalloon(balloonConfig, index) {
      const side = Math.random() > 0.5 ? 1 : -1;
      const startX =
        side *
        randomBetween(
          balloonConfig.sideOffsetMin || 2.2,
          balloonConfig.sideOffsetMax || 3.5,
        );
      const startY = balloonConfig.startHeight || 0.4;
      const startZ = randomBetween(
        -(balloonConfig.depthSpread || 2.2),
        balloonConfig.depthSpread || 2.2,
      );
      const endX = startX + randomBetween(-0.35, 0.35);
      const endY = balloonConfig.endHeight || 4.9;
      const endZ = startZ + randomBetween(
        -(balloonConfig.driftX || 0.45),
        balloonConfig.driftX || 0.45,
      );
      const duration = Math.max(4000, balloonConfig.durationMs || 9600);
      const color = pickRandom(balloonConfig.colors, "#ffd166");

      const balloon = document.createElement("a-entity");
      balloon.setAttribute("position", `${startX} ${startY} ${startZ}`);
      balloon.setAttribute("rotation", `0 0 ${randomBetween(-10, 10)}`);
      balloon.setAttribute("animation__rise", {
        property: "position",
        to: `${endX} ${endY} ${endZ}`,
        dur: duration,
        easing: "linear",
      });

      const body = document.createElement("a-sphere");
      body.setAttribute("radius", "0.2");
      body.setAttribute(
        "scale",
        `${randomBetween(0.82, 0.96)} ${randomBetween(1.08, 1.28)} ${randomBetween(0.82, 0.96)}`,
      );
      setEntityMaterial(body, {
        color,
        emissive: color,
        emissiveIntensity: 0.2,
        roughness: 0.35,
        metalness: 0.05,
      });
      body.setAttribute("animation__sway", {
        property: "rotation",
        from: `0 0 ${randomBetween(-8, 4)}`,
        to: `0 0 ${randomBetween(4, 12)}`,
        dur: randomBetween(1500, 2300),
        dir: "alternate",
        easing: "easeInOutSine",
        loop: true,
        delay: index * 120,
      });

      const string = document.createElement("a-cylinder");
      string.setAttribute("radius", "0.005");
      string.setAttribute("height", `${randomBetween(0.42, 0.62)}`);
      string.setAttribute("position", "0 -0.38 0");
      setEntityMaterial(string, {
        color: "#fff8f0",
        emissive: "#fff8f0",
        emissiveIntensity: 0.05,
        transparent: true,
        opacity: 0.88,
      });

      const knot = document.createElement("a-cone");
      knot.setAttribute("radius-bottom", "0.04");
      knot.setAttribute("radius-top", "0.01");
      knot.setAttribute("height", "0.08");
      knot.setAttribute("position", "0 -0.2 0");
      setEntityMaterial(knot, {
        color,
        emissive: color,
        emissiveIntensity: 0.14,
      });

      balloon.appendChild(body);
      balloon.appendChild(string);
      balloon.appendChild(knot);
      this.effectRoot.appendChild(balloon);

      window.setTimeout(() => {
        balloon.remove();
      }, duration + 120);
    },

    spawnConfettiBurst(overrides = {}) {
      const confettiConfig = this.effectsConfig.confetti || {};
      if (!confettiConfig.enabled || !this.effectRoot) {
        return;
      }

      const burstCount = Math.max(
        6,
        overrides.burstCount || confettiConfig.burstCount || 18,
      );
      const duration = Math.max(
        900,
        overrides.durationMs || confettiConfig.durationMs || 2200,
      );
      const origin = overrides.origin || { x: 0, y: 0, z: 0 };
      const burstHeight =
        overrides.burstHeight || origin.y || confettiConfig.burstHeight || 2.3;
      const radius = overrides.radius || confettiConfig.radius || 1.9;

      for (let index = 0; index < burstCount; index += 1) {
        const confetti = document.createElement("a-plane");
        const angle = (index / burstCount) * Math.PI * 2;
        const distance = randomBetween(radius * 0.35, radius);
        const targetX = (origin.x || 0) + Math.cos(angle) * distance;
        const targetY = burstHeight + randomBetween(0.25, 1.15);
        const targetZ = (origin.z || 0) + Math.sin(angle) * distance;
        const width = randomBetween(0.05, 0.1);
        const height = randomBetween(0.14, 0.24);

        confetti.setAttribute(
          "position",
          `${(origin.x || 0) + randomBetween(-0.16, 0.16)} ${burstHeight} ${(origin.z || 0) + randomBetween(-0.16, 0.16)}`,
        );
        confetti.setAttribute("width", `${width}`);
        confetti.setAttribute("height", `${height}`);
        confetti.setAttribute(
          "rotation",
          `${randomBetween(0, 360)} ${randomBetween(0, 360)} ${randomBetween(0, 360)}`,
        );
        setEntityMaterial(confetti, {
          color: pickRandom(confettiConfig.colors, "#ffd166"),
          emissive: pickRandom(confettiConfig.colors, "#ffd166"),
          emissiveIntensity: 0.18,
          side: "double",
          transparent: true,
          opacity: 0.95,
        });
        confetti.setAttribute("animation__burst", {
          property: "position",
          to: `${targetX} ${targetY} ${targetZ}`,
          dur: duration,
          easing: "easeOutCubic",
        });
        confetti.setAttribute("animation__twirl", {
          property: "rotation",
          to: `${randomBetween(240, 520)} ${randomBetween(180, 520)} ${randomBetween(280, 720)}`,
          dur: duration,
          easing: "linear",
        });
        confetti.setAttribute("animation__fade", {
          property: "material.opacity",
          to: 0,
          dur: duration,
          easing: "easeInCubic",
        });

        this.effectRoot.appendChild(confetti);
        window.setTimeout(() => {
          confetti.remove();
        }, duration + 120);
      }
    },

    spawnHudCelebration(isBigMoment = false, sourceKind = "photo", mode = "tap") {
      const hudConfig = this.effectsConfig.hud || {};
      if (!hudConfig.enabled || !this.overlayRoot) {
        return;
      }

      const burstCount = isBigMoment
        ? Math.max(10, hudConfig.burstCount || 14)
        : mode === "hover"
          ? Math.max(3, Math.round((hudConfig.burstCount || 14) * 0.25))
          : Math.max(5, Math.round((hudConfig.burstCount || 14) * 0.5));
      const streamerCount = isBigMoment
        ? Math.max(6, hudConfig.streamerCount || 8)
        : mode === "hover"
          ? Math.max(1, Math.round((hudConfig.streamerCount || 8) * 0.2))
          : Math.max(3, Math.round((hudConfig.streamerCount || 8) * 0.5));
      const duration = Math.max(1200, hudConfig.durationMs || 2100);
      const colors = hudConfig.colors || ["#ffd166"];
      const baseX = randomBetween(12, 88);
      const baseY = isBigMoment ? randomBetween(18, 34) : randomBetween(22, 42);

      for (let index = 0; index < burstCount; index += 1) {
        const spark = document.createElement("span");
        spark.className = `celebration-overlay__spark celebration-overlay__spark--${sourceKind}`;
        spark.style.left = `${baseX + randomBetween(-10, 10)}%`;
        spark.style.top = `${baseY + randomBetween(-8, 8)}%`;
        spark.style.setProperty("--spark-x", `${randomBetween(-180, 180)}px`);
        spark.style.setProperty("--spark-y", `${randomBetween(-120, 180)}px`);
        spark.style.setProperty("--spark-rotate", `${randomBetween(90, 540)}deg`);
        spark.style.setProperty("--spark-scale", `${randomBetween(0.7, 1.3)}`);
        spark.style.setProperty("--spark-color", pickRandom(colors, "#ffd166"));
        spark.style.animationDuration = `${duration}ms`;
        this.overlayRoot.appendChild(spark);
        window.setTimeout(() => {
          spark.remove();
        }, duration + 120);
      }

      for (let index = 0; index < streamerCount; index += 1) {
        const streamer = document.createElement("span");
        streamer.className = "celebration-overlay__streamer";
        streamer.style.left = `${baseX + randomBetween(-14, 14)}%`;
        streamer.style.top = `${baseY + randomBetween(-6, 6)}%`;
        streamer.style.setProperty("--streamer-x", `${randomBetween(-140, 140)}px`);
        streamer.style.setProperty("--streamer-y", `${randomBetween(120, 260)}px`);
        streamer.style.setProperty("--streamer-rotate", `${randomBetween(120, 420)}deg`);
        streamer.style.setProperty("--streamer-color", pickRandom(colors, "#ff8fab"));
        streamer.style.animationDuration = `${duration + 300}ms`;
        this.overlayRoot.appendChild(streamer);
        window.setTimeout(() => {
          streamer.remove();
        }, duration + 420);
      }

      if (mode !== "hover") {
        const pulse = document.createElement("span");
        pulse.className = "celebration-overlay__pulse";
        pulse.style.left = `${baseX}%`;
        pulse.style.top = `${baseY}%`;
        pulse.style.setProperty("--pulse-color", pickRandom(colors, "#ffd166"));
        pulse.style.animationDuration = `${duration - 300}ms`;
        this.overlayRoot.appendChild(pulse);
        window.setTimeout(() => {
          pulse.remove();
        }, duration);
      }
    },
  });

  AFRAME.registerComponent("media-card-interaction", {
    schema: {
      kind: { default: "photo" },
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

      this.el.sceneEl.emit("gallery:celebrate", {
        cardEl: this.el,
        kind: this.data.kind,
        mode: "tap",
      });

      if (this.data.kind === "video") {
        this.playPopAnimation(1.08);
        const isPlaying = this.toggleVideo();
        this.el.sceneEl.emit("gallery:video-toggled", {
          isPlaying,
          videoId: this.el.getAttribute("data-video-id"),
          cardEl: this.el,
        });
        return;
      }

      this.playPopAnimation(1.12);
      this.el.sceneEl.emit("gallery:photo-toggle-focus", { cardEl: this.el });
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
      this.introConfig = this.config.intro || { countdownSeconds: 3 };
      this.desktopConfig = this.config.desktopPreview || {};
      this.scene = this.el;
      this.camera = document.getElementById("camera");
      this.ground = document.getElementById("ground");
      this.assets = document.getElementById("mediaAssets");
      this.prompt = document.getElementById("promptText");
      this.status = document.getElementById("statusText");
      this.videoButton = document.getElementById("videoBtn");
      this.revealOverlay = document.getElementById("revealOverlay");
      this.countdownNumber = document.getElementById("countdownNumber");
      this.countdownLabel = document.getElementById("countdownLabel");

      this.galleryRoot = null;
      this.videoAssetIds = [];
      this.allVideosPlaying = false;
      this.hasPlacedGallery = false;
      this.isPlacementLocked = false;
      this.isRevealing = false;
      this.isAutoPlacing = false;
      this.countdownTimer = null;
      this.autoPlaceTimeout = null;
      this.autoPlaceSampleTimer = null;
      this.focusedPhotoCard = null;
      this.isDesktopPreview = this.detectDesktopPreviewMode();
      this.desktopIdleStatus =
        this.config.ui.desktopStatus || "Desktop preview active.";
      this.hoveredCard = null;

      if (!this.scene.hasAttribute("celebration-effects")) {
        this.scene.setAttribute("celebration-effects", "");
      }

      this.handleGroundTap = this.handleGroundTap.bind(this);
      this.handleToggleVideos = this.handleToggleVideos.bind(this);
      this.handlePhotoToggleFocus = this.handlePhotoToggleFocus.bind(this);
      this.handleVideoToggled = this.handleVideoToggled.bind(this);

      this.ground.addEventListener("click", this.handleGroundTap);
      this.videoButton.addEventListener("click", this.handleToggleVideos);
      this.scene.addEventListener(
        "gallery:photo-toggle-focus",
        this.handlePhotoToggleFocus,
      );
      this.scene.addEventListener(
        "gallery:video-toggled",
        this.handleVideoToggled,
      );

      this.updatePrompt(this.config.ui.prompt);
  this.setStatus(this.config.ui.autoPlaceScanningMessage);
      this.updateVideoButtonLabel();

      this.setupDesktopPreviewPlacement();
    },

    detectDesktopPreviewMode() {
      const hasTouchPoints =
        navigator.maxTouchPoints && navigator.maxTouchPoints > 0;
      const hasTouchEvents = "ontouchstart" in window;
      return !(hasTouchPoints || hasTouchEvents);
    },

    setupDesktopPreviewPlacement() {
      const isAutoPlace = this.isDesktopPreview
        ? this.desktopConfig.autoPlace
        : this.config.placement.autoPlace;

      if (!isAutoPlace) {
        return;
      }

      if (this.isDesktopPreview) {
        this.updatePrompt(
          this.config.ui.desktopPrompt || this.config.ui.prompt,
          true,
        );
        this.setStatus(this.desktopIdleStatus);
      }

      const placeWhenReady = () => {
        if (this.hasPlacedGallery || this.isRevealing || this.isAutoPlacing) {
          return;
        }

        if (this.isDesktopPreview) {
          this.placeGallery(this.getAutoPlaceGroundY());
          return;
        }

        this.beginLockedAutoPlacement();
      };

      if (this.scene.hasLoaded) {
        window.setTimeout(placeWhenReady, 180);
        return;
      }

      this.scene.addEventListener(
        "loaded",
        () => {
          window.setTimeout(placeWhenReady, 180);
        },
        { once: true },
      );
    },

    bindDesktopHoverHint(targetEl, hintMessage) {
      if (!this.isDesktopPreview || !targetEl) {
        return;
      }

      targetEl.addEventListener("mouseenter", () => {
        if (this.isRevealing) {
          return;
        }

        const card = targetEl.closest(".photo-card, .video-card");
        const hoverConfig = this.config.effects?.hoverBurst || {};
        const now = Date.now();
        const lastCelebrateAt = Number(card?.dataset.hoverCelebrateAt || 0);
        const cooldownMs = hoverConfig.cooldownMs || 900;

        if (card && hoverConfig.enabled && now - lastCelebrateAt >= cooldownMs) {
          card.dataset.hoverCelebrateAt = String(now);
          this.scene.emit("gallery:celebrate", {
            cardEl: card,
            kind: getCardKind(card),
            mode: "hover",
          });
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

      const baseEmissiveIntensity = Number(
        frame.dataset.baseEmissiveIntensity || 0.2,
      );
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
      this.cancelAutoPlacement();
      this.stopCountdown();
      this.ground.removeEventListener("click", this.handleGroundTap);
      this.videoButton.removeEventListener("click", this.handleToggleVideos);
      this.scene.removeEventListener(
        "gallery:photo-toggle-focus",
        this.handlePhotoToggleFocus,
      );
      this.scene.removeEventListener(
        "gallery:video-toggled",
        this.handleVideoToggled,
      );
    },

    handleGroundTap(event) {
      if (this.isRevealing) {
        this.setStatus(this.config.ui.revealingBlockedMessage);
        return;
      }

      if (this.isAutoPlacing) {
        this.setStatus(this.config.ui.autoPlaceAlreadyInProgressMessage);
        return;
      }

      if (this.isPlacementLocked || this.hasPlacedGallery) {
        this.setStatus(this.config.ui.lockedPlacementMessage);
        return;
      }

      if (!this.isDesktopPreview && this.config.placement.autoPlace) {
        this.setStatus(this.config.ui.autoPlaceAlreadyInProgressMessage);
        return;
      }

      const point = event?.detail?.intersection?.point;
      if (!point) return;

      if (!this.hasPlacedGallery) {
        this.placeGallery(point.y);
      }
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

      this.scene.emit("gallery:all-videos-toggled", {
        isPlaying: this.allVideosPlaying,
      });

      this.scene.emit("gallery:celebrate", {
        kind: "button",
        mode: "button",
      });

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
        this.setStatus(
          this.config.ui.photoCollapsedMessage || "Photo restored.",
        );
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
          ? this.config.ui.videoTapPlayMessage || "Video playing."
          : this.config.ui.videoTapPauseMessage || "Video paused.",
      );
    },

    syncAllVideosPlayingState() {
      const videos = this.videoAssetIds
        .map((id) => document.getElementById(id))
        .filter(Boolean);

      this.allVideosPlaying =
        videos.length > 0 && videos.every((video) => !video.paused);
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
          floatDelay,
        ),
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

    getAutoPlaceGroundY() {
      return this.isDesktopPreview
        ? Number.isFinite(this.desktopConfig.autoPlaceGroundY)
          ? this.desktopConfig.autoPlaceGroundY
          : -0.5
        : Number.isFinite(this.config.placement.autoPlaceGroundY)
          ? this.config.placement.autoPlaceGroundY
          : 0;
    },

    beginLockedAutoPlacement() {
      if (this.hasPlacedGallery || this.isPlacementLocked || this.isAutoPlacing) {
        return;
      }

      const placementConfig = this.config.placement || {};
      const delayMs = Number.isFinite(placementConfig.autoPlaceStabilizeDelayMs)
        ? placementConfig.autoPlaceStabilizeDelayMs
        : 1200;
      const groundY = this.getAutoPlaceGroundY();

      this.isAutoPlacing = true;
      this.updatePrompt(this.config.ui.prompt, true);
      this.setStatus(this.config.ui.autoPlaceScanningMessage);

      this.autoPlaceTimeout = window.setTimeout(() => {
        this.autoPlaceTimeout = null;

        this.samplePlacementCenter(groundY)
          .then((center) => {
            if (this.hasPlacedGallery || this.isPlacementLocked) {
              return;
            }

            this.placeGallery(groundY, center);
          })
          .finally(() => {
            this.isAutoPlacing = false;
          });
      }, delayMs);
    },

    cancelAutoPlacement() {
      if (this.autoPlaceTimeout) {
        window.clearTimeout(this.autoPlaceTimeout);
        this.autoPlaceTimeout = null;
      }

      if (this.autoPlaceSampleTimer) {
        window.clearInterval(this.autoPlaceSampleTimer);
        this.autoPlaceSampleTimer = null;
      }

      this.isAutoPlacing = false;
    },

    samplePlacementCenter(groundY) {
      const placementConfig = this.config.placement || {};
      const sampleCount = Number.isFinite(placementConfig.autoPlaceSampleCount)
        ? Math.max(3, placementConfig.autoPlaceSampleCount)
        : 18;
      const sampleIntervalMs = Number.isFinite(
        placementConfig.autoPlaceSampleIntervalMs,
      )
        ? Math.max(16, placementConfig.autoPlaceSampleIntervalMs)
        : 55;
      const samples = [];

      return new Promise((resolve) => {
        const collectSample = () => {
          samples.push(this.getUserCenter(groundY));

          if (samples.length < sampleCount) {
            return;
          }

          if (this.autoPlaceSampleTimer) {
            window.clearInterval(this.autoPlaceSampleTimer);
            this.autoPlaceSampleTimer = null;
          }

          resolve(this.getStableCenter(samples));
        };

        collectSample();

        if (samples.length >= sampleCount) {
          return;
        }

        this.autoPlaceSampleTimer = window.setInterval(
          collectSample,
          sampleIntervalMs,
        );
      });
    },

    getStableCenter(samples) {
      return {
        x: this.getMedianValue(samples.map((sample) => sample.x)),
        y: this.getMedianValue(samples.map((sample) => sample.y)),
        z: this.getMedianValue(samples.map((sample) => sample.z)),
      };
    },

    getMedianValue(values) {
      const sortedValues = [...values].sort((left, right) => left - right);
      const middleIndex = Math.floor(sortedValues.length / 2);

      if (sortedValues.length % 2 === 1) {
        return sortedValues[middleIndex];
      }

      return (sortedValues[middleIndex - 1] + sortedValues[middleIndex]) / 2;
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

    getPlacementRotationY() {
      const cameraDirection = new THREE.Vector3();
      this.camera.object3D.getWorldDirection(cameraDirection);
      cameraDirection.y = 0;

      if (cameraDirection.lengthSq() < 0.000001) {
        return 0;
      }

      cameraDirection.normalize();

      const orientation = new THREE.Object3D();
      orientation.lookAt(cameraDirection);
      return THREE.MathUtils.radToDeg(orientation.rotation.y);
    },

    placeGallery(groundY, centerOverride) {
      if (this.isPlacementLocked && this.hasPlacedGallery) {
        return;
      }

      this.cancelAutoPlacement();
      this.removeGallery();
      this.ensureVideoAssets();
      this.focusedPhotoCard = null;

      const center = centerOverride || this.getUserCenter(groundY);

      this.galleryRoot = document.createElement("a-entity");
      this.galleryRoot.setAttribute("id", "galleryRoot");
      this.galleryRoot.setAttribute(
        "position",
        `${center.x} ${center.y} ${center.z}`,
      );
      this.galleryRoot.setAttribute(
        "rotation",
        `0 ${this.getPlacementRotationY()} 0`,
      );
      this.galleryRoot.setAttribute("visible", "false");
      this.galleryRoot.setAttribute("scale", "0.84 0.84 0.84");
      this.scene.appendChild(this.galleryRoot);
      this.scene.emit("gallery:placed", { galleryRoot: this.galleryRoot });

      this.buildPhotoLayer(this.galleryRoot);
      this.buildVideoLayer(this.galleryRoot);
      this.addDecorativeRings(this.galleryRoot);
      this.galleryRoot.appendChild(createFloorDecor());
      this.playPlacementPulse();

      this.hasPlacedGallery = true;
      this.isPlacementLocked = true;
      this.updatePrompt(this.config.ui.revealPreparingMessage, true);
      this.setStatus(this.config.ui.revealInProgressMessage);
      this.updateVideoButtonLabel();

      this.unlockVideos();
      this.startRevealSequence();
    },

    removeGallery() {
      if (!this.galleryRoot) return;
      this.scene.emit("gallery:removed", { galleryRoot: this.galleryRoot });
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
      let remaining = Math.max(
        1,
        Math.floor(this.introConfig.countdownSeconds || 3),
      );

      this.stopCountdown();
      this.isRevealing = true;
      this.setRevealOverlayVisible(true);

      if (this.countdownLabel) {
        this.countdownLabel.textContent =
          this.introConfig.revealLabel || "Get ready...";
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
        this.countdownLabel.textContent =
          this.introConfig.revealDoneLabel || "Gallery live";
      }

      window.setTimeout(() => {
        this.setRevealOverlayVisible(false);
      }, 650);

      this.isRevealing = false;
      this.updatePrompt(this.config.ui.placedMessage, false);
      this.setStatus(this.config.ui.placedMessage);
      this.playPlacementPulse();
      this.scene.emit("gallery:revealed", { galleryRoot: this.galleryRoot });
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
        card.setAttribute("rotation", `0 ${facingY} ${getCardTilt(index, "photo")}`);
        card.setAttribute("media-card-interaction", "kind: photo");
        card.dataset.photoIndex = String(index);
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
            index * 90,
          ),
        );

        const backFace = document.createElement("a-entity");
        backFace.setAttribute("position", "0 0 -0.038");
        backFace.setAttribute("rotation", "0 180 0");

        const frameTone = item.frameColor || "#ffd166";
        const frontFrame = createDecorativeFrame({
          width: layer.itemWidth,
          height: layer.itemHeight,
          frameColor: frameTone,
          frameDepth: -0.012,
          emissiveIntensity: 0.2,
          frameClass: "media-frame",
        });
        const backFrame = createDecorativeFrame({
          width: layer.itemWidth,
          height: layer.itemHeight,
          frameColor: frameTone,
          frameDepth: -0.012,
          emissiveIntensity: 0.12,
          frameClass: "media-frame-back",
        });
        const frame = frontFrame.frame;
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

        const backPhoto = document.createElement("a-plane");
        backPhoto.classList.add("cantap");
        backPhoto.setAttribute("position", "0 0 0");
        backPhoto.setAttribute("width", layer.itemWidth);
        backPhoto.setAttribute("height", layer.itemHeight);
        setEntityMaterial(backPhoto, {
          src: item.src,
          side: "double",
          shader: "flat",
          transparent: true,
        });

        const frontTitle = createTitleBadge({
          title: item.title,
          subtitle: item.subtitle,
          color: frameTone,
          label: "月齡相片",
        });
        const backTitle = createTitleBadge({
          title: item.title,
          subtitle: item.subtitle,
          color: frameTone,
          label: "月齡相片",
        });

        // 動態調整寬高比，讓框架緊貼圖片尺寸
        const adjustImageAspectRatio = () => {
          const texture = photo.getObject3D("mesh").material.map;
          if (texture && texture.image) {
            const imgWidth = texture.image.width;
            const imgHeight = texture.image.height;
            if (imgWidth && imgHeight) {
              const aspectRatio = imgWidth / imgHeight;
              const newHeight = layer.itemHeight;
              const newWidth = newHeight * aspectRatio;
              photo.setAttribute("width", newWidth);
              backPhoto.setAttribute("width", newWidth);
              frontFrame.updateLayout(newWidth, newHeight);
              backFrame.updateLayout(newWidth, newHeight);
              frontTitle.updateLayout(newWidth, newHeight);
              backTitle.updateLayout(newWidth, newHeight);
            }
          }
        };

        // 當材質加載完成時調整寬高比
        photo.addEventListener("materialtextureloaded", adjustImageAspectRatio);
        photo.addEventListener("model-loaded", adjustImageAspectRatio);

        const photoHoverHint =
          this.config.ui.desktopHoverPhotoHint ||
          "Photo is clickable. Left-click to expand.";
        this.bindDesktopHoverHint(photo, photoHoverHint);
        this.bindDesktopHoverHint(frame, photoHoverHint);
        this.bindDesktopHoverHint(backPhoto, photoHoverHint);
        this.bindDesktopHoverHint(backFrame.frame, photoHoverHint);

        frontTitle.updateLayout(layer.itemWidth, layer.itemHeight);
        backTitle.updateLayout(layer.itemWidth, layer.itemHeight);

        card.appendChild(frontFrame.root);
        card.appendChild(photo);
        card.appendChild(frontTitle.root);
        backFace.appendChild(backFrame.root);
        backFace.appendChild(backPhoto);
        backFace.appendChild(backTitle.root);
        card.appendChild(backFace);
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
        card.setAttribute("rotation", `0 ${facingY} ${getCardTilt(index, "video")}`);
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
            index * 140,
          ),
        );

        const backFace = document.createElement("a-entity");
        backFace.setAttribute("position", "0 0 -0.04");
        backFace.setAttribute("rotation", "0 180 0");

        const frameTone = item.frameColor || "#6ecbff";
        const frontFrame = createDecorativeFrame({
          width: layer.itemWidth,
          height: layer.itemHeight,
          frameColor: frameTone,
          frameDepth: -0.014,
          emissiveIntensity: 0.24,
          frameClass: "media-frame",
        });
        const backFrame = createDecorativeFrame({
          width: layer.itemWidth,
          height: layer.itemHeight,
          frameColor: frameTone,
          frameDepth: -0.014,
          emissiveIntensity: 0.14,
          frameClass: "media-frame-back",
        });
        const frame = frontFrame.frame;
        frame.dataset.baseEmissiveIntensity = "0.24";

        const screen = document.createElement("a-video");
        screen.classList.add("cantap");
        screen.setAttribute("position", "0 0 0");
        screen.setAttribute("src", `#${this.videoAssetIds[index]}`);
        screen.setAttribute("width", layer.itemWidth);
        screen.setAttribute("height", layer.itemHeight);

        const backScreen = document.createElement("a-video");
        backScreen.classList.add("cantap");
        backScreen.setAttribute("position", "0 0 0");
        backScreen.setAttribute("src", `#${this.videoAssetIds[index]}`);
        backScreen.setAttribute("width", layer.itemWidth);
        backScreen.setAttribute("height", layer.itemHeight);

        const pauseBadge = document.createElement("a-circle");
        pauseBadge.classList.add("pause-badge", "cantap");
        pauseBadge.setAttribute("radius", "0.11");
        pauseBadge.setAttribute(
          "position",
          `${layer.itemWidth / 2 - 0.12} ${-(layer.itemHeight / 2) + 0.12} 0.03`,
        );

        const backPauseBadge = document.createElement("a-circle");
        backPauseBadge.classList.add("pause-badge", "cantap");
        backPauseBadge.setAttribute("radius", "0.11");
        backPauseBadge.setAttribute(
          "position",
          `${layer.itemWidth / 2 - 0.12} ${-(layer.itemHeight / 2) + 0.12} 0.03`,
        );

        // 動態調整影片寬高比，讓框架和按鈕位置一起跟著內容調整
        const adjustVideoAspectRatio = () => {
          const videoEl = document.getElementById(this.videoAssetIds[index]);
          if (videoEl && videoEl.videoWidth && videoEl.videoHeight) {
            const aspectRatio = videoEl.videoWidth / videoEl.videoHeight;
            const newHeight = layer.itemHeight;
            const newWidth = newHeight * aspectRatio;
            screen.setAttribute("width", newWidth);
            backScreen.setAttribute("width", newWidth);
            frontFrame.updateLayout(newWidth, newHeight);
            backFrame.updateLayout(newWidth, newHeight);
            pauseBadge.setAttribute(
              "position",
              `${newWidth / 2 - 0.12} ${-(newHeight / 2) + 0.12} 0.03`,
            );
            backPauseBadge.setAttribute(
              "position",
              `${newWidth / 2 - 0.12} ${-(newHeight / 2) + 0.12} 0.03`,
            );
            frontTitle.updateLayout(newWidth, newHeight);
            backTitle.updateLayout(newWidth, newHeight);
          }
        };

        screen.addEventListener("video-loaded", adjustVideoAspectRatio);
        const videoEl = document.getElementById(this.videoAssetIds[index]);
        if (videoEl) {
          videoEl.addEventListener("loadedmetadata", adjustVideoAspectRatio);
          videoEl.addEventListener("canplay", adjustVideoAspectRatio);
        }
        setEntityMaterial(pauseBadge, {
          color: "#10131a",
          emissive: "#10131a",
          emissiveIntensity: 0.1,
          opacity: 0.85,
          transparent: true,
        });

        setEntityMaterial(backPauseBadge, {
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

        const backPauseText = document.createElement("a-text");
        backPauseText.setAttribute("value", "II");
        backPauseText.setAttribute("align", "center");
        backPauseText.setAttribute("width", "2");
        backPauseText.setAttribute("color", "#ffffff");
        backPauseText.setAttribute("position", "0 0 0.01");
        backPauseText.setAttribute("shader", "msdf");

        const frontTitle = createTitleBadge({
          title: item.title,
          subtitle: item.subtitle,
          color: frameTone,
          label: "成長影片",
          zOffset: 0.03,
          scale: 0.92,
        });
        const backTitle = createTitleBadge({
          title: item.title,
          subtitle: item.subtitle,
          color: frameTone,
          label: "成長影片",
          zOffset: 0.03,
          scale: 0.92,
        });

        const videoHoverHint =
          this.config.ui.desktopHoverVideoHint ||
          "Video is clickable. Left-click to play or pause.";
        this.bindDesktopHoverHint(screen, videoHoverHint);
        this.bindDesktopHoverHint(frame, videoHoverHint);
        this.bindDesktopHoverHint(backScreen, videoHoverHint);
        this.bindDesktopHoverHint(backFrame.frame, videoHoverHint);

        pauseBadge.appendChild(pauseText);
        backPauseBadge.appendChild(backPauseText);
        frontTitle.updateLayout(layer.itemWidth, layer.itemHeight);
        backTitle.updateLayout(layer.itemWidth, layer.itemHeight);

        card.appendChild(frontFrame.root);
        card.appendChild(screen);
        card.appendChild(pauseBadge);
        card.appendChild(frontTitle.root);
        backFace.appendChild(backFrame.root);
        backFace.appendChild(backScreen);
        backFace.appendChild(backPauseBadge);
        backFace.appendChild(backTitle.root);
        card.appendChild(backFace);
        root.appendChild(card);
      });
    },

    addDecorativeRings(root) {
      const lowerRing = document.createElement("a-torus");
      lowerRing.classList.add("decorative-ring");
      lowerRing.setAttribute(
        "position",
        `0 ${this.config.layerOne.height - 0.52} 0`,
      );
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
      lowerRing.dataset.baseOpacity = "0.65";
      lowerRing.dataset.baseEmissiveIntensity = "0.2";
      lowerRing.setAttribute("animation__spin", {
        property: "rotation",
        to: "90 360 0",
        dur: 22000,
        easing: "linear",
        loop: true,
      });

      const upperRing = document.createElement("a-torus");
      upperRing.classList.add("decorative-ring");
      upperRing.setAttribute(
        "position",
        `0 ${this.config.layerTwo.height - 0.46} 0`,
      );
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
      upperRing.dataset.baseOpacity = "0.55";
      upperRing.dataset.baseEmissiveIntensity = "0.24";
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
