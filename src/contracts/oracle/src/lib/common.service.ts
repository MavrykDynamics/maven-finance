import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { MessariFetcherService } from '@mavryk-oracle-node/messari-fetcher';
import { CoingeckoFetcherService } from '@mavryk-oracle-node/coingecko-fetcher';
import { OracleConfig } from './oracle.config';
import {
  AggregatorContractAbstraction,
  AggregatorFactoryContractAbstraction,
} from '@mavryk-oracle-node/contracts';
import { ContractProvider, TezosToolkit } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';
import BigNumber from 'bignumber.js';
import { packDataBytes } from '@taquito/michel-codec';

@Injectable()
export class CommonService implements OnModuleInit {
  private readonly logger = new Logger(CommonService.name);
  private tezosToolkit: TezosToolkit | undefined;

  constructor(
    private readonly messariFetcherService: MessariFetcherService,
    private readonly coingeckoFectcherService: CoingeckoFetcherService,
    private readonly oracleConfig: OracleConfig
  ) {
    if (oracleConfig.rpcUrl === '') {
      throw new Error('RPC Url must be set (RPC_URL env variable)');
    }

    if (oracleConfig.oracleSecretKey === '') {
      throw new Error(
        'Oracle private key must be set (ORACLE_SECRET_KEY env variable)'
      );
    }

    if (oracleConfig.oracleWithdrawAddress === '') {
      throw new Error(
        'Oracle withdraw address must be set (ORACLE_WITHDRAW_ADDRESS env variable)'
      );
    }
  }

  async onModuleInit(): Promise<void> {
    const toolkit = await this.getTezosToolkit();
    const pkh = await toolkit.signer.publicKeyHash();
    this.logger.log(`Using Oracle address: ${pkh}`);
    this.logger.log(
      `Using AggregatorFactory address: ${this.oracleConfig.aggregatorFactorySmartContractAddress}`
    );
    this.logger.log(`Using RPC url: ${this.oracleConfig.rpcUrl}`);
  }

  public async getAggregatorsAddresses(): Promise<
    Map<[string, string], string>
  > {
    const aggregatorFactory = await this.getAggregatorFactory();
    const { trackedAggregators } = await aggregatorFactory.storage();

    const pairs = Array.from(await trackedAggregators.entries());

    const aggregators: Map<[string, string], string> = new Map<
      [string, string],
      string
    >();

    for (const [pair, address] of pairs) {
      aggregators.set([pair[0], pair[1]], address);
    }

    return aggregators;
  }

  public async getAggregator(
    aggregatorSmartContractAddress: string
  ): Promise<AggregatorContractAbstraction<ContractProvider>> {
    const toolkit = await this.getTezosToolkit();
    let aggregator: AggregatorContractAbstraction<ContractProvider>;
    try {
      aggregator = await toolkit.contract.at<
        AggregatorContractAbstraction<ContractProvider>
      >(aggregatorSmartContractAddress);
    } catch (e) {
      this.logger.error(
        `Error while fetching aggregator smart contract at ${aggregatorSmartContractAddress} ${JSON.stringify(
          e
        )}`
      );
      throw e;
    }

    return aggregator;
  }

  public async getAggregatorFactory(): Promise<
    AggregatorFactoryContractAbstraction<ContractProvider>
  > {
    const toolkit = await this.getTezosToolkit();
    let aggregatorFactory: AggregatorFactoryContractAbstraction<ContractProvider>;
    try {
      aggregatorFactory = await toolkit.contract.at<
        AggregatorFactoryContractAbstraction<ContractProvider>
      >(this.oracleConfig.aggregatorFactorySmartContractAddress);
    } catch (e) {
      this.logger.error(
        `Error while fetching aggregator factory smart contract at ${
          this.oracleConfig.aggregatorFactorySmartContractAddress
        } ${JSON.stringify(e)}`
      );
      throw e;
    }

    return aggregatorFactory;
  }

  public async getTezosToolkit(): Promise<TezosToolkit> {
    if (this.tezosToolkit !== undefined) {
      return this.tezosToolkit;
    }

    this.tezosToolkit = new TezosToolkit(this.oracleConfig.rpcUrl);
    this.tezosToolkit.setProvider({
      signer: await InMemorySigner.fromSecretKey(
        this.oracleConfig.oracleSecretKey
      ),
    });

    return this.tezosToolkit;
  }

  public getSecretKey(): string {
    return this.oracleConfig.oracleSecretKey;
  }

  public async getPkh(): Promise<string> {
    const toolkit = await this.getTezosToolkit();
    return toolkit.wallet.pkh();
  }

  public filterNotNull<T>(ops: (T | null)[]): T[] {
    return ops.filter((op) => op !== null) as T[];
  }

  public getCommitData(price: BigNumber, salt: string) {
    const data: any = {
      prim: 'Pair',
      args: [{ int: price.toString() }, { string: salt }],
    };
    const typ: any = {
      prim: 'pair',
      args: [{ prim: 'int' }, { prim: 'string' }],
    };
    const priceCodec = packDataBytes(data, typ);
    return priceCodec.bytes;
  }
}
