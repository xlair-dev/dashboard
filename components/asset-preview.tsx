"use client";

import Link from "@cloudscape-design/components/link";
import Modal from "@cloudscape-design/components/modal";
import SpaceBetween from "@cloudscape-design/components/space-between";
import { useEffect, useState } from "react";

type PreviewType = "audio" | "chart";

function proxyUrl(url: string) {
	const path = new URL(url, window.location.origin).pathname;
	return `/api/assets${path}`;
}

export default function AssetPreview({
	type,
	url,
	file,
	label,
}: {
	type: PreviewType;
	url?: string | null;
	file?: File;
	label: string;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const [source, setSource] = useState<string>();
	const [svg, setSvg] = useState<string>();
	const [error, setError] = useState<string>();

	useEffect(() => {
		if (file) {
			const objectUrl = URL.createObjectURL(file);
			setSource(objectUrl);
			return () => URL.revokeObjectURL(objectUrl);
		}
		setSource(url ? proxyUrl(url) : undefined);
	}, [file, url]);

	useEffect(() => {
		if (!isOpen || type !== "chart" || !source) return;
		const controller = new AbortController();
		setError(undefined);
		setSvg(undefined);
		(async () => {
			try {
				const response = await fetch(source, { signal: controller.signal });
				if (!response.ok)
					throw new Error("譜面ファイルを取得できませんでした。");
				const content = await response.text();
				const wasm = await import("@/lib/pjsekai-scores/pjsekai_scores_rs.js");
				await wasm.default();
				setSvg(wasm.Score.load(content).svg());
			} catch (cause) {
				if (!controller.signal.aborted)
					setError(
						cause instanceof Error
							? cause.message
							: "譜面を表示できませんでした。",
					);
			}
		})();
		return () => controller.abort();
	}, [isOpen, source, type]);

	if (!source) return null;
	return (
		<>
			<Link onFollow={() => setIsOpen(true)}>{label}</Link>
			<Modal
				visible={isOpen}
				onDismiss={() => setIsOpen(false)}
				header={label}
				closeAriaLabel="プレビューを閉じる"
				size="large"
			>
				<SpaceBetween size="s">
					{/* Audio previews contain no spoken content requiring captions. */}
					{/* biome-ignore lint/a11y/useMediaCaption: The preview is instrumental audio. */}
					{type === "audio" ? <audio controls src={source} /> : null}
					{type === "chart" && error ? <p>{error}</p> : null}
					{type === "chart" && !error && !svg ? (
						<p>譜面を読み込み中...</p>
					) : null}
					{type === "chart" && svg ? (
						<iframe
							title="譜面プレビュー"
							sandbox=""
							srcDoc={svg}
							className="h-[32rem] w-full border-0"
						/>
					) : null}
				</SpaceBetween>
			</Modal>
		</>
	);
}
