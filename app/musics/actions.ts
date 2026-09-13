"use server";

import {
	type CreateMusicInput,
	createMusic,
	deleteJacket,
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

export async function uploadJacketAction(file: File) {
	return uploadJacket(file);
}

export async function deleteJacketAction(
	upload: Parameters<typeof deleteJacket>[0],
) {
	return deleteJacket(upload);
}

export async function updateMusicAction(
	musicId: string,
	input: UpdateMusicInput,
): Promise<MusicWithSheets> {
	return updateMusic(musicId, input);
}
