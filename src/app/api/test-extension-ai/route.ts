import { NextRequest, NextResponse } from 'next/server';
import { generateExtensionFix, testExtensionAI, getExtensionRateLimitInfo } from '@/lib/extensionAiClient';

export async function GET(req: NextRequest) {
  try {
    // Test the extension AI
    await testExtensionAI();
    
    // Get rate limit info
    const rateLimitInfo = getExtensionRateLimitInfo();
    
    return NextResponse.json({
      message: 'Extension AI test completed',
      rateLimitInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Extension AI test failed:', error);
    return NextResponse.json({ 
      error: 'Test failed', 
      details: error.message 
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { originalCode, fileType, vulnerabilityType, vulnerabilityMessage } = body;

    if (!originalCode || !fileType || !vulnerabilityType) {
      return NextResponse.json({ 
        error: 'Missing required fields: originalCode, fileType, vulnerabilityType' 
      }, { status: 400 });
    }

    const result = await generateExtensionFix(
      originalCode,
      fileType,
      vulnerabilityType,
      vulnerabilityMessage || 'Vulnerability detected'
    );

    const rateLimitInfo = getExtensionRateLimitInfo();

    return NextResponse.json({
      result,
      rateLimitInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Extension AI fix generation failed:', error);
    return NextResponse.json({ 
      error: 'Fix generation failed', 
      details: error.message 
    }, { status: 500 });
  }
} 