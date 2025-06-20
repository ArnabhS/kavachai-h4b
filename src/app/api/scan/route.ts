import { getUser } from "@civic/auth-web3/nextjs";

import { askAgent } from "@/lib/aiClient";
import { htmlAgentPrompt, contractAgentPrompt, logAgentPrompt } from "@/lib/agents";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  

const user = await getUser();
 
  if(!user){
    return NextResponse.json({
        message:"User not found. Please log in",
        status:404
    })
  }  
  const { url } = await req.json();
  const html = await fetch(url).then(res => res.text());

  const [htmlVuln, contractVuln, logVuln] = await Promise.all([
    askAgent(htmlAgentPrompt, html),
    askAgent(contractAgentPrompt, html),
    askAgent(logAgentPrompt, html)
  ]);

  return NextResponse.json({
    site: url,
    timestamp: new Date().toISOString(),
    results: { htmlVuln, contractVuln, logVuln }
  });
}
