import type { ChartFormat } from "@xlair-dev/chart-viewer";

function decodeChartSource(bytes: Uint8Array): string {
	if (bytes[0] === 0xff && bytes[1] === 0xfe) {
		return new TextDecoder("utf-16le", { fatal: true }).decode(
			bytes.subarray(2),
		);
	}
	if (bytes[0] === 0xfe && bytes[1] === 0xff) {
		return new TextDecoder("utf-16be", { fatal: true }).decode(
			bytes.subarray(2),
		);
	}
	const source =
		bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf
			? bytes.subarray(3)
			: bytes;
	return new TextDecoder("utf-8", { fatal: true }).decode(source);
}

export function chartFormat(bytes: Uint8Array): ChartFormat {
	const lines = decodeChartSource(bytes).split(/\r?\n/);
	const headerLines: string[] = [];
	for (const rawLine of lines) {
		const line = rawLine.trim();
		if (!line || line.startsWith("'")) continue;
		headerLines.push(line);
	}
	if (headerLines.some((line) => line.startsWith("RESOLUTION\t"))) return "c2s";
	const firstHashLine = headerLines.findIndex((line) => line.startsWith("#"));
	if (
		headerLines.some(
			(line, index) =>
				line === "@ENDHEAD" && (firstHashLine < 0 || index < firstHashLine),
		)
	) {
		return "ugc";
	}
	if (firstHashLine >= 0) return "sus";
	throw new Error("譜面のヘッダーから形式を判定できません。");
}
