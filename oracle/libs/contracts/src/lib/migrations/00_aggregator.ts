import { NetworkConfig, NetworkName } from '../scripts/env';
import {
  ContractProvider,
  OpKind,
  OriginationOperation,
  TezosToolkit,
  WalletTransferParams,
  withKind,
} from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';
import { saveContractAddress } from '../scripts/helpers';
import { MichelsonMap } from '@taquito/michelson-encoder';
import BigNumber from 'bignumber.js';
import { accountPerNetwork } from '../accounts';
import {
  AggregatorFactoryCode,
  AggregatorFactoryContractAbstraction,
  AggregatorFactoryStorage,
} from '../aggregatorFactory';
import { AggregatorContractAbstraction } from '../aggregator';
import { MVKTokenCode, mvkTokenStorageForNetwork } from '../mvkToken';

export const MVK_TOKEN_SMART_CONTRACT_ADDRESS =
  'MVK_TOKEN_SMART_CONTRACT_ADDRESS';
export const AGGREGATOR_FACTORY_SMART_CONTRACT_ADDRESS =
  'AGGREGATOR_FACTORY_SMART_CONTRACT_ADDRESS';

export type MigrationResult = {
  [MVK_TOKEN_SMART_CONTRACT_ADDRESS]: string;
  [AGGREGATOR_FACTORY_SMART_CONTRACT_ADDRESS]: string;
};

