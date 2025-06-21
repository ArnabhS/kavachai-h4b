"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Globe, FileText, Code, ScrollText, Shield, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { WebScrapingTab } from "@/components/dashboard/WebScrappingTab"
import { SmartContractsTab } from "@/components/dashboard/SmartContractTabs"
import { VSCodeExtensionTab } from "@/components/dashboard/VsCodeExtension"
import { AuditLogTab } from "@/components/dashboard/AuditLogTab"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { useScanStats } from "@/lib/hooks/useScanStats"

const tabs = [
  {
    id: "web-scraping",
    label: "Web Scraping",
    icon: <Globe className="h-5 w-5" />,
  },
  {
    id: "smart-contracts",
    label: "Smart Contracts",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    id: "vscode-extension",
    label: "VS Code Extension",
    icon: <Code className="h-5 w-5" />,
  },
  {
    id: "audit-log",
    label: "Audit Log",
    icon: <ScrollText className="h-5 w-5" />,
  },
]

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("web-scraping")
  const { stats, loading, refetch } = useScanStats()

  const handleScanComplete = () => {
    // Refresh stats when a scan is completed
    refetch()
  }

  const getStats = () => {
    if (loading || !stats) {
      return [
        {
          title: "Completed Scans",
          value: "0",
          change: "0",
          trend: "up" as const,
          icon: <Shield className="h-6 w-6" />,
        },
        {
          title: "Vulnerabilities Found",
          value: "0",
          change: "0",
          trend: "up" as const,
          icon: <AlertTriangle className="h-6 w-6" />,
        },
        {
          title: "Total Scans",
          value: "0",
          change: "0",
          trend: "up" as const,
          icon: <CheckCircle className="h-6 w-6" />,
        },
        {
          title: "Suggestions",
          value: "0",
          change: "0",
          trend: "up" as const,
          icon: <Clock className="h-6 w-6" />,
        },
      ]
    }

    return [
      {
        title: "Completed Scans",
        value: stats.completed.total.toString(),
        change: "+" + stats.completed.total,
        trend: "up" as const,
        icon: <Shield className="h-6 w-6" />,
      },
      {
        title: "Vulnerabilities Found",
        value: stats.metrics.vulnerabilities.toString(),
        change: "+" + stats.metrics.vulnerabilities,
        trend: "up" as const,
        icon: <AlertTriangle className="h-6 w-6" />,
      },
      {
        title: "Total Scans",
        value: stats.total.total.toString(),
        change: "+" + stats.total.total,
        trend: "up" as const,
        icon: <CheckCircle className="h-6 w-6" />,
      },
      {
        title: "Suggestions",
        value: stats.metrics.suggestions.toString(),
        change: "+" + stats.metrics.suggestions,
        trend: "up" as const,
        icon: <Clock className="h-6 w-6" />,
      },
    ]
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "web-scraping":
        return <WebScrapingTab onScanComplete={handleScanComplete} />
      case "smart-contracts":
        return <SmartContractsTab onScanComplete={handleScanComplete} />
      case "vscode-extension":
        return <VSCodeExtensionTab />
      case "audit-log":
        return <AuditLogTab onScanComplete={handleScanComplete} />
      default:
        return <WebScrapingTab onScanComplete={handleScanComplete} />
    }
  }

  return (
      <div className="space-y-6 py-8 w-[96%] mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-3xl font-bold text-white mb-2">Security Dashboard</h1>
          <p className="text-gray-400">Monitor and manage your Web3 security infrastructure</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {getStats().map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
            >
              <StatsCard {...stat} />
            </motion.div>
          ))}
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          className="border-b border-gray-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "border-white text-white"
                    : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700"
                }`}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
              >
                <span className={activeTab === tab.id ? "text-white" : "text-gray-500"}>{tab.icon}</span>
                <span>{tab.label}</span>
              </motion.button>
            ))}
          </nav>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>
  )
}
