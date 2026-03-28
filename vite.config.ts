import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { defineConfig } from "vite";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/**
 * Сегменты HLS часто называют `.ts` (MPEG-TS). Vite иначе пытается прогнать их через esbuild как TypeScript.
 * Отдаём файлы под /tmp-hls-episode/ из demo/public как бинарные до остальных middleware.
 */
function serveHlsTsSegmentsAsBinary(): Plugin {
	const publicDir = path.join(projectRoot, "demo/public");
	return {
		name: "serve-hls-ts-segments-as-binary",
		enforce: "pre",
		configureServer(server) {
			server.middlewares.use((req, res, next) => {
				const raw = req.url?.split("?")[0] ?? "";
				if (!raw.startsWith("/tmp-hls-episode/") || !raw.endsWith(".ts")) {
					next();
					return;
				}
				const rel = raw.replace(/^\//, "");
				const filePath = path.join(publicDir, rel);
				if (!filePath.startsWith(publicDir)) {
					next();
					return;
				}
				if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
					res.statusCode = 404;
					res.end();
					return;
				}
				res.setHeader("Content-Type", "video/mp2t");
				res.setHeader("Cache-Control", "public, max-age=3600");
				fs.createReadStream(filePath).pipe(res);
			});
		},
	};
}

export default defineConfig({
	root: path.join(projectRoot, "demo"),
	plugins: [serveHlsTsSegmentsAsBinary(), react()],
	resolve: {
		alias: {
			"react-hls-player": path.join(projectRoot, "src/index.ts"),
		},
	},
	server: {
		port: 5173,
		open: true,
	},
	build: {
		/** Отдельно от `dist/` библиотеки (`tsc`): итог в `demo/dist`. */
		outDir: "dist",
		emptyOutDir: true,
	},
});
