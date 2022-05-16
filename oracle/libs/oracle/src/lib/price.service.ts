import { Injectable, Logger } from '@nestjs/common';
import { MessariFetcherService } from '@mavryk-oracle-node/messari-fetcher';
import { CoingeckoFetcherService } from '@mavryk-oracle-node/coingecko-fetcher';
import { PriceFetcher } from '@mavryk-oracle-node/price-fetcher';
import { OracleConfig } from './oracle.config';
import BigNumber from 'bignumber.js';
import { CommonService } from './common.service';

@Injectable()
export class PriceService {
  private readonly logger = new Logger(PriceService.name);
  private readonly priceFetchers: PriceFetcher[] = [];

  constructor(
    private readonly messariFetcherService: MessariFetcherService,
    private readonly coingeckoFectcherService: CoingeckoFetcherService,
    private readonly oracleConfig: OracleConfig,
    private readonly commonService: CommonService
  ) {
    if (this.oracleConfig.useFakePrices) {
      this.logger.warn(
        'YOU ARE USING FAKE PRICES, DO NOT DO THIS IN PRODUCTION'
      );
    }
    this.priceFetchers = [messariFetcherService, coingeckoFectcherService];
  }

  public async getPrice(
    decimals: BigNumber,
    pair: [string, string]
  ): Promise<BigNumber> {
    if (this.oracleConfig.useFakePrices) {
      // return new BigNumber(10);
      const currentSeconds = new Date().getSeconds();
      const currentMinutes = new Date().getMinutes();

      const val = (currentMinutes % 2) * 60 + currentSeconds; // 0 - 119
      const val0To2 = 2.0 * (val / 119); // 0 - 2
      const val100To102 = 100 + val0To2; // 100 - 102

      return new BigNumber(Math.round(val100To102 * 10 ** decimals.toNumber()));
    }

    const prices: (number | null)[] = await Promise.all(
      this.priceFetchers.map(async (pf) => {
        let price;

        try {
          price = await pf.getPrice(pair);
        } catch (e) {
          this.logger.warn(
            `Price fetcher ${
              pf.constructor.name
            } failed to fetch price for pair ${pair[0]}/${
              pair[1]
            }: ${e.toString()}`
          );
          return null;
        }

        return price;
      })
    );

    const notNullPrices = this.commonService.filterNotNull(prices);

    this.logger.verbose(
      `${notNullPrices.length}/${prices.length} fetchers answered on pair ${pair[0]}/${pair[1]}`
    );

    if (notNullPrices.length === 0) {
      throw new Error(
        `All price fetcher failed to fetch value for pair ${pair[0]}/${pair[1]}`
      );
    }

    return PriceService.median(
      notNullPrices.map((value) =>
        new BigNumber(value).multipliedBy(
          new BigNumber(10).exponentiatedBy(decimals)
        )
      )
    ).decimalPlaces(0);
  }

  private static median(arr: BigNumber[]): BigNumber {
    const mid = Math.floor(arr.length / 2),
      nums = [...arr].sort((a, b) => (a.isGreaterThan(b) ? 1 : -1));
    return arr.length % 2 !== 0
      ? nums[mid]
      : nums[mid - 1].plus(nums[mid]).div(2);
  }
}
