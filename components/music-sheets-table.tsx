"use client";

import Header from "@cloudscape-design/components/header";
import Table from "@cloudscape-design/components/table";

import type { Sheet } from "@/lib/api";

type SheetWithLabel = Sheet & { difficultyLabel: string };

export default function MusicSheetsTable({
	sheets,
}: {
	sheets: SheetWithLabel[];
}) {
	return (
		<Table
			columnDefinitions={[
				{ header: "難易度", cell: (item) => item.difficultyLabel },
				{ header: "レベル", cell: (item) => item.level },
				{ header: "譜面制作者", cell: (item) => item.notesDesigner },
			]}
			items={sheets}
			header={<Header counter={`(${sheets.length})`}>譜面一覧</Header>}
			empty={<span>譜面がありません。</span>}
		/>
	);
}
