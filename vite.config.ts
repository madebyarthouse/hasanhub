import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig(({ command }) => {
  const isServe = command === "serve";

  return {
    plugins: [
      ...(isServe
        ? [
            cloudflare({
              // Disable the inspector to avoid EPERM on restricted dev ports.
              inspectorPort: false,
            }),
          ]
        : []),
      tailwindcss(),
      reactRouter(),
      tsconfigPaths(),
    ],
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
      ],
    },
    environments: {
      hasanhub_cloudflare: {
        build: {
          outDir: "build/worker",
          emptyOutDir: false,
        },
      },
    },
    ssr: {
      noExternal: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
      ],
      external: ["cloudflare:workers"],
    },
    build: {
      emptyOutDir: false,
      rollupOptions: {
        external: ["cloudflare:workers"],
      },
    },
  };
});
