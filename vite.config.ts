import { warn } from "console";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd());

  return {
    assetsInclude: ["**/*.html"],
    server: {
      port: 4200,
    },
    build: {
      target: "esnext",
    },
    resolve: {
      alias: {
        "@root": "/src",
        "@components": "/src/components",
        "@systems": "/src/systems",
        "@libs": "/src/libs",
        "@shared": "/src/shared",
        "@game-modes": "/src/game-modes",
      },
    },
    // Expose env variables to the client
    define: {
      "process.env": env,
    },
  };
});
