import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: "standalone",
	experimental: {
		serverActions: {
			bodySizeLimit: "35mb",
		},
	},
	transpilePackages: [
		"@cloudscape-design/components",
		"@cloudscape-design/component-toolkit",
	],
};

export default nextConfig;
