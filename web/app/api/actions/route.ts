import { allActionsList } from "@/lib/engine/actions/standard-actions";
import { NextResponse } from "next/server";
import SuperJSON from "superjson";

export function GET() {
	return NextResponse.json(SuperJSON.serialize(allActionsList));
}
