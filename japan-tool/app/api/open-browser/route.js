import { NextResponse } from "next/server";
import { chromium } from "playwright";

export async function GET() {
    try {
        const browser = await chromium.launch({
            headless: false,
            slowMo: 100,
        });
        const page = await browser.newPage();
        await page.goto("https://logoform.jp/form/9cfD/598244");

        return NextResponse.json({ message: "✅ Browser opened!" });
    } catch (err) {
        console.log(err.message)
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
