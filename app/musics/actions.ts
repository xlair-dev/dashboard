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
} from "@/lib/api";

export async function createMusicAction(
	input: CreateMusicInput,
	jacket?: File,
	audio?: File,
	charts: Array<{
		difficulty: "basic" | "advanced" | "master";
		file: File;
	}> = [],
): Promise<MusicWithSheets> {
	return createMusic(input, jacket, audio, charts);
}

export async function updateMusicAction(
	musicId: string,
	input: UpdateMusicInput,
	jacket?: File,
	audio?: File,
	charts: Array<{
		difficulty: "basic" | "advanced" | "master";
		file: File;
	}> = [],
): Promise<MusicWithSheets> {
	return updateMusic(musicId, input, jacket, audio, charts);
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
