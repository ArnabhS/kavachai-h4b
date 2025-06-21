"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Globe, AlertTriangle, CheckCircle, Clock, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LoadingSkeleton } from "../ui/LoadingSkeleton"


type ScanResult = {
  site?: string
  timestamp?: string
  results?: {
    htmlVuln?: {
      vulnerabilities?: Array<{
        type: string
        description: string
        severity: string
        location: string
      }>
      suggestions?: Array<{
        suggestion: string
        details: string
        example?: string
      }>
    }
  }
  error?: string
} | null

interface WebScrapingTabProps {
  onScanComplete?: () => void
}

export function WebScrapingTab({ onScanComplete }: WebScrapingTabProps) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ScanResult>(null)
  const [url, setUrl] = useState("")

  const handleScan = async () => {
    if (!url.trim()) return

    setLoading(true)
    setData(null)

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })
      const result = await res.json()
      setData(result)
      // Trigger stats refresh
      if (onScanComplete) {
        onScanComplete()
      }
    } catch (error) {
      setData({ error: error instanceof Error ? error.message : "Failed to scan website. Please try again." })
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
      {/* Scan Input */}
      <motion.div
        className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-lg font-semibold text-white mb-4">Website Security Scanner</h3>
        <div className="flex flex-col md:flex-row space-x-4">
          <input
            type="url"
            placeholder="Enter website URL to scan..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-gray-600 mb-4 md:mb-0"
            onKeyPress={(e) => e.key === "Enter" && handleScan()}
          />
          <Button
            onClick={handleScan}
            className="bg-white hover:bg-gray-100 text-black px-4 lg:px-6"
            disabled={loading || !url.trim()}
          >
            {loading ? "Scanning..." : "Scan"}
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
            <span className="font-semibold">Scan Failed</span>
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
          {/* Scan Info */}
          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Scan Results</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Clock className="h-4 w-4" />
                <span>{data.timestamp ? new Date(data.timestamp).toLocaleString() : new Date().toLocaleString()}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Globe className="h-4 w-4 text-gray-400" />
              <a
                href={data.site || url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 flex items-center space-x-1"
              >
                <span className="truncate max-w-md">{data.site || url}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Vulnerabilities */}
          {data.results?.htmlVuln?.vulnerabilities && data.results.htmlVuln.vulnerabilities.length > 0 && (
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <span>Vulnerabilities Found ({data.results.htmlVuln.vulnerabilities.length})</span>
              </h3>
              <div className="space-y-4">
                {data.results.htmlVuln.vulnerabilities.map((vuln, index) => (
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
                    <p className="text-gray-500 text-xs">Location: {vuln.location}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {data.results?.htmlVuln?.suggestions && data.results.htmlVuln.suggestions.length > 0 && (
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>Recommendations ({data.results.htmlVuln.suggestions.length})</span>
              </h3>
              <div className="space-y-4">
                {data.results.htmlVuln.suggestions.map((suggestion, index) => (
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
          {(!data.results?.htmlVuln?.vulnerabilities || data.results.htmlVuln.vulnerabilities.length === 0) &&
            (!data.results?.htmlVuln?.suggestions || data.results.htmlVuln.suggestions.length === 0) && (
              <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-8 text-center">
                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Scan Complete</h3>
                <p className="text-gray-400">No vulnerabilities detected or scan results are being processed.</p>
              </div>
            )}
        </motion.div>
      )}
    </div>
  )
}
