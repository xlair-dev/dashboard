"use client";

import Button from "@cloudscape-design/components/button";
import Link from "@cloudscape-design/components/link";
import Modal from "@cloudscape-design/components/modal";
import Select from "@cloudscape-design/components/select";
import SpaceBetween from "@cloudscape-design/components/space-between";
import {
	audioSecondsAtBeat,
	type ChartData,
	ChartViewer,
	type ChartViewMode,
	chartEndBeat,
	parseChartBytes,
	positionAtAudioSeconds,
	supportsChartTiming,
} from "@xlair-dev/chart-viewer";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { chartFormat } from "@/lib/chart-format";

type PreviewType = "audio" | "chart" | "jacket";

function proxyUrl(url: string) {
	const path = new URL(url, window.location.origin).pathname;
	return `/api/assets${path}`;
}

export default function AssetPreview({
	type,
	url,
	file,
	label,
	downloadUrl,
	companionAudio,
}: {
	type: PreviewType;
	url?: string | null;
	file?: File;
	label: string;
	downloadUrl?: string;
	companionAudio?: { url?: string | null; file?: File };
}) {
	const [isOpen, setIsOpen] = useState(false);
	const [source, setSource] = useState<string>();
	const [audioSource, setAudioSource] = useState<string>();
	const [chart, setChart] = useState<ChartData>();
	const [position, setPosition] = useState(0);
	const [mode, setMode] = useState<ChartViewMode>("both");
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
		const audioFile = companionAudio?.file;
		if (audioFile) {
			const objectUrl = URL.createObjectURL(audioFile);
			setAudioSource(objectUrl);
			return () => URL.revokeObjectURL(objectUrl);
		}
		setAudioSource(
			companionAudio?.url ? proxyUrl(companionAudio.url) : undefined,
		);
	}, [companionAudio?.file, companionAudio?.url]);

	useEffect(() => {
		if (!isOpen) audioRef.current?.pause();
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen || type !== "chart" || !source) return;
		const controller = new AbortController();
		setError(undefined);
		setChart(undefined);
		setPosition(0);
		(async () => {
			try {
				const response = await fetch(source, { signal: controller.signal });
				if (!response.ok)
					throw new Error("譜面ファイルを取得できませんでした。");
				const bytes = new Uint8Array(await response.arrayBuffer());
				setChart(await parseChartBytes(bytes, chartFormat(bytes)));
			} catch (cause) {
				if (!controller.signal.aborted)
					setError(
						cause instanceof Error
							? cause.message
							: typeof cause === "string"
								? cause
								: "譜面を表示できませんでした。",
					);
			}
		})();
		return () => controller.abort();
	}, [isOpen, source, type]);

	const syncPosition = useCallback(() => {
		const audio = audioRef.current;
		if (chart && audio && supportsChartTiming(chart)) {
			setPosition(positionAtAudioSeconds(chart, audio.currentTime));
		}
	}, [chart]);

	useEffect(() => {
		const audio = audioRef.current;
		if (!isOpen || type !== "chart" || !chart || !audio || audio.paused) return;
		let frame = 0;
		const update = () => {
			syncPosition();
			frame = requestAnimationFrame(update);
		};
		frame = requestAnimationFrame(update);
		return () => cancelAnimationFrame(frame);
	}, [chart, isOpen, syncPosition, type]);

	const seek = (beat: number) => {
		setPosition(beat);
		const audio = audioRef.current;
		if (chart && audio && supportsChartTiming(chart)) {
			audio.currentTime = audioSecondsAtBeat(chart, beat);
		}
	};

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
				footer={
					downloadUrl ? (
						<Button href={downloadUrl} iconName="download">
							ダウンロード
						</Button>
					) : null
				}
			>
				<SpaceBetween size="s">
					{type === "audio" || (type === "chart" && audioSource) ? (
						<>
							{/* biome-ignore lint/a11y/useMediaCaption: The preview is instrumental audio. */}
							<audio
								ref={audioRef}
								controls
								src={type === "audio" ? source : audioSource}
								onTimeUpdate={syncPosition}
								onSeeked={syncPosition}
							/>
						</>
					) : null}
					{type === "jacket" ? (
						<div className="relative h-[min(70vh,48rem)] w-full">
							<Image
								src={source}
								alt={`${label}プレビュー`}
								fill
								sizes="(max-width: 820px) 100vw, 780px"
								className="object-contain"
								unoptimized
							/>
						</div>
					) : null}
					{type === "chart" && error ? <p>{error}</p> : null}
					{type === "chart" && !error && !chart ? (
						<p>譜面を読み込み中...</p>
					) : null}
					{type === "chart" && chart ? (
						<>
							<div className="flex items-center gap-2">
								<span>表示</span>
								<Select
									ariaLabel="表示"
									selectedOption={{
										label:
											mode === "sheet"
												? "譜面"
												: mode === "playfield"
													? "ゲーム画面"
													: "両方",
										value: mode,
									}}
									options={[
										{ label: "譜面", value: "sheet" },
										{ label: "ゲーム画面", value: "playfield" },
										{ label: "両方", value: "both" },
									]}
									onChange={({ detail }) =>
										setMode(detail.selectedOption.value as ChartViewMode)
									}
								/>
							</div>
							<ChartViewer
								chart={chart}
								mode={mode}
								position={position}
								onPositionChange={seek}
								showSeekBar={false}
							/>
							<label className="flex items-center gap-3">
								<span className="whitespace-nowrap">
									{position.toFixed(2)} 拍
								</span>
								<input
									aria-label="譜面の再生位置"
									className="w-full"
									type="range"
									min={0}
									max={chartEndBeat(chart)}
									step={0.01}
									value={Math.min(position, chartEndBeat(chart))}
									onChange={(event) => seek(Number(event.target.value))}
								/>
							</label>
							{audioSource && !supportsChartTiming(chart) ? (
								<p>この譜面には音源と同期するための BPM 情報がありません。</p>
							) : null}
						</>
					) : null}
				</SpaceBetween>
			</Modal>
		</>
	);
}
