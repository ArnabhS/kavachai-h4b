"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { WebScrapingTab } from "@/components/dashboard/WebScrappingTab"
import { SmartContractsTab } from "@/components/dashboard/SmartContractTabs"
import { WalletSecurityTab } from "@/components/dashboard/WalletSecurityTab"
import { VSCodeExtensionTab } from "@/components/dashboard/VsCodeExtension"
import { AuditLogTab } from "@/components/dashboard/AuditLogTab"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { useScanStats } from "@/lib/hooks/useScanStats"
import { AppSidebar } from "@/components/dashboard/AppSidebar"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("web-scraping")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { stats, loading, refetch } = useScanStats()
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    const observer = () => {
      setTheme(document.documentElement.classList.contains('light') ? 'light' : 'dark')
    }
    observer()
    window.addEventListener('themechange', observer)
    return () => window.removeEventListener('themechange', observer)
  }, [])

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
      case "wallet-security":
        return <WalletSecurityTab onScanComplete={handleScanComplete} />
      case "vscode-extension":
        return <VSCodeExtensionTab />
      case "audit-log":
        return <AuditLogTab onScanComplete={handleScanComplete} />
      default:
        return <WebScrapingTab onScanComplete={handleScanComplete} />
    }
  }

  return (
    <div className={`flex h-screen overflow-hidden ${theme === 'light' ? 'bg-gray-100 text-gray-900' : 'bg-black text-white'}`}>
      {/* Sidebar */}
      <AppSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((open) => !open)}
      />
      {/* Main Content */}
      <div className="flex-1 ml-0 md:ml-8 overflow-y-auto h-screen relative transition-all duration-300">
        {/* Mobile sidebar toggle button */}
        <button
          className="md:hidden fixed top-4 right-4 z-50 bg-gray-900 border border-gray-800 rounded-lg p-2 text-gray-300 hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="space-y-6 py-8 w-[90%] md: lg:w-[94%] mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-xl lg:text-3xl font-bold text-white mb-2">Security Dashboard</h1>
            <p className="text-gray-400 text-sm md:text-base">Monitor and manage your Web3 security infrastructure</p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 "
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
          {/* <motion.div
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
        </motion.div> */}


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
      </div>
    </div>
  )
}
