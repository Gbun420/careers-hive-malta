import { NextResponse } from "next/server";
import { SITE_URL } from "@/lib/site/url";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = SITE_URL;

  const content = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`;

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}