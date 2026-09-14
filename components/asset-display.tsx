import Icon from "@cloudscape-design/components/icon";
import Image from "next/image";

import type { Sheet } from "@/lib/api";

type AssetType = "jacket" | "audio" | "chart";

type AssetDisplayProps = {
	type: AssetType;
	url: string | null;
	updatedAt: string | null;
	fileName?: string;
	label?: string;
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
	fileName,
	label,
}: AssetDisplayProps) {
	const hasAsset = Boolean(url || fileName);
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
						ariaLabel={displayLabel}
					/>
				)}
			</div>
			<div className="min-w-0">
				<div className="truncate">
					{hasAsset ? (fileName ?? displayLabel) : "なし"}
				</div>
				{hasAsset && (
					<div className="text-sm text-slate-600">
						{fileName ? "保存後に反映" : formatUpdatedAt(updatedAt)}
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
			url={sheet.src}
			updatedAt={sheet.chartUpdatedAt}
			label={label}
		/>
	);
}
