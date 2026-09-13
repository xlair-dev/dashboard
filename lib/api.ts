import {
	AccessTokenError,
	AccessTokenErrorCode,
} from "@auth0/nextjs-auth0/errors";
import { redirect } from "next/navigation";

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

async function getAccessToken(returnTo: string) {
	const audience = process.env.AUTH0_AUDIENCE ?? "https://api.xlair.dev";
	try {
		return await auth0.getAccessToken({ audience });
	} catch (error) {
		if (
			error instanceof AccessTokenError &&
			[
				AccessTokenErrorCode.MISSING_REFRESH_TOKEN,
				AccessTokenErrorCode.FAILED_TO_REFRESH_TOKEN,
				AccessTokenErrorCode.SESSION_EXPIRED,
			].includes(error.code as AccessTokenErrorCode)
		) {
			const loginParams = new URLSearchParams({
				prompt: "login",
				returnTo,
			});
			redirect(`/auth/login?${loginParams.toString()}`);
		}
		throw error;
	}
}

export async function fetchMusics(
	searchParams: { cursor?: string; limit?: number } = {},
): Promise<MusicListResponse> {
	const params = new URLSearchParams();
	if (searchParams.cursor) params.set("cursor", searchParams.cursor);
	if (searchParams.limit) params.set("limit", String(searchParams.limit));
	const returnTo = `/musics${params.size ? `?${params.toString()}` : ""}`;
	const accessToken = await getAccessToken(returnTo);

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

export async function fetchMusic(musicId: string): Promise<MusicWithSheets> {
	const accessToken = await getAccessToken(`/musics/${musicId}`);
	const response = await fetch(
		`${process.env.API_BASE_URL}/admin/musics/${encodeURIComponent(musicId)}`,
		{
			headers: { Authorization: `Bearer ${accessToken.token}` },
			cache: "no-store",
		},
	);

	if (!response.ok) {
		throw new Error(`Failed to fetch music: ${response.status}`);
	}

	return response.json() as Promise<MusicWithSheets>;
}
