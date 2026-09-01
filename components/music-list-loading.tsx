import Container from "@cloudscape-design/components/container";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import Spinner from "@cloudscape-design/components/spinner";

import DashboardLayout from "@/components/dashboard-layout";

export default function MusicListLoading() {
	return (
		<DashboardLayout activeHref="/musics">
			<ContentLayout header={<Header variant="h1">楽曲管理</Header>}>
				<Container>
					<div
						aria-label="楽曲一覧を読み込み中"
						className="flex min-h-48 items-center justify-center"
						role="status"
					>
						<Spinner size="large" />
						<span className="sr-only">楽曲一覧を読み込み中</span>
					</div>
				</Container>
			</ContentLayout>
		</DashboardLayout>
	);
}
