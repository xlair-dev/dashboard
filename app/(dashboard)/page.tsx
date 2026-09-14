import DashboardHome from "@/components/dashboard-home";
import { auth0 } from "@/lib/auth0";

export default async function Page() {
	const session = await auth0.getSession();

	return (
		<DashboardHome userName={session?.user.name ?? session?.user.email ?? ""} />
	);
}
