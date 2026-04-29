import { defineConfig } from "vitest/config";
export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		include: [
			"test/vitest/**/*.test.js"
		],
		exclude: [
			"test/jest/**",
			"tests/**",
			"node_modules/**"
		],
		watch: false
	}
});
