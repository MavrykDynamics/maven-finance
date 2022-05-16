import { TezosToolkit } from '@taquito/taquito';
import { networkConfig, NetworkName } from '../lib/scripts/env';
import { AccountName, accounts } from '../lib/accounts';
import { InMemorySigner } from '@taquito/signer';

export async function getTezosToolkitFor(
  accountName: AccountName,
  networkName: NetworkName = 'development'
): Promise<TezosToolkit> {
  const toolkit = new TezosToolkit(networkConfig.networks[networkName].rpc);

  toolkit.setProvider({
    config: {
      confirmationPollingTimeoutSecond:
        networkConfig.confirmationPollingTimeoutSecond,
    },
    signer: await InMemorySigner.fromSecretKey(accounts[accountName].sk),
  });

  return toolkit;
}
