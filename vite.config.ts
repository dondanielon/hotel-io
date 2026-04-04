import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd());

  return {
    assetsInclude: ["**/*.html"],
    server: {
      port: 3000,
    },
    build: {
      target: "esnext",
    },
    resolve: {
      alias: {
        "@root": "/src",
        "@objects": "/src/objects",
        "@shared": "/src/shared",
        "@ui": "/src/ui",
        "@managers": "/src/managers",
      },
    },
    // Expose env variables to the client
    define: {
      "process.env": env,
    },
  };
});
