import { NextResponse } from 'next/server';
import { getApiKey, createApiKey, regenerateApiKey } from '@/lib/models';
import { getUser } from '@civic/auth-web3/nextjs';

const DEMO_USER_ID = 'demo-user'; // TODO: Replace with real user auth

export async function GET() {
  
  const user = await getUser();
  console.log(user)
  let doc = await getApiKey(DEMO_USER_ID);
  if (!doc) {
    doc = await createApiKey(DEMO_USER_ID);
  }
  return NextResponse.json({ apiKey: doc.apiKey });
}

export async function POST() {
  const doc = await regenerateApiKey(DEMO_USER_ID);
  return NextResponse.json({ apiKey: doc.apiKey });
} 