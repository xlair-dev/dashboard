"use client";

import Button from "@cloudscape-design/components/button";
import Container from "@cloudscape-design/components/container";
import ContentLayout from "@cloudscape-design/components/content-layout";
import CopyToClipboard from "@cloudscape-design/components/copy-to-clipboard";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { AssetDisplay, chartAssetDisplay } from "@/components/asset-display";
import DashboardLayout from "@/components/dashboard-layout";
import MusicBreadcrumbs from "@/components/music-breadcrumbs";
import StickyPageHeader from "@/components/sticky-page-header";
import type { MusicWithSheets } from "@/lib/api";

const MusicSheetsTable = dynamic(
	() => import("@/components/music-sheets-table"),
	{
		ssr: false,
	},
);

const difficultyLabels = {
	basic: "Basic",
	advanced: "Advanced",
	master: "Master",
} as const;

const difficultyColumns = {
	basic: "md:col-start-1",
	advanced: "md:col-start-2",
	master: "md:col-start-3",
} as const;

export default function MusicDetail({ data }: { data: MusicWithSheets }) {
	const { music } = data;

	return (
		<DashboardLayout activeHref="/musics">
			<ContentLayout
				header={
					<StickyPageHeader>
						<Header
							variant="h1"
							actions={<Button href={`/musics/${music.id}/edit`}>編集</Button>}
						>
							{music.title}
						</Header>
					</StickyPageHeader>
				}
				breadcrumbs={
					<MusicBreadcrumbs
						current={music.title}
						currentHref={`/musics/${encodeURIComponent(music.id)}`}
					/>
				}
			>
				<SpaceBetween size="l">
					<Container header={<Header variant="h2">楽曲情報</Header>}>
						<dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
							<DetailItem
								label="ID"
								value={
									<CopyToClipboard
										variant="inline"
										textToCopy={music.id}
										copySuccessText="コピーしました"
										copyErrorText="コピーに失敗しました"
										copyButtonAriaLabel="楽曲 ID をコピー"
									/>
								}
							/>
							<DetailItem label="タイトル" value={music.title} />
							<DetailItem label="アーティスト" value={music.artist} />
							<DetailItem label="BPM" value={String(music.bpm)} />
							<DetailItem label="ジャンル" value={music.genre} />
							<DetailItem
								label="登録日時"
								value={new Date(music.registrationDate).toLocaleDateString(
									"ja-JP",
								)}
							/>
							<DetailItem
								label="テスト楽曲"
								value={music.isTest ? "はい" : "いいえ"}
							/>
						</dl>
					</Container>
					<Container header={<Header variant="h2">アセット</Header>}>
						<SpaceBetween size="l">
							<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
								<AssetDisplay
									type="jacket"
									url={music.jacket?.url ?? null}
									updatedAt={music.jacket?.updatedAt ?? null}
								/>
								<div className="md:col-start-2">
									<AssetDisplay
										type="audio"
										url={music.audio?.url ?? null}
										updatedAt={music.audio?.updatedAt ?? null}
										preview="audio"
									/>
								</div>
								{data.sheets.map((sheet) => (
									<div
										key={sheet.id}
										className={difficultyColumns[sheet.difficulty]}
									>
										{chartAssetDisplay(
											sheet,
											`${difficultyLabels[sheet.difficulty]} 譜面`,
										)}
									</div>
								))}
							</div>
						</SpaceBetween>
					</Container>
					<MusicSheetsTable
						sheets={data.sheets.map((sheet) => ({
							...sheet,
							difficultyLabel: difficultyLabels[sheet.difficulty],
						}))}
					/>
				</SpaceBetween>
			</ContentLayout>
		</DashboardLayout>
	);
}

function DetailItem({ label, value }: { label: string; value: ReactNode }) {
	return (
		<div>
			<dt className="font-semibold">{label}</dt>
			<dd className="break-words">{value}</dd>
		</div>
	);
}
