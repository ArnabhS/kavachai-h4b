"use client"

import React, { useState, useEffect } from "react";

type Web2Result = Record<string, unknown> | { error: string } | null;
type Web3Result = Record<string, unknown> | { error: string } | null;
type LoggerResult = Record<string, unknown> | { error: string } | null;

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("web2");
  const [web2Loading, setWeb2Loading] = useState(false);
  const [web2Result, setWeb2Result] = useState<Web2Result>(null);
  const [web3Loading, setWeb3Loading] = useState(false);
  const [web3Result, setWeb3Result] = useState<Web3Result>(null);
  const [loggerLoading, setLoggerLoading] = useState(false);
  const [loggerResult, setLoggerResult] = useState<LoggerResult>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [apiKeyLoading, setApiKeyLoading] = useState(false);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);

  // Fetch API key on mount
  useEffect(() => {
    const fetchApiKey = async () => {
      setApiKeyLoading(true);
      setApiKeyError(null);
      try {
        const res = await fetch("/api/apikey");
        const data = await res.json();
        if (data.apiKey) setApiKey(data.apiKey);
        else setApiKeyError("No API key found.");
      } catch {
        setApiKeyError("Failed to fetch API key.");
      }
      setApiKeyLoading(false);
    };
    fetchApiKey();
  }, []);

  // Regenerate API key
  const regenerateApiKey = async () => {
    setApiKeyLoading(true);
    setApiKeyError(null);
    try {
      const res = await fetch("/api/apikey", { method: "POST" });
      const data = await res.json();
      if (data.apiKey) setApiKey(data.apiKey);
      else setApiKeyError("Failed to regenerate API key.");
    } catch {
      setApiKeyError("Failed to regenerate API key.");
    }
    setApiKeyLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8">AI Cybersecurity Agent Dashboard</h1>
      {/* API Key Management Section */}
      <div className="bg-white p-4 rounded shadow mb-8 max-w-xl">
        <h2 className="text-lg font-semibold mb-2">VS Code Extension API Key</h2>
        <p className="mb-2 text-gray-600">Use this API key to connect the Kadakai VS Code extension to your account.</p>
        {apiKeyLoading ? (
          <div className="text-blue-600">Loading...</div>
        ) : apiKeyError ? (
          <div className="text-red-600">{apiKeyError}</div>
        ) : apiKey ? (
          <div className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              value={apiKey}
              readOnly
              className="border p-2 rounded w-full font-mono text-xs bg-gray-100"
              onFocus={e => e.target.select()}
            />
            <button
              className="bg-gray-200 px-2 py-1 rounded text-xs"
              onClick={() => {
                navigator.clipboard.writeText(apiKey);
              }}
            >
              Copy
            </button>
          </div>
        ) : null}
        <button
          className="bg-blue-600 text-white px-3 py-1 rounded text-xs mt-2"
          onClick={regenerateApiKey}
          disabled={apiKeyLoading}
        >
          Regenerate API Key
        </button>
      </div>
      {/* End API Key Management Section */}
      <div className="flex space-x-4 mb-8">
        <button
          className={`px-4 py-2 rounded ${activeTab === "web2" ? "bg-blue-600 text-white" : "bg-white border"}`}
          onClick={() => setActiveTab("web2")}
        >
          Web2 Scanner
        </button>
        <button
          className={`px-4 py-2 rounded ${activeTab === "web3" ? "bg-blue-600 text-white" : "bg-white border"}`}
          onClick={() => setActiveTab("web3")}
        >
          Web3 Scanner
        </button>
        <button
          className={`px-4 py-2 rounded ${activeTab === "logger" ? "bg-blue-600 text-white" : "bg-white border"}`}
          onClick={() => setActiveTab("logger")}
        >
          Logger Agent
        </button>
      </div>
      <div>
        {activeTab === "web2" && (
          <div id="web2-scanner">
            <h2 className="text-xl font-semibold mb-4">Web2 Vulnerability Scanner</h2>
            <form
              className="mb-4"
              onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                const form = e.currentTarget;
                const url = (form.elements.namedItem("url") as HTMLInputElement).value;
                setWeb2Loading(true);
                setWeb2Result(null);
                try {
                  const res = await fetch("/api/scan", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ url }),
                  });
                  const data = await res.json();
                  setWeb2Result(data);
                } catch {
                  setWeb2Result({ error: "Failed to scan." });
                }
                setWeb2Loading(false);
              }}
            >
              <input
                type="url"
                name="url"
                placeholder="Enter website URL"
                className="border p-2 rounded w-80 mr-2"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded"
                disabled={web2Loading}
              >
                {web2Loading ? "Scanning..." : "Scan"}
              </button>
            </form>
            {web2Result && (
              <div className="bg-white p-4 rounded shadow">
                <pre className="whitespace-pre-wrap text-sm">
                  {JSON.stringify(web2Result, null, 2)}
                </pre>
              </div>
            )}
            <p className="mt-4 text-gray-600">Scan your website for vulnerabilities using AI.</p>
          </div>
        )}
        {activeTab === "web3" && (
          <div id="web3-scanner">
            <h2 className="text-xl font-semibold mb-4">Web3 Contract Vulnerability Scanner</h2>
            <form
              className="mb-4"
              onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                const form = e.currentTarget;
                const contract = (form.elements.namedItem("contract") as HTMLInputElement).value;
                setWeb3Loading(true);
                setWeb3Result(null);
                try {
                  const res = await fetch("/api/scan-web3", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ contract }),
                  });
                  const data = await res.json();
                  setWeb3Result(data);
                } catch {
                  setWeb3Result({ error: "Failed to scan contract." });
                }
                setWeb3Loading(false);
              }}
            >
              <textarea
                name="contract"
                placeholder="Enter contract address or code"
                className="border p-2 rounded w-80 h-32 mr-2"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded"
                disabled={web3Loading}
              >
                {web3Loading ? "Scanning..." : "Scan"}
              </button>
            </form>
            {web3Result && (
              <div className="bg-white p-4 rounded shadow">
                <pre className="whitespace-pre-wrap text-sm">
                  {JSON.stringify(web3Result, null, 2)}
                </pre>
              </div>
            )}
            <p className="mt-4 text-gray-600">Analyze smart contracts for vulnerabilities using AI.</p>
          </div>
        )}
        {activeTab === "logger" && (
          <div id="logger-agent">
            <h2 className="text-xl font-semibold mb-4">Logger Agent</h2>
            <form
              className="mb-4"
              onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                const form = e.currentTarget;
                const logs = (form.elements.namedItem("logs") as HTMLTextAreaElement).value;
                setLoggerLoading(true);
                setLoggerResult(null);
                try {
                  const res = await fetch("/api/logger", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ logs }),
                  });
                  const data = await res.json();
                  setLoggerResult(data);
                } catch {
                  setLoggerResult({ error: "Failed to analyze logs." });
                }
                setLoggerLoading(false);
              }}
            >
              <textarea
                name="logs"
                placeholder="Paste logs here or upload a file"
                className="border p-2 rounded w-80 h-32 mr-2"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded"
                disabled={loggerLoading}
              >
                {loggerLoading ? "Analyzing..." : "Analyze"}
              </button>
            </form>
            {loggerResult && (
              <div className="bg-white p-4 rounded shadow">
                <pre className="whitespace-pre-wrap text-sm">
                  {JSON.stringify(loggerResult, null, 2)}
                </pre>
              </div>
            )}
            <p className="mt-4 text-gray-600">Analyze logs for suspicious activity using AI.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 