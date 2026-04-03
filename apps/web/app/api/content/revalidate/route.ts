import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { getContentRevalidateSecret } from "@/lib/env";

function readToken(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length).trim();
  }

  const url = new URL(request.url);
  return url.searchParams.get("secret");
}

export async function POST(request: Request) {
  const expectedSecret = getContentRevalidateSecret();
  const providedSecret = readToken(request);

  if (!expectedSecret || !providedSecret || providedSecret !== expectedSecret) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { path?: string };
  const path = typeof body.path === "string" && body.path.startsWith("/") ? body.path : null;

  if (path) {
    revalidatePath(path);
  } else {
    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath("/help");
  }

  return NextResponse.json({ ok: true, path });
}
