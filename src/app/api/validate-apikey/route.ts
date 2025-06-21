import { NextRequest, NextResponse } from 'next/server';
import { getApiKey } from '@/lib/models';
import { getUser } from '@civic/auth-web3/nextjs';


export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const user = await getUser();
  if(!user){
    return NextResponse.json({ message: 'User not found' }, { status: 404 });

  }
  const doc = await getApiKey(user?.id);
  if (!authHeader || !doc || authHeader !== `Bearer ${doc.apiKey}`) {
    return NextResponse.json({ message: 'Invalid or missing API key.' }, { status: 401 });
  }
  return NextResponse.json({ message: 'API key is valid.' });
} 