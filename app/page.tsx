"use client";

import { WalletConnection } from "./components/WalletConnection";
import { OneClickTokenCreator } from "./components/OneClickTokenCreator";

export default function Home() {
  return (
    <div className="">
      <div className="">
        <WalletConnection />
      </div>
      <div className="mt-10">
        <OneClickTokenCreator />
      </div>
    </div>
  );
}
