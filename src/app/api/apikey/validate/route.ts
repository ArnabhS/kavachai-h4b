import { NextRequest, NextResponse } from 'next/server';
import { ApiKeyModel } from '@/lib/models';
import { connectDB } from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    let apiKey: string | null = null;
    
    // First try to get API key from Authorization header
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      apiKey = authHeader.replace('Bearer ', '');
    } else {
      // Fallback to request body
      try {
        const body = await req.json();
        apiKey = body.apiKey || null;
      } catch {
        // If JSON parsing fails, try to get from query params or other sources
        const url = new URL(req.url);
        apiKey = url.searchParams.get('apiKey');
      }
    }
    
    if (!apiKey) {
      return NextResponse.json({ 
        message: 'API key is required. Please provide it in Authorization header (Bearer token) or request body.',
        valid: false 
      }, { status: 400 });
    }
    
    await connectDB();
    
    // Find which user owns this API key
    const apiKeyDoc = await ApiKeyModel.findOne({ apiKey });
    
    if (!apiKeyDoc) {
      return NextResponse.json({ 
        message: 'Invalid API key.',
        valid: false 
      }, { status: 401 });
    }
    
    return NextResponse.json({ 
      message: 'API key is valid.',
      valid: true,
      userId: apiKeyDoc.userId,
      createdAt: apiKeyDoc.createdAt
    });
    
  } catch (error) {
    console.error('Error validating API key:', error);
    return NextResponse.json({ 
      message: 'Error validating API key.',
      valid: false 
    }, { status: 500 });
  }
} 