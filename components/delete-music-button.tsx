"use client";

import Alert from "@cloudscape-design/components/alert";
import Button from "@cloudscape-design/components/button";
import Modal from "@cloudscape-design/components/modal";
import SpaceBetween from "@cloudscape-design/components/space-between";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteMusicAction } from "@/app/musics/actions";

const destructiveIconStyle = {
	root: {
		background: {
			active: "#fff5f5",
			default: "#ffffff",
			hover: "#fff5f5",
		},
		borderColor: {
			active: "#7d2100",
			default: "#d13212",
			hover: "#a91b0c",
		},
		color: {
			active: "#7d2100",
			default: "#d13212",
			hover: "#a91b0c",
		},
	},
};

const destructiveActionStyle = {
	root: {
		background: {
			active: "#a91b0c",
			default: "#d13212",
			hover: "#a91b0c",
		},
		borderColor: {
			active: "#7d2100",
			default: "#d13212",
			hover: "#a91b0c",
		},
		color: { default: "#ffffff" },
	},
};

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
			<Button
				ariaLabel="楽曲を削除する"
				iconName="delete-marker"
				style={destructiveIconStyle}
				variant="normal"
				onClick={() => setVisible(true)}
			>
				楽曲を削除する
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
							style={destructiveActionStyle}
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
