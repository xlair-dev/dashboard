"use client";

import Alert from "@cloudscape-design/components/alert";
import Button from "@cloudscape-design/components/button";
import Checkbox from "@cloudscape-design/components/checkbox";
import Container from "@cloudscape-design/components/container";
import ContentLayout from "@cloudscape-design/components/content-layout";
import DatePicker from "@cloudscape-design/components/date-picker";
import FileUpload from "@cloudscape-design/components/file-upload";
import Form from "@cloudscape-design/components/form";
import FormField from "@cloudscape-design/components/form-field";
import Header from "@cloudscape-design/components/header";
import Input from "@cloudscape-design/components/input";
import Select from "@cloudscape-design/components/select";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
	createMusicAction,
	deleteJacketAction,
	updateMusicAction,
} from "@/app/musics/actions";
import DashboardLayout from "@/components/dashboard-layout";
import MusicBreadcrumbs from "@/components/music-breadcrumbs";
import type {
	CreateMusicInput,
	Genre,
	MusicWithSheets,
	UpdateMusicInput,
} from "@/lib/api";

type Difficulty = "basic" | "advanced" | "master";
type SheetDraft = { id?: string; level: string; notesDesigner: string };
type FormValues = {
	title: string;
	artist: string;
	bpm: string;
	genre: Genre;
	jacket: string | null;
	registrationDate: string;
	isTest: boolean;
	sheets: Record<Difficulty, SheetDraft>;
};

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
				},
			];
		}),
	) as Record<Difficulty, SheetDraft>;
	return {
		title: data?.music.title ?? "",
		artist: data?.music.artist ?? "",
		bpm: data ? String(data.music.bpm) : "",
		genre: data?.music.genre ?? "ORIGINAL",
		jacket: data?.music.jacket || null,
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
	const [submitError, setSubmitError] = useState<string>();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isDeletingJacket, setIsDeletingJacket] = useState(false);
	const [jacketFile, setJacketFile] = useState<File[]>([]);
	const [jacketPreviewUrl, setJacketPreviewUrl] = useState<string>();
	const router = useRouter();

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

	const isEdit = Boolean(data);
	const updateValue = (
		key: keyof Omit<FormValues, "sheets">,
		value: string | boolean,
	) => setValues((current) => ({ ...current, [key]: value }));

	function validate() {
		const nextErrors: Record<string, string> = {};
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
		setSubmitError(undefined);
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
			if (data) {
				await updateMusicAction(
					data.music.id,
					{
						...fields,
						sheets: difficulties.map(({ key }) => ({
							id: values.sheets[key].id as string,
							difficulty: key,
							level: Number(values.sheets[key].level),
							notesDesigner: values.sheets[key].notesDesigner.trim(),
						})),
					} satisfies UpdateMusicInput,
					jacketFile[0],
				);
			} else {
				await createMusicAction(
					{
						...fields,
						sheets: difficulties.map(({ key }) => ({
							difficulty: key,
							level: Number(values.sheets[key].level),
							notesDesigner: values.sheets[key].notesDesigner.trim(),
						})),
					} satisfies CreateMusicInput,
					jacketFile[0],
				);
			}
			router.push(data ? `/musics/${data.music.id}` : "/musics");
		} catch (error) {
			setSubmitError(
				error instanceof Error ? error.message : "保存に失敗しました。",
			);
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleDeleteJacket() {
		if (!data) return;
		setSubmitError(undefined);
		setIsDeletingJacket(true);
		try {
			await deleteJacketAction(data.music.id);
			setValues((current) => ({ ...current, jacket: null }));
			setJacketFile([]);
		} catch (error) {
			setSubmitError(
				error instanceof Error
					? error.message
					: "ジャケットを削除できませんでした。",
			);
		} finally {
			setIsDeletingJacket(false);
		}
	}

	const previewUrl = jacketPreviewUrl ?? values.jacket;

	return (
		<DashboardLayout activeHref="/musics">
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
							{submitError ? (
								<Alert type="error" header="保存できませんでした">
									{submitError}
								</Alert>
							) : null}
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
									<FormField label="ジャケット" errorText={errors.jacket}>
										<SpaceBetween size="s">
											<FileUpload
												accept="image/jpeg,image/png,image/webp"
												value={jacketFile}
												onChange={({ detail }) => setJacketFile(detail.value)}
												i18nStrings={{
													uploadButtonText: () => "画像を選択",
													dropzoneText: () => "画像をここにドロップ",
													removeFileAriaLabel: () => "画像を削除",
												}}
											/>
											{previewUrl ? (
												<SpaceBetween size="s">
													<Image
														src={previewUrl}
														alt="ジャケットプレビュー"
														width={128}
														height={128}
														loading="eager"
														className="size-32 object-cover"
														unoptimized
													/>
													{data && !jacketPreviewUrl ? (
														<Button
															loading={isDeletingJacket}
															disabled={isSubmitting || isDeletingJacket}
															onClick={handleDeleteJacket}
														>
															ジャケットを削除
														</Button>
													) : null}
												</SpaceBetween>
											) : null}
										</SpaceBetween>
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
