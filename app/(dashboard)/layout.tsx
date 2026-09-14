import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { auth0 } from "@/lib/auth0";

export default async function DashboardRouteLayout({
	children,
}: Readonly<{ children: ReactNode }>) {
	const session = await auth0.getSession();

	if (!session) {
		redirect("/auth/login");
	}

	return children;
}
