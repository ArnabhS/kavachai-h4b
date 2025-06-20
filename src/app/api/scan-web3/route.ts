import { NextRequest, NextResponse } from "next/server";
import { askAgent } from "@/lib/aiClient";
import { contractAgentPrompt } from "@/lib/agents";

export async function POST(req: NextRequest) {
  const { contract } = await req.json();
  if (!contract) {
    return NextResponse.json({ error: "No contract provided." }, { status: 400 });
  }

  try {
    const result = await askAgent(contractAgentPrompt, contract);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to analyze contract." }, { status: 500 });
  }
} 