export default async function (
  networkConfig: NetworkConfig,
  networkName: NetworkName,
  saveToEnv = true
): Promise<MigrationResult> {
  const toolkit = new TezosToolkit(networkConfig.networks[networkName].rpc);

  toolkit.setProvider({
    config: {
      confirmationPollingTimeoutSecond:
        networkConfig.confirmationPollingTimeoutSecond,
    },
    signer: await InMemorySigner.fromSecretKey(
      networkConfig.networks[networkName].secretKey
    ),
  });

  // MVK TOKEN CONTRACT ORIGINATION
  console.log('Originating MVK Token');
  const opMvkToken: OriginationOperation = await toolkit.contract.originate({
    code: MVKTokenCode,
    storage: mvkTokenStorageForNetwork(networkName),
  });
  console.log('Origination done MVK Token: ', opMvkToken.contractAddress);

  if (opMvkToken.contractAddress === undefined) {
    throw new Error('Aggregator smart contract address not received');
  }

  await opMvkToken.confirmation();

  if (saveToEnv) {
    await saveContractAddress(
      MVK_TOKEN_SMART_CONTRACT_ADDRESS,
      opMvkToken.contractAddress,
      networkName
    );
  }

  let oraclesArray;
  if (networkName === 'ithacanet-kms') {
    oraclesArray = [
      accountPerNetwork[networkName].bob.pkh,
      accountPerNetwork[networkName].eve.pkh,
      accountPerNetwork[networkName].mallory.pkh,
    ];
  } else {
    oraclesArray = [
      accountPerNetwork[networkName].bob.pkh,
      accountPerNetwork[networkName].eve.pkh,
      accountPerNetwork[networkName].mallory.pkh,
      accountPerNetwork[networkName].oscar.pkh,
      accountPerNetwork[networkName].trudy.pkh,
      accountPerNetwork[networkName].isaac.pkh,
    ];
  }

  // AGGREGATOR FACTORY CONTRACT ORIGINATION
  const aggregatorFactoryStorage: AggregatorFactoryStorage = {
    admin: networkConfig.networks[networkName].pkh,
    mvkTokenAddress: opMvkToken.contractAddress,
    trackedSatellite: oraclesArray,
    trackedAggregators: MichelsonMap.fromLiteral({}) as MichelsonMap<
      { 0: string; 1: string },
      string
    >,
  };

  console.log('Originating Aggregator factory');
  const opFactory: OriginationOperation = await toolkit.contract.originate({
    code: AggregatorFactoryCode,
    storage: aggregatorFactoryStorage,
  });
  console.log(
    `Aggregator factory origination done at: ${opFactory.contractAddress}`
  );

  if (opFactory.contractAddress === undefined) {
    throw new Error('Factory smart contract address not received');
  }

  if (saveToEnv) {
    await saveContractAddress(
      AGGREGATOR_FACTORY_SMART_CONTRACT_ADDRESS,
      opFactory.contractAddress,
      networkName
    );
  }

  await opFactory.confirmation();

  // 3 AGGREGATOR CONTRACTS ORIGINATIONS
  const aggregatorFactory =
    await toolkit.contract.at<AggregatorFactoryContractAbstraction>(
      opFactory.contractAddress
    );

  let oracles;
  if (networkName === 'ithacanet-kms') {
    oracles = {
      [accountPerNetwork[networkName].bob.pkh]: true,
      [accountPerNetwork[networkName].eve.pkh]: true,
      [accountPerNetwork[networkName].mallory.pkh]: true,
    };
  } else {
    oracles = {
      [accountPerNetwork[networkName].bob.pkh]: true,
      [accountPerNetwork[networkName].eve.pkh]: true,
      [accountPerNetwork[networkName].mallory.pkh]: true,
      [accountPerNetwork[networkName].oscar.pkh]: true,
      [accountPerNetwork[networkName].trudy.pkh]: true,
      [accountPerNetwork[networkName].isaac.pkh]: true,
    };
  }

  const OraclesMap = MichelsonMap.fromLiteral(oracles) as MichelsonMap<
    string,
    boolean
  >;
  const createAggregator1Op = await aggregatorFactory.methods
    .createAggregator(
      'USD',
      'BTC',
      OraclesMap,
      opMvkToken.contractAddress,
      new BigNumber(8),
      accountPerNetwork[networkName].alice.pkh,
      new BigNumber(1),
      new BigNumber(2),
      new BigNumber(60),
      new BigNumber(5),
      new BigNumber(1),
      new BigNumber(500),
      opFactory.contractAddress
    )
    .send();

  await createAggregator1Op.confirmation();

  const createAggregator2Op = await aggregatorFactory.methods
    .createAggregator(
      'USD',
      'XTZ',
      OraclesMap,
      opMvkToken.contractAddress,
      new BigNumber(8),
      accountPerNetwork[networkName].alice.pkh,
      new BigNumber(1),
      new BigNumber(2),
      new BigNumber(60),
      new BigNumber(5),
      new BigNumber(1),
      new BigNumber(500),
      opFactory.contractAddress
    )
    .send();

  await createAggregator2Op.confirmation();

  const createAggregator3Op = await aggregatorFactory.methods
    .createAggregator(
      'USD',
      'DOGE',
      OraclesMap,
      opMvkToken.contractAddress,
      new BigNumber(16),
      accountPerNetwork[networkName].alice.pkh,
      new BigNumber(1),
      new BigNumber(2),
      new BigNumber(60),
      new BigNumber(5),
      new BigNumber(1),
      new BigNumber(500),
      opFactory.contractAddress
    )
    .send();

  await createAggregator3Op.confirmation();

  // send 100 tezos to each originated contract
  const storage = await aggregatorFactory.storage();

  const ops = await Promise.all(
    Array.from(await storage.trackedAggregators.values()).map(
      async (address) => {
        console.log('agregator contract: ', address);
        const aggregator = await toolkit.contract.at<
          AggregatorContractAbstraction<ContractProvider>
        >(address);
        return aggregator.methods.default();
      }
    )
  );
  const notNullOps = ops.filter((op) => op !== null);

  const notNullOpsWithKind = notNullOps.map(
    (value): withKind<WalletTransferParams, OpKind.TRANSACTION> => {
      return {
        ...value.toTransferParams(),
        kind: OpKind.TRANSACTION,
        amount: 100,
      };
    }
  );

  const response = await toolkit.wallet.batch(notNullOpsWithKind).send();
  await response.confirmation();

  // send 100 MVK to each originated contract
  const mvkContract = await toolkit.contract.at(opMvkToken.contractAddress);

  const ops_mvk = await Promise.all(
    Array.from(await storage.trackedAggregators.values()).map(
      async (address) => {
        const transfer_params = [
          {
            from_: networkConfig.networks[networkName].pkh,
            txs: [
              {
                to_: address,
                token_id: 0,
                amount: 50000,
              },
            ],
          },
        ];
        return mvkContract.methods['transfer'](transfer_params);
      }
    )
  );
  const notNullOps_mvk = ops_mvk.filter((op) => op !== null);

  const notNullOpsWithKind_mvk = notNullOps_mvk.map(
    (value): withKind<WalletTransferParams, OpKind.TRANSACTION> => {
      return {
        kind: OpKind.TRANSACTION,
        ...value.toTransferParams(),
      };
    }
  );

  const response_mvk = await toolkit.wallet
    .batch(notNullOpsWithKind_mvk)
    .send();
  await response_mvk.confirmation();

  // const clientStorage: ClientStorage = {
  //   address: '',
  //   lastprices: {
  //     round: 0,
  //     decimals: 0,
  //     price: 0,
  //     percentOracleResponse: 0,
  //   },
  // };
  //
  // console.log('Originating client');
  // const opClient: OriginationOperation = await toolkit.contract.originate({
  //   code: Client,
  //   storage: {
  //     ...clientStorage,
  //     address: opAggregator.contractAddress,
  //   },
  // });
  // console.log(`client origination done at: ${opClient.contractAddress}`);
  //
  // if (opClient.contractAddress === undefined) {
  //   throw new Error('Client smart contract address not received');
  // }

  //await saveContractAddress(
  //  'CLIENT_SMART_CONTRACT_ADDRESS',
  //  opClient.contractAddress,
  //  networkName
  //

  return {
    [MVK_TOKEN_SMART_CONTRACT_ADDRESS]: opMvkToken.contractAddress,
    [AGGREGATOR_FACTORY_SMART_CONTRACT_ADDRESS]: opFactory.contractAddress,
  };
}
