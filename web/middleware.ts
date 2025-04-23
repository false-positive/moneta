import { NextRequest, NextResponse } from "next/server";
import { ipAddress } from "@vercel/edge";

const TESTER_COOKIE = "_m_tester";
const TESTER_PARAM = "_tester";

export async function middleware(request: NextRequest) {
	if (process.env.NODE_ENV === "development") {
		return NextResponse.next();
	}

	const ip = ipAddress(request);
	const isTester =
		!!request.cookies.get(TESTER_COOKIE)?.value ||
		request.nextUrl.searchParams.get(TESTER_PARAM) === "1";

	const userId = await crypto.subtle
		.digest("SHA-256", new TextEncoder().encode(ip))
		.then((hash) =>
			Array.from(new Uint8Array(hash))
				.map((b) => b.toString(16).padStart(2, "0"))
				.join("")
		);

	if (isTester || (await isAccessAllowed(userId))) {
		const response = NextResponse.next();
		if (request.nextUrl.searchParams.has(TESTER_PARAM)) {
			response.cookies.set(TESTER_COOKIE, "1");
		}
		return response;
	}

	const url = new URL(request.url);
	url.protocol = "https";
	url.hostname = process.env.WAITLIST_HOSTNAME!;
	url.port = "443";
	return NextResponse.rewrite(url);
}

async function isAccessAllowed(userId: string) {
	const data = await fetch(
		`${process.env.NEXT_PUBLIC_POSTHOG_HOST}/decide?v=3/`,
		{
			method: "POST",
			body: JSON.stringify({
				api_key: process.env.NEXT_PUBLIC_POSTHOG_KEY,
				distinct_id: userId,
			}),
		}
	).then((res) => res.json());

	console.log(data);

	return data.featureFlags["pre-launch-demo"] === true;
}
