import React from "react";
import { Network, useNetwork } from "../providers";

function NetworkPicker() {
  const { network, setNetwork } = useNetwork();

  return (
    <div className="">
      <select
        value={network}
        onChange={(e) => setNetwork(e.target.value as Network)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="testnet">Testnet</option>
        <option value="mainnet">Mainnet</option>
        <option value="devnet">Devnet</option>
      </select>
    </div>
  );
}

export default NetworkPicker;
