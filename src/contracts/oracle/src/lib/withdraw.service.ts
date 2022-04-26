import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { OracleConfig } from './oracle.config';
import { OpKind } from '@taquito/taquito';
import { AggregatorStorage } from '@mavryk-oracle-node/contracts';
import { TxManagerService } from '@mavryk-oracle-node/tx-manager';
import { CronJob } from 'cron';
import { Mutex } from 'async-mutex';
import BigNumber from 'bignumber.js';
import { WalletParamsWithKind } from '@taquito/taquito/dist/types/wallet/wallet';
import { CommonService } from './common.service';

@Injectable()
export class WithdrawService implements OnModuleInit {
  private readonly logger = new Logger(WithdrawService.name);
  private cronJob: CronJob;
  private mutex = new Mutex();
  private readonly oracleWithdrawAddress: string;
  private readonly oracleWithdrawCronString: string;

  constructor(
    private readonly txManagerService: TxManagerService,
    private readonly commonService: CommonService,
    oracleConfig: OracleConfig
  ) {
    this.oracleWithdrawAddress = oracleConfig.oracleWithdrawAddress;
    this.oracleWithdrawCronString = oracleConfig.oracleWithdrawCronString;
  }

  async onModuleInit(): Promise<void> {
    this.logger.verbose(
      `Using withdraw cron string: ${this.oracleWithdrawCronString}`
    );
    this.logger.verbose(
      `Using withdraw address: ${this.oracleWithdrawAddress}`
    );

    this.cronJob = new CronJob(this.oracleWithdrawCronString, async () => {
      try {
        await this.withdraw();
      } catch (e) {
        this.logger.error(`Uncaught error in withdraw: ${e.toString()}`)
      }
    });

    this.cronJob.start();
  }

  private async withdraw(): Promise<void> {
    if (this.mutex.isLocked()) {
      return;
    }

    const aggregators = await this.commonService.getAggregatorsAddresses();

    const ops = await Promise.all(
      Array.from(aggregators.entries()).map(
        ([pair, aggregatorSmartContractAddress]) =>
          this.withdrawFromAggregator(pair, aggregatorSmartContractAddress)
      )
    );

    const notNullOps = this.commonService.filterNotNull(ops.flat());

    if (notNullOps.length === 0) {
      return;
    }

    this.logger.verbose(
      `Withdrawing: ${notNullOps.length} batched withdraw operations`
    );

    await this.mutex.runExclusive(async () => {
      const result = await this.txManagerService.addBatch(
        this.commonService.getSecretKey(),
        notNullOps
      );
      switch (result.type) {
        case 'success':
          this.logger.log(
            `Withdrawing: Confirmed ${notNullOps.length} withdraw batched operations`
          );
          break;
        case 'error':
          this.logger.error(
            `Withdrawing: Failed to withdraw (${
              notNullOps.length
            } operations): ${result.error.toString()}`
          );
      }
    });
  }

  private async withdrawFromAggregator(
    pair: [string, string],
    aggregatorSmartContractAddress: string
  ): Promise<(WalletParamsWithKind | null)[]> {
    return Promise.all([
      this.withdrawXTZFromAggregator(aggregatorSmartContractAddress).catch(
        (e) => {
          this.logger.error(
            `Error while trying to withdraw XTZ on pair ${pair[0]}/${
              pair[1]
            }: ${e.toString()}`
          );
          return null;
        }
      ),
      this.withdrawMVKFromAggregator(aggregatorSmartContractAddress).catch(
        (e) => {
          this.logger.error(
            `Error while trying to withdraw MVK on pair ${pair[0]}/${
              pair[1]
            }: ${e.toString()}`
          );
          return null;
        }
      ),
    ]);
  }

  private async withdrawXTZFromAggregator(
    aggregatorSmartContractAddress: string
  ): Promise<WalletParamsWithKind | null> {
    const aggregator = await this.commonService.getAggregator(
      aggregatorSmartContractAddress
    );
    const { oracleRewardsXTZ }: AggregatorStorage = await aggregator.storage();
    const pkh = await this.commonService.getPkh();

    const reward = oracleRewardsXTZ.get(pkh);

    if (reward === undefined) {
      return null;
    }

    if (reward.eq(new BigNumber(0))) {
      // Oracle have exactly 0 XTZ to withdraw
      return null;
    }

    return {
      kind: OpKind.TRANSACTION,
      ...aggregator.methods
        .withdrawRewardXTZ(this.oracleWithdrawAddress)
        .toTransferParams(),
    };
  }

  private async withdrawMVKFromAggregator(
    aggregatorSmartContractAddress: string
  ): Promise<WalletParamsWithKind | null> {
    const aggregator = await this.commonService.getAggregator(
      aggregatorSmartContractAddress
    );

    const { oracleRewardsMVK } = await aggregator.storage();
    const pkh = await this.commonService.getPkh();

    const reward = oracleRewardsMVK.get(pkh);

    if (reward === undefined) {
      // Oracle do not have any reward to withdraw
      return null;
    }

    if (reward.eq(new BigNumber(0))) {
      // Oracle have exactly 0 MVK to withdraw
      return null;
    }

    return {
      kind: OpKind.TRANSACTION,
      ...aggregator.methods
        .withdrawRewardMVK(this.oracleWithdrawAddress)
        .toTransferParams(),
    };
  }
}
