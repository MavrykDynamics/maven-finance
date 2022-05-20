import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CronJob } from 'cron';
import { MaintainerConfig } from './maintainer.config';
import { ContractProvider, OpKind } from '@taquito/taquito';
import {
  AggregatorContractAbstraction,
  AggregatorFactoryContractAbstraction,
} from '@mavryk-oracle-node/contracts';
import { Mutex } from 'async-mutex';
import { TxManagerService } from '@mavryk-oracle-node/tx-manager';
import { CronExpression } from '@nestjs/schedule';

@Injectable()
export class RequestRateUpdateService implements OnModuleInit {
  private readonly logger = new Logger(RequestRateUpdateService.name);
  private readonly cronJob: CronJob;
  private readonly mutex = new Mutex();

  constructor(
    private readonly maintainerConfig: MaintainerConfig,
    private readonly txManagerService: TxManagerService
  ) {
    if (maintainerConfig.rpcUrl === '') {
      throw new Error('RPC Url must be set (RPC_URL env variable)');
    }

    if (maintainerConfig.maintainerPkh === '') {
      throw new Error('Maintainer pkh must be set (MAINTAINER_PKH env variable)');
    }

    if (maintainerConfig.aggregatorFactorySmartContractAddress === '') {
      throw new Error(
        'Aggregator factory smart contract address must be set (AGGREGATOR_FACTORY_SMART_CONTRACT_ADDRESS env variable)'
      );
    }

    this.logger.log(
      `Round duration: ${maintainerConfig.roundDurationMinutes} minutes`
    );

    this.cronJob = new CronJob(CronExpression.EVERY_5_SECONDS, async () => {
      try {
        await this.requestUpdateRate();
      } catch (e) {
        this.logger.error(
          `Uncaught error in requestUpdateRate: ${e.toString()}`
        );
      }
    });

    this.cronJob.start();
  }

  async onModuleInit(): Promise<void> {
    this.logger.log(`Using maintainer address: ${this.maintainerConfig.maintainerPkh}`);
    this.logger.log(
      `Using AggregatorFactory address: ${this.maintainerConfig.aggregatorFactorySmartContractAddress}`
    );
    this.logger.log(`Using RPC url: ${this.maintainerConfig.rpcUrl}`);
  }

  private async requestUpdateRate() {
    if (this.mutex.isLocked()) {
      return;
    }

    const toolkit = await this.txManagerService.getTezosToolkit(
      this.maintainerConfig.maintainerPkh
    );
    const aggregators = await this.getAggregators();

    await this.mutex.runExclusive(async () => {
      for (const [pair, address] of aggregators) {
        const aggregator = await toolkit.contract.at<
          AggregatorContractAbstraction<ContractProvider>
        >(address);

        const {
          lastCompletedRoundPrice: { round: lastCompletedRound },
          roundStart
        } = await aggregator.storage();

        const minutesSinceLastRound =
          (Date.now() - Date.parse(roundStart)) / (60 * 1000);

        this.logger.debug(
          `Minutes since last round ${lastCompletedRound} (started at ${roundStart}): ${minutesSinceLastRound}`
        );

        if (minutesSinceLastRound < this.maintainerConfig.roundDurationMinutes) {
          // Wait before starting new round
          return;
        }

        const result = await this.txManagerService.addBatch(
          this.maintainerConfig.maintainerPkh,
          [
            {
              kind: OpKind.TRANSACTION,
              ...aggregator.methods.requestRateUpdate().toTransferParams(),
            },
          ]
        );

        switch (result.type) {
          case 'success':
            this.logger.log(`Request rate update: Requested for pair ${pair}`);
            break;
          case 'error':
            this.logger.error(
              `Request rate update: Failed to request rate update for pair ${pair}: ${result.error.toString()}`
            );
        }
      }
    });
  }

  private async getAggregators(): Promise<Map<string, string>> {
    const toolkit = await this.txManagerService.getTezosToolkit(
      this.maintainerConfig.maintainerPkh
    );

    let aggregatorFactory: AggregatorFactoryContractAbstraction<ContractProvider>;
    try {
      aggregatorFactory = await toolkit.contract.at<
        AggregatorFactoryContractAbstraction<ContractProvider>
      >(this.maintainerConfig.aggregatorFactorySmartContractAddress);
    } catch (e) {
      this.logger.error(
        `Error while aggregator factory fetching contract ${JSON.stringify(e)}`
      );
      return new Map();
    }

    const storage = await aggregatorFactory.storage();

    const pairs = Array.from(await storage.trackedAggregators.entries());

    const aggregators: Map<string, string> = new Map<string, string>();

    for (const pair of pairs) {
      aggregators.set(`${pair[0][0]}/${pair[0][1]}`, pair[1]);
    }

    return aggregators;
  }
}
