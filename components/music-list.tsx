"use client";

import AppLayout from "@cloudscape-design/components/app-layout";
import Button from "@cloudscape-design/components/button";
import Container from "@cloudscape-design/components/container";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Table from "@cloudscape-design/components/table";
import TopNavigation from "@cloudscape-design/components/top-navigation";

import type { MusicListResponse } from "@/lib/api";

export default function MusicList({
	data,
	limit,
}: {
	data: MusicListResponse;
	limit?: number;
}) {
	const nextPageHref = data.nextCursor
		? `/musics?${new URLSearchParams({
				cursor: data.nextCursor,
				...(limit ? { limit: String(limit) } : {}),
			}).toString()}`
		: undefined;

	return (
		<div className="min-h-screen min-w-80">
			<TopNavigation
				id="dashboard-header"
				identity={{ href: "/", title: "XLAIR Dashboard" }}
			/>
			<AppLayout
				headerSelector="#dashboard-header"
				// Remove toolsHide when an AppLayout tools panel is introduced.
				toolsHide
				content={
					<ContentLayout
						header={
							<Header actions={<Button href="/">ホーム</Button>} variant="h1">
								楽曲管理
							</Header>
						}
					>
						<Container>
							<SpaceBetween size="m">
								<Table
									columnDefinitions={[
										{ header: "タイトル", cell: (item) => item.music.title },
										{
											header: "アーティスト",
											cell: (item) => item.music.artist,
										},
										{ header: "BPM", cell: (item) => item.music.bpm },
										{ header: "譜面", cell: (item) => item.sheets.length },
										{
											header: "登録日時",
											cell: (item) =>
												new Date(item.music.registrationDate).toLocaleString(
													"ja-JP",
												),
										},
									]}
									items={data.items}
									header={
										<Header counter={`(${data.items.length})`}>楽曲一覧</Header>
									}
									empty={<span>楽曲がありません。</span>}
								/>
								<div className="flex justify-end">
									<Button disabled={!nextPageHref} href={nextPageHref}>
										次へ
									</Button>
								</div>
							</SpaceBetween>
						</Container>
					</ContentLayout>
				}
			/>
		</div>
	);
}
