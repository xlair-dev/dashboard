"use client";

import Link from "@cloudscape-design/components/link";
import Modal from "@cloudscape-design/components/modal";
import SpaceBetween from "@cloudscape-design/components/space-between";
import { useEffect, useRef, useState } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

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
	const [chartSource, setChartSource] = useState<string>();
	const [error, setError] = useState<string>();
	const audioRef = useRef<HTMLAudioElement>(null);

	useEffect(() => {
		if (file) {
			const objectUrl = URL.createObjectURL(file);
			setSource(objectUrl);
			return () => URL.revokeObjectURL(objectUrl);
		}
		setSource(url ? proxyUrl(url) : undefined);
	}, [file, url]);

	useEffect(() => {
		if (!isOpen) audioRef.current?.pause();
	}, [isOpen]);

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

	useEffect(() => {
		if (!svg) {
			setChartSource(undefined);
			return;
		}
		const objectUrl = URL.createObjectURL(
			new Blob([svg], { type: "image/svg+xml" }),
		);
		setChartSource(objectUrl);
		return () => URL.revokeObjectURL(objectUrl);
	}, [svg]);

	if (!source) return null;
	return (
		<>
			<Link className="font-bold no-underline" onFollow={() => setIsOpen(true)}>
				{label}
			</Link>
			<Modal
				visible={isOpen}
				onDismiss={() => setIsOpen(false)}
				header={`${label}プレビュー`}
				closeAriaLabel="プレビューを閉じる"
				size="large"
			>
				<SpaceBetween size="s">
					{/* Audio previews contain no spoken content requiring captions. */}
					{type === "audio" ? (
						<>
							{/* Audio previews contain no spoken content requiring captions. */}
							{/* biome-ignore lint/a11y/useMediaCaption: The preview is instrumental audio. */}
							<audio ref={audioRef} controls src={source} />
						</>
					) : null}
					{type === "chart" && error ? <p>{error}</p> : null}
					{type === "chart" && !error && !svg ? (
						<p>譜面を読み込み中...</p>
					) : null}
					{type === "chart" && chartSource ? (
						<TransformWrapper
							centerOnInit
							minScale={0.5}
							maxScale={4}
							wheel={{ disabled: true }}
						>
							<TransformComponent
								wrapperClass="h-[32rem] w-full cursor-grab bg-white active:cursor-grabbing"
								contentClass="min-h-full min-w-full"
							>
								{/* The SVG is generated locally and cannot be optimized by next/image. */}
								{/* biome-ignore lint/performance/noImgElement: Blob URLs are not supported by next/image optimization. */}
								<img alt="" className="block max-w-none" src={chartSource} />
							</TransformComponent>
						</TransformWrapper>
					) : null}
				</SpaceBetween>
			</Modal>
		</>
	);
}
