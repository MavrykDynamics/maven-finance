import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { MessariFetcherService } from '@mavryk-oracle-node/messari-fetcher';
import { CoingeckoFetcherService } from '@mavryk-oracle-node/coingecko-fetcher';
import { OracleConfig } from './oracle.config';
import {
  AggregatorContractAbstraction,
  AggregatorFactoryContractAbstraction,
} from '@mavryk-oracle-node/contracts';
import { ContractProvider, TezosToolkit } from '@taquito/taquito';
import BigNumber from 'bignumber.js';
import { packDataBytes, MichelsonData, MichelsonType } from '@taquito/michel-codec';
import { TxManagerService } from '@mavryk-oracle-node/tx-manager';

@Injectable()
export class CommonService implements OnModuleInit {
  private readonly logger = new Logger(CommonService.name);

  constructor(
    private readonly messariFetcherService: MessariFetcherService,
    private readonly coingeckoFectcherService: CoingeckoFetcherService,
    private readonly txManagerService: TxManagerService,
    private readonly oracleConfig: OracleConfig
  ) {
    if (oracleConfig.rpcUrl === '') {
      throw new Error('RPC Url must be set (RPC_URL env variable)');
    }

    if (oracleConfig.oraclePhk === '') {
      throw new Error('Oracle pkh must be set (ORACLE_PKH env variable)');
    }

    if (oracleConfig.oracleWithdrawAddress === '') {
      throw new Error(
        'Oracle withdraw address must be set (ORACLE_WITHDRAW_ADDRESS env variable)'
      );
    }
  }

  async onModuleInit(): Promise<void> {
    const toolkit = await this.txManagerService.getTezosToolkit(
      this.oracleConfig.oraclePhk
    );
    const pkh = await toolkit.signer.publicKeyHash();
    this.logger.verbose(`Using Oracle address: ${pkh}`);
    this.logger.verbose(
      `Using AggregatorFactory address: ${this.oracleConfig.aggregatorFactorySmartContractAddress}`
    );
    this.logger.verbose(`Using RPC url: ${this.oracleConfig.rpcUrl}`);
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
    const toolkit = await this.txManagerService.getTezosToolkit(
      this.oracleConfig.oraclePhk
    );
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
    const toolkit = await this.txManagerService.getTezosToolkit(
      this.oracleConfig.oraclePhk
    );
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
    return this.txManagerService.getTezosToolkit(this.oracleConfig.oraclePhk);
  }

  public getPkh(): string {
    return this.oracleConfig.oraclePhk;
  }

  public filterNotNull<T>(ops: (T | null)[]): T[] {
    return ops.filter((op) => op !== null) as T[];
  }

  public filterNotNullOpPair<T>(arr: {pair: [string, string], op: T | null}[]): {pair: [string, string], op: T}[] {
    return arr.filter((op) => op.op !== null) as {pair: [string, string], op: T}[];
  }

  public getCommitData(price: BigNumber, salt: string, pkh: string) {
    const data: MichelsonData = {
      prim: 'Pair',
      args: [
        { prim: 'Pair', args: [{ int: price.toString() }, { string: salt }] },
        { string: pkh },
      ],
    };
    const typ: MichelsonType = {
      prim: 'pair',
      args: [
        { prim: 'pair', args: [{ prim: 'nat' }, { prim: 'string' }] },
        { prim: 'address' },
      ],
    };
    const priceCodec = packDataBytes(data, typ);
    return priceCodec.bytes;
  }
}
