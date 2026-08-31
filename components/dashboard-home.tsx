"use client";

import AppLayout from "@cloudscape-design/components/app-layout";
import Button from "@cloudscape-design/components/button";
import Container from "@cloudscape-design/components/container";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import TopNavigation from "@cloudscape-design/components/top-navigation";

export default function DashboardHome({ userName }: { userName: string }) {
	return (
		<div className="min-h-screen min-w-80">
			<TopNavigation
				id="dashboard-header"
				identity={{ href: "/", title: "XLAIR Dashboard" }}
			/>
			<AppLayout
				headerSelector="#dashboard-header"
				// Remove toolsHide when an AppLayout tools panel is introduced.
				toolsHide
				content={
					<ContentLayout header={<Header variant="h1">XLAIR Dashboard</Header>}>
						<Container>
							<SpaceBetween size="m">
								<div>管理者用ダッシュボードへようこそ、{userName} さん。</div>
								<Button href="/musics">楽曲管理</Button>
								<Button href="/auth/logout">ログアウト</Button>
							</SpaceBetween>
						</Container>
					</ContentLayout>
				}
			/>
		</div>
	);
}
