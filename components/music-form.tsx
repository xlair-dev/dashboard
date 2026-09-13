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
import SpaceBetween from "@cloudscape-design/components/space-between";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
	createMusicAction,
	updateMusicAction,
	uploadJacketAction,
} from "@/app/musics/actions";
import DashboardLayout from "@/components/dashboard-layout";
import MusicBreadcrumbs from "@/components/music-breadcrumbs";
import type {
	CreateMusicInput,
	MusicWithSheets,
	UpdateMusicInput,
} from "@/lib/api";

type Difficulty = "easy" | "normal" | "hard";
type SheetDraft = { id?: string; level: string; notesDesigner: string };
type FormValues = {
	title: string;
	artist: string;
	bpm: string;
	jacket: string;
	registrationDate: string;
	isTest: boolean;
	sheets: Record<Difficulty, SheetDraft>;
};

const difficulties: Array<{ key: Difficulty; label: string }> = [
	{ key: "easy", label: "Easy" },
	{ key: "normal", label: "Normal" },
	{ key: "hard", label: "Hard" },
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
		jacket: data?.music.jacket ?? "",
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
	const [jacketFile, setJacketFile] = useState<File[]>([]);
	const router = useRouter();

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
		if (!values.jacket.trim() && jacketFile.length === 0)
			nextErrors.jacket = "ジャケットを入力してください。";
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
			const jacket = jacketFile[0]
				? await uploadJacketAction(data?.music.id, jacketFile[0])
				: values.jacket.trim();
			const fields = {
				title: values.title.trim(),
				artist: values.artist.trim(),
				bpm: Number(values.bpm),
				genre: "ORIGINAL" as const,
				jacket,
				registrationDate: `${values.registrationDate}T00:00:00.000Z`,
				isTest: values.isTest,
			};
			if (data) {
				await updateMusicAction(data.music.id, {
					...fields,
					sheets: difficulties.map(({ key }) => ({
						id: values.sheets[key].id as string,
						difficulty: key,
						level: Number(values.sheets[key].level),
						notesDesigner: values.sheets[key].notesDesigner.trim(),
					})),
				} satisfies UpdateMusicInput);
			} else {
				await createMusicAction({
					...fields,
					sheets: difficulties.map(({ key }) => ({
						difficulty: key,
						level: Number(values.sheets[key].level),
						notesDesigner: values.sheets[key].notesDesigner.trim(),
					})),
				} satisfies CreateMusicInput);
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
									<FormField
										label="ジャンル"
										description="現在は ORIGINAL 固定です。"
									>
										<Input value="ORIGINAL" disabled />
									</FormField>
									<FormField label="ジャケット" errorText={errors.jacket}>
										<SpaceBetween size="s">
											<FileUpload
												accept="image/jpeg,image/png,image/webp"
												showFileThumbnail
												value={jacketFile}
												onChange={({ detail }) => setJacketFile(detail.value)}
												i18nStrings={{
													uploadButtonText: () => "画像を選択",
													dropzoneText: () => "画像をここにドロップ",
													removeFileAriaLabel: () => "画像を削除",
												}}
											/>
											{values.jacket ? (
												<Image
													src={values.jacket}
													alt="ジャケットプレビュー"
													width={128}
													height={128}
													className="size-32 object-cover"
													unoptimized
												/>
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
