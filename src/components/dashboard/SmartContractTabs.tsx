"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FileText, Shield, AlertTriangle, CheckCircle, Code } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LoadingSkeleton } from "../ui/LoadingSkeleton"


type ContractScanResult = {
  vulnerabilities?: Array<{
    type: string
    description: string
    severity: string
    location?: string
  }>
  suggestions?: Array<{
    suggestion: string
    details: string
    example?: string
  }>
  error?: string
} | null

interface SmartContractsTabProps {
  onScanComplete?: () => void
}

export function SmartContractsTab({ onScanComplete }: SmartContractsTabProps) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ContractScanResult>(null)
  const [contract, setContract] = useState("")

  const handleScan = async () => {
    if (!contract.trim()) return

    setLoading(true)
    setData(null)

    try {
      const res = await fetch("/api/scan-web3", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contract }),
      })
      const result = await res.json()
      setData(result)
      // Trigger stats refresh
      if (onScanComplete) {
        onScanComplete()
      }
    } catch (error) {
      setData({ error: error instanceof Error ? error.message : "Failed to scan smart contract. Please try again." })
    }

    setLoading(false)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high":
        return "text-red-400 bg-red-400/10 border-red-400/20"
      case "medium":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
      case "low":
        return "text-green-400 bg-green-400/10 border-green-400/20"
      default:
        return "text-gray-400 bg-gray-400/10 border-gray-400/20"
    }
  }

  if (loading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Contract Input */}
      <motion.div
        className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-lg font-semibold text-white mb-4">Smart Contract Security Scanner</h3>
        <div className="space-y-4">
          <textarea
            placeholder="Enter contract address or paste contract code here..."
            value={contract}
            onChange={(e) => setContract(e.target.value)}
            className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-gray-600 resize-none font-mono text-sm"
          />
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-400">Supports Ethereum addresses and Solidity contract code</p>
            <Button
              onClick={handleScan}
              className="bg-gray-100 hover:bg-gray-100 text-black px-6"
              disabled={loading || !contract.trim()}
            >
              {loading ? "Analyzing..." : "Analyze Contract"}
            </Button>
          </div>
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
          {/* Analysis Info */}
          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Contract Analysis Results</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Code className="h-4 w-4" />
                <span>Smart Contract</span>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2 text-green-400">
                <Shield className="h-4 w-4" />
                <span>Vulnerability Detection</span>
              </div>
              <div className="flex items-center space-x-2 text-yellow-400">
                <AlertTriangle className="h-4 w-4" />
                <span>Security Analysis</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-400">
                <CheckCircle className="h-4 w-4" />
                <span>Best Practices</span>
              </div>
            </div>
          </div>

          {/* Vulnerabilities */}
          {data.vulnerabilities && data.vulnerabilities.length > 0 && (
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <span>Vulnerabilities Found ({data.vulnerabilities.length})</span>
              </h3>
              <div className="space-y-4">
                {data.vulnerabilities.map((vuln, index) => (
                  <motion.div
                    key={index}
                    className="border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-white">{vuln.type}</h4>
                      <span className={`px-2 py-1 rounded text-xs border ${getSeverityColor(vuln.severity)}`}>
                        {vuln.severity}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{vuln.description}</p>
                    {vuln.location && <p className="text-gray-500 text-xs">Location: {vuln.location}</p>}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {data.suggestions && data.suggestions.length > 0 && (
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>Recommendations ({data.suggestions.length})</span>
              </h3>
              <div className="space-y-4">
                {data.suggestions.map((suggestion, index) => (
                  <motion.div
                    key={index}
                    className="border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <h4 className="font-medium text-white mb-2">{suggestion.suggestion}</h4>
                    <p className="text-gray-300 text-sm mb-3">{suggestion.details}</p>
                    {suggestion.example && (
                      <div className="bg-gray-800 rounded p-3">
                        <p className="text-xs text-gray-400 mb-1">Example:</p>
                        <code className="text-xs text-green-400 font-mono">{suggestion.example}</code>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {(!data.vulnerabilities || data.vulnerabilities.length === 0) &&
            (!data.suggestions || data.suggestions.length === 0) && (
              <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-8 text-center">
                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Analysis Complete</h3>
                <p className="text-gray-400">No vulnerabilities detected in the smart contract.</p>
              </div>
            )}
        </motion.div>
      )}

      {/* Default State */}
      {!data && !loading && (
        <motion.div
          className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Smart Contract Analysis</h3>
          <p className="text-gray-400 mb-6">Upload your smart contracts for comprehensive security analysis</p>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2 text-green-400">
              <Shield className="h-4 w-4" />
              <span>Vulnerability Detection</span>
            </div>
            <div className="flex items-center space-x-2 text-yellow-400">
              <AlertTriangle className="h-4 w-4" />
              <span>Gas Optimization</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-400">
              <CheckCircle className="h-4 w-4" />
              <span>Best Practices</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
