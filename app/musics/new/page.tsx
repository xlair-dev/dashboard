import MusicForm from "@/components/music-form";
import { ensureAuthenticated } from "@/lib/api";

export default async function NewMusicPage() {
	await ensureAuthenticated("/musics/new");
	return <MusicForm title="楽曲を追加" />;
}
