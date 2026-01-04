import { connectDB } from "@/db";
import { BlogPageCTA } from "@/db/blogPageSchema";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await connectDB();
        const cta = await BlogPageCTA.findOne().lean();

        if (!cta) {
            return NextResponse.json({
                title: "Stay Ahead of the Curve",
                description: "Get the latest content marketing tips delivered to your inbox.",
                button_text: "Subscribe"
            });
        }

        return NextResponse.json(cta);
    } catch (error) {
        console.error("Error fetching blog page cta:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
