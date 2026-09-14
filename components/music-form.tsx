"use client";

import Button from "@cloudscape-design/components/button";
import Checkbox from "@cloudscape-design/components/checkbox";
import Container from "@cloudscape-design/components/container";
import ContentLayout from "@cloudscape-design/components/content-layout";
import DatePicker from "@cloudscape-design/components/date-picker";
import FileUpload from "@cloudscape-design/components/file-upload";
import Flashbar from "@cloudscape-design/components/flashbar";
import Form from "@cloudscape-design/components/form";
import FormField from "@cloudscape-design/components/form-field";
import Header from "@cloudscape-design/components/header";
import Input from "@cloudscape-design/components/input";
import ProgressBar from "@cloudscape-design/components/progress-bar";
import Select from "@cloudscape-design/components/select";
import SpaceBetween from "@cloudscape-design/components/space-between";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
	createMusicMetadataAction,
	deleteAudioAction,
	deleteChartAction,
	deleteJacketAction,
	updateMusicMetadataAction,
	uploadAudioAction,
	uploadChartAction,
	uploadJacketAction,
} from "@/app/musics/actions";
import { AssetDisplay, PendingAssetDisplay } from "@/components/asset-display";
import DashboardLayout from "@/components/dashboard-layout";
import MusicBreadcrumbs from "@/components/music-breadcrumbs";
import type {
	CreateMusicInput,
	Genre,
	MusicWithSheets,
	UpdateMusicInput,
} from "@/lib/api";

type Difficulty = "basic" | "advanced" | "master";
type SheetDraft = {
	id?: string;
	level: string;
	notesDesigner: string;
	chart: string | null;
};
type FormValues = {
	title: string;
	artist: string;
	bpm: string;
	genre: Genre;
	jacket: string | null;
	audio: string | null;
	registrationDate: string;
	isTest: boolean;
	sheets: Record<Difficulty, SheetDraft>;
};
type SaveProgress = { current: number; total: number; label: string };

const difficulties: Array<{ key: Difficulty; label: string }> = [
	{ key: "basic", label: "Basic" },
	{ key: "advanced", label: "Advanced" },
	{ key: "master", label: "Master" },
];

const genres: Array<{ value: Genre; label: string }> = [
	{ value: "ORIGINAL", label: "ORIGINAL" },
	{ value: "EXTERNAL", label: "EXTERNAL" },
	{ value: "OTHER", label: "OTHER" },
];

const MAX_JACKET_SIZE = 5 * 1024 * 1024;
const MAX_AUDIO_SIZE = 30 * 1024 * 1024;
const MAX_CHART_SIZE = 5 * 1024 * 1024;

function isPositiveSingleDecimal(value: string) {
	return /^\d+(\.\d)?$/.test(value) && Number(value) > 0;
}

function initialValues(data?: MusicWithSheets): FormValues {
	const sheets = Object.fromEntries(
		difficulties.map(({ key }) => {
			const sheet = data?.sheets.find((item) => item.difficulty === key);
			return [
				key,
				{
					id: sheet?.id,
					level: sheet ? String(sheet.level) : "",
					notesDesigner: sheet?.notesDesigner ?? "",
					chart: sheet?.chart?.url ?? null,
				},
			];
		}),
	) as Record<Difficulty, SheetDraft>;
	return {
		title: data?.music.title ?? "",
		artist: data?.music.artist ?? "",
		bpm: data ? String(data.music.bpm) : "",
		genre: data?.music.genre ?? "ORIGINAL",
		jacket: data?.music.jacket?.url ?? null,
		audio: data?.music.audio?.url ?? null,
		registrationDate: data?.music.registrationDate.slice(0, 10) ?? "",
		isTest: data?.music.isTest ?? false,
		sheets,
	};
}

