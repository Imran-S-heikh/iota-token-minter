"use client";

import { ConnectButton, useCurrentAccount } from "@iota/dapp-kit";

export function WalletConnection() {
  const currentAccount = useCurrentAccount();

  return (
    <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-bold text-gray-800">IOTA Token Creator</h1>
        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
          Testnet
        </span>
      </div>

      <div className="flex items-center space-x-4">
        {currentAccount && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Connected:</span>{" "}
            <span className="font-mono">
              {currentAccount.address.slice(0, 6)}...
              {currentAccount.address.slice(-4)}
            </span>
          </div>
        )}

        <ConnectButton
          connectText="Connect Wallet"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        />
      </div>
    </div>
  );
}
