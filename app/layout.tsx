import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
	title: "XLAIR Dashboard",
	description: "XLAIR 管理者用ダッシュボード",
};

export default function RootLayout({
	children,
}: Readonly<{ children: ReactNode }>) {
	return (
		<html lang="ja">
			<body>{children}</body>
		</html>
	);
}
