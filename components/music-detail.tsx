"use client";

import Button from "@cloudscape-design/components/button";
import Container from "@cloudscape-design/components/container";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import dynamic from "next/dynamic";

import DashboardLayout from "@/components/dashboard-layout";
import type { MusicWithSheets } from "@/lib/api";

const MusicSheetsTable = dynamic(
	() => import("@/components/music-sheets-table"),
	{
		ssr: false,
	},
);

const difficultyLabels = {
	easy: "Easy",
	normal: "Normal",
	hard: "Hard",
} as const;

export default function MusicDetail({ data }: { data: MusicWithSheets }) {
	const { music } = data;

	return (
		<DashboardLayout activeHref="/musics">
			<ContentLayout
				header={
					<Header
						variant="h1"
						actions={
							<SpaceBetween direction="horizontal" size="s">
								<Button href={`/musics/${music.id}/edit`}>編集</Button>
								<Button href="/musics">楽曲一覧に戻る</Button>
							</SpaceBetween>
						}
					>
						{music.title}
					</Header>
				}
			>
				<SpaceBetween size="l">
					<Container header={<Header variant="h2">楽曲情報</Header>}>
						<dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
							<DetailItem label="タイトル" value={music.title} />
							<DetailItem label="アーティスト" value={music.artist} />
							<DetailItem label="BPM" value={String(music.bpm)} />
							<DetailItem label="ジャンル" value={music.genre} />
							<DetailItem label="ジャケット" value={music.jacket} />
							<DetailItem
								label="登録日時"
								value={new Date(music.registrationDate).toISOString()}
							/>
							<DetailItem
								label="テスト楽曲"
								value={music.isTest ? "はい" : "いいえ"}
							/>
						</dl>
					</Container>
					<Container header={<Header variant="h2">譜面</Header>}>
						<MusicSheetsTable
							sheets={data.sheets.map((sheet) => ({
								...sheet,
								difficultyLabel: difficultyLabels[sheet.difficulty],
							}))}
						/>
					</Container>
				</SpaceBetween>
			</ContentLayout>
		</DashboardLayout>
	);
}

function DetailItem({ label, value }: { label: string; value: string }) {
	return (
		<div>
			<dt className="font-semibold">{label}</dt>
			<dd className="break-words">{value}</dd>
		</div>
	);
}
