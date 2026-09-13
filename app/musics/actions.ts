"use server";

import {
	type CreateMusicInput,
	createMusic,
	deleteJacket,
	type MusicWithSheets,
	type UpdateMusicInput,
	updateMusic,
} from "@/lib/api";

export async function createMusicAction(
	input: CreateMusicInput,
	jacket?: File,
): Promise<MusicWithSheets> {
	return createMusic(input, jacket);
}

export async function updateMusicAction(
	musicId: string,
	input: UpdateMusicInput,
	jacket?: File,
): Promise<MusicWithSheets> {
	return updateMusic(musicId, input, jacket);
}

export async function deleteJacketAction(
	musicId: string,
): Promise<MusicWithSheets> {
	return deleteJacket(musicId);
}
