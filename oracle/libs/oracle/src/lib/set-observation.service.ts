import {Injectable, Logger, OnModuleInit} from '@nestjs/common';
import {OracleConfig} from './oracle.config';
import {PriceService} from './price.service';
import {CronExpression} from '@nestjs/schedule';
import {OpKind} from '@taquito/taquito';
import {AggregatorStorage} from '@mavryk-oracle-node/contracts';
import {TxManagerService} from '@mavryk-oracle-node/tx-manager';
import {Mutex} from 'async-mutex';
import BigNumber from 'bignumber.js';
import {WalletParamsWithKind} from '@taquito/taquito/dist/types/wallet/wallet';
import {CommonService} from './common.service';
import {CommitStorageService} from './commit-storage.service';
import {createHash} from 'crypto';
import {CronJob} from 'cron';

@Injectable()
export class SetObservationService implements OnModuleInit {
  private readonly logger = new Logger(SetObservationService.name);
  private commitMutex = new Mutex();
  private revealMutex = new Mutex();
  private readonly workAtLoss;
  private cronJobCommit: CronJob;
  private cronJobReveal: CronJob;

  constructor(
    private readonly priceService: PriceService,
    private readonly txManagerService: TxManagerService,
    private readonly commonService: CommonService,
    private readonly commitStorageService: CommitStorageService,
    oracleConfig: OracleConfig
  ) {
    this.workAtLoss = oracleConfig.workAtLoss;
  }

  async onModuleInit(): Promise<void> {
    this.cronJobCommit = new CronJob(
      CronExpression.EVERY_5_SECONDS,
      async () => {
        try {
          await this.setObservationCommitIfNeeded();
        } catch (e) {
          this.logger.error(
            `Uncaught error in setObservationCommitIfNeeded: ${e.toString()}`
          );
        }
      }
    );
    this.cronJobReveal = new CronJob(CronExpression.EVERY_5_SECONDS, async () => {
      try {
        await this.setObservationRevealIfNeeded();
      } catch (e) {
        this.logger.error(
          `Uncaught error in setObservationRevealIfNeeded: ${e.toString()}`
        );
      }
    });

    this.cronJobCommit.start();
    this.cronJobReveal.start();
  }

  private async setObservationCommitIfNeeded(): Promise<void> {
    if (this.commitMutex.isLocked()) {
      return;
    }

    const aggregators = await this.commonService.getAggregatorsAddresses();

    await this.commitMutex.runExclusive(async () => {
      const pairAndOp = await Promise.all(
        Array.from(aggregators.entries()).map(
          async ([pair, aggregatorSmartContractAddress]) => {
            return {
              pair,
              op: await this.getSetObservationCommitOpOrNull(
                pair,
                aggregatorSmartContractAddress
              )
            }
          }
        )
      );

      const notNullPairAndOps = this.commonService.filterNotNullOpPair(pairAndOp);

      if (notNullPairAndOps.length === 0) {
        return;
      }

      this.logger.verbose(
        `Sending observationCommits: ${notNullPairAndOps.length} batched observation operations`
      );

      const result = await this.txManagerService.addBatch(
        this.commonService.getPkh(),
        notNullPairAndOps.map(pairAndOp => pairAndOp.op)
      );
      switch (result.type) {
        case 'success':
          this.logger.log(
            `Committed on ${notNullPairAndOps.length} pairs: ${notNullPairAndOps
              .map(pairAndOp => `${pairAndOp.pair[0]}/${pairAndOp.pair[1]}`)
              .join(', ')}`
          );
          break;
        case 'error':
          this.logger.error(
            `Sending observationCommits: Failed to send observationCommits (${
              notNullPairAndOps.length
            } operations): ${result.error.toString()}`
          );
      }
    });
  }

