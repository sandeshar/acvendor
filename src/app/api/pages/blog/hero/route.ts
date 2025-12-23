import { db } from "@/db";
import { blogPageHero } from "@/db/blogPageSchema";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const hero = await db.select().from(blogPageHero).limit(1);

        if (!hero.length) {
            return NextResponse.json({
                title: "The Content Solution Blog",
                subtitle: "Expert insights, trends, and strategies in content marketing for Nepali businesses.",
                background_image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBP7wRSP6PNVQerc44qHCLRoYYd7gD0XXulRDkuPttKz8c2wm7R80QfOir0XcMWFKjBGgyJ5pcMWrIKbPt6SCgNWruICSXdJlao0ovxqmc5rLvSBMdY5X6oZLjHPx9qPTGkgNMIYnTzo9hXeQxzkwUbhDDc7WVvEd49h17mKa6w8QfB2EIEDD7W8XIG5RncWJ-n5n8nCSqHu4E6zkNP0BsMHsoIQz9Vpi8C5qNBL4Po-ca4mAAVTciZ-3q8TREYwunoIejOppPSO_k"
            });
        }

        return NextResponse.json(hero[0]);
    } catch (error) {
        console.error("Error fetching blog page hero:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
