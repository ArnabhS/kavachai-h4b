import { NextRequest, NextResponse } from "next/server";
import { askAgent } from "@/lib/aiClient";
import { logAgentPrompt } from "@/lib/agents";

export async function POST(req: NextRequest) {
  const { logs } = await req.json();
  if (!logs) {
    return NextResponse.json({ error: "No logs provided." }, { status: 400 });
  }

  try {
    const result = await askAgent(logAgentPrompt, logs);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to analyze logs." }, { status: 500 });
  }
} 