import { NextRequest, NextResponse } from 'next/server';
import { ApiKeyModel } from '@/lib/models';
import { connectDB } from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const { apiKey } = await req.json();
    
    if (!apiKey) {
      return NextResponse.json({ 
        message: 'API key is required.',
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