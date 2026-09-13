"use client";

import Header from "@cloudscape-design/components/header";
import Link from "@cloudscape-design/components/link";
import Table from "@cloudscape-design/components/table";
import TableCell from "@/components/table-cell";
import type { MusicListResponse } from "@/lib/api";

export default function MusicTable({ data }: { data: MusicListResponse }) {
	return (
		<Table
			columnDefinitions={[
				{
					header: <TableCell>タイトル</TableCell>,
					cell: (item) => (
						<TableCell>
							<Link href={`/musics/${encodeURIComponent(item.music.id)}`}>
								{item.music.title}
							</Link>
						</TableCell>
					),
				},
				{
					header: <TableCell>アーティスト</TableCell>,
					cell: (item) => <TableCell>{item.music.artist}</TableCell>,
				},
				{
					header: <TableCell>BPM</TableCell>,
					cell: (item) => <TableCell>{item.music.bpm}</TableCell>,
				},
				{
					header: <TableCell>登録日時</TableCell>,
					cell: (item) => (
						<TableCell>
							{new Date(item.music.registrationDate).toLocaleDateString(
								"ja-JP",
							)}
						</TableCell>
					),
				},
			]}
			items={data.items}
			header={<Header counter={`(${data.items.length})`}>楽曲一覧</Header>}
			empty={<span>楽曲がありません。</span>}
		/>
	);
}
