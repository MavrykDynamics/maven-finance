import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import BigNumber from 'bignumber.js';

import * as sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { Database } from 'sqlite/build/Database';
import { OracleConfig } from './oracle.config';

type ObservationCommitData = {
  price: BigNumber;
  salt: string;
};

@Injectable()
export class CommitStorageService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CommitStorageService.name);
  private db: Database;

  constructor(private readonly oracleConfig: OracleConfig) {
    this.logger.log(
      `Using file sqlite file: ${this.oracleConfig.commitDataDbFile}`
    );
  }

  async onModuleInit() {
    this.db = await open({
      filename: this.oracleConfig.commitDataDbFile,
      driver: sqlite3.cached.Database,
    });

    await this.db.exec(`
        CREATE TABLE IF NOT EXISTS commit_data(
            aggregator TEXT,
            round TEXT,
            price TEXT,
            salt TEXT,
            PRIMARY KEY (aggregator, round)
        )
      `);

    this.logger.log('Database initialized');
  }

  async onModuleDestroy() {
    if (this.db !== undefined) {
      await this.db.close();
    }
  }

  public async saveCommitData(
    round: BigNumber,
    price: BigNumber,
    salt: string,
    aggregatorSmartContractAddress: string
  ): Promise<void> {
    await this.db.run(
      `
      INSERT INTO commit_data
        (aggregator, round, price, salt) VALUES (?, ?, ?, ?)
      ON CONFLICT DO UPDATE SET
        price = excluded.price,
        salt = excluded.salt
    `,
      aggregatorSmartContractAddress,
      round.toString(),
      price.toString(),
      salt
    );
  }

  public async getCommitData(
    round: BigNumber,
    aggregatorSmartContractAddress: string
  ): Promise<ObservationCommitData | null> {
    const result = await this.db.get<{
      price: string;
      salt: string;
    }>(
      `SELECT price, salt FROM commit_data WHERE aggregator = ? AND round = ? `,
      aggregatorSmartContractAddress,
      round.toString()
    );

    if (result === undefined) {
      return null;
    }

    return {
      price: new BigNumber(result.price),
      salt: result.salt,
    };
  }
}
