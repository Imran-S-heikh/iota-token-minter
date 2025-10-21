import { useSignTransaction } from "@iota/dapp-kit";
import {
  IotaClient,
  IotaTransactionBlockResponse,
  IotaTransactionBlockResponseOptions,
} from "@iota/iota-sdk/client";
import { Transaction } from "@iota/iota-sdk/transactions";
import { WalletAccount } from "@wallet-standard/base";

export interface TimedIotaTransactionBlockResponse
  extends IotaTransactionBlockResponse {
  time: number;
}

export interface SignAndExecuteArgs {
  iotaClient: IotaClient;
  currentAccount: WalletAccount;
  tx: Transaction;
  signTransaction: ReturnType<typeof useSignTransaction>;
  options?: IotaTransactionBlockResponseOptions;
}

export interface WaitForTxArgs {
  iotaClient: IotaClient;
  digest: string;
  timeout?: number;
  pollInterval?: number;
}
