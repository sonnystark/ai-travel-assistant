import { NextResponse } from "next/server";
import { generatePlan } from "../../lib/generator";

type ReqBody = { prompt: string };

export async function POST(req: Request) {
  try {
    const body: ReqBody = await req.json();
    const prompt = body?.prompt || "";
    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 },
      );
    }

    const result = await generatePlan(prompt);

    return NextResponse.json({
      plan: result.plan,
      modelUsed: result.modelUsed,
      tokenBudget: result.tokenBudget,
    });
  } catch (err: any) {
    // Map internal errors to clean client messages
    const msg = String(err?.message || err);
    if (msg.includes("Upstream API error")) {
      return NextResponse.json(
        { error: "Upstream API error", details: msg },
        { status: 502 },
      );
    }
    if (msg.includes("Missing GOOGLE_API_KEY")) {
      return NextResponse.json(
        { error: "Missing api key in environment" },
        { status: 500 },
      );
    }
    if (msg.includes("No usable text found")) {
      return NextResponse.json(
        { error: "No usable text found in upstream response" },
        { status: 502 },
      );
    }
    return NextResponse.json(
      { error: "Unexpected server error", details: msg },
      { status: 500 },
    );
  }
}
