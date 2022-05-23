import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { OracleConfig } from './oracle.config';
import { PriceService } from './price.service';
import { OpKind } from '@taquito/taquito';
import { TxManagerService } from '@mavryk-oracle-node/tx-manager';
import { Mutex } from 'async-mutex';
import BigNumber from 'bignumber.js';
import { WalletParamsWithKind } from '@taquito/taquito/dist/types/wallet/wallet';
import { CommonService } from './common.service';
import { CronJob } from 'cron';
import { CommitStorageService } from './commit-storage.service';
import { createHash } from 'crypto';

@Injectable()
export class DeviationTriggerService implements OnModuleInit {
  private readonly logger = new Logger(DeviationTriggerService.name);
  private cronJob: CronJob;
  private mutex = new Mutex();
  private readonly workAtLoss;
  private readonly deviationTriggerCronString: string;
  private readonly enableDeviationTrigger: boolean;

  constructor(
    private readonly priceService: PriceService,
    private readonly txManagerService: TxManagerService,
    private readonly commonService: CommonService,
    private readonly commitStorageService: CommitStorageService,
    oracleConfig: OracleConfig
  ) {
    this.workAtLoss = oracleConfig.workAtLoss;
    this.deviationTriggerCronString = oracleConfig.deviationTriggerCronString;
    this.enableDeviationTrigger = oracleConfig.enableDeviationTrigger;
  }

  async onModuleInit(): Promise<void> {
    this.logger.verbose(
      `Using deviation trigger cron string: ${this.deviationTriggerCronString}`
    );

    if(!this.enableDeviationTrigger) {
      this.logger.warn('Deviation trigger is disabled (set ENABLE_DEVIATION_TRIGGER env variable to true to enable)');
      return;
    }

    this.cronJob = new CronJob(this.deviationTriggerCronString, async () => {
      try {
        await this.triggerDeviationIfNeeded();
      } catch (e) {
        this.logger.error(
          `Uncaught error in triggerDeviationIfNeeded: ${e.toString()}`
        );
      }
    });

    this.cronJob.start();
  }

  private async triggerDeviationIfNeeded(): Promise<void> {
    if (this.mutex.isLocked()) {
      return;
    }

    const aggregators = await this.commonService.getAggregatorsAddresses();

    const ops = await Promise.all(
      Array.from(aggregators.entries()).map(
        async ([pair, aggregatorSmartContractAddress]) => {
          try {
            return await this.getDeviationTriggerOpetationIfNeeded(
              pair,
              aggregatorSmartContractAddress
            );
          } catch (e) {
            this.logger.error(
              `Error while trying to set observation on pair ${pair[0]}/${
                pair[1]
              }: ${e.toString()}`
            );
            return null;
          }
        }
      )
    );

    const notNullOps = this.commonService.filterNotNull(ops);

    if (notNullOps.length === 0) {
      return;
    }

    this.logger.log(
      `Sending observations: ${notNullOps.length} batched observation operations`
    );

    await this.mutex.runExclusive(async () => {
      const result = await this.txManagerService.addBatch(
        this.commonService.getPkh(),
        notNullOps
      );
      switch (result.type) {
        case 'success':
          this.logger.log(
            `Sending observations: Confirmed ${notNullOps.length} batched operations`
          );
          break;
        case 'error':
          this.logger.error(
            `Sending observations: Failed to send observations (${
              notNullOps.length
            } operations): ${result.error.toString()}`
          );
      }
    });
  }

  private async getDeviationTriggerOpetationIfNeeded(
    pair: [string, string],
    aggregatorSmartContractAddress: string
  ): Promise<WalletParamsWithKind | null> {
    const toolkit = await this.commonService.getTezosToolkit();
    const aggregator = await this.commonService.getAggregator(
      aggregatorSmartContractAddress
    );

    const {
      config: {
        deviationRewardAmountXTZ,
        minimalTezosAmountDeviationTrigger: tezStake,
        perthousandDeviationTrigger: thresholdPerthousand,
        decimals,
      },
      lastCompletedRoundPrice: { price: lastPrice, round: lastCompletedRound },
      round: currentRound,
    } = await aggregator.storage();

    if (!lastCompletedRound.eq(currentRound)) {
      // Last round is not finished yet
      return null;
    }

    if (currentRound.eq(new BigNumber(0))) {
      // oracle initiation
      return null;
    }

    const nextRound = currentRound.plus(1);

    const newPrice = await this.priceService.getPrice(decimals, pair);

    // 1000 * abs(newPrice - lastPrice) / lastPrice
    const deviation = newPrice
      .minus(lastPrice)
      .abs()
      .div(lastPrice)
      .multipliedBy(1000);

    if (deviation.gte(thresholdPerthousand)) {
      this.logger.log(
        `Deviation detected on pair ${pair[0]}/${pair[1]} (${deviation
          .precision(2)
          .toNumber()}‰ > ${thresholdPerthousand}‰ (${lastPrice} -> ${newPrice}))`
      );
      const salt = (Math.random() + 1).toString(36).substring(7);
      const commitData = this.commonService.getCommitData(newPrice, salt, this.commonService.getPkh());

      const commitDataHash = createHash('sha256')
        .update(commitData, 'hex')
        .digest('hex');

      const op = aggregator.methods.requestRateUpdateDeviation(
        nextRound,
        commitDataHash
      );

      const transferParams = {
        ...op.toTransferParams(),
        amount: tezStake.toNumber(),
        mutez: false,
      };

      const estimate = await toolkit.estimate.transfer(transferParams);

      if (deviationRewardAmountXTZ.lt(new BigNumber(estimate.totalCost))) {
        this.logger.warn(
          `XTZ Reward (${deviationRewardAmountXTZ.toString()}) is lower than estimated gas cost (${
            estimate.totalCost
          })`
        );

        if (!this.workAtLoss) {
          return null;
        }
      }

      await this.commitStorageService.saveCommitData(
        nextRound,
        newPrice,
        salt,
        aggregatorSmartContractAddress
      );
      return {
        kind: OpKind.TRANSACTION,
        ...transferParams,
      };
    }

    return null;
  }
}
