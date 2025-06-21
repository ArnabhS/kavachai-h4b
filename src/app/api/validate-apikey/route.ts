import { NextRequest, NextResponse } from 'next/server';
import { getApiKey, ApiKeyModel } from '@/lib/models';
import { getUser } from '@civic/auth-web3/nextjs';
import { connectDB } from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  
  // If we have an Authorization header, this is likely from the extension
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const apiKey = authHeader.replace('Bearer ', '');
    
    try {
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
        userId: apiKeyDoc.userId
      });
    } catch (error) {
      console.error('Error validating API key:', error);
      return NextResponse.json({ 
        message: 'Error validating API key.',
        valid: false 
      }, { status: 500 });
    }
  }
  
  // If no Authorization header, this is from the frontend - check user session
  const user = await getUser();
  console.log('User from session:', user);
  
  if (!user) {
    return NextResponse.json({ 
      message: 'User not found. Please log in.',
      valid: false 
    }, { status: 404 });
  }
  
  const doc = await getApiKey(user?.id);
  if (!doc) {
    return NextResponse.json({ 
      message: 'No API key found for user.',
      valid: false 
    }, { status: 404 });
  }
  
  return NextResponse.json({ 
    message: 'API key is valid.',
    valid: true,
    userId: user.id,
    apiKey: doc.apiKey
  });
} 