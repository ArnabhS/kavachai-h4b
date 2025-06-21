import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Scan } from '@/lib/models'

export async function GET() {
  try {
    await connectDB()

    // Get active scans count for each type
    const webScrapingActive = await Scan.countDocuments({ 
      type: 'web-scraping', 
      status: 'active' 
    })
    
    const smartContractsActive = await Scan.countDocuments({ 
      type: 'smart-contracts', 
      status: 'active' 
    })
    
    const auditLogActive = await Scan.countDocuments({ 
      type: 'audit-log', 
      status: 'active' 
    })

    // Get total scans count for each type
    const webScrapingTotal = await Scan.countDocuments({ type: 'web-scraping' })
    const smartContractsTotal = await Scan.countDocuments({ type: 'smart-contracts' })
    const auditLogTotal = await Scan.countDocuments({ type: 'audit-log' })

    // Get completed scans count for each type
    const webScrapingCompleted = await Scan.countDocuments({ 
      type: 'web-scraping', 
      status: 'completed' 
    })
    
    const smartContractsCompleted = await Scan.countDocuments({ 
      type: 'smart-contracts', 
      status: 'completed' 
    })
    
    const auditLogCompleted = await Scan.countDocuments({ 
      type: 'audit-log', 
      status: 'completed' 
    })

    // Calculate vulnerabilities and suggestions from completed scans
    const completedScans = await Scan.find({ status: 'completed' })
    
    let totalVulnerabilities = 0
    let totalSuggestions = 0

    completedScans.forEach(scan => {
      if (scan.results) {
        // Web scraping results
        if (scan.results.results?.htmlVuln) {
          totalVulnerabilities += scan.results.results.htmlVuln.vulnerabilities?.length || 0
          totalSuggestions += scan.results.results.htmlVuln.suggestions?.length || 0
        }
        
        // Smart contract results
        if (scan.results.vulnerabilities) {
          totalVulnerabilities += scan.results.vulnerabilities.length || 0
          totalSuggestions += scan.results.suggestions?.length || 0
        }
        
        // Audit log results
        if (scan.results.scan_results) {
          const scanResults = scan.results.scan_results
          totalVulnerabilities += (scanResults.sensitive_data_leakage?.length || 0) +
                                 (scanResults.unencrypted_logging?.length || 0) +
                                 (scanResults.missing_audit_trails?.length || 0)
        }
        
        // VS Code extension results
        if (scan.results.summary) {
          totalVulnerabilities += scan.results.summary.total || 0
        }
      }
    })

    return NextResponse.json({
      active: {
        'web-scraping': webScrapingActive,
        'smart-contracts': smartContractsActive,
        'audit-log': auditLogActive,
        total: webScrapingActive + smartContractsActive + auditLogActive
      },
      total: {
        'web-scraping': webScrapingTotal,
        'smart-contracts': smartContractsTotal,
        'audit-log': auditLogTotal,
        total: webScrapingTotal + smartContractsTotal + auditLogTotal
      },
      completed: {
        'web-scraping': webScrapingCompleted,
        'smart-contracts': smartContractsCompleted,
        'audit-log': auditLogCompleted,
        total: webScrapingCompleted + smartContractsCompleted + auditLogCompleted
      },
      metrics: {
        vulnerabilities: totalVulnerabilities,
        suggestions: totalSuggestions
      }
    })
  } catch (error) {
    console.error('Error fetching scan stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scan statistics' },
      { status: 500 }
    )
  }
} 