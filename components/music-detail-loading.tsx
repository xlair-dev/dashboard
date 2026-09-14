import Container from "@cloudscape-design/components/container";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import Spinner from "@cloudscape-design/components/spinner";

import DashboardLayout from "@/components/dashboard-layout";
import MusicBreadcrumbs from "@/components/music-breadcrumbs";
import StickyPageHeader from "@/components/sticky-page-header";

export default function MusicDetailLoading() {
	return (
		<DashboardLayout activeHref="/musics">
			<ContentLayout
				breadcrumbs={
					<MusicBreadcrumbs current="楽曲詳細" currentHref="/musics" />
				}
				header={
					<StickyPageHeader>
						<Header variant="h1">楽曲管理</Header>
					</StickyPageHeader>
				}
			>
				<Container>
					<div
						aria-label="楽曲詳細を読み込み中"
						className="flex min-h-48 items-center justify-center"
						role="status"
					>
						<Spinner size="large" />
						<span className="sr-only">楽曲詳細を読み込み中</span>
					</div>
				</Container>
			</ContentLayout>
		</DashboardLayout>
	);
}
