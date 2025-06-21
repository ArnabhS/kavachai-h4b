import { getUser } from "@civic/auth-web3/nextjs";
import { askAgent } from "@/lib/aiClient.js";
import { htmlAgentPrompt, } from "@/lib/agents";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Scan } from "@/lib/models";
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  const user = await getUser();
  console.log(user) 
  if(!user){
    return NextResponse.json({
        message:"User not found. Please log in",
        status:404
    })
  }  

  const { url } = await req.json();
  console.log("url :" ,url)

  // Create scan record
  await connectDB();
  const scanId = uuidv4();
  const scan = new Scan({
    id: scanId,
    type: 'web-scraping',
    status: 'active',
    startedAt: new Date(),
    userId: user.id || user.email,
    metadata: { url }
  });
  await scan.save();

  try {
    const html = await fetch(url).then(res => res.text());
    console.log("HTML:", html)
    const [htmlVuln] = await Promise.all([
      askAgent(htmlAgentPrompt, html),
    ]);

    const results = {
      site: url,
      timestamp: new Date().toISOString(),
      results: { htmlVuln }
    };

    // Update scan record as completed
    await Scan.findOneAndUpdate(
      { id: scanId },
      { 
        status: 'completed',
        completedAt: new Date(),
        results
      }
    );

    return NextResponse.json(results);
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

    throw error;
  }
}
