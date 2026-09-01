"use client";

import Button from "@cloudscape-design/components/button";
import Container from "@cloudscape-design/components/container";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import dynamic from "next/dynamic";

import DashboardLayout from "@/components/dashboard-layout";
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
		<DashboardLayout activeHref="/musics">
			<ContentLayout
				header={
					<Header
						variant="h1"
						actions={
							<Button variant="primary" href="/musics/new">
								楽曲を追加
							</Button>
						}
					>
						楽曲管理
					</Header>
				}
			>
				<Container>
					<SpaceBetween size="m">
						<MusicTable data={data} />
						{nextPageHref ? (
							<div className="flex justify-end">
								<Button href={nextPageHref}>次へ</Button>
							</div>
						) : null}
					</SpaceBetween>
				</Container>
			</ContentLayout>
		</DashboardLayout>
	);
}
