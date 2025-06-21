"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Wallet, AlertTriangle, CheckCircle, Clock, Shield, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LoadingSkeleton } from "../ui/LoadingSkeleton"

type WalletSecurityResult = {
  address?: string
  riskScore?: number
  risks?: Array<{
    type: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    description: string
    evidence?: string
  }>
  civicAuthStatus?: {
    verified: boolean
    verificationLevel: string
    lastVerified: string | null
    message: string
    requiresVerification: boolean
  }
  transactionAnalysis?: {
    totalTransactions: number
    suspiciousTransactions: number
    highValueTransactions: number
    recentActivity: Array<{
      type: string
      amount: string
      timestamp: string
      risk: string
    }>
  }
  recommendations?: string[]
  error?: string
} | null

interface WalletSecurityTabProps {
  onScanComplete?: () => void
}

export function WalletSecurityTab({ onScanComplete }: WalletSecurityTabProps) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<WalletSecurityResult>(null)
  const [walletAddress, setWalletAddress] = useState("")

  const handleScan = async () => {
    if (!walletAddress.trim()) return

    setLoading(true)
    setData(null)

    try {
      const res = await fetch("/api/wallet-security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress }),
      })
      const result = await res.json()
      setData(result.data || result)
      // Trigger stats refresh
      if (onScanComplete) {
        onScanComplete()
      }
    } catch (error) {
      setData({ error: error instanceof Error ? error.message : "Failed to analyze wallet security. Please try again." })
    }

    setLoading(false)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "text-red-400 bg-red-400/10 border-red-400/20"
      case "high":
        return "text-orange-400 bg-orange-400/10 border-orange-400/20"
      case "medium":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
      case "low":
        return "text-green-400 bg-green-400/10 border-green-400/20"
      default:
        return "text-gray-400 bg-gray-400/10 border-gray-400/20"
    }
  }

  const getRiskScoreColor = (score: number) => {
    if (score >= 75) return "text-red-400"
    if (score >= 50) return "text-orange-400"
    if (score >= 25) return "text-yellow-400"
    return "text-green-400"
  }

  const getRiskScoreBg = (score: number) => {
    if (score >= 75) return "bg-red-400/10 border-red-400/20"
    if (score >= 50) return "bg-orange-400/10 border-orange-400/20"
    if (score >= 25) return "bg-yellow-400/10 border-yellow-400/20"
    return "bg-green-400/10 border-green-400/20"
  }

  if (loading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Wallet Input */}
      <motion.div
        className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-lg font-semibold text-white mb-4">Wallet Security Analyzer</h3>
        <div className="flex flex-col md:flex-row space-x-4">
          <input
            type="text"
            placeholder="Enter wallet address (0x...)"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-gray-600 mb-4 md:mb-0 font-mono text-sm"
            onKeyPress={(e) => e.key === "Enter" && handleScan()}
          />
          <Button
            onClick={handleScan}
            className="bg-white hover:bg-gray-100 text-black px-4 lg:px-6"
            disabled={loading || !walletAddress.trim()}
          >
            {loading ? "Analyzing..." : "Analyze Wallet"}
          </Button>
        </div>
      </motion.div>

      {/* Error Display */}
      {data?.error && (
        <motion.div
          className="bg-gradient-to-br from-red-900/20 to-black border border-red-800/50 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center space-x-2 text-red-400">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-semibold">Analysis Failed</span>
          </div>
          <p className="text-red-300 mt-2">{data.error}</p>
        </motion.div>
      )}

      {/* Results */}
      {data && !data.error && (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Wallet Info */}
          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Wallet Analysis Results</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Clock className="h-4 w-4" />
                <span>{new Date().toLocaleString()}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm mb-4">
              <Wallet className="h-4 w-4 text-gray-400" />
              <span className="text-gray-400 font-mono">{data.address}</span>
            </div>
            
            {/* Risk Score */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-gray-400" />
                <span className="text-gray-400">Risk Score:</span>
              </div>
              <div className={`px-3 py-1 rounded-lg border ${getRiskScoreBg(data.riskScore || 0)}`}>
                <span className={`font-bold text-lg ${getRiskScoreColor(data.riskScore || 0)}`}>
                  {data.riskScore || 0}/100
                </span>
              </div>
            </div>
          </div>

          {/* Civic Auth Status */}
          {data.civicAuthStatus && (
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blue-400" />
                <span>Civic Auth Status</span>
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Verification Status:</span>
                  <span className={`px-2 py-1 rounded text-sm ${data.civicAuthStatus.verified ? 'text-green-400 bg-green-400/10 border border-green-400/20' : 'text-red-400 bg-red-400/10 border border-red-400/20'}`}>
                    {data.civicAuthStatus.verified ? 'Verified' : 'Not Verified'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Verification Level:</span>
                  <span className="text-white">{data.civicAuthStatus.verificationLevel}</span>
                </div>
                {data.civicAuthStatus.lastVerified && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Last Verified:</span>
                    <span className="text-white">{new Date(data.civicAuthStatus.lastVerified).toLocaleDateString()}</span>
                  </div>
                )}
                <p className="text-gray-300 text-sm mt-3">{data.civicAuthStatus.message}</p>
              </div>
            </div>
          )}

          {/* Transaction Analysis */}
          {data.transactionAnalysis && (
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Activity className="h-5 w-5 text-purple-400" />
                <span>Transaction Analysis</span>
              </h3>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{data.transactionAnalysis.totalTransactions}</div>
                  <div className="text-sm text-gray-400">Total Transactions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">{data.transactionAnalysis.suspiciousTransactions}</div>
                  <div className="text-sm text-gray-400">Suspicious</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{data.transactionAnalysis.highValueTransactions}</div>
                  <div className="text-sm text-gray-400">High Value</div>
                </div>
              </div>
              
              {/* Recent Activity */}
              {data.transactionAnalysis.recentActivity && data.transactionAnalysis.recentActivity.length > 0 && (
                <div>
                  <h4 className="text-md font-semibold text-white mb-3">Recent Activity</h4>
                  <div className="space-y-2">
                    {data.transactionAnalysis.recentActivity.slice(0, 5).map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div>
                          <div className="text-white text-sm">{activity.type}</div>
                          <div className="text-gray-400 text-xs">{activity.amount}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-gray-400 text-xs">{new Date(activity.timestamp).toLocaleDateString()}</div>
                          <div className={`text-xs px-2 py-1 rounded ${getSeverityColor(activity.risk)}`}>
                            {activity.risk}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Security Risks */}
          {data.risks && data.risks.length > 0 && (
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <span>Security Risks Found ({data.risks.length})</span>
              </h3>
              <div className="space-y-4">
                {data.risks.map((risk, index) => (
                  <motion.div
                    key={index}
                    className="border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-white">{risk.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                      <span className={`px-2 py-1 rounded text-xs border ${getSeverityColor(risk.severity)}`}>
                        {risk.severity}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{risk.description}</p>
                    {risk.evidence && <p className="text-gray-500 text-xs">Evidence: {risk.evidence}</p>}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {data.recommendations && data.recommendations.length > 0 && (
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>Security Recommendations ({data.recommendations.length})</span>
              </h3>
              <div className="space-y-4">
                {data.recommendations.map((recommendation, index) => (
                  <motion.div
                    key={index}
                    className="border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-300 text-sm">{recommendation}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* No Risks Found */}
          {(!data.risks || data.risks.length === 0) && data.riskScore !== undefined && data.riskScore < 25 && (
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Wallet Security Analysis Complete</h3>
              <p className="text-gray-400">No significant security risks detected. Your wallet appears to be secure.</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
} 