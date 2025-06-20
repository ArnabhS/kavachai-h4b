import { getUser } from "@civic/auth-web3/nextjs";

import { askAgent } from "@/lib/aiClient.js";
import { htmlAgentPrompt, } from "@/lib/agents";
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
  console.log("url :" ,url)
  const html = await fetch(url).then(res => res.text());
  console.log("HTML:", html)
  const [htmlVuln] = await Promise.all([
    askAgent(htmlAgentPrompt, html),
  ]);

  return NextResponse.json({
    site: url,
    timestamp: new Date().toISOString(),
    results: { htmlVuln }
  });
}
