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
      title: "Noah 01",
      src: "assets/photos/generated/photo01.jpg",
      frameColor: framePalette[0],
    },
    {
      title: "Noah 02",
      src: "assets/photos/generated/photo02.jpg",
      frameColor: framePalette[1],
    },
    {
      title: "Noah 03",
      src: "assets/photos/generated/photo03.jpg",
      frameColor: framePalette[2],
    },
    {
      title: "Noah 04",
      src: "assets/photos/generated/photo04.svg",
      frameColor: framePalette[3],
    },
    {
      title: "Noah 05",
      src: "assets/photos/generated/photo05.svg",
      frameColor: framePalette[4],
    },
    {
      title: "Noah 06",
      src: "assets/photos/generated/photo06.svg",
      frameColor: framePalette[5],
    },
    {
      title: "Noah 07",
      src: "assets/photos/generated/photo07.svg",
      frameColor: framePalette[0],
    },
    {
      title: "Noah 08",
      src: "assets/photos/generated/photo08.svg",
      frameColor: framePalette[1],
    },
    {
      title: "Noah 09",
      src: "assets/photos/generated/photo09.svg",
      frameColor: framePalette[2],
    },
    {
      title: "Noah 10",
      src: "assets/photos/generated/photo10.svg",
      frameColor: framePalette[3],
    },
    {
      title: "Noah 11",
      src: "assets/photos/generated/photo11.svg",
      frameColor: framePalette[4],
    },
    {
      title: "Noah 12",
      src: "assets/photos/generated/photo12.svg",
      frameColor: framePalette[5],
    },
  ];

  // Current mapping points to generated local videos.
  // Later you can replace the files with your real videos using same file names.
  const videos = [
    {
      title: "Party Clip 01",
      src: "assets/videos/generated/video01.mp4",
      frameColor: "#6ecbff",
      muted: true,
      loop: true,
    },
    {
      title: "Party Clip 02",
      src: "assets/videos/generated/video02.mp4",
      frameColor: "#ffca7a",
      muted: true,
      loop: true,
    },
    {
      title: "Party Clip 03",
      src: "assets/videos/generated/video03.mp4",
      frameColor: "#7cf7c1",
      muted: true,
      loop: true,
    },
    {
      title: "Party Clip 04",
      src: "assets/videos/generated/video04.mp4",
      frameColor: "#f5a0ff",
      muted: true,
      loop: true,
    },
  ];

  window.PARTY_CONFIG = {
    placement: {
      centerYOffset: 0,
      allowRelocateOnGroundTap: true,
      autoPlace: true,
      autoPlaceGroundY: 0,
    },

    layerOne: {
      radius: 3.35,
      height: 1.85,
      itemWidth: 1.02,
      itemHeight: 0.68,
      spinOffsetDeg: 8,
    },

    layerTwo: {
      radius: 1.45,
      height: 2.85,
      itemWidth: 0.96,
      itemHeight: 0.56,
      spinOffsetDeg: 45,
    },

    intro: {
      countdownSeconds: 3,
      revealLabel: "Ready to reveal your memory sky...",
      revealDoneLabel: "Happy Birthday Noah!",
    },

    desktopPreview: {
      autoPlace: true,
      autoPlaceGroundY: 0,
      relocateRequiresShift: true,
    },

    animation: {
      floatDistance: 0.065,
      floatDurationMs: 2600,
      popDurationMs: 340,
    },

    interaction: {
      photoFocusScale: 1.8,
      photoFocusMoveIn: 0.82,
      photoFocusLift: 0.08,
    },

    photos,
    videos,

    ui: {
      prompt: "Scan floor, then tap once to place Noah's gallery around you.",
      desktopPrompt:
        "Desktop preview mode: gallery auto-places for easier testing.",
      desktopStatus:
        "Desktop preview active. Drag mouse to look around and click cards.",
      desktopRelocateHint:
        "Desktop: hold Shift and click ground to reposition layout.",
      desktopHoverPhotoHint: "Photo is clickable. Left-click to expand.",
      desktopHoverVideoHint: "Video is clickable. Left-click to play or pause.",
      revealPreparingMessage: "Gallery anchored. Reveal starts now.",
      revealInProgressMessage: "Counting down... keep camera steady.",
      placedMessage: "Gallery revealed. Tap cards for interactions.",
      relocatedMessage: "Gallery moved to your current position.",
      relocatedWithCountdownMessage:
        "Gallery moved. 3-second reveal starts now.",
      allVideosPlayingMessage: "All videos are now playing.",
      allVideosPausedMessage: "All videos are now paused.",
      videoTapPlayMessage: "Video playing. Tap again to pause.",
      videoTapPauseMessage: "Video paused.",
      photoExpandedMessage: "Photo expanded. Tap same photo to restore.",
      photoCollapsedMessage: "Photo restored.",
      playAllLabel: "Play Party Videos",
      pauseAllLabel: "Pause Party Videos",
      revealingBlockedMessage: "Reveal in progress. Please wait.",
    },
  };
})();
