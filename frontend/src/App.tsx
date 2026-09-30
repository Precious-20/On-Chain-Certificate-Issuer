import React, { useState } from "react";
import { WalletProvider } from "./web3/walletContext";
import { Navbar, type NavTab } from "./components/Navbar";
import { HomePage } from "./pages/HomePage";
import { VerifyPage } from "./pages/VerifyPage";
import { IssuePage } from "./pages/IssuePage";
import { AdminPage } from "./pages/AdminPage";
import { Shield, Code2, ExternalLink } from "lucide-react";

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>("home");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Page Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {activeTab === "home" && <HomePage onNavigate={setActiveTab} />}
        {activeTab === "verify" && <VerifyPage />}
        {activeTab === "issue" && <IssuePage />}
        {activeTab === "admin" && <AdminPage />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-400" />
            <span>TechCrush Web3 Blockchain Capstone &mdash; Team C (Web3 Integration)</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Precious-20/On-Chain-Certificate-Issuer"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-slate-200 flex items-center gap-1 transition"
            >
              <Code2 className="w-4 h-4" /> GitHub Repository <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <WalletProvider>
      <AppContent />
    </WalletProvider>
  );
}

export default App;

