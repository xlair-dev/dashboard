import Button from "@cloudscape-design/components/button";
import Container from "@cloudscape-design/components/container";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";

import DashboardLayout from "@/components/dashboard-layout";

export default function DashboardHome({ userName }: { userName: string }) {
	return (
		<DashboardLayout activeHref="/">
			<ContentLayout header={<Header variant="h1">XLAIR Dashboard</Header>}>
				<Container>
					<SpaceBetween size="m">
						<div>管理者用ダッシュボードへようこそ、{userName} さん。</div>
						<Button href="/auth/logout">ログアウト</Button>
					</SpaceBetween>
				</Container>
			</ContentLayout>
		</DashboardLayout>
	);
}