  private async setObservationRevealIfNeeded(): Promise<void> {
    if (this.revealMutex.isLocked()) {
      return;
    }

    // if (this.toReveal == 0) {
    //   return;
    // }


    await this.revealMutex.runExclusive(async () => {
      const aggregators = await this.commonService.getAggregatorsAddresses();

      const ops = await Promise.all(
        Array.from(aggregators.entries()).map(
          async ([pair, aggregatorSmartContractAddress]) => {
            return {
              pair,
              op: await this.getSetObservationRevealOpOrNull(
                pair,
                aggregatorSmartContractAddress
              )
            }
          }
        )
      );

      const notNullPairAndOps = this.commonService.filterNotNullOpPair(ops);

      if (notNullPairAndOps.length === 0) {
        return;
      }

      this.logger.verbose(
        `Sending observationReveals: ${notNullPairAndOps.length} batched observation operations`
      );

      const result = await this.txManagerService.addBatch(
        this.commonService.getPkh(),
        notNullPairAndOps.map(pairAndOp => pairAndOp.op)
      );
      switch (result.type) {
        case 'success':
          this.logger.log(
            `Revealed on ${notNullPairAndOps.length} pairs: ${notNullPairAndOps
              .map(pairAndOp => `${pairAndOp.pair[0]}/${pairAndOp.pair[1]}`)
              .join(', ')}`
          );
          break;
        case 'error':
          this.logger.error(
            `Failed to reveal on pairs: ${notNullPairAndOps
              .map(pairAndOp => `${pairAndOp.pair[0]}/${pairAndOp.pair[1]}`)
              .join(', ')}: ${result.error.toString()}`
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

    const pkh = this.commonService.getPkh();
    const {
      round,
      observationCommits,
      switchBlock,
      config: {rewardAmountXTZ, decimals},
    }: AggregatorStorage = await aggregator.storage();

    if (observationCommits === undefined || observationCommits === null) {
      this.logger.error(`Current round ${round} has no observation map`);
      return null;
    }

    const alreadyAnswered = observationCommits.has(pkh);

    if (alreadyAnswered) {
      return null;
    }

    const {
      header: {level},
    } = await toolkit.rpc.getBlock();

    if (!switchBlock.eq(0) && switchBlock.lt(level)) {
      // It's reveal time
      return null;
    }

    this.logger.verbose(
      `[${aggregatorSmartContractAddress}] New round detected on pair ${pair[0]}/${pair[1]}: ${round}`
    );

    const price = await this.priceService.getPrice(decimals, pair);
    const salt = (Math.random() + 1).toString(36).substring(7);
    const commitData = this.commonService.getCommitData(price, salt, this.commonService.getPkh());

    const commitDataHash = createHash('sha256')
      .update(commitData, 'hex')
      .digest('hex');

    this.logger.log(
      `Committing ${price} for round ${round} on pair ${pair[0]}/${pair[1]}`
    );

    this.logger.debug(`[${aggregatorSmartContractAddress}] Sending setObservationCommit(${round}, hash(${price}, ${salt}, ${this.commonService.getPkh()}) = ${commitDataHash}`);
    const op = aggregator.methods
      .setObservationCommit(round, commitDataHash)
      .toTransferParams();

    const estimate = await toolkit.estimate.transfer(op);

    // TODO: this shoud also take into account that the reward is for commit + reveal, not just commit.

    if (rewardAmountXTZ.lt(new BigNumber(estimate.totalCost))) {
      this.logger.warn(
        `XTZ Reward (${rewardAmountXTZ.toString()}) is lower than estimated gas cost (${
          estimate.totalCost
        })`
      );

      if (!this.workAtLoss) {
        this.logger.error('XTZ reward is too low, aborting commit');
        return null;
      }
    }
    await this.commitStorageService.saveCommitData(
      round,
      price,
      salt,
      aggregatorSmartContractAddress
    );
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

    const pkh = this.commonService.getPkh();
    const {
      round,
      switchBlock,
      observationCommits,
      observationReveals,
      config: {rewardAmountXTZ},
    }: AggregatorStorage = await aggregator.storage();

    if (
      switchBlock === undefined ||
      switchBlock === null ||
      switchBlock?.toNumber() == 0
    ) {
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
      // Already revealed
      return null;
    }

    const blockResponse = await toolkit.rpc.getBlock();

    if (blockResponse.metadata.level_info?.level === undefined) {
      return null;
    }
    if (blockResponse.metadata.level_info?.level <= switchBlock.toNumber()) {
      //this.logger.warn(`Soon..`);
      return null;
    }

    const commitData = await this.commitStorageService.getCommitData(
      round,
      aggregatorSmartContractAddress
    );

    if (commitData === null) {
      this.logger.error(`Problem to retrieve commit data...`);
      return null;
    }

    const price = commitData.price;
    const salt = commitData.salt;

    this.logger.log(
      `Revealing price ${price} for round ${round} on pair ${pair[0]}/${pair[1]} (${aggregatorSmartContractAddress})`
    );

    this.logger.debug(`[${aggregatorSmartContractAddress}] Sending setObservationReveal(${round}, ${price}, ${salt}, ${pkh})`);

    const op = aggregator.methods
      .setObservationReveal(round, price, salt, pkh)
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
