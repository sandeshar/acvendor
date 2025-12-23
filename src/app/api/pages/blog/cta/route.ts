import { db } from "@/db";
import { blogPageCTA } from "@/db/blogPageSchema";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const cta = await db.select().from(blogPageCTA).limit(1);

        if (!cta.length) {
            return NextResponse.json({
                title: "Stay Ahead of the Curve",
                description: "Get the latest content marketing tips delivered to your inbox.",
                button_text: "Subscribe"
            });
        }

        return NextResponse.json(cta[0]);
    } catch (error) {
        console.error("Error fetching blog page cta:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
