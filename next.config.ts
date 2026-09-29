import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: "standalone",
	experimental: {
		proxyClientMaxBodySize: "65mb",
		serverActions: {
			bodySizeLimit: "65mb",
		},
	},
	transpilePackages: [
		"@cloudscape-design/components",
		"@cloudscape-design/component-toolkit",
	],
};

export default nextConfig;
