/**
 * Vercel build — bundles src/vercel.ts (Express app export, no server.listen)
 * into api/index.js at the repo root so Vercel can serve it as a serverless function.
 */
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";
import { rm, mkdir } from "node:fs/promises";

globalThis.require = createRequire(import.meta.url);

const artifactDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(artifactDir, "../..");
const outDir = path.resolve(repoRoot, "api");

async function buildVercel() {
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  await esbuild({
    entryPoints: [path.resolve(artifactDir, "src/vercel.ts")],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: path.resolve(outDir, "index.js"),
    logLevel: "info",
    external: [
      "*.node",
      "sharp",
      "better-sqlite3",
      "sqlite3",
      "canvas",
      "bcrypt",
      "argon2",
      "fsevents",
      "re2",
      "pg-native",
      "pino-pretty",
    ],
    sourcemap: false,
    banner: {
      js: `"use strict";`,
    },
  });

  console.log("Vercel API bundle written to api/index.js");
}

buildVercel().catch((err) => {
  console.error(err);
  process.exit(1);
});
