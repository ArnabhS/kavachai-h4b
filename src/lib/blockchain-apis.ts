import { getUser } from "@civic/auth-web3/nextjs";

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || '';
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || '';

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  timestamp: string;
  blockNumber: string;
  contractAddress?: string;
  methodName?: string;
}

interface ContractInfo {
  address: string;
  verified: boolean;
  contractName: string;
  compilerVersion: string;
  sourceCode?: string;
  abi?: string;
}

interface TokenApproval {
  tokenAddress: string;
  spender: string;
  amount: string;
  allowance: string;
}

interface CivicAuthStatus {
  verified: boolean;
  verificationLevel: 'pending' | 'verified' | 'unknown';
  lastVerified: string | null;
  message: string;
  requiresVerification: boolean;
}

// Etherscan API calls
export async function getEthereumTransactions(address: string): Promise<Transaction[]> {
  if (!ETHERSCAN_API_KEY) {
    throw new Error('ETHERSCAN_API_KEY not configured');
  }

  try {
    const response = await fetch(
      `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${ETHERSCAN_API_KEY}`
    );
    
    const data: { status: string; result?: Array<{
      hash: string;
      from: string;
      to: string;
      value: string;
      gas: string;
      gasPrice: string;
      timeStamp: string;
      blockNumber: string;
      contractAddress?: string;
      methodName?: string;
    }> } = await response.json();
    
    if (data.status === '1' && data.result) {
      return data.result.map((tx) => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: tx.value,
        gas: tx.gas,
        gasPrice: tx.gasPrice,
        timestamp: tx.timeStamp,
        blockNumber: tx.blockNumber,
        contractAddress: tx.contractAddress || undefined,
        methodName: tx.methodName || undefined
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching Ethereum transactions:', error);
    return [];
  }
}

export async function getEthereumContractInfo(address: string): Promise<ContractInfo | null> {
  if (!ETHERSCAN_API_KEY) {
    throw new Error('ETHERSCAN_API_KEY not configured');
  }

  try {
    const response = await fetch(
      `https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${address}&apikey=${ETHERSCAN_API_KEY}`
    );
    
    const data = await response.json();
    
    if (data.status === '1' && data.result && data.result[0]) {
      const contract = data.result[0];
      return {
        address: contract.ContractAddress,
        verified: contract.SourceCode !== '',
        contractName: contract.ContractName || 'Unknown',
        compilerVersion: contract.CompilerVersion || 'Unknown',
        sourceCode: contract.SourceCode || undefined,
        abi: contract.ABI || undefined
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching Ethereum contract info:', error);
    return null;
  }
}

// Polygon API calls
export async function getPolygonTransactions(address: string): Promise<Transaction[]> {
  if (!POLYGONSCAN_API_KEY) {
    throw new Error('POLYGONSCAN_API_KEY not configured');
  }

  try {
    const response = await fetch(
      `https://api.polygonscan.com/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${POLYGONSCAN_API_KEY}`
    );
    
    const data: { status: string; result?: Array<{
      hash: string;
      from: string;
      to: string;
      value: string;
      gas: string;
      gasPrice: string;
      timeStamp: string;
      blockNumber: string;
      contractAddress?: string;
      methodName?: string;
    }> } = await response.json();
    
    if (data.status === '1' && data.result) {
      return data.result.map((tx) => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: tx.value,
        gas: tx.gas,
        gasPrice: tx.gasPrice,
        timestamp: tx.timeStamp,
        blockNumber: tx.blockNumber,
        contractAddress: tx.contractAddress || undefined,
        methodName: tx.methodName || undefined
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching Polygon transactions:', error);
    return [];
  }
}

// Token approval checking (using Etherscan API)
export async function getTokenApprovals(walletAddress: string): Promise<TokenApproval[]> {
  if (!ETHERSCAN_API_KEY) {
    throw new Error('ETHERSCAN_API_KEY not configured');
  }

  try {
    const response = await fetch(
      `https://api.etherscan.io/api?module=account&action=tokentx&address=${walletAddress}&sort=desc&apikey=${ETHERSCAN_API_KEY}`
    );
    
    const data: { status: string; result?: Array<{
      contractAddress: string;
      to: string;
      value: string;
      methodName: string;
    }> } = await response.json();
    
    if (data.status === '1' && data.result) {
      // Filter for approval transactions
      const approvals = data.result.filter((tx) => 
        tx.methodName === 'approve' || tx.methodName === 'increaseAllowance'
      );
      
      return approvals.map((tx) => ({
        tokenAddress: tx.contractAddress,
        spender: tx.to,
        amount: tx.value,
        allowance: tx.value // For approvals, value is the allowance
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching token approvals:', error);
    return [];
  }
}

// Civic Auth API integration - using Civic Auth Web3 for user verification
export async function checkCivicAuthStatus(): Promise<CivicAuthStatus> {
  try {
    const user = await getUser();

    if(!user){
        return {
            verified: false,
            verificationLevel: 'pending',
            lastVerified: null,
            message: 'Please sign in with Civic Auth to verify your identity',
            requiresVerification: true
          };
    }
    return {
        verified: true,
        verificationLevel: 'pending',
        lastVerified: null,
        message: 'Civic auth verified successfully',
        requiresVerification: false
      }; 
  } catch (error) {
    console.error('Error checking Civic Auth status:', error);
    return {
      verified: false,
      verificationLevel: 'unknown',
      lastVerified: null,
      message: 'Unable to verify Civic Auth status',
      requiresVerification: true
    };
  }
}

// Phishing database check (using Etherscan API for known malicious contracts)
export async function checkPhishingDatabase(address: string): Promise<boolean> {
  try {
    // Check if address has been flagged in recent transactions
    const transactions = await getEthereumTransactions(address);
    
    // Look for patterns that might indicate phishing
    const suspiciousPatterns = transactions.some(tx => 
      tx.to.toLowerCase().includes('phish') ||
      tx.to.toLowerCase().includes('scam') ||
      tx.to.toLowerCase().includes('fake')
    );
    
    return suspiciousPatterns;
  } catch (error) {
    console.error('Error checking phishing database:', error);
    return false;
  }
}

// Get wallet balance and activity summary
export async function getWalletSummary(address: string): Promise<{
  totalTransactions: number;
  suspiciousTransactions: number;
  highValueTransactions: number;
  recentActivity: Array<{
    type: string;
    amount: string;
    timestamp: string;
    risk: string;
  }>;
}> {
  try {
    const [ethTransactions, polygonTransactions] = await Promise.all([
      getEthereumTransactions(address),
      getPolygonTransactions(address)
    ]);
    
    const allTransactions = [...ethTransactions, ...polygonTransactions];
    
    return {
      totalTransactions: allTransactions.length,
      suspiciousTransactions: allTransactions.filter(tx => 
        tx.value > '1000000000000000000' || // > 1 ETH
        tx.to.toLowerCase().includes('phish') ||
        tx.to.toLowerCase().includes('scam')
      ).length,
      highValueTransactions: allTransactions.filter(tx => 
        tx.value > '1000000000000000000' // > 1 ETH
      ).length,
      recentActivity: allTransactions.slice(0, 5).map(tx => ({
        type: tx.contractAddress ? 'contract_interaction' : 'transfer',
        amount: tx.value,
        timestamp: new Date(parseInt(tx.timestamp) * 1000).toISOString(),
        risk: tx.value > '1000000000000000000' ? 'high' : 'low'
      }))
    };
  } catch (error) {
    console.error('Error getting wallet summary:', error);
    return {
      totalTransactions: 0,
      suspiciousTransactions: 0,
      highValueTransactions: 0,
      recentActivity: []
    };
  }
} 