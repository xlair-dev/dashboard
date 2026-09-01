"use client";

import Alert from "@cloudscape-design/components/alert";
import Button from "@cloudscape-design/components/button";
import Container from "@cloudscape-design/components/container";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";

import DashboardLayout from "@/components/dashboard-layout";

export default function MusicDetailError({ reset }: { reset: () => void }) {
	return (
		<DashboardLayout activeHref="/musics">
			<ContentLayout header={<Header variant="h1">楽曲管理</Header>}>
				<Container>
					<Alert type="error" header="楽曲を取得できませんでした">
						楽曲が存在しないか、一時的に取得できません。時間をおいて再試行してください。
					</Alert>
					<div className="mt-4">
						<SpaceBetween direction="horizontal" size="s">
							<Button href="/musics">楽曲一覧に戻る</Button>
							<Button onClick={reset}>再試行</Button>
						</SpaceBetween>
					</div>
				</Container>
			</ContentLayout>
		</DashboardLayout>
	);
}
