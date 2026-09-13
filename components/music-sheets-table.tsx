"use client";

import Header from "@cloudscape-design/components/header";
import Table from "@cloudscape-design/components/table";
import TableCell from "@/components/table-cell";
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
				{
					header: <TableCell>難易度</TableCell>,
					cell: (item) => <TableCell>{item.difficultyLabel}</TableCell>,
				},
				{
					header: <TableCell>レベル</TableCell>,
					cell: (item) => <TableCell>{item.level}</TableCell>,
				},
				{
					header: <TableCell>譜面制作者</TableCell>,
					cell: (item) => <TableCell>{item.notesDesigner}</TableCell>,
				},
			]}
			items={sheets}
			header={<Header counter={`(${sheets.length})`}>譜面一覧</Header>}
			empty={<span>譜面がありません。</span>}
		/>
	);
}
