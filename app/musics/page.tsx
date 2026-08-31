import MusicList from "@/components/music-list";
import { fetchMusics } from "@/lib/api";

type MusicPageProps = {
	searchParams: Promise<{ cursor?: string; limit?: string }>;
};

export default async function MusicPage({ searchParams }: MusicPageProps) {
	const params = await searchParams;
	const limit = params.limit ? Number(params.limit) : undefined;
	const data = await fetchMusics({ cursor: params.cursor, limit });

	return <MusicList data={data} limit={limit} />;
}
