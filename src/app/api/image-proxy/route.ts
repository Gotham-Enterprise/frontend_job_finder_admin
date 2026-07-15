import { NextRequest, NextResponse } from "next/server";

// Same hosts as next.config.ts images.domains — keeps the proxy from being an open relay
const ALLOWED_HOSTS = new Set([
  "jfapi.docbooked.com",
  "gotham-job-finder-app-bucket.s3.amazonaws.com",
  "gotham-job-finder-app-bucket.s3.us-east-2.amazonaws.com",
  "gotham-job-finder.s3.amazonaws.com",
  "gotham-job-finder.s3.us-east-2.amazonaws.com",
]);

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  if (parsed.protocol !== "https:" || !ALLOWED_HOSTS.has(parsed.hostname)) {
    return NextResponse.json({ error: "Host not allowed" }, { status: 403 });
  }

  const upstream = await fetch(parsed.toString());

  if (!upstream.ok) {
    return NextResponse.json(
      { error: "Failed to fetch image" },
      { status: upstream.status },
    );
  }

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "image/jpeg",
      "Cache-Control": "private, max-age=300",
    },
  });
}
