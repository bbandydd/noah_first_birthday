(() => {
  const framePalette = [
    "#ffd166",
    "#ff9f89",
    "#f7b2ff",
    "#a0e7e5",
    "#8ad6ff",
    "#ffc38a",
  ];

  // Replace each src with your own file as needed.
  // Current mapping points to generated placeholders.
  // Later you can replace the files with your real photos using same file names.
  const photos = [
    {
      title: "1 個月",
      subtitle: "你舉起小拳頭，第一次望向世界",
      src: "assets/photos/optimized/photo01.jpg",
      frameColor: framePalette[0],
    },
    {
      title: "2 個月",
      subtitle: "你含著奶嘴，小表情已經很有戲",
      src: "assets/photos/optimized/photo02.jpg",
      frameColor: framePalette[1],
    },
    {
      title: "3 個月",
      subtitle: "你一笑起來，整張小臉都亮了",
      src: "assets/photos/optimized/photo03.jpg",
      frameColor: framePalette[2],
    },
    {
      title: "4 個月",
      subtitle: "你抓著故事書，開始研究新世界",
      src: "assets/photos/optimized/photo04.jpg",
      frameColor: framePalette[3],
    },
    {
      title: "5 個月",
      subtitle: "你最愛玩水，泡澡時笑彎了眼",
      src: "assets/photos/optimized/photo05.jpg",
      frameColor: framePalette[4],
    },
    {
      title: "6 個月",
      subtitle: "你睡得香香的，像一顆小麻糬",
      src: "assets/photos/optimized/photo06.jpg",
      frameColor: framePalette[5],
    },
    {
      title: "7 個月",
      subtitle: "你坐得穩穩的，笑得像個小大人",
      src: "assets/photos/optimized/photo07.jpg",
      frameColor: framePalette[0],
    },
    {
      title: "8 個月",
      subtitle: "你包得暖暖的，睜大眼睛到處看",
      src: "assets/photos/optimized/photo08.jpg",
      frameColor: framePalette[1],
    },
    {
      title: "9 個月",
      subtitle: "你坐上鞦韆，眼睛忙著看整個公園",
      src: "assets/photos/optimized/photo09.jpg",
      frameColor: framePalette[2],
    },
    {
      title: "10 個月",
      subtitle: "你坐在落葉堆裡，開心揮手打招呼",
      src: "assets/photos/optimized/photo10.jpg",
      frameColor: framePalette[3],
    },
    {
      title: "11 個月",
      subtitle: "你穿著小花裙，抱著玩具甜甜看鏡頭",
      src: "assets/photos/optimized/photo11.jpg",
      frameColor: framePalette[4],
    },
    {
      title: "12 個月",
      subtitle: "你站得穩穩的，笑著迎接一歲冒險",
      src: "assets/photos/optimized/photo12.jpg",
      frameColor: framePalette[5],
    },
  ];

  // Current mapping points to generated local videos.
  // Later you can replace the files with your real videos using same file names.
  const videos = [
    {
      title: "第一次見面",
      subtitle: "還在肚子裡，就先和我們打招呼",
      src: "assets/videos/optimized/video01.mp4",
      frameColor: "#6ecbff",
      muted: true,
      loop: true,
    },
    {
      title: "趴趴探索",
      subtitle: "努力抬頭，也用小嘴研究玩具",
      src: "assets/videos/optimized/video02.mp4",
      frameColor: "#ffca7a",
      muted: true,
      loop: true,
    },
    {
      title: "努力前進中",
      subtitle: "戴著護具，一點一點勇敢往前爬",
      src: "assets/videos/optimized/video03.mp4",
      frameColor: "#7cf7c1",
      muted: true,
      loop: true,
    },
    {
      title: "學步小冒險",
      subtitle: "戴著小帽子，搖搖晃晃往前走",
      src: "assets/videos/optimized/video04.mp4",
      frameColor: "#f5a0ff",
      muted: true,
      loop: true,
    },
  ];

  window.PARTY_CONFIG = {
    placement: {
      centerYOffset: 0,
      allowRelocateOnGroundTap: false,
      autoPlace: true,
      autoPlaceGroundY: 0,
      autoPlaceStabilizeDelayMs: 1200,
      autoPlaceSampleCount: 18,
      autoPlaceSampleIntervalMs: 55,
    },

    layerOne: {
      radius: 3.35,
      height: 1.55,
      itemWidth: 1.02,
      itemHeight: 0.74,
      spinOffsetDeg: 248,
    },

    layerTwo: {
      radius: 2.15,
      height: 2.82,
      itemWidth: 0.96,
      itemHeight: 0.56,
      spinOffsetDeg: 225,
    },

    intro: {
      countdownSeconds: 3,
      revealLabel: "宥辰週歲趴",
      revealDoneLabel: "Happy Birthday Noah!",
    },

    desktopPreview: {
      autoPlace: true,
      autoPlaceGroundY: 0,
    },

    animation: {
      floatDistance: 0.065,
      floatDurationMs: 2600,
      popDurationMs: 340,
    },

    effects: {
      balloons: {
        enabled: true,
        spawnIntervalMs: 2600,
        spawnCount: 3,
        startHeight: 0.4,
        endHeight: 4.9,
        sideOffsetMin: 2.2,
        sideOffsetMax: 3.5,
        depthSpread: 2.2,
        driftX: 0.45,
        durationMs: 9600,
        colors: ["#ff7b89", "#ffd166", "#7fe7c4", "#8ad6ff", "#f7b2ff"],
      },
      confetti: {
        enabled: true,
        burstCount: 22,
        burstHeight: 2.3,
        radius: 1.9,
        durationMs: 2200,
        colors: ["#ffd166", "#ff8fab", "#7bdff2", "#b8f2b2", "#cdb4ff"],
      },
      tapBurst: {
        enabled: true,
        burstCount: 12,
        radius: 0.92,
        durationMs: 1650,
        lift: 0.82,
        waveDurationMs: 520,
        waveScale: 1.7,
      },
      hoverBurst: {
        enabled: true,
        burstCount: 4,
        radius: 0.42,
        durationMs: 900,
        lift: 0.44,
        waveDurationMs: 360,
        waveScale: 1.14,
        cooldownMs: 900,
      },
      hud: {
        enabled: true,
        cycleIntervalMs: 3600,
        burstCount: 18,
        streamerCount: 10,
        durationMs: 2300,
        colors: ["#ffd166", "#ff8fab", "#7bdff2", "#b8f2b2", "#cdb4ff"],
      },
      galleryPulse: {
        enabled: true,
        softScale: 1.03,
        strongScale: 1.07,
        durationMs: 380,
        ringOpacityBoost: 0.22,
        ringEmissiveBoost: 0.24,
      },
      photoSweep: {
        enabled: true,
        durationMs: 320,
        delayStepMs: 42,
        glowBoost: 0.28,
        opacityBoost: 0.08,
        scaleBoost: 1.06,
      },
      videoTrail: {
        enabled: true,
        glowOpacity: 0.34,
        glowScale: 1.18,
        sparkleCount: 4,
        orbitStars: 4,
        orbitScale: 1.26,
      },
    },

    interaction: {
      photoFocusScale: 1.8,
      photoFocusMoveIn: 0.82,
      photoFocusLift: 0.08,
    },

    photos,
    videos,

    ui: {
      prompt: "掃描地板並保持穩定，系統會自動定位 Noah 的 AR 相簿。",
      desktopPrompt:
        "Desktop 預覽模式：版面會自動放置，方便測試互動。",
      desktopStatus:
        "Desktop 預覽已啟用，可拖曳視角並點擊卡片。",
      desktopHoverPhotoHint: "照片可點擊放大。",
      desktopHoverVideoHint: "影片可點擊播放或暫停。",
      autoPlaceScanningMessage: "正在掃描地板並穩定定位，請先拿穩手機。",
      autoPlaceAlreadyInProgressMessage: "系統正在自動定位，請稍候。",
      revealPreparingMessage: "定位完成，準備揭曉相簿。",
      revealInProgressMessage: "倒數中，請保持手機穩定。",
      placedMessage: "相簿已鎖定在原地，點卡片可互動。",
      lockedPlacementMessage: "定位已鎖定；若要重新定位請重新整理頁面。",
      allVideosPlayingMessage: "所有影片已開始播放。",
      allVideosPausedMessage: "所有影片已暫停。",
      videoTapPlayMessage: "影片播放中，再點一次可暫停。",
      videoTapPauseMessage: "影片已暫停。",
      photoExpandedMessage: "照片已放大，再點一次可還原。",
      photoCollapsedMessage: "照片已還原。",
      playAllLabel: "播放派對影片",
      pauseAllLabel: "暫停派對影片",
      revealingBlockedMessage: "揭曉進行中，請稍候。",
    },
  };
})();
