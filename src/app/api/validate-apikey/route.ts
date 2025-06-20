import { NextRequest, NextResponse } from 'next/server';
import { getApiKey } from '@/lib/models';

const DEMO_USER_ID = 'demo-user'; // TODO: Replace with real user auth

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const doc = await getApiKey(DEMO_USER_ID);
  if (!authHeader || !doc || authHeader !== `Bearer ${doc.apiKey}`) {
    return NextResponse.json({ message: 'Invalid or missing API key.' }, { status: 401 });
  }
  return NextResponse.json({ message: 'API key is valid.' });
} 