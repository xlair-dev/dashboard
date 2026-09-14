import type { ReactNode } from "react";

export default function StickyPageHeader({
	children,
}: {
	children: ReactNode;
}) {
	return <div className="sticky top-0 z-10 bg-white">{children}</div>;
}
