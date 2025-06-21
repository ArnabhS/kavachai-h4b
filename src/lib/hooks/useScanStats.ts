import { useState, useEffect } from 'react'

interface ScanStats {
  active: {
    'web-scraping': number
    'smart-contracts': number
    'audit-log': number
    total: number
  }
  total: {
    'web-scraping': number
    'smart-contracts': number
    'audit-log': number
    total: number
  }
  completed: {
    'web-scraping': number
    'smart-contracts': number
    'audit-log': number
    total: number
  }
  metrics: {
    vulnerabilities: number
    suggestions: number
  }
}

export function useScanStats() {
  const [stats, setStats] = useState<ScanStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/scan-stats')
      if (!response.ok) {
        throw new Error('Failed to fetch scan stats')
      }
      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    
    return () => clearInterval(interval)
  }, [])

  return { stats, loading, error, refetch: fetchStats }
} 