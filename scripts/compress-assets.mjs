import { spawnSync } from "node:child_process";
import { mkdirSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(scriptDir, "..");

const photoInputDir = join(rootDir, "assets", "photos", "generated");
const photoOutputDir = join(rootDir, "assets", "photos", "optimized");
const videoInputDir = join(rootDir, "assets", "videos", "generated");
const videoOutputDir = join(rootDir, "assets", "videos", "optimized");

const imageExtensions = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const videoExtensions = new Set([".mp4", ".mov", ".m4v", ".webm"]);

const toMegabytes = (bytes) => (bytes / (1024 * 1024)).toFixed(2);

const runCommand = (command, args) => {
  const result = spawnSync(command, args, { stdio: "inherit" });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`${command} exited with code ${result.status}`);
  }
};

const verifyFfmpeg = () => {
  const result = spawnSync("ffmpeg", ["-version"], { stdio: "ignore" });

  if (result.error || result.status !== 0) {
    throw new Error("ffmpeg is required but was not found on PATH.");
  }
};

const getFiles = (directory, allowedExtensions) =>
  readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => join(directory, entry.name))
    .filter((filePath) => allowedExtensions.has(extname(filePath).toLowerCase()))
    .sort((left, right) => left.localeCompare(right));

const compressImage = (inputPath) => {
  const outputPath = join(
    photoOutputDir,
    `${basename(inputPath, extname(inputPath))}.jpg`,
  );

  const args = [
    "-y",
    "-i",
    inputPath,
    "-vf",
    "scale='if(gt(iw,ih),1600,-2)':'if(gt(iw,ih),-2,1600)':flags=lanczos",
    "-frames:v",
    "1",
    "-q:v",
    "4",
    outputPath,
  ];

  runCommand("ffmpeg", args);

  return {
    name: basename(outputPath),
    beforeBytes: statSync(inputPath).size,
    afterBytes: statSync(outputPath).size,
  };
};

const compressVideo = (inputPath) => {
  const outputPath = join(videoOutputDir, `${basename(inputPath, extname(inputPath))}.mp4`);

  const args = [
    "-y",
    "-i",
    inputPath,
    "-map",
    "0:v:0",
    "-map",
    "0:a?",
    "-vf",
    "scale='if(gt(iw,ih),960,-2)':'if(gt(iw,ih),-2,960)':flags=lanczos,fps=30",
    "-c:v",
    "libx264",
    "-preset",
    "slow",
    "-crf",
    "28",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    "-c:a",
    "aac",
    "-b:a",
    "96k",
    outputPath,
  ];

  runCommand("ffmpeg", args);

  return {
    name: basename(outputPath),
    beforeBytes: statSync(inputPath).size,
    afterBytes: statSync(outputPath).size,
  };
};

const printSummary = (label, results) => {
  const beforeBytes = results.reduce((total, result) => total + result.beforeBytes, 0);
  const afterBytes = results.reduce((total, result) => total + result.afterBytes, 0);

  console.log(`\n${label} summary:`);
  console.log(`  before: ${toMegabytes(beforeBytes)} MB`);
  console.log(`  after:  ${toMegabytes(afterBytes)} MB`);
  console.log(`  saved:  ${toMegabytes(beforeBytes - afterBytes)} MB`);
};

const main = () => {
  verifyFfmpeg();
  mkdirSync(photoOutputDir, { recursive: true });
  mkdirSync(videoOutputDir, { recursive: true });

  const photoFiles = getFiles(photoInputDir, imageExtensions);
  const videoFiles = getFiles(videoInputDir, videoExtensions);

  console.log(`Compressing ${photoFiles.length} photos into ${photoOutputDir}`);
  const photoResults = photoFiles.map((filePath) => compressImage(filePath));

  console.log(`\nCompressing ${videoFiles.length} videos into ${videoOutputDir}`);
  const videoResults = videoFiles.map((filePath) => compressVideo(filePath));

  printSummary("Photos", photoResults);
  printSummary("Videos", videoResults);
};

main();