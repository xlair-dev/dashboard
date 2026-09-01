"use client";

import AppLayout from "@cloudscape-design/components/app-layout";
import Button from "@cloudscape-design/components/button";
import Container from "@cloudscape-design/components/container";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import TopNavigation from "@cloudscape-design/components/top-navigation";
import dynamic from "next/dynamic";

import type { MusicListResponse } from "@/lib/api";

const MusicTable = dynamic(() => import("@/components/music-table"), {
	ssr: false,
});

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
								<MusicTable data={data} />
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
