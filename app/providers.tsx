"use client";

import { IotaClientProvider, WalletProvider } from "@iota/dapp-kit";
import { getFullnodeUrl } from "@iota/iota-sdk/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";

// Networks
const networks = {
  testnet: { url: getFullnodeUrl("testnet") },
  mainnet: { url: getFullnodeUrl("mainnet") },
  devnet: { url: getFullnodeUrl("devnet") },
};

export type Network = keyof typeof networks;

const NetworkContext = createContext<{
  network: Network;
  setNetwork: Dispatch<SetStateAction<Network>>;
}>({
  network: "mainnet",
  setNetwork() {},
});

export const useNetwork = () => useContext(NetworkContext);

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [network, setNetwork] = useState<Network>("mainnet");

  return (
    <NetworkContext.Provider
      value={{
        network,
        setNetwork,
      }}
    >
      <QueryClientProvider client={queryClient}>
        <IotaClientProvider networks={networks} network={network}>
          <WalletProvider autoConnect>{children}</WalletProvider>
        </IotaClientProvider>
      </QueryClientProvider>
    </NetworkContext.Provider>
  );
}
