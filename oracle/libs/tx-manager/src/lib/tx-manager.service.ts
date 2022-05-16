import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { WalletParamsWithKind } from '@taquito/taquito/dist/types/wallet/wallet';
import { TezosToolkit } from '@taquito/taquito';
import { TxManagerConfig } from './tx-manager.config';
import { filter, firstValueFrom, Subject } from 'rxjs';
import { BatchWalletOperation } from '@taquito/taquito/dist/types/wallet/batch-operation';
import { CronExpression } from '@nestjs/schedule';
import { Mutex } from 'async-mutex';
import { randomUUID } from 'crypto';
import { ParamsWithKind } from '@taquito/taquito/dist/types/operations/types';
import { RemoteSigner } from '@taquito/remote-signer';
import { CronJob } from 'cron';

type BatchQueueRequest = {
  uuid: string;
  requests: WalletParamsWithKind[];
};
type Pool = BatchQueueRequest[];

type Pools = Map<string, Pool>; // Secret key -> Batch queue

type BatchQueueResponseSuccess = {
  type: 'success';
  uuid: string;
  response: BatchWalletOperation;
};

type BatchQueueResponseError = {
  type: 'error';
  uuid: string;
  error: Error;
};

type BatchQueueResponse = BatchQueueResponseSuccess | BatchQueueResponseError;

@Injectable()
export class TxManagerService implements OnModuleInit {
  private readonly logger = new Logger(TxManagerService.name);
  private pools: Pools = new Map();
  private tezosToolkit: Map<string, TezosToolkit> = new Map<
    string,
    TezosToolkit
  >();
  private batchResponse$: Subject<BatchQueueResponse> = new Subject();
  private mutex = new Mutex();
  private cronJob: CronJob;

  constructor(private readonly txManagerConfig: TxManagerConfig) {}

  onModuleInit() {
    this.logger.verbose(
      `Using confirmation polling interval: ${this.txManagerConfig.confirmationPollingIntervalSecond}s`
    );
    this.logger.verbose(`Using signer: ${this.txManagerConfig.signerUrl}`);

    this.cronJob = new CronJob(CronExpression.EVERY_SECOND, async () => {
      try {
        await this.executeBatches();
      } catch (e) {
        this.logger.error(`Uncaught error in executeBatches: ${e.toString()}`);
      }
    });

    this.cronJob.start();
  }

  public async addBatch(
    pkh: string,
    batch: WalletParamsWithKind[]
  ): Promise<BatchQueueResponse> {
    const uuid = randomUUID();

    if (!this.pools.has(pkh)) {
      this.pools.set(pkh, []);
    }
    this.pools.set(pkh, [
      ...(this.pools.get(pkh) ?? []),
      {
        uuid,
        requests: batch,
      },
    ]);

    return await firstValueFrom(
      this.batchResponse$.pipe(filter((response) => response.uuid === uuid))
    );
  }

  private async executeBatches() {
    if (this.mutex.isLocked()) {
      return;
    }

    await this.mutex.runExclusive(async () => {
      await Promise.all(
        Array.from(this.pools.keys()).map((pkh) => this.executePool(pkh))
      );
    });
  }

  private async executePool(pkh: string): Promise<void> {
    const pool = this.pools.get(pkh);

    if (pool === undefined) {
      return;
    }

    const initialPoolSize = pool.length;

    if (initialPoolSize === 0) {
      // Nothing to batch
      return;
    }

    this.logger.debug(`Execution pool of size ${initialPoolSize}`);

    while (pool.length !== 0) {
      this.logger.debug(
        `Pool execution status: ${pool.length}/${initialPoolSize} remaining`
      );

      const batch = pool.shift();
      if (batch === undefined) {
        return;
      }
      await this.executeBatch(pkh, batch);
    }
  }

  private async executeBatch(
    pkh: string,
    { requests, uuid }: BatchQueueRequest
  ) {
    if (requests.length === 0) {
      // Nothing to batch
      return;
    }

    const toolkit = await this.getTezosToolkit(pkh);

    try {
      const pkh = await toolkit.wallet.pkh();
      const estimateInput: ParamsWithKind[] = requests.map((value) => ({
        ...value,
        source: pkh,
      }));

      await toolkit.estimate.batch(estimateInput);
    } catch (e) {
      this.logger.error(`Estimate failed: ${e.toString()}`);
      this.batchResponse$.next({
        type: 'error',
        uuid: uuid,
        error: e,
      });
    }

    try {
      const batchResult1 = await toolkit.wallet.batch(requests);
      const batchResult2 = await batchResult1.send();
      await batchResult2.confirmation();

      this.logger.verbose(`Batched ${requests.length} transactions`);
      this.batchResponse$.next({
        type: 'success',
        uuid: uuid,
        response: batchResult2,
      });
    } catch (e) {
      this.batchResponse$.next({
        type: 'error',
        uuid: uuid,
        error: e,
      });
    }
  }

  public async getTezosToolkit(pkh: string): Promise<TezosToolkit> {
    const toolkitFromMap = this.tezosToolkit.get(pkh);

    if (toolkitFromMap !== undefined) {
      return toolkitFromMap;
    }

    const toolkit = new TezosToolkit(this.txManagerConfig.rpcUrl);

    toolkit.setProvider({
      signer: new RemoteSigner(pkh, this.txManagerConfig.signerUrl),
      config: {
        confirmationPollingIntervalSecond:
          this.txManagerConfig.confirmationPollingIntervalSecond,
      },
    });

    this.tezosToolkit.set(pkh, toolkit);

    return toolkit;
  }
}
