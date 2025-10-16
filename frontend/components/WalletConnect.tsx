"use client";

import { useState, useEffect } from "react";
import { checkFreighterInstalled, connectWallet, getWalletAddress } from "@/lib/freighter";

interface WalletConnectProps {
  onConnect: (address: string) => void;
  onDisconnect: () => void;
}

export default function WalletConnect({ onConnect, onDisconnect }: WalletConnectProps) {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    checkInstallation();
    checkExistingConnection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function checkInstallation() {
    const installed = await checkFreighterInstalled();
    setIsInstalled(installed);
  }

  async function checkExistingConnection() {
    const addr = await getWalletAddress();
    if (addr) {
      setAddress(addr);
      onConnect(addr);
    }
  }

  async function handleConnect() {
    setIsConnecting(true);
    const addr = await connectWallet();
    if (addr) {
      setAddress(addr);
      onConnect(addr);
    }
    setIsConnecting(false);
  }

  function handleDisconnect() {
    setAddress(null);
    onDisconnect();
  }

  if (!isInstalled) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 font-medium">Freighter Wallet Not Installed</p>
        <p className="text-red-600 text-sm mt-1">
          Please install the{" "}
          <a
            href="https://freighter.app"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-red-800"
          >
            Freighter Wallet
          </a>{" "}
          browser extension to continue.
        </p>
      </div>
    );
  }

  if (address) {
    return (
      <div className="flex items-center gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
          <p className="text-xs text-green-600 font-medium">Connected</p>
          <p className="text-sm font-mono text-green-900">
            {address.slice(0, 8)}...{address.slice(-8)}
          </p>
        </div>
        <button
          onClick={handleDisconnect}
          className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
    >
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}

