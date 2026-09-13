"use server";

import {
	type CreateMusicInput,
	createMusic,
	type MusicWithSheets,
	type UpdateMusicInput,
	updateMusic,
} from "@/lib/api";

export async function createMusicAction(
	input: CreateMusicInput,
): Promise<MusicWithSheets> {
	return createMusic(input);
}

export async function updateMusicAction(
	musicId: string,
	input: UpdateMusicInput,
): Promise<MusicWithSheets> {
	return updateMusic(musicId, input);
}
