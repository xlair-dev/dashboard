import { auth0 } from "@/lib/auth0";

export type Sheet = {
	id: string;
	musicId: string;
	difficulty: "easy" | "normal" | "hard";
	level: number;
	notesDesigner: string;
};

export type Music = {
	id: string;
	title: string;
	artist: string;
	bpm: number;
	genre: string;
	jacket: string;
	registrationDate: string;
	isTest: boolean;
};

export type MusicWithSheets = {
	music: Music;
	sheets: Sheet[];
};

export type MusicListResponse = {
	items: MusicWithSheets[];
	nextCursor: string | null;
};

export async function fetchMusics(
	searchParams: { cursor?: string; limit?: number } = {},
): Promise<MusicListResponse> {
	const accessToken = await auth0.getAccessToken();
	const params = new URLSearchParams();
	if (searchParams.cursor) params.set("cursor", searchParams.cursor);
	if (searchParams.limit) params.set("limit", String(searchParams.limit));

	const response = await fetch(
		`${process.env.API_BASE_URL}/admin/musics?${params.toString()}`,
		{
			headers: { Authorization: `Bearer ${accessToken.token}` },
			cache: "no-store",
		},
	);

	if (!response.ok) {
		throw new Error(`Failed to fetch musics: ${response.status}`);
	}

	return response.json() as Promise<MusicListResponse>;
}
