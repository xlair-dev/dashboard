"use client";

import Alert from "@cloudscape-design/components/alert";
import Button from "@cloudscape-design/components/button";
import Modal from "@cloudscape-design/components/modal";
import SpaceBetween from "@cloudscape-design/components/space-between";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteMusicAction } from "@/app/musics/actions";

export default function DeleteMusicButton({ musicId }: { musicId: string }) {
	const router = useRouter();
	const [visible, setVisible] = useState(false);
	const [error, setError] = useState<string>();
	const [isPending, startTransition] = useTransition();

	function handleDelete() {
		setError(undefined);
		startTransition(async () => {
			try {
				await deleteMusicAction(musicId);
				router.push("/musics");
			} catch {
				setError("楽曲を削除できませんでした。");
			}
		});
	}

	return (
		<>
			<Button variant="normal" onClick={() => setVisible(true)}>
				削除
			</Button>
			<Modal
				visible={visible}
				onDismiss={() => setVisible(false)}
				header="楽曲を削除"
				footer={
					<SpaceBetween direction="horizontal" size="xs">
						<Button onClick={() => setVisible(false)} disabled={isPending}>
							キャンセル
						</Button>
						<Button
							variant="primary"
							onClick={handleDelete}
							loading={isPending}
						>
							削除
						</Button>
					</SpaceBetween>
				}
			>
				<SpaceBetween size="m">
					{error ? <Alert type="error">{error}</Alert> : null}
					<p>
						この楽曲と関連する譜面、アセットを削除します。この操作は元に戻せません。
					</p>
				</SpaceBetween>
			</Modal>
		</>
	);
}
