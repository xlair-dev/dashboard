import type { ReactNode } from "react";

export default function TableCell({ children }: { children: ReactNode }) {
	return <div className="px-4 sm:px-6">{children}</div>;
}
