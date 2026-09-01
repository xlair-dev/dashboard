import Container from "@cloudscape-design/components/container";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import Skeleton from "@cloudscape-design/components/skeleton";
import SpaceBetween from "@cloudscape-design/components/space-between";

import DashboardLayout from "@/components/dashboard-layout";

const skeletonRows = Array.from({ length: 8 }, (_, index) => index);

export default function MusicListLoading() {
	return (
		<DashboardLayout activeHref="/musics">
			<ContentLayout header={<Header variant="h1">楽曲管理</Header>}>
				<Container>
					<div aria-label="楽曲一覧を読み込み中" role="status">
						<SpaceBetween size="s">
							{skeletonRows.map((row) => (
								<div
									className="grid grid-cols-2 gap-2 sm:grid-cols-5 sm:gap-4"
									key={row}
								>
									<Skeleton />
									<Skeleton />
									<Skeleton width="4rem" />
									<Skeleton width="4rem" />
									<Skeleton width="10rem" />
								</div>
							))}
						</SpaceBetween>
					</div>
				</Container>
			</ContentLayout>
		</DashboardLayout>
	);
}
