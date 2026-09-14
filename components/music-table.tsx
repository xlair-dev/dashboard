"use client";

import CopyToClipboard from "@cloudscape-design/components/copy-to-clipboard";
import Header from "@cloudscape-design/components/header";
import Link from "@cloudscape-design/components/link";
import Table from "@cloudscape-design/components/table";
import Image from "next/image";

import type { MusicListResponse } from "@/lib/api";

export default function MusicTable({ data }: { data: MusicListResponse }) {
	const eagerJacketMusicId = data.items[0]?.music.id;

	return (
		<Table
			className="px-4 sm:px-6"
			variant="container"
			header={<Header counter={`(${data.items.length})`}>楽曲一覧</Header>}
			columnDefinitions={[
				{
					header: "ジャケット",
					cell: (item) => (
						<div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded border border-slate-300">
							{item.music.jacket ? (
								<Image
									src={item.music.jacket.url}
									alt={`${item.music.title} のジャケット`}
									width={32}
									height={32}
									loading={
										item.music.id === eagerJacketMusicId ? "eager" : "lazy"
									}
									className="size-8 object-cover"
									unoptimized
								/>
							) : (
								<span className="text-xs text-slate-500">なし</span>
							)}
						</div>
					),
				},
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
						new Date(item.music.registrationDate).toLocaleDateString("ja-JP"),
				},
				{
					header: "ID",
					cell: (item) => (
						<CopyToClipboard
							variant="inline"
							textToCopy={item.music.id}
							copySuccessText="コピーしました"
							copyErrorText="コピーに失敗しました"
							copyButtonAriaLabel="楽曲 ID をコピー"
						/>
					),
				},
			]}
			items={data.items}
			empty={<span>楽曲がありません。</span>}
		/>
	);
}
