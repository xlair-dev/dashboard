"use client";

import BreadcrumbGroup from "@cloudscape-design/components/breadcrumb-group";

export default function MusicBreadcrumbs({
	current,
	currentHref,
}: {
	current: string;
	currentHref: string;
}) {
	return (
		<BreadcrumbGroup
			ariaLabel="楽曲管理の階層"
			items={[
				{ text: "ホーム", href: "/" },
				{ text: "楽曲管理", href: "/musics" },
				{ text: current, href: currentHref },
			]}
		/>
	);
}
