"use client";

import Header from "@cloudscape-design/components/header";
import Table from "@cloudscape-design/components/table";

import type { MusicListResponse } from "@/lib/api";

export default function MusicTable({ data }: { data: MusicListResponse }) {
	return (
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
						new Date(item.music.registrationDate).toLocaleString("ja-JP"),
				},
			]}
			items={data.items}
			header={<Header counter={`(${data.items.length})`}>楽曲一覧</Header>}
			empty={<span>楽曲がありません。</span>}
		/>
	);
}
