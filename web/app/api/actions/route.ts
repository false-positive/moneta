import { allActionsList } from "@/lib/cases/actions";
import { NextResponse } from "next/server";
import SuperJSON from "superjson";

export function GET() {
	return NextResponse.json(SuperJSON.serialize(allActionsList));
}
