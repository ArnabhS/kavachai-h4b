"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ScrollText, Clock, User, Shield, AlertTriangle, CheckCircle, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LoadingSkeleton } from "../ui/LoadingSkeleton"


type LogAnalysisResult = {
  analysis?: {
    summary?: string
    threats?: Array<{
      type: string
      description: string
      severity: string
      timestamp?: string
    }>
    recommendations?: Array<{
      suggestion: string
      details: string
    }>
  }
  error?: string
} | null

interface AuditLogTabProps {
  onScanComplete?: () => void
}

const recentLogs = [
  {
    id: 1,
    action: "Security scan completed",
    user: "System",
    timestamp: "2024-12-21 14:30:25",
    type: "scan",
    details: "Vulnerability scan for instagram.com completed",
  },
  {
    id: 2,
    action: "User login",
    user: "john.doe@example.com",
    timestamp: "2024-12-21 14:25:10",
    type: "auth",
    details: "User authenticated via Civic",
  },
  {
    id: 3,
    action: "Smart contract analyzed",
    user: "System",
    timestamp: "2024-12-21 14:20:15",
    type: "analysis",
    details: "Contract 0x1234...abcd analyzed for vulnerabilities",
  },
  {
    id: 4,
    action: "Alert triggered",
    user: "System",
    timestamp: "2024-12-21 14:15:30",
    type: "alert",
    details: "High severity vulnerability detected",
  },
]

export function AuditLogTab({ onScanComplete }: AuditLogTabProps) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<LogAnalysisResult>(null)
  const [logs, setLogs] = useState("")

  const handleAnalyze = async () => {
    if (!logs.trim()) return

    setLoading(true)
    setData(null)

    try {
      const res = await fetch("/api/logger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logs }),
      })
      const result = await res.json()
      setData(result)
      // Trigger stats refresh
      if (onScanComplete) {
        onScanComplete()
      }
    } catch (error) {
      setData({ error: error instanceof Error ? error.message : "Failed to analyze logs. Please try again." })
    }

    setLoading(false)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "scan":
        return <Shield className="h-4 w-4 text-blue-400" />
      case "auth":
        return <User className="h-4 w-4 text-green-400" />
      case "analysis":
        return <ScrollText className="h-4 w-4 text-purple-400" />
      case "alert":
        return <AlertTriangle className="h-4 w-4 text-red-400" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
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
      {/* Log Analysis Input */}
      <motion.div
        className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Log Analysis Agent</span>
        </h3>
        <div className="space-y-4">
          <textarea
            placeholder="Paste your logs here for AI-powered security analysis..."
            value={logs}
            onChange={(e) => setLogs(e.target.value)}
            className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-gray-600 resize-none font-mono text-sm"
          />
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-400">
              Analyze logs for suspicious activity, security threats, and anomalies
            </p>
            <Button
              onClick={handleAnalyze}
              className="bg-white hover:bg-gray-100 text-black px-6"
              disabled={loading || !logs.trim()}
            >
              {loading ? "Analyzing..." : "Analyze Logs"}
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

      {/* Analysis Results */}
      {data && !data.error && (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Summary */}
          {data.analysis?.summary && (
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Analysis Summary</h3>
              <p className="text-gray-300">{data.analysis.summary}</p>
            </div>
          )}

          {/* Threats */}
          {data.analysis?.threats && data.analysis.threats.length > 0 && (
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <span>Threats Detected ({data.analysis.threats.length})</span>
              </h3>
              <div className="space-y-4">
                {data.analysis.threats.map((threat, index) => (
                  <motion.div
                    key={index}
                    className="border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-white">{threat.type}</h4>
                      <span className={`px-2 py-1 rounded text-xs border ${getSeverityColor(threat.severity)}`}>
                        {threat.severity}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{threat.description}</p>
                    {threat.timestamp && <p className="text-gray-500 text-xs">Timestamp: {threat.timestamp}</p>}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {data.analysis?.recommendations && data.analysis.recommendations.length > 0 && (
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>Recommendations ({data.analysis.recommendations.length})</span>
              </h3>
              <div className="space-y-4">
                {data.analysis.recommendations.map((rec, index) => (
                  <motion.div
                    key={index}
                    className="border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <h4 className="font-medium text-white mb-2">{rec.suggestion}</h4>
                    <p className="text-gray-300 text-sm">{rec.details}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Recent Activity */}
      <motion.div
        className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: data ? 0.4 : 0.2 }}
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <ScrollText className="h-5 w-5" />
          <span>Recent Activity</span>
        </h3>

        <div className="space-y-3">
          {recentLogs.map((log, index) => (
            <motion.div
              key={log.id}
              className="flex items-start space-x-4 p-4 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex-shrink-0 mt-1">{getTypeIcon(log.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-white font-medium">{log.action}</p>
                  <span className="text-xs text-gray-500">{log.timestamp}</span>
                </div>
                <p className="text-sm text-gray-300 mb-1">{log.details}</p>
                <p className="text-xs text-gray-500">by {log.user}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
