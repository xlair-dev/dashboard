import { auth0 } from "@/lib/auth0";

const assetPathPattern = /^musics\/[^/]+\/(audio|chart)\/[^/]+$/;

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ path: string[] }> },
) {
	const path = (await params).path.join("/");
	if (!assetPathPattern.test(path)) return new Response(null, { status: 404 });

	let accessToken: Awaited<ReturnType<typeof auth0.getAccessToken>>;
	try {
		accessToken = await auth0.getAccessToken({
			audience: process.env.AUTH0_AUDIENCE ?? "https://api.xlair.dev",
		});
	} catch {
		return new Response(null, { status: 401 });
	}
	if (!accessToken?.token) return new Response(null, { status: 401 });

	const upstreamUrl = new URL(
		path.split("/").map(encodeURIComponent).join("/"),
		`${process.env.API_BASE_URL}/`,
	);
	const requestHeaders = new Headers({
		Authorization: `Bearer ${accessToken.token}`,
	});
	for (const name of ["if-range", "range"]) {
		const value = request.headers.get(name);
		if (value) requestHeaders.set(name, value);
	}

	let response: Response;
	try {
		response = await fetch(upstreamUrl, {
			headers: requestHeaders,
			cache: "no-store",
		});
	} catch {
		return new Response(null, { status: 502 });
	}
	const headers = new Headers();
	for (const name of [
		"accept-ranges",
		"content-length",
		"content-range",
		"content-type",
	]) {
		const value = response.headers.get(name);
		if (value) headers.set(name, value);
	}
	return new Response(response.body, { status: response.status, headers });
}
