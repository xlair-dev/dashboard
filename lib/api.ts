import {
	AccessTokenError,
	AccessTokenErrorCode,
} from "@auth0/nextjs-auth0/errors";
import { redirect } from "next/navigation";

import { auth0 } from "@/lib/auth0";

export type Sheet = {
	id: string;
	musicId: string;
	difficulty: "basic" | "advanced" | "master";
	level: number;
	notesDesigner: string;
	chart: Asset | null;
};
export type Asset = { url: string; updatedAt: string };
export type Genre = "ORIGINAL" | "EXTERNAL" | "OTHER";
export type Music = {
	id: string;
	title: string;
	artist: string;
	bpm: number;
	genre: Genre;
	jacket: Asset | null;
	audio: Asset | null;
	registrationDate: string;
	isTest: boolean;
};
export type MusicWithSheets = { music: Music; sheets: Sheet[] };
export type MusicListResponse = {
	items: MusicWithSheets[];
	nextCursor: string | null;
};

function assetUrl(path: string | null): string | null {
	return path ? new URL(path, process.env.API_BASE_URL).toString() : null;
}

function normalizeAsset(asset: Asset | null): Asset | null {
	return asset ? { ...asset, url: assetUrl(asset.url) ?? asset.url } : null;
}

function normalizeMusic(value: MusicWithSheets): MusicWithSheets {
	return {
		music: {
			...value.music,
			jacket: normalizeAsset(value.music.jacket),
			audio: normalizeAsset(value.music.audio),
		},
		sheets: value.sheets.map((sheet) => ({
			...sheet,
			chart: normalizeAsset(sheet.chart),
		})),
	};
}

function normalizeMusicList(value: MusicListResponse): MusicListResponse {
	return {
		...value,
		items: value.items.map(normalizeMusic),
	};
}
export type MusicFields = {
	title: string;
	artist: string;
	bpm: number;
	genre: Genre;
	registrationDate: string;
	isTest: boolean;
};
export type CreateMusicInput = MusicFields & {
	sheets: Array<{
		difficulty: Sheet["difficulty"];
		level: number;
		notesDesigner: string;
	}>;
};
export type UpdateMusicInput = MusicFields & {
	sheets: Array<{
		id: string;
		difficulty: Sheet["difficulty"];
		level: number;
		notesDesigner: string;
	}>;
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
			const loginParams = new URLSearchParams({ prompt: "login", returnTo });
			redirect(`/auth/login?${loginParams.toString()}`);
		}
		throw error;
	}
}

export async function ensureAuthenticated(returnTo: string) {
	await getAccessToken(returnTo);
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
	if (!response.ok)
		throw new Error(`Failed to fetch musics: ${response.status}`);
	return normalizeMusicList((await response.json()) as MusicListResponse);
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
	if (!response.ok)
		throw new Error(`Failed to fetch music: ${response.status}`);
	return normalizeMusic((await response.json()) as MusicWithSheets);
}

async function writeMusic(
	path: string,
	body: CreateMusicInput | UpdateMusicInput,
	returnTo: string,
): Promise<MusicWithSheets> {
	const accessToken = await getAccessToken(returnTo);
	const response = await fetch(`${process.env.API_BASE_URL}${path}`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${accessToken.token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
		cache: "no-store",
	});
	if (!response.ok)
		throw new Error(`Failed to write music: ${response.status}`);
	return normalizeMusic((await response.json()) as MusicWithSheets);
}

export async function uploadJacket(
	musicId: string,
	jacket: File,
	returnTo: string,
): Promise<MusicWithSheets> {
	const accessToken = await getAccessToken(returnTo);
	const response = await fetch(
		`${process.env.API_BASE_URL}/admin/musics/${encodeURIComponent(musicId)}/jacket`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${accessToken.token}`,
				"Content-Type": jacket.type,
			},
			body: jacket,
			cache: "no-store",
		},
	);
	if (!response.ok)
		throw new Error(`Failed to upload jacket: ${response.status}`);
	return normalizeMusic((await response.json()) as MusicWithSheets);
}

export async function uploadAudio(
	musicId: string,
	audio: File,
	returnTo: string,
): Promise<MusicWithSheets> {
	const accessToken = await getAccessToken(returnTo);
	const response = await fetch(
		`${process.env.API_BASE_URL}/admin/musics/${encodeURIComponent(musicId)}/audio`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${accessToken.token}`,
				"Content-Type": audio.type,
			},
			body: audio,
			cache: "no-store",
		},
	);
	if (!response.ok)
		throw new Error(`Failed to upload audio: ${response.status}`);
	return normalizeMusic((await response.json()) as MusicWithSheets);
}

export async function uploadChart(
	sheetId: string,
	chart: File,
	returnTo: string,
): Promise<MusicWithSheets> {
	const accessToken = await getAccessToken(returnTo);
	const fileName = chart.name.replace(/["\\\r\n]/g, "_");
	const response = await fetch(
		`${process.env.API_BASE_URL}/admin/sheets/${encodeURIComponent(sheetId)}/chart`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${accessToken.token}`,
				"Content-Type": "application/octet-stream",
				"Content-Disposition": `attachment; filename="${fileName}"`,
			},
			body: chart,
			cache: "no-store",
		},
	);
	if (!response.ok)
		throw new Error(`Failed to upload chart: ${response.status}`);
	return normalizeMusic((await response.json()) as MusicWithSheets);
}

export async function deleteJacket(musicId: string): Promise<MusicWithSheets> {
	const accessToken = await getAccessToken(`/musics/${musicId}/edit`);
	const response = await fetch(
		`${process.env.API_BASE_URL}/admin/musics/${encodeURIComponent(musicId)}/jacket`,
		{
			method: "DELETE",
			headers: { Authorization: `Bearer ${accessToken.token}` },
			cache: "no-store",
		},
	);
	if (!response.ok)
		throw new Error(`Failed to delete jacket: ${response.status}`);
	return normalizeMusic((await response.json()) as MusicWithSheets);
}

export async function deleteAudio(musicId: string): Promise<MusicWithSheets> {
	const accessToken = await getAccessToken(`/musics/${musicId}/edit`);
	const response = await fetch(
		`${process.env.API_BASE_URL}/admin/musics/${encodeURIComponent(musicId)}/audio`,
		{
			method: "DELETE",
			headers: { Authorization: `Bearer ${accessToken.token}` },
			cache: "no-store",
		},
	);
	if (!response.ok)
		throw new Error(`Failed to delete audio: ${response.status}`);
	return normalizeMusic((await response.json()) as MusicWithSheets);
}

export async function deleteChart(sheetId: string): Promise<MusicWithSheets> {
	const accessToken = await getAccessToken(`/musics/edit`);
	const response = await fetch(
		`${process.env.API_BASE_URL}/admin/sheets/${encodeURIComponent(sheetId)}/chart`,
		{
			method: "DELETE",
			headers: { Authorization: `Bearer ${accessToken.token}` },
			cache: "no-store",
		},
	);
	if (!response.ok)
		throw new Error(`Failed to delete chart: ${response.status}`);
	return normalizeMusic((await response.json()) as MusicWithSheets);
}

export function createMusic(input: CreateMusicInput) {
	return writeMusic("/admin/musics", input, "/musics/new");
}

export function updateMusic(musicId: string, input: UpdateMusicInput) {
	return writeMusic(
		`/admin/musics/${encodeURIComponent(musicId)}`,
		input,
		`/musics/${musicId}/edit`,
	);
}
