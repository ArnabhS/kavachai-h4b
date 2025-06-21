import { NextRequest, NextResponse } from 'next/server';
import { 
  checkCivicAuthStatus, 
  getWalletSummary, 
  checkPhishingDatabase, 
  getTokenApprovals 
} from '@/lib/blockchain-apis';
import { getUser } from '@civic/auth-web3/nextjs';

interface WalletSecurityResult {
  address: string;
  riskScore: number;
  risks: {
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    evidence?: string;
  }[];
  civicAuthStatus: {
    verified: boolean;
    verificationLevel: string;
    lastVerified: string | null;
    message: string;
    requiresVerification: boolean;
  };
  transactionAnalysis: {
    totalTransactions: number;
    suspiciousTransactions: number;
    highValueTransactions: number;
    recentActivity: {
      type: string;
      amount: string;
      timestamp: string;
      risk: string;
    }[];
  };
  recommendations: string[];
}

// Check for smart contract risks using real data
async function checkSmartContractRisks(walletAddress: string): Promise<Array<{
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  evidence?: string;
}>> {
  const risks: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    evidence?: string;
  }> = [];
  
  try {
    // Check for excessive token approvals
    const approvals = await getTokenApprovals(walletAddress);
    
    if (approvals.length > 10) {
      risks.push({
        type: 'excessive_approvals',
        severity: 'high',
        description: `Wallet has ${approvals.length} token approvals to various contracts`,
        evidence: `Found ${approvals.length} approval transactions`
      });
    }
    
    // Check for high-value approvals
    const highValueApprovals = approvals.filter(approval => 
      parseInt(approval.amount) > 1000000000000000000000 // > 1000 tokens
    );
    
    if (highValueApprovals.length > 0) {
      risks.push({
        type: 'high_value_approvals',
        severity: 'critical',
        description: `Wallet has high-value token approvals (${highValueApprovals.length} found)`,
        evidence: `Approvals totaling ${highValueApprovals.reduce((sum, a) => sum + parseInt(a.amount), 0)} wei`
      });
    }
    
  } catch (error) {
    console.error('Error checking smart contract risks:', error);
  }
  
  return risks;
}

// Check for phishing risks using real data
async function checkPhishingRisks(walletAddress: string): Promise<Array<{
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  evidence?: string;
}>> {
  const risks: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    evidence?: string;
  }> = [];
  
  try {
    // Check against phishing database
    const isPhishing = await checkPhishingDatabase(walletAddress);
    
    if (isPhishing) {
      risks.push({
        type: 'phishing_address',
        severity: 'critical',
        description: 'Address has been flagged for suspicious activity',
        evidence: 'Transaction history shows patterns consistent with phishing'
      });
    }
    
    // Check for recently created addresses (less than 30 days)
    // This would require additional blockchain data in real implementation
    
  } catch (error) {
    console.error('Error checking phishing risks:', error);
  }
  
  return risks;
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return NextResponse.json({ message: 'Invalid content type.' }, { status: 400 });
  }
  
  const body = await req.json();
  if (!body.walletAddress) {
    return NextResponse.json({ message: 'Wallet address is required.' }, { status: 400 });
  }
  const user = await getUser();
  if(!user){
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }
  
  const walletAddress = body.walletAddress;
  
  try {
    // Perform wallet security analysis with real data
    const [civicAuthStatus, transactionAnalysis, phishingRisks, contractRisks] = await Promise.all([
      checkCivicAuthStatus(),
      getWalletSummary(walletAddress),
      checkPhishingRisks(walletAddress),
      checkSmartContractRisks(walletAddress)
    ]);
    
    const allRisks = [...phishingRisks, ...contractRisks];
    
    // Calculate risk score (0-100) based on real data
    let riskScore = 0;
    
    // Base score from transaction analysis
    if (transactionAnalysis.suspiciousTransactions > 0) {
      riskScore += 20;
    }
    if (transactionAnalysis.highValueTransactions > 5) {
      riskScore += 15;
    }
    
    // Add risk score from detected issues
    allRisks.forEach(risk => {
      switch (risk.severity) {
        case 'critical': riskScore += 25; break;
        case 'high': riskScore += 15; break;
        case 'medium': riskScore += 10; break;
        case 'low': riskScore += 5; break;
      }
    });
    
    // Cap at 100
    riskScore = Math.min(100, riskScore);
    
    // Generate recommendations based on real data
    const recommendations = [];
    if (!civicAuthStatus.verified) {
      recommendations.push('Enable Civic Auth verification for enhanced security');
    }
    if (allRisks.some(r => r.type === 'excessive_approvals')) {
      recommendations.push('Review and revoke unnecessary token approvals');
    }
    if (allRisks.some(r => r.type === 'high_value_approvals')) {
      recommendations.push('Immediately revoke high-value token approvals');
    }
    if (riskScore > 50) {
      recommendations.push('Consider using a hardware wallet for high-value assets');
    }
    if (transactionAnalysis.suspiciousTransactions > 0) {
      recommendations.push('Monitor wallet activity for suspicious transactions');
    }
    if (transactionAnalysis.totalTransactions === 0) {
      recommendations.push('Wallet appears to be new - be cautious with initial transactions');
    }
    
    const result: WalletSecurityResult = {
      address: walletAddress,
      riskScore,
      risks: allRisks,
      civicAuthStatus,
      transactionAnalysis,
      recommendations
    };
    
    return NextResponse.json({
      success: true,
      data: result,
      scanTime: new Date().toISOString()
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to analyze wallet security',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 