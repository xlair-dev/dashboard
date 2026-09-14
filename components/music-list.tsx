"use client";

import Button from "@cloudscape-design/components/button";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import dynamic from "next/dynamic";

import DashboardLayout from "@/components/dashboard-layout";
import MusicBreadcrumbs from "@/components/music-breadcrumbs";
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
		<DashboardLayout
			activeHref="/musics"
			breadcrumbs={<MusicBreadcrumbs />}
			contentHeader={<Header variant="h1">楽曲管理</Header>}
		>
			<ContentLayout>
				<SpaceBetween size="m">
					<div className="flex justify-end">
						<Button variant="primary" href="/musics/new">
							楽曲を追加
						</Button>
					</div>
					<MusicTable data={data} />
					{nextPageHref ? (
						<div className="flex justify-end">
							<Button href={nextPageHref}>次へ</Button>
						</div>
					) : null}
				</SpaceBetween>
			</ContentLayout>
		</DashboardLayout>
	);
}
