import MusicDetail from "@/components/music-detail";
import { fetchMusic } from "@/lib/api";

type MusicDetailPageProps = {
	params: Promise<{ musicId: string }>;
};

export default async function MusicDetailPage({
	params,
}: MusicDetailPageProps) {
	const { musicId } = await params;
	const data = await fetchMusic(musicId);

	return <MusicDetail data={data} />;
}
