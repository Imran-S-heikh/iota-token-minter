"use client";

import { useState } from "react";
import { getBytecode } from "@/lib/move-template/coin";
import initMoveByteCodeTemplate from "@/lib/move-template/move-bytecode-template";
import { signAndExecute, throwTXIfNotSuccessful, waitForTx } from "@/utils";
import {
  useCurrentAccount,
  useIotaClient,
  useSignTransaction,
} from "@iota/dapp-kit";
import { Transaction } from "@iota/iota-sdk/transactions";
import { normalizeIotaAddress } from "@iota/iota-sdk/utils";
import { CREATE_TOKEN_IOTA_FEE, TREASURY } from "@/constants/fees";
import { useNetwork } from "../providers";
import useMatchNetwork from "../hooks/useMatchedNetwork";

interface TokenConfig {
  name: string;
  symbol: string;
  description: string;
  decimals: number;
  iconUrl?: string;
  supply: string;
}

interface TokenCreationResult {
  packageId: string;
  treasuryCap: string;
  coinType: string;
  transactionDigest: string;
  explorerUrl: string;
  tokenInfo: {
    name: string;
    symbol: string;
    description: string;
    decimals: number;
    moduleName: string;
    structName: string;
  };
}

export function OneClickTokenCreator() {
  const currentAccount = useCurrentAccount();
  const signTransaction = useSignTransaction();
  const iotaClient = useIotaClient();
  const { network } = useNetwork();

  const [tokenConfig, setTokenConfig] = useState<TokenConfig>({
    name: "",
    symbol: "",
    description: "",
    decimals: 6,
    iconUrl: "",
    supply: "900",
  });

  const [isCreating, setIsCreating] = useState(false);
  const [currentStep] = useState("");
  const [result, setResult] = useState<TokenCreationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const matched = useMatchNetwork();

  const handleInputChange = (
    field: keyof TokenConfig,
    value: string | number
  ) => {
    setTokenConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  async function createToken() {
    try {
      if (!currentAccount) {
        setError("Please connect your wallet first");
        return;
      }
      setIsCreating(true);
      setError(null);

      await initMoveByteCodeTemplate("/move_bytecode_template_bg.wasm");
      const bytecode = await getBytecode({
        description: tokenConfig.description,
        fixedSupply: true,
        name: tokenConfig.name,
        symbol: tokenConfig.symbol,
        totalSupply: tokenConfig.supply,
        decimals: tokenConfig.decimals,
        recipient: currentAccount.address,
        imageUrl: tokenConfig.iconUrl,
      });

      const tx = new Transaction();

      const [fee] = tx.splitCoins(tx.gas, [String(CREATE_TOKEN_IOTA_FEE)]);
      tx.transferObjects([fee], tx.pure.address(TREASURY));

      const [upgradeCap] = tx.publish({
        modules: [[...bytecode]],
        dependencies: [
          normalizeIotaAddress("0x1"),
          normalizeIotaAddress("0x2"),
        ],
      });

      tx.transferObjects([upgradeCap], tx.pure.address(currentAccount.address));

      const result = await signAndExecute({
        iotaClient: iotaClient,
        tx,
        currentAccount,
        signTransaction,
      });

      throwTXIfNotSuccessful(result);
      setResult({
        packageId:
          result?.effects?.created?.[0]?.reference?.objectId || "Unknown",
        treasuryCap:
          result?.effects?.created?.[1]?.reference?.objectId || "Unknown",
        coinType: `${result.effects?.created?.[0]?.reference?.objectId}::${tokenConfig.symbol}::${tokenConfig.symbol}`,
        transactionDigest: result.digest,
        explorerUrl: `https://explorer.iota.org/txblock/${result.digest}?network=${network}`,
        tokenInfo: {
          name: tokenConfig.name,
          symbol: tokenConfig.symbol,
          description: tokenConfig.description,
          decimals: tokenConfig.decimals,
          moduleName: tokenConfig.symbol,
          structName: tokenConfig.symbol,
        },
      });

      await waitForTx({ iotaClient, digest: result.digest });
    } catch (error: any) {
      console.log(error);
      setError(error?.message || "Failed to create Token");
    } finally {
      setIsCreating(false);
    }
  }

  if (result) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">
            Token Deployed Successfully!
          </h2>
          <p className="text-gray-600">
            Your {result.tokenInfo.name} token is live on IOTA testnet
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">
              Token Information
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Name:</span>{" "}
                {result.tokenInfo.name}
              </div>
              <div>
                <span className="font-medium">Symbol:</span>{" "}
                {result.tokenInfo.symbol}
              </div>
              <div>
                <span className="font-medium">Decimals:</span>{" "}
                {result.tokenInfo.decimals}
              </div>
              <div>
                <span className="font-medium">Description:</span>{" "}
                {result.tokenInfo.description}
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-700 mb-2">
              Blockchain Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="break-all">
                <span className="font-medium">Package ID:</span>
                <code className="ml-2 bg-blue-100 px-1 rounded text-xs">
                  {result.packageId}
                </code>
              </div>
              <div className="break-all">
                <span className="font-medium">Treasury Cap:</span>
                <code className="ml-2 bg-blue-100 px-1 rounded text-xs">
                  {result.treasuryCap}
                </code>
              </div>
              <div className="break-all">
                <span className="font-medium">Coin Type:</span>
                <code className="ml-2 bg-blue-100 px-1 rounded text-xs">
                  {result.coinType}
                </code>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <a
            href={result.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-center hover:bg-blue-700 transition-colors"
          >
            View on Explorer
          </a>
          <button
            onClick={() => {
              setResult(null);
              setTokenConfig({
                name: "",
                symbol: "",
                description: "",
                decimals: 6,
                iconUrl: "",
                supply: "",
              });
            }}
            className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Create Another Token
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Create Your IOTA Token
        </h2>
        <p className="text-gray-600">
          One-click token creation and deployment to IOTA{" "}
          <span className="capitalize">{network}</span>
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {isCreating && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <p className="text-blue-700">{currentStep}</p>
          </div>
          <div className="mt-2 text-sm text-blue-600">
            This may take 10-20 seconds...
          </div>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          createToken();
        }}
        className="space-y-6"
      >
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Token Name *
          </label>
          <input
            type="text"
            id="name"
            value={tokenConfig.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="e.g., My Awesome Token"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isCreating}
          />
        </div>

        <div>
          <label
            htmlFor="symbol"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Token Symbol *
          </label>
          <input
            type="text"
            id="symbol"
            value={tokenConfig.symbol}
            onChange={(e) =>
              handleInputChange("symbol", e.target.value.toUpperCase())
            }
            placeholder="e.g., MAT"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={10}
            required
            disabled={isCreating}
          />
        </div>
        <div>
          <label
            htmlFor="supply"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Token Supply *
          </label>
          <input
            type="number"
            id="supply"
            value={tokenConfig.supply}
            onChange={(e) => handleInputChange("supply", e.target.value)}
            placeholder="99000"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isCreating}
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Description *
          </label>
          <textarea
            id="description"
            value={tokenConfig.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Describe your token..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isCreating}
          />
        </div>

        <div>
          <label
            htmlFor="decimals"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Decimals
          </label>
          <select
            id="decimals"
            value={tokenConfig.decimals}
            onChange={(e) =>
              handleInputChange("decimals", parseInt(e.target.value))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isCreating}
          >
            <option value={0}>0 (No decimals)</option>
            <option value={2}>2 (Like cents)</option>
            <option value={6}>6 (Recommended)</option>
            <option value={8}>8 (Like Bitcoin)</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="iconUrl"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Icon URL (Optional)
          </label>
          <input
            type="url"
            id="iconUrl"
            value={tokenConfig.iconUrl}
            onChange={(e) => handleInputChange("iconUrl", e.target.value)}
            placeholder="https://example.com/icon.png"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isCreating}
          />
        </div>

        <button
          type="submit"
          disabled={isCreating || !currentAccount || !matched}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isCreating ? "Creating & Deploying Token..." : "Create Token"}
        </button>
      </form>

      {!currentAccount && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-700 text-center">
            Please connect your wallet to create a token
          </p>
        </div>
      )}

      {!matched && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-700 text-center">
            Oops! Looks like your wallet and the app are on different networks.
            Please switch them to match.
          </p>
        </div>
      )}
    </div>
  );
}
