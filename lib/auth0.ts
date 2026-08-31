import { Auth0Client } from "@auth0/nextjs-auth0/server";

export const auth0 = new Auth0Client({
	authorizationParameters: {
		audience: process.env.AUTH0_AUDIENCE ?? "https://api.xlair.dev",
		// This must match the `github` connection managed by the Auth0 tenant configuration.
		connection: "github",
	},
});
