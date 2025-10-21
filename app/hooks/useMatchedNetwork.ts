import { useCurrentAccount } from "@iota/dapp-kit";
import { useNetwork } from "../providers";

function useMatchNetwork() {
  const { network } = useNetwork();
  const account = useCurrentAccount();
  const walletNetwork = account?.chains.find((chain) =>
    chain.startsWith("iota:")
  );

  return walletNetwork === `iota:${network}`;
}

export default useMatchNetwork;
