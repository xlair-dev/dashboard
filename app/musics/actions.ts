"use server";

import {
	type CreateMusicInput,
	createMusic,
	deleteAudio,
	deleteChart,
	deleteJacket,
	type MusicWithSheets,
	type UpdateMusicInput,
	updateMusic,
	uploadAudio,
	uploadChart,
	uploadJacket,
} from "@/lib/api";

export async function createMusicMetadataAction(
	input: CreateMusicInput,
): Promise<MusicWithSheets> {
	return createMusic(input);
}

export async function updateMusicMetadataAction(
	musicId: string,
	input: UpdateMusicInput,
): Promise<MusicWithSheets> {
	return updateMusic(musicId, input);
}

export async function uploadJacketAction(
	musicId: string,
	file: File,
): Promise<MusicWithSheets> {
	return uploadJacket(musicId, file, `/musics/${musicId}/edit`);
}

export async function uploadAudioAction(
	musicId: string,
	file: File,
): Promise<MusicWithSheets> {
	return uploadAudio(musicId, file, `/musics/${musicId}/edit`);
}

export async function uploadChartAction(
	sheetId: string,
	file: File,
): Promise<MusicWithSheets> {
	return uploadChart(sheetId, file, `/musics/edit`);
}

export async function deleteJacketAction(
	musicId: string,
): Promise<MusicWithSheets> {
	return deleteJacket(musicId);
}

export async function deleteAudioAction(
	musicId: string,
): Promise<MusicWithSheets> {
	return deleteAudio(musicId);
}

export async function deleteChartAction(
	sheetId: string,
): Promise<MusicWithSheets> {
	return deleteChart(sheetId);
}
