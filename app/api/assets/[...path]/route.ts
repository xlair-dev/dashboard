import { auth0 } from "@/lib/auth0";

const assetPathPattern =
	/^(musics\/[^/]+\/(?:audio|jacket)|sheets\/[^/]+\/chart)\/[^/]+$/;
// Jacket files use the public API route; audio and chart files use admin routes.
const jacketPathPattern = /^musics\/[^/]+\/jacket\/[^/]+$/;

function attachmentFileName(path: string, requestedName: string | null) {
	const assetName = path.split("/").at(-1) ?? "asset";
	const extension = assetName.match(/\.[a-z\d]+$/i)?.[0] ?? "";
	const name =
		requestedName ?? assetName.slice(0, assetName.length - extension.length);
	const safeName = Array.from(name, (character) => {
		const codePoint = character.codePointAt(0) ?? 0;
		return /[<>:"/\\|?*]/.test(character) || codePoint < 32 || codePoint === 127
			? "_"
			: character;
	})
		.join("")
		.trim()
		.replace(/^\.+|[. ]+$/g, "");
	return `${Array.from(safeName).slice(0, 160).join("") || "asset"}${extension}`;
}

function encodeFileName(fileName: string) {
	return encodeURIComponent(fileName).replace(
		/[!'()*]/g,
		(character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
	);
}

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ path: string[] }> },
) {
	const path = (await params).path.join("/");
	if (!assetPathPattern.test(path)) return new Response(null, { status: 404 });

	const isPublicJacket = jacketPathPattern.test(path);
	let accessToken: Awaited<ReturnType<typeof auth0.getAccessToken>> | undefined;
	if (!isPublicJacket) {
		try {
			accessToken = await auth0.getAccessToken({
				audience: process.env.AUTH0_AUDIENCE ?? "https://api.xlair.dev",
			});
		} catch {
			return new Response(null, { status: 401 });
		}
	}
	if (!isPublicJacket && !accessToken?.token)
		return new Response(null, { status: 401 });

	const upstreamPath = isPublicJacket ? path : `admin/${path}`;
	const upstreamUrl = new URL(
		upstreamPath.split("/").map(encodeURIComponent).join("/"),
		`${process.env.API_BASE_URL}/`,
	);
	const requestHeaders = new Headers();
	if (accessToken?.token)
		requestHeaders.set("Authorization", `Bearer ${accessToken.token}`);
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
	if (new URL(request.url).searchParams.has("download") && response.ok) {
		const fileName = attachmentFileName(
			path,
			new URL(request.url).searchParams.get("filename"),
		);
		headers.set(
			"content-disposition",
			`attachment; filename*=UTF-8''${encodeFileName(fileName)}`,
		);
	}
	return new Response(response.body, { status: response.status, headers });
}
