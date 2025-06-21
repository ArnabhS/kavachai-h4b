"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Code, Download, Settings, Key, Copy, RefreshCw, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"

export function VSCodeExtensionTab() {
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [apiKeyLoading, setApiKeyLoading] = useState(false)
  const [apiKeyError, setApiKeyError] = useState<string | null>(null)
  const [copySuccess, setCopySuccess] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)

  // Fetch API key on mount
  useEffect(() => {
    const fetchApiKey = async () => {
      setApiKeyLoading(true)
      setApiKeyError(null)
      try {
        const res = await fetch("/api/apikey")
        const data = await res.json()
        if (data.apiKey) {
          setApiKey(data.apiKey)
        } else {
          setApiKeyError("No API key found.")
        }
      } catch {
        setApiKeyError("Failed to fetch API key.")
      }
      setApiKeyLoading(false)
    }
    fetchApiKey()
  }, [])

  // Regenerate API key
  const regenerateApiKey = async () => {
    setApiKeyLoading(true)
    setApiKeyError(null)
    try {
      const res = await fetch("/api/apikey", { method: "POST" })
      const data = await res.json()
      if (data.apiKey) {
        setApiKey(data.apiKey)
      } else {
        setApiKeyError("Failed to regenerate API key.")
      }
    } catch {
      setApiKeyError("Failed to regenerate API key.")
    }
    setApiKeyLoading(false)
  }

  const copyToClipboard = async () => {
    if (apiKey) {
      try {
        await navigator.clipboard.writeText(apiKey)
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
      } catch {
        // Fallback for older browsers
        const textArea = document.createElement("textarea")
        textArea.value = apiKey
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand("copy")
        document.body.removeChild(textArea)
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
      }
    }
  }

  const toggleApiKeyVisibility = () => {
    setShowApiKey(!showApiKey)
  }

  const getMaskedApiKey = (key: string) => {
    if (key.length <= 8) return '*'.repeat(key.length)
    return key.substring(0, 4) + '*'.repeat(key.length - 8) + key.substring(key.length - 4)
  }

  return (
    <div className="space-y-6">
      {/* API Key Management */}
      <motion.div
        className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Key className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">VS Code Extension API Key</h3>
            <p className="text-gray-400 text-sm">
              Use this API key to connect the Kavach.ai VS Code extension to your account
            </p>
          </div>
        </div>

        {apiKeyLoading ? (
          <div className="flex items-center space-x-2 text-blue-400">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </div>
        ) : apiKeyError ? (
          <div className="text-red-400 mb-4">{apiKeyError}</div>
        ) : apiKey ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type={showApiKey ? "text" : "password"}
                value={showApiKey ? apiKey : getMaskedApiKey(apiKey)}
                readOnly
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none"
                onFocus={(e) => showApiKey && e.target.select()}
              />
              <Button
                onClick={toggleApiKeyVisibility}
                variant="outline"
                size="sm"
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
                title={showApiKey ? "Hide API Key" : "Show API Key"}
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                onClick={copyToClipboard}
                variant="outline"
                size="sm"
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <Copy className="h-4 w-4 mr-1" />
                {copySuccess ? "Copied!" : "Copy"}
              </Button>
            </div>
            {!showApiKey && (
              <p className="text-xs text-gray-500">
                Click the eye icon to reveal the full API key
              </p>
            )}
          </div>
        ) : null}

        <Button
          onClick={regenerateApiKey}
          disabled={apiKeyLoading}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${apiKeyLoading ? "animate-spin" : ""}`} />
          Regenerate API Key
        </Button>
      </motion.div>

      {/* Extension Info */}
      <motion.div
        className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-3 bg-blue-500/10 rounded-lg">
            <Code className="h-8 w-8 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Kavach.ai VS Code Extension</h3>
            <p className="text-gray-400">Real-time security analysis in your IDE</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-white mb-3">Features</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                <span>Real-time vulnerability detection</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                <span>Smart contract analysis</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                <span>Security best practices</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                <span>Automated code review</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                <span>Instant security alerts</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-white mb-3">Installation</h4>
            <div className="space-y-3">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <Download className="h-4 w-4 mr-2" />
                Install Extension
              </Button>
              <Button variant="outline" className="w-full border-gray-700 text-gray-300 hover:bg-gray-800">
                <Settings className="h-4 w-4 mr-2" />
                Configure Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="mt-8 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <h4 className="font-medium text-white mb-3">Setup Instructions</h4>
          <ol className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start space-x-2">
              <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                1
              </span>
              <span>Install the Kavach.ai extension from the VS Code marketplace</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                2
              </span>
              <span>Copy your API key from above (click the eye icon to reveal)</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                3
              </span>
              <span>Open VS Code settings and paste the API key in Kavach.ai extension settings</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                4
              </span>
              <span>Start coding and receive real-time security analysis</span>
            </li>
          </ol>
        </div>
      </motion.div>
    </div>
  )
}
