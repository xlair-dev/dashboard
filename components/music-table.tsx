"use client";

import Header from "@cloudscape-design/components/header";
import Link from "@cloudscape-design/components/link";
import Table from "@cloudscape-design/components/table";

import type { MusicListResponse } from "@/lib/api";

export default function MusicTable({ data }: { data: MusicListResponse }) {
	return (
		<div>
			<Header counter={`(${data.items.length})`}>楽曲一覧</Header>
			<div className="px-4 sm:px-6">
				<Table
					columnDefinitions={[
						{
							header: "タイトル",
							cell: (item) => (
								<Link href={`/musics/${encodeURIComponent(item.music.id)}`}>
									{item.music.title}
								</Link>
							),
						},
						{
							header: "アーティスト",
							cell: (item) => item.music.artist,
						},
						{
							header: "BPM",
							cell: (item) => item.music.bpm,
						},
						{
							header: "登録日時",
							cell: (item) =>
								new Date(item.music.registrationDate).toLocaleDateString(
									"ja-JP",
								),
						},
					]}
					items={data.items}
					empty={<span>楽曲がありません。</span>}
				/>
			</div>
		</div>
	);
}
