"use client"
import { Globe, FileText, Code, ScrollText, Menu, } from "lucide-react"
import Image from "next/image"

const navigationItems = [
  {
    id: "web-scraping",
    title: "Web Scraping",
    icon: Globe,
    description: "Website vulnerability scanner",
  },
  {
    id: "smart-contracts",
    title: "Smart Contracts",
    icon: FileText,
    description: "Contract security analysis",
  },
  {
    id: "vscode-extension",
    title: "VS Code Extension",
    icon: Code,
    description: "IDE security integration",
  },
  {
    id: "audit-log",
    title: "Audit Log",
    icon: ScrollText,
    description: "Log analysis & monitoring",
  },
]

interface AppSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  isOpen: boolean
  onToggle: () => void
}

export function AppSidebar({ activeTab, onTabChange, isOpen, onToggle }: AppSidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onToggle} />}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-56 lg:w-72 bg-black border-r border-gray-800 z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:z-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="border-b border-gray-800 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Image src={'/kavachai.webp'} width={100} height={100} className="h-10 w-10 rounded-full" alt="logo" />
              <div>
                <h2 className="font-bold text-white">Kadak.AI</h2>
                <p className="text-xs text-gray-400">Security Dashboard</p>
              </div>
            </div>
            <button
              className="md:hidden text-gray-400 hover:text-white p-1 rounded transition-colors"
              onClick={onToggle}
            >
              <Menu className=" h-3 w-3 rounded-full bg-cyan-950" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col h-[88%] full overflow-y-auto">
          <div className="p-4 flex-1">
            {/* Navigation */}
            <div className="mb-6">
              <h3 className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-3">Security Tools</h3>
              <nav className="space-y-1  lg:space-y-2">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id)
                      if (window.innerWidth < 768) onToggle()
                    }}
                    className={`w-full flex items-center text-sm lg:text-base space-x-3 py-1 lg:py-3 px-3 rounded-lg transition-all duration-200 text-left hover:scale-[1.02] active:scale-[0.98] ${
                      activeTab === item.id
                        ? "bg-gray-800 text-white border-l-2 border-blue-500"
                        : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                    }`}
                  >
                    <item.icon className={`h-5 w-5 ${activeTab === item.id ? "text-blue-400" : "text-gray-400"}`} />
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{item.title}</span>
                      <span className="text-xs text-gray-500">{item.description}</span>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Status Indicator - Fixed at bottom */}
          <div className="p-2 lg:p-4 border-t border-gray-800">
            <div className="p-3 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-800/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className=" text-xs lg:text-sm text-green-400 font-medium">System Online</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">All security services operational</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
