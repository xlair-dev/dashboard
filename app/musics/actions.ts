"use server";

import {
	type CreateMusicInput,
	createMusic,
	type MusicWithSheets,
	type UpdateMusicInput,
	updateMusic,
	uploadJacket,
} from "@/lib/api";

export async function createMusicAction(
	input: CreateMusicInput,
): Promise<MusicWithSheets> {
	return createMusic(input);
}

export async function uploadJacketAction(
	musicId: string | undefined,
	file: File,
) {
	return uploadJacket(musicId, file);
}

export async function updateMusicAction(
	musicId: string,
	input: UpdateMusicInput,
): Promise<MusicWithSheets> {
	return updateMusic(musicId, input);
}
