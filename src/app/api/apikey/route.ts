import { NextResponse } from 'next/server';
import { getApiKey, createApiKey, regenerateApiKey } from '@/lib/models';
import { getUser } from '@civic/auth-web3/nextjs';


export async function GET() {
  
  const user = await getUser();
 
  if(!user){
    return NextResponse.json({ message:"User not found" ,
      status:404
    });
  }
  let doc = await getApiKey(user?.id);
  if (!doc) {
    doc = await createApiKey(user?.id);
  }
  return NextResponse.json({ apiKey: doc.apiKey });
}

export async function POST() {
  const user = await getUser();
  
  if(!user){
    return NextResponse.json({ message:"User not found" ,
      status:404
    });
  }
  const doc = await regenerateApiKey(user?.id);
  return NextResponse.json({ apiKey: doc.apiKey });
} 