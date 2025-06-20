import { NextRequest, NextResponse } from 'next/server';
import { getApiKey } from '@/lib/models';

const DEMO_USER_ID = 'demo-user'; // TODO: Replace with real user auth

export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return NextResponse.json({ message: 'Invalid content type.' }, { status: 400 });
  }
  const body = await req.json();
  if (!Array.isArray(body.files)) {
    return NextResponse.json({ message: 'Missing files array.' }, { status: 400 });
  }
  // Authenticate API key
  const authHeader = req.headers.get('authorization');
  const doc = await getApiKey(DEMO_USER_ID);
  if (!authHeader || !doc || authHeader !== `Bearer ${doc.apiKey}`) {
    return NextResponse.json({ message: 'Invalid or missing API key.' }, { status: 401 });
  }
  // Dummy scan: just echo file names and a fake result
  const results = body.files.map((f: { file: string }) => ({
    file: f.file,
    issues: [
      { type: 'demo', message: `No real scan performed for ${f.file}` }
    ]
  }));
  return NextResponse.json({ results });
} 