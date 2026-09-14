import MusicForm from "@/components/music-form";
import { fetchMusic } from "@/lib/api";

export default async function EditMusicPage({
	params,
}: {
	params: Promise<{ musicId: string }>;
}) {
	const { musicId } = await params;
	const data = await fetchMusic(musicId);

	return <MusicForm data={data} title="楽曲を編集" />;
}
