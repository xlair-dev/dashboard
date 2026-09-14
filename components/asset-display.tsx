import Button from "@cloudscape-design/components/button";
import Icon from "@cloudscape-design/components/icon";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Image from "next/image";

import type { Sheet } from "@/lib/api";

type AssetType = "jacket" | "audio" | "chart";

type AssetDisplayProps = {
	type: AssetType;
	url: string | null;
	updatedAt: string | null;
	label?: string;
	showUpdatedAt?: boolean;
};

const assetLabels: Record<AssetType, string> = {
	jacket: "ジャケット",
	audio: "音源",
	chart: "譜面",
};

function formatUpdatedAt(value: string | null) {
	return value
		? new Date(value).toLocaleString("ja-JP")
		: "アップロード日時不明";
}

export function AssetDisplay({
	type,
	url,
	updatedAt,
	label,
	showUpdatedAt = true,
}: AssetDisplayProps) {
	const hasAsset = Boolean(url);
	const displayLabel = label ?? assetLabels[type];

	return (
		<div className="flex min-h-12 items-center gap-3">
			<div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded border border-slate-300">
				{type === "jacket" && url ? (
					<Image
						src={url}
						alt="ジャケット"
						width={32}
						height={32}
						loading="eager"
						className="size-8 object-cover"
						unoptimized
					/>
				) : (
					<Icon
						name={type === "audio" ? "audio-full" : "file"}
						variant={hasAsset ? "normal" : "disabled"}
						className={hasAsset ? "text-cyan-500" : "text-slate-400"}
						ariaLabel={displayLabel}
					/>
				)}
			</div>
			<div className="min-w-0">
				<div className="truncate">{hasAsset ? displayLabel : "なし"}</div>
				{hasAsset && showUpdatedAt && (
					<div className="text-sm text-slate-600">
						{formatUpdatedAt(updatedAt)}
					</div>
				)}
			</div>
		</div>
	);
}

export function chartAssetDisplay(sheet: Sheet, label?: string) {
	return (
		<AssetDisplay
			type="chart"
			url={sheet.chart?.url ?? null}
			updatedAt={sheet.chart?.updatedAt ?? null}
			label={label}
		/>
	);
}

export function PendingAssetDisplay({
	type,
	fileName,
	previewUrl,
	onRemove,
}: {
	type: AssetType;
	fileName: string;
	previewUrl?: string;
	onRemove: () => void;
}) {
	const label = assetLabels[type];

	return (
		<div className="rounded-[8px] border-2 border-[#006ce0] bg-[#f0fbff] p-4">
			<SpaceBetween direction="horizontal" size="s" alignItems="center">
				<SpaceBetween direction="horizontal" size="s" alignItems="center">
					<div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded border border-slate-300">
						{type === "jacket" && previewUrl ? (
							<Image
								src={previewUrl}
								alt="ジャケット"
								width={32}
								height={32}
								className="size-8 object-cover"
								unoptimized
							/>
						) : (
							<Icon
								name={type === "audio" ? "audio-full" : "file"}
								className="text-cyan-500"
								ariaLabel={label}
							/>
						)}
					</div>
					<span className="break-all">{fileName}</span>
				</SpaceBetween>
				<Button
					variant="icon"
					iconName="close"
					ariaLabel={`${label}を選択解除`}
					onClick={onRemove}
				/>
			</SpaceBetween>
		</div>
	);
}
