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

export type MusicFields = {
	title: string;
	artist: string;
	bpm: number;
	genre: "ORIGINAL";
	jacket: string;
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

type JacketUploadResponse = {
	uploadId: string;
	uploadUrl: string;
	jacketUrl: string;
	cleanupToken: string;
};

export type UploadedJacket = {
	uploadId: string;
	jacketUrl: string;
	contentType: string;
	cleanupToken: string;
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

async function writeMusic(
	path: string,
	method: "POST",
	body: CreateMusicInput | UpdateMusicInput,
	returnTo: string,
): Promise<MusicWithSheets> {
	const accessToken = await getAccessToken(returnTo);
	const response = await fetch(`${process.env.API_BASE_URL}${path}`, {
		method,
		headers: {
			Authorization: `Bearer ${accessToken.token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
		cache: "no-store",
	});

	if (!response.ok) {
		throw new Error(
			`Failed to ${method === "POST" ? "create" : "update"} music: ${response.status}`,
		);
	}

	return response.json() as Promise<MusicWithSheets>;
}

export function createMusic(input: CreateMusicInput) {
	return writeMusic("/admin/musics", "POST", input, "/musics/new");
}

export function updateMusic(musicId: string, input: UpdateMusicInput) {
	return writeMusic(
		`/admin/musics/${encodeURIComponent(musicId)}`,
		"POST",
		input,
		`/musics/${musicId}/edit`,
	);
}

export async function uploadJacket(
	musicId: string | undefined,
	file: File,
): Promise<UploadedJacket> {
	if (
		!(["image/jpeg", "image/png", "image/webp"] as string[]).includes(file.type)
	)
		throw new Error(
			"ジャケット画像は JPEG、PNG、WebP のいずれかを選択してください。",
		);
	if (file.size > 5 * 1024 * 1024)
		throw new Error("ジャケット画像は 5 MiB 以下にしてください。");
	const accessToken = await getAccessToken(
		musicId ? `/musics/${musicId}/edit` : "/musics/new",
	);
	const response = await fetch(
		`${process.env.API_BASE_URL}/admin/jackets/upload-url`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${accessToken.token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ contentType: file.type }),
			cache: "no-store",
		},
	);
	if (!response.ok)
		throw new Error(`Failed to create jacket upload URL: ${response.status}`);
	const upload = (await response.json()) as JacketUploadResponse;
	const uploaded: UploadedJacket = {
		uploadId: upload.uploadId,
		jacketUrl: upload.jacketUrl,
		contentType: file.type,
		cleanupToken: upload.cleanupToken,
	};
	try {
		const uploadResponse = await fetch(upload.uploadUrl, {
			method: "PUT",
			headers: { "Content-Type": file.type },
			body: await file.arrayBuffer(),
		});
		if (!uploadResponse.ok)
			throw new Error(`Failed to upload jacket: ${uploadResponse.status}`);
		const finalizeResponse = await fetch(
			`${process.env.API_BASE_URL}/admin/jackets/${encodeURIComponent(upload.uploadId)}/finalize`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${accessToken.token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					contentType: file.type,
					cleanupToken: uploaded.cleanupToken,
				}),
				cache: "no-store",
			},
		);
		if (!finalizeResponse.ok)
			throw new Error(
				`Failed to finalize jacket upload: ${finalizeResponse.status}`,
			);
		return uploaded;
	} catch (error) {
		try {
			await deleteJacket(uploaded);
		} catch {
			// Cleanup is best effort after an upload failure.
		}
		throw error;
	}
}

export async function deleteJacket(upload: UploadedJacket) {
	const accessToken = await getAccessToken("/musics");
	const response = await fetch(
		`${process.env.API_BASE_URL}/admin/jackets/${encodeURIComponent(upload.uploadId)}`,
		{
			method: "DELETE",
			headers: {
				Authorization: `Bearer ${accessToken.token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				contentType: upload.contentType,
				cleanupToken: upload.cleanupToken,
			}),
			cache: "no-store",
		},
	);
	if (!response.ok)
		throw new Error(`Failed to delete jacket upload: ${response.status}`);
}
