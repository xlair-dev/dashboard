"use client";

import AppLayout from "@cloudscape-design/components/app-layout";
import SideNavigation from "@cloudscape-design/components/side-navigation";
import TopNavigation from "@cloudscape-design/components/top-navigation";
import type { ReactNode } from "react";

const navigationItems = [
	{ type: "link" as const, text: "ホーム", href: "/" },
	{ type: "link" as const, text: "楽曲管理", href: "/musics" },
];

export default function DashboardLayout({
	activeHref,
	children,
}: {
	activeHref: string;
	children: ReactNode;
}) {
	return (
		<div className="min-h-screen min-w-80">
			<TopNavigation
				id="dashboard-header"
				identity={{ href: "/", title: "XLAIR Dashboard" }}
			/>
			<AppLayout
				headerSelector="#dashboard-header"
				navigation={
					<SideNavigation
						activeHref={activeHref}
						header={{ href: "/", text: "XLAIR Dashboard" }}
						items={navigationItems}
					/>
				}
				// Remove toolsHide when an AppLayout tools panel is introduced.
				toolsHide
				content={children}
			/>
		</div>
	);
}
