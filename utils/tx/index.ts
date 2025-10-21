import {
  SignAndExecuteArgs,
  TimedIotaTransactionBlockResponse,
  WaitForTxArgs,
} from "./tx.types";
import {
  IotaTransactionBlockResponse,
  OwnedObjectRef,
} from "@iota/iota-sdk/client";

export const throwTXIfNotSuccessful = (
  tx: IotaTransactionBlockResponse,
  callback?: () => void
) => {
  if (!!tx.effects?.status && tx.effects.status.status !== "success") {
    callback?.();
    throw new Error("Transaction failed");
  }
};

export const signAndExecute = async ({
  iotaClient,
  currentAccount,
  tx,
  signTransaction,
  options,
}: SignAndExecuteArgs): Promise<TimedIotaTransactionBlockResponse> => {
  const { signature, bytes } = await signTransaction.mutateAsync({
    account: currentAccount,
    transaction: tx,
  });

  const startTime = Date.now();

  const txResult = await iotaClient.executeTransactionBlock({
    transactionBlock: bytes,
    signature,
    options: {
      showEffects: true,
      ...options,
    },
    requestType: "WaitForLocalExecution",
  });

  await iotaClient.waitForTransaction({
    digest: txResult.digest,
    timeout: 20000,
    pollInterval: 1000,
  });

  const endTime = Date.now();

  if (txResult.timestampMs)
    return {
      ...txResult,
      time: Number(txResult.timestampMs) - startTime,
    };

  const txDoubleResponse = await iotaClient.getTransactionBlock({
    digest: txResult.digest,
    options: { showEffects: true },
  });

  return {
    ...txResult,
    time: Number(txDoubleResponse.timestampMs ?? endTime) - startTime,
  };
};

export const waitForTx = async ({
  iotaClient: suiClient,
  digest,
  timeout = 10000,
  pollInterval = 500,
}: WaitForTxArgs) =>
  suiClient.waitForTransaction({
    digest,
    timeout,
    pollInterval,
  });

export const getObjectIdsFromTxResult = (
  txResult: TimedIotaTransactionBlockResponse,
  field: "created" | "mutated"
): ReadonlyArray<string> =>
  txResult.effects![field]!.map(
    (item: OwnedObjectRef) => item.reference.objectId
  );
