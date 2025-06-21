import { NextRequest, NextResponse } from "next/server";
import { askAgent } from "@/lib/aiClient";
import { logAgentPrompt } from "@/lib/agents";
import { connectDB } from "@/lib/mongodb";
import { Scan } from "@/lib/models";
import { v4 as uuidv4 } from 'uuid';
import { getUser } from "@civic/auth-web3/nextjs";

export async function POST(req: NextRequest) {
  const user = await getUser();
  if(!user){
    return NextResponse.json({
        message:"User not found. Please log in",
        status:404
    })
  }

  const { logs } = await req.json();
  if (!logs) {
    return NextResponse.json({ error: "No logs provided." }, { status: 400 });
  }

  // Create scan record
  await connectDB();
  const scanId = uuidv4();
  const scan = new Scan({
    id: scanId,
    type: 'audit-log',
    status: 'active',
    startedAt: new Date(),
    userId: user.id || user.email,
    metadata: { logSource: 'user-input' }
  });
  await scan.save();

  try {
    const result = await askAgent(logAgentPrompt, logs);
    
    // Update scan record as completed
    await Scan.findOneAndUpdate(
      { id: scanId },
      { 
        status: 'completed',
        completedAt: new Date(),
        results: result
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    // Update scan record as failed
    await Scan.findOneAndUpdate(
      { id: scanId },
      { 
        status: 'failed',
        completedAt: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    );

    return NextResponse.json({ error: "Failed to analyze logs." }, { status: 500 });
  }
} 