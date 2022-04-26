import { Injectable, Logger } from '@nestjs/common';
import { OracleConfig } from './oracle.config';
import { PriceService } from './price.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OpKind } from '@taquito/taquito';
import { AggregatorStorage } from '@mavryk-oracle-node/contracts';
import { TxManagerService } from '@mavryk-oracle-node/tx-manager';
import { Mutex } from 'async-mutex';
import BigNumber from 'bignumber.js';
import { WalletParamsWithKind } from '@taquito/taquito/dist/types/wallet/wallet';
import { CommonService } from './common.service';
// eslint-disable-next-line @typescript-eslint/no-var-requires

@Injectable()
export class SetObservationService {
  private readonly logger = new Logger(SetObservationService.name);
  private mutex = new Mutex();
  private readonly workAtLoss;

  constructor(
    private readonly priceService: PriceService,
    private readonly txManagerService: TxManagerService,
    private readonly commonService: CommonService,
    oracleConfig: OracleConfig
  ) {
    this.workAtLoss = oracleConfig.workAtLoss;
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  private async setObservationCommitIfNeeded(): Promise<void> {
    if (this.mutex.isLocked()) {
      return;
    }

    const aggregators = await this.commonService.getAggregatorsAddresses();

    const ops = await Promise.all(
      Array.from(aggregators.entries()).map(
        async ([pair, aggregatorSmartContractAddress]) =>
          this.getSetObservationCommitOpOrNull(pair, aggregatorSmartContractAddress)
      )
    );

    const notNullOps = this.commonService.filterNotNull(ops);

    if (notNullOps.length === 0) {
      return;
    }

    this.logger.log(
      `Sending observationCommits: ${notNullOps.length} batched observation operations`
    );

    await this.mutex.runExclusive(async () => {
      const result = await this.txManagerService.addBatch(
        this.commonService.getSecretKey(),
        notNullOps
      );
      switch (result.type) {
        case 'success':
          this.logger.log(
            `Sending observationCommits: Confirmed ${notNullOps.length} batched operations`
          );
          // this.toReveal = this.toReveal + notNullOps.length;
          // console.log("this.toReveal: ",this.toReveal)
          break;
        case 'error':
          this.logger.error(
            `Sending observationCommits: Failed to send observationCommits (${
              notNullOps.length
            } operations): ${result.error.toString()}`
          );
      }
    });
  }

  @Cron("*/3 * * * * *")
  private async setObservationRevealIfNeeded(): Promise<void> {
    if (this.mutex.isLocked()) {
      return;
    }

    // if (this.toReveal == 0) {
    //   return;
    // }

    const aggregators = await this.commonService.getAggregatorsAddresses();

    const ops = await Promise.all(
      Array.from(aggregators.entries()).map(
        async ([pair, aggregatorSmartContractAddress]) =>
          this.getSetObservationRevealOpOrNull(pair, aggregatorSmartContractAddress)
      )
    );

    const notNullOps = this.commonService.filterNotNull(ops);

    if (notNullOps.length === 0) {
      return;
    }

    this.logger.log(
      `Sending observationReveals: ${notNullOps.length} batched observation operations`
    );

    await this.mutex.runExclusive(async () => {
      const result = await this.txManagerService.addBatch(
        this.commonService.getSecretKey(),
        notNullOps
      );
      switch (result.type) {
        case 'success':
          this.logger.log(
            `Sending observationReveals: Confirmed ${notNullOps.length} batched operations`
          );
          // this.toReveal = this.toReveal - notNullOps.length;
          // console.log("this.toReveal: ",this.toReveal)
          break;
        case 'error':
          this.logger.error(
            `Sending observationReveals: Failed to send observationReveals (${
              notNullOps.length
            } operations): ${result.error.toString()}`
          );
      }
    });
  }

  private async getSetObservationCommitOpOrNull(
    pair: [string, string],
    aggregatorSmartContractAddress: string
  ): Promise<WalletParamsWithKind | null> {
    try {
      return await this.getSetObservationCommitOpIfNeeded(
        pair,
        aggregatorSmartContractAddress
      );
    } catch (e) {
      this.logger.error(
        `Error while trying to set observationCommit on pair ${pair[0]}/${
          pair[1]
        }: ${e.toString()}`
      );

      return null;
    }
  }

  private async getSetObservationRevealOpOrNull(
    pair: [string, string],
    aggregatorSmartContractAddress: string
  ): Promise<WalletParamsWithKind | null> {
    try {
      return await this.getSetObservationRevealOpIfNeeded(
        pair,
        aggregatorSmartContractAddress
      );
    } catch (e) {
      this.logger.error(
        `Error while trying to set observationReveal on pair ${pair[0]}/${
          pair[1]
        }: ${e.toString()}`
      );

      return null;
    }
  }

  private async getSetObservationCommitOpIfNeeded(
    pair: [string, string],
    aggregatorSmartContractAddress: string
  ): Promise<WalletParamsWithKind | null> {
    const toolkit = await this.commonService.getTezosToolkit();
    const aggregator = await this.commonService.getAggregator(
      aggregatorSmartContractAddress
    );

    const pkh = await this.commonService.getPkh();
    const {
      round,
      observationCommits,
      aggregatorConfig: { rewardAmountXTZ, decimals },
    }: AggregatorStorage = await aggregator.storage();

    if (observationCommits === undefined || observationCommits === null) {
      this.logger.error(`Current round ${round} has no observation map`);
      return null;
    }

    const alreadyAnswered = observationCommits.has(pkh);

    if (alreadyAnswered) {
      return null;
    }

    this.logger.log(
      `New round detected on pair ${pair[0]}/${pair[1]}: ${round}`
    );

    const price = await this.priceService.getPrice(decimals, pair);
    const salt = (Math.random() + 1).toString(36).substring(7);
    const sign = await toolkit.signer.sign(this.commonService.getSetObservationCommitDataToSign(price,salt));

    this.logger.log(
      `[${aggregatorSmartContractAddress}] Sending observationCommit on pair ${pair[0]}/${pair[1]}: ${price} for round ${round}`
    );

    const op = aggregator.methods
      .setObservationCommit(round, sign.sig)
      .toTransferParams();

    const estimate = await toolkit.estimate.transfer(op);

    if (rewardAmountXTZ.lt(new BigNumber(estimate.totalCost))) {
      this.logger.warn(
        `XTZ Reward (${rewardAmountXTZ.toString()}) is lower than estimated gas cost (${
          estimate.totalCost
        })`
      );

      if (!this.workAtLoss) {
        return null;
      }
    }
    this.txManagerService.saveCommitData(round.toNumber(), price, salt, aggregatorSmartContractAddress);
    return {
      kind: OpKind.TRANSACTION,
      ...op,
    };
  }

  private async getSetObservationRevealOpIfNeeded(
    pair: [string, string],
    aggregatorSmartContractAddress: string
  ): Promise<WalletParamsWithKind | null> {
    const toolkit = await this.commonService.getTezosToolkit();
    const aggregator = await this.commonService.getAggregator(
      aggregatorSmartContractAddress
    );

    const pkh = await this.commonService.getPkh();
    const {
      round,
      switchBlock,
      observationCommits,
      observationReveals,
      aggregatorConfig: { rewardAmountXTZ },
    }: AggregatorStorage = await aggregator.storage();

    if (switchBlock === undefined || switchBlock === null || switchBlock?.toNumber() == 0) {
      //this.logger.warn(`Not the time to commit`);
      return null;
    }

    if (observationCommits === undefined || observationCommits === null) {
      this.logger.warn(`Current round ${round} has no observationCommits map`);
      return null;
    }

    if (!observationCommits.has(pkh)) {
      this.logger.warn(`You didn't commit for this round ${round}`);
      return null;
    }

    if (observationReveals === undefined || observationReveals === null) {
      this.logger.warn(`Current round ${round} has no observationReveals map`);
      return null;
    }

    if (observationReveals.has(pkh)) {
      return null;
    }

    const blockResponse = await toolkit.rpc.getBlock();
    if (blockResponse.metadata.level_info?.level === undefined) {
      return null;
    }
    if (blockResponse.metadata.level_info?.level <= switchBlock.toNumber()){
      //this.logger.warn(`Soon..`);
      return null;
    }

    const commitData = this.txManagerService.getCommitData(round.toNumber(),aggregatorSmartContractAddress);
    if (commitData === null) {
      this.logger.error(`Problem to retrieve commit data..`);
      return null;
    }

    const price = commitData.price;
    const salt = commitData.salt;

    this.logger.log(
      `[${aggregatorSmartContractAddress}] Sending observationReveal on pair ${pair[0]}/${pair[1]}: ${price} for round ${round}`
    );

    const op = aggregator.methods
      .setObservationReveal(price, salt, round)
      .toTransferParams();

    const estimate = await toolkit.estimate.transfer(op);

    if (rewardAmountXTZ.lt(new BigNumber(estimate.totalCost))) {
      this.logger.warn(
        `XTZ Reward (${rewardAmountXTZ.toString()}) is lower than estimated gas cost (${
          estimate.totalCost
        })`
      );

      if (!this.workAtLoss) {
        return null;
      }
    }
    return {
      kind: OpKind.TRANSACTION,
      ...op,
    };
  }
}