export default function MusicForm({
	data,
	title,
}: {
	data?: MusicWithSheets;
	title: string;
}) {
	const [values, setValues] = useState(() => initialValues(data));
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [errorNotification, setErrorNotification] = useState<string>();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isDeletingJacket, setIsDeletingJacket] = useState(false);
	const [isDeletingAudio, setIsDeletingAudio] = useState(false);
	const [deletingChart, setDeletingChart] = useState<Difficulty>();
	const [saveProgress, setSaveProgress] = useState<SaveProgress>();
	const [jacketFile, setJacketFile] = useState<File[]>([]);
	const [audioFile, setAudioFile] = useState<File[]>([]);
	const [chartFiles, setChartFiles] = useState<Record<Difficulty, File[]>>({
		basic: [],
		advanced: [],
		master: [],
	});
	const [assetErrors, setAssetErrors] = useState<Record<string, string>>({});
	const [jacketPreviewUrl, setJacketPreviewUrl] = useState<string>();
	const router = useRouter();

	function showError(error: unknown, fallback: string) {
		setErrorNotification(error instanceof Error ? error.message : fallback);
	}

	useEffect(() => {
		const file = jacketFile[0];
		if (!file) {
			setJacketPreviewUrl(undefined);
			return;
		}

		const url = URL.createObjectURL(file);
		setJacketPreviewUrl(url);
		return () => URL.revokeObjectURL(url);
	}, [jacketFile]);

	useEffect(() => {
		if (errorNotification) window.scrollTo({ top: 0, behavior: "smooth" });
	}, [errorNotification]);

	const isEdit = Boolean(data);
	function setAssetError(field: string, message?: string) {
		setAssetErrors((current) => {
			const next = { ...current };
			if (message) next[field] = message;
			else delete next[field];
			return next;
		});
	}

	const updateValue = (
		key: keyof Omit<FormValues, "sheets">,
		value: string | boolean,
	) => setValues((current) => ({ ...current, [key]: value }));

	function validate() {
		const nextErrors: Record<string, string> = { ...assetErrors };
		if (!values.title.trim()) nextErrors.title = "タイトルを入力してください。";
		if (!values.artist.trim())
			nextErrors.artist = "アーティストを入力してください。";
		if (!values.registrationDate)
			nextErrors.registrationDate = "登録日を入力してください。";
		else if (!/^\d{4}-\d{2}-\d{2}$/.test(values.registrationDate))
			nextErrors.registrationDate =
				"登録日は YYYY-MM-DD 形式で入力してください。";
		if (!isPositiveSingleDecimal(values.bpm))
			nextErrors.bpm = "BPM は正の数値（小数第1位まで）で入力してください。";
		for (const { key, label } of difficulties) {
			const sheet = values.sheets[key];
			if (!isPositiveSingleDecimal(sheet.level))
				nextErrors[`${key}.level`] =
					`${label} のレベルは正の数値（小数第1位まで）で入力してください。`;
			if (!sheet.notesDesigner.trim())
				nextErrors[`${key}.notesDesigner`] =
					`${label} の譜面制作者を入力してください。`;
			if (isEdit && !sheet.id)
				nextErrors[`${key}.id`] = `${label} の譜面 ID がありません。`;
		}
		setErrors(nextErrors);
		return nextErrors;
	}

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setErrorNotification(undefined);
		if (Object.keys(validate()).length > 0) return;
		setIsSubmitting(true);
		try {
			const fields = {
				title: values.title.trim(),
				artist: values.artist.trim(),
				bpm: Number(values.bpm),
				genre: values.genre,
				registrationDate: `${values.registrationDate}T00:00:00.000Z`,
				isTest: values.isTest,
			};
			const uploadCount =
				Number(Boolean(jacketFile[0])) +
				Number(Boolean(audioFile[0])) +
				difficulties.filter(({ key }) => chartFiles[key][0]).length;
			const totalSteps = 1 + uploadCount;
			setSaveProgress({
				current: 0,
				total: totalSteps,
				label: "楽曲情報を保存中",
			});
			let saved: MusicWithSheets;
			if (data) {
				saved = await updateMusicMetadataAction(data.music.id, {
					...fields,
					sheets: difficulties.map(({ key }) => ({
						id: values.sheets[key].id as string,
						difficulty: key,
						level: Number(values.sheets[key].level),
						notesDesigner: values.sheets[key].notesDesigner.trim(),
					})),
				} satisfies UpdateMusicInput);
			} else {
				saved = await createMusicMetadataAction({
					...fields,
					sheets: difficulties.map(({ key }) => ({
						difficulty: key,
						level: Number(values.sheets[key].level),
						notesDesigner: values.sheets[key].notesDesigner.trim(),
					})),
				} satisfies CreateMusicInput);
			}
			let currentStep = 1;
			setSaveProgress({
				current: currentStep,
				total: totalSteps,
				label: "楽曲情報を保存しました",
			});

			if (jacketFile[0]) {
				setSaveProgress({
					current: currentStep,
					total: totalSteps,
					label: "ジャケットをアップロード中",
				});
				saved = await uploadJacketAction(saved.music.id, jacketFile[0]);
				currentStep += 1;
			}
			if (audioFile[0]) {
				setSaveProgress({
					current: currentStep,
					total: totalSteps,
					label: "音源をアップロード中",
				});
				saved = await uploadAudioAction(saved.music.id, audioFile[0]);
				currentStep += 1;
			}
			for (const { key, label } of difficulties) {
				const file = chartFiles[key][0];
				if (!file) continue;
				const sheet = saved.sheets.find((item) => item.difficulty === key);
				if (!sheet) throw new Error(`${label} の譜面が見つかりません。`);
				setSaveProgress({
					current: currentStep,
					total: totalSteps,
					label: `${label} の譜面をアップロード中`,
				});
				saved = await uploadChartAction(sheet.id, file);
				currentStep += 1;
			}
			router.push(data ? `/musics/${data.music.id}` : "/musics");
		} catch (error) {
			showError(error, "保存に失敗しました。");
		} finally {
			setIsSubmitting(false);
			setSaveProgress(undefined);
		}
	}

	async function handleDeleteJacket() {
		if (!data) return;
		setErrorNotification(undefined);
		setIsDeletingJacket(true);
		try {
			await deleteJacketAction(data.music.id);
			setValues((current) => ({ ...current, jacket: null }));
			setJacketFile([]);
		} catch (error) {
			showError(error, "ジャケットを削除できませんでした。");
		} finally {
			setIsDeletingJacket(false);
		}
	}

	async function handleDeleteAudio() {
		if (!data) return;
		setIsDeletingAudio(true);
		try {
			await deleteAudioAction(data.music.id);
			setValues((current) => ({ ...current, audio: null }));
		} catch (error) {
			showError(error, "音源を削除できませんでした。");
		} finally {
			setIsDeletingAudio(false);
		}
	}

	async function handleDeleteChart(key: Difficulty) {
		const sheetId = values.sheets[key].id;
		if (!sheetId) return;
		setDeletingChart(key);
		try {
			await deleteChartAction(sheetId);
			setValues((current) => ({
				...current,
				sheets: {
					...current.sheets,
					[key]: { ...current.sheets[key], chart: null },
				},
			}));
		} catch (error) {
			showError(error, "譜面ファイルを削除できませんでした。");
		} finally {
			setDeletingChart(undefined);
		}
	}

	return (
		<DashboardLayout activeHref="/musics">
			{errorNotification ? (
				<div className="fixed inset-x-4 top-16 z-50 sm:left-auto sm:w-96">
					<Flashbar
						items={[
							{
								id: "music-form-error",
								type: "error",
								header: "エラーが発生しました",
								content: errorNotification,
								dismissible: true,
								dismissLabel: "エラー通知を閉じる",
								onDismiss: () => setErrorNotification(undefined),
							},
						]}
					/>
				</div>
			) : null}
			{saveProgress ? (
				<div className="mb-4">
					<ProgressBar
						value={(saveProgress.current / saveProgress.total) * 100}
						label={saveProgress.label}
						description={`${saveProgress.current} / ${saveProgress.total}`}
					/>
				</div>
			) : null}
			<ContentLayout
				breadcrumbs={
					<MusicBreadcrumbs
						current={title}
						currentHref={data ? `/musics/${data.music.id}/edit` : "/musics/new"}
					/>
				}
				header={<Header variant="h1">{title}</Header>}
			>
				<form onSubmit={handleSubmit}>
					<Form
						actions={
							<SpaceBetween direction="horizontal" size="s">
								<Button href={data ? `/musics/${data.music.id}` : "/musics"}>
									キャンセル
								</Button>
								<Button
									variant="primary"
									loading={isSubmitting}
									disabled={isSubmitting}
								>
									保存
								</Button>
							</SpaceBetween>
						}
					>
						<SpaceBetween size="l">
							<Container header={<Header variant="h2">楽曲情報</Header>}>
								<SpaceBetween size="l">
									<FormField label="タイトル" errorText={errors.title}>
										<Input
											value={values.title}
											onChange={({ detail }) =>
												updateValue("title", detail.value)
											}
										/>
									</FormField>
									<FormField label="アーティスト" errorText={errors.artist}>
										<Input
											value={values.artist}
											onChange={({ detail }) =>
												updateValue("artist", detail.value)
											}
										/>
									</FormField>
									<FormField label="BPM" errorText={errors.bpm}>
										<Input
											type="number"
											value={values.bpm}
											onChange={({ detail }) =>
												updateValue("bpm", detail.value)
											}
										/>
									</FormField>
									<FormField label="ジャンル">
										<Select
											selectedOption={
												genres.find(({ value }) => value === values.genre) ??
												genres[0]
											}
											onChange={({ detail }) =>
												updateValue(
													"genre",
													detail.selectedOption.value ?? "ORIGINAL",
												)
											}
											options={genres}
										/>
									</FormField>
									<FormField label="登録日" errorText={errors.registrationDate}>
										<DatePicker
											format="iso"
											inputFormat="iso"
											value={values.registrationDate}
											onChange={({ detail }) =>
												updateValue("registrationDate", detail.value)
											}
										/>
									</FormField>
									<Checkbox
										checked={values.isTest}
										onChange={({ detail }) =>
											updateValue("isTest", detail.checked)
										}
									>
										テスト楽曲
									</Checkbox>
								</SpaceBetween>
							</Container>
							<Container header={<Header variant="h2">アセット</Header>}>
								<FormField label="ジャケット" errorText={assetErrors.jacket}>
									<SpaceBetween size="s">
										{!jacketFile.length && !values.jacket ? (
											<FileUpload
												accept="image/jpeg,image/png,image/webp"
												value={jacketFile}
												constraintText="最大 5 MiB"
												onChange={({ detail }) => {
													const file = detail.value[0];
													if (file && file.size > MAX_JACKET_SIZE) {
														setJacketFile([]);
														setAssetError(
															"jacket",
															"ジャケットは 5 MiB 以下にしてください。",
														);
														return;
													}
													setJacketFile(detail.value);
													setAssetError("jacket");
												}}
												i18nStrings={{
													uploadButtonText: () => "画像を選択",
													dropzoneText: () => "画像をここにドロップ",
													removeFileAriaLabel: () => "画像を削除",
												}}
											/>
										) : null}
										{jacketFile[0] ? (
											<SpaceBetween size="s">
												<PendingAssetDisplay
													type="jacket"
													fileName={jacketFile[0].name}
													previewUrl={jacketPreviewUrl}
													onRemove={() => setJacketFile([])}
												/>
											</SpaceBetween>
										) : null}
										{data && !jacketFile.length && values.jacket ? (
											<SpaceBetween size="s">
												<AssetDisplay
													type="jacket"
													url={values.jacket}
													updatedAt={data?.music.jacket?.updatedAt ?? null}
												/>
												<Button
													loading={isDeletingJacket}
													disabled={isSubmitting || isDeletingJacket}
													onClick={handleDeleteJacket}
												>
													ジャケットを削除
												</Button>
											</SpaceBetween>
										) : null}
									</SpaceBetween>
								</FormField>
								<FormField label="音源" errorText={assetErrors.audio}>
									<SpaceBetween size="s">
										{!audioFile.length && !values.audio ? (
											<FileUpload
												accept="audio/wav"
												value={audioFile}
												constraintText="WAV、最大 30 MiB"
												onChange={({ detail }) => {
													const file = detail.value[0];
													if (file && file.size > MAX_AUDIO_SIZE) {
														setAudioFile([]);
														setAssetError(
															"audio",
															"音源は 30 MiB 以下にしてください。",
														);
														return;
													}
													setAudioFile(detail.value);
													setAssetError("audio");
												}}
												i18nStrings={{
													uploadButtonText: () => "音源を選択",
													dropzoneText: () => "WAV ファイルをここにドロップ",
													removeFileAriaLabel: () => "音源を削除",
												}}
											/>
										) : null}
										{audioFile[0] ? (
											<PendingAssetDisplay
												type="audio"
												fileName={audioFile[0].name}
												onRemove={() => setAudioFile([])}
											/>
										) : null}
										{!audioFile.length && values.audio ? (
											<SpaceBetween size="s">
												<AssetDisplay
													type="audio"
													url={values.audio}
													updatedAt={data?.music.audio?.updatedAt ?? null}
												/>
												<Button
													loading={isDeletingAudio}
													disabled={isSubmitting || isDeletingAudio}
													onClick={handleDeleteAudio}
												>
													音源を削除
												</Button>
											</SpaceBetween>
										) : null}
									</SpaceBetween>
								</FormField>
							</Container>
							<Container header={<Header variant="h2">譜面</Header>}>
								<SpaceBetween size="l">
									{difficulties.map(({ key, label }) => {
										const sheet = values.sheets[key];
										return (
											<Container
												key={key}
												header={<Header variant="h3">{label}</Header>}
											>
												<SpaceBetween size="m">
													<FormField
														label="レベル"
														errorText={errors[`${key}.level`]}
													>
														<Input
															type="number"
															value={sheet.level}
															onChange={({ detail }) =>
																setValues((current) => ({
																	...current,
																	sheets: {
																		...current.sheets,
																		[key]: { ...sheet, level: detail.value },
																	},
																}))
															}
														/>
													</FormField>
													<FormField
														label="譜面ファイル"
														errorText={assetErrors[`chart.${key}`]}
													>
														<SpaceBetween size="s">
															{!chartFiles[key].length && !sheet.chart ? (
																<FileUpload
																	accept=".sus"
																	value={chartFiles[key]}
																	constraintText="SUS、最大 5 MiB"
																	onChange={({ detail }) => {
																		const file = detail.value[0];
																		const field = `chart.${key}`;
																		if (file && file.size > MAX_CHART_SIZE) {
																			setChartFiles((current) => ({
																				...current,
																				[key]: [],
																			}));
																			setAssetError(
																				field,
																				`${label} の譜面ファイルは 5 MiB 以下にしてください。`,
																			);
																			return;
																		}
																		setChartFiles((current) => ({
																			...current,
																			[key]: detail.value,
																		}));
																		setAssetError(field);
																	}}
																	i18nStrings={{
																		uploadButtonText: () => "譜面を選択",
																		dropzoneText: () =>
																			"SUS ファイルをここにドロップ",
																		removeFileAriaLabel: () => "譜面を削除",
																	}}
																/>
															) : null}
															{chartFiles[key][0] ? (
																<PendingAssetDisplay
																	type="chart"
																	fileName={chartFiles[key][0].name}
																	onRemove={() =>
																		setChartFiles((current) => ({
																			...current,
																			[key]: [],
																		}))
																	}
																/>
															) : null}
															{!chartFiles[key].length && sheet.chart ? (
																<SpaceBetween size="s">
																	<AssetDisplay
																		type="chart"
																		url={sheet.chart}
																		updatedAt={
																			data?.sheets.find(
																				(item) => item.difficulty === key,
																			)?.chart?.updatedAt ?? null
																		}
																		label={label}
																	/>
																	<Button
																		loading={deletingChart === key}
																		disabled={
																			isSubmitting || deletingChart === key
																		}
																		onClick={() => handleDeleteChart(key)}
																	>
																		譜面を削除
																	</Button>
																</SpaceBetween>
															) : null}
														</SpaceBetween>
													</FormField>
													<FormField
														label="譜面制作者"
														errorText={errors[`${key}.notesDesigner`]}
													>
														<Input
															value={sheet.notesDesigner}
															onChange={({ detail }) =>
																setValues((current) => ({
																	...current,
																	sheets: {
																		...current.sheets,
																		[key]: {
																			...sheet,
																			notesDesigner: detail.value,
																		},
																	},
																}))
															}
														/>
													</FormField>
												</SpaceBetween>
											</Container>
										);
									})}
								</SpaceBetween>
							</Container>
						</SpaceBetween>
					</Form>
				</form>
			</ContentLayout>
		</DashboardLayout>
	);
}
