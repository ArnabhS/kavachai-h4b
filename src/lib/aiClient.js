import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function askAgent(prompt, content) {
  

  const response = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: `${prompt}\n${content}` }] }],
  });

  const rawText = response.text;
  console.log("Raw Response:", rawText);

  if (!rawText) {
    console.warn("❌ No text in response.");
    return {
      auditResults: [],
      scanResults: {},
      vulnerabilities: [],
      suggestions: [],
      recommendations: []
    };
  }

  // Match multiple valid JSON blocks from the response
  const jsonMatches = rawText.match(/```json[\s\S]*?```/g) || [rawText];

  let merged = {
  auditResults: [],
  scanResults: {},
  vulnerabilities: [],
  suggestions: [],
  recommendations: []
};

for (const jsonBlock of jsonMatches) {
  try {
    const cleaned = jsonBlock.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    // Merge intelligently based on keys
    if (parsed.audit_results) {
      const results =
        Array.isArray(parsed.audit_results.findings)
          ? parsed.audit_results.findings
          : parsed.audit_results;

      if (Array.isArray(results)) {
        merged.auditResults.push(...results);
      } else {
        merged.auditResults.push(
          ...Object.entries(results).map(([type, info]) => ({
            type,
            detected: info?.detected ?? false,
            description: info?.description ?? "No description"
          }))
        );
      }
    }

    if (parsed.scan_results && typeof parsed.scan_results === "object") {
      merged.scanResults = {
        ...merged.scanResults,
        ...parsed.scan_results
      };
    }

    if (Array.isArray(parsed.vulnerabilities)) {
      merged.vulnerabilities.push(...parsed.vulnerabilities);
    }

    if (Array.isArray(parsed.suggestions)) {
      merged.suggestions.push(...parsed.suggestions);
    }

    if (Array.isArray(parsed.recommendations)) {
      merged.recommendations.push(...parsed.recommendations);
    }
  } catch (err) {
    console.warn("❌ Failed to parse a block:", err);
  }
}
  return merged;
}
