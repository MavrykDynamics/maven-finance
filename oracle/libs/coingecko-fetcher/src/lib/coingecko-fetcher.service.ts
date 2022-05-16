import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CoingeckoFetcherConfig } from './coingecko-fetcher.config';
import { PriceFetcher } from '@mavryk-oracle-node/price-fetcher';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import BigNumber from 'bignumber.js';

@Injectable()
export class CoingeckoFetcherService implements PriceFetcher, OnModuleInit {
  private readonly logger = new Logger(CoingeckoFetcherService.name);
  private readonly baseUrl = 'https://api.coingecko.com/api/v3';

  private symbolToId: Map<string, string> = new Map<string, string>();
  private supportedVsCurrencies: Set<string> = new Set<string>();

  constructor(
    private readonly httpService: HttpService,
    private readonly config: CoingeckoFetcherConfig
  ) {
    if (config.coingeckoApiKey === '') {
      this.logger.warn(
        'No Coingecko API key set. You may hit the api request limit. Set the COINGECKO_API_KEY env variable with your API Key'
      );
    }
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.updateSymbolToIdMap();
      await this.updateSupportedVsCurrenciesSet();
    } catch (e) {
      this.logger.error(e.toString());
      // Do not re-throw to avoid crashing app
      // The app should handle some price fetcher being down
    }
  }

  async updateSymbolToIdMap() {
    let response: AxiosResponse;

    try {
      const response$ = this.httpService.get(`${this.baseUrl}/coins/list`, {
        //headers: {
        //  'x-messari-api-key': this.config.messariApiKey,
        //},
      });

      response = await firstValueFrom(response$);
    } catch (e) {
      throw new Error(
        `Failed to fetch coins list data from Coingecko, the price fetcher won't work correctly: ${e.toString()}`
      );
    }

    if (response.status !== 200) {
      throw new Error(
        "Failed to fetch coins list data from Coingecko, the price fetcher won't work correctly"
      );
    }

    const coins = response.data;

    for (const coin of coins) {
      this.symbolToId.set(coin.symbol, coin.id);
    }

    this.logger.verbose(`Fetched ids of ${this.symbolToId.size} coins`);
  }

  async updateSupportedVsCurrenciesSet() {
    let response: AxiosResponse;
    try {
      const response$ = this.httpService.get(
        `${this.baseUrl}/simple/supported_vs_currencies`,
        {
          //headers: {
          //  'x-messari-api-key': this.config.messariApiKey,
          //},
        }
      );

      response = await firstValueFrom(response$);
    } catch (e) {
      throw new Error(
        `Failed to fetch supportedVsCurrencies data from Coingecko, the price fetcher won't work correctly: ${e.toString()}`
      );
    }

    if (response.status !== 200) {
      throw new Error(
        "Failed to fetch supportedVsCurrencies data from Coingecko, the price fetcher won't work correctly"
      );
    }

    const supportedVsCurrencies = response.data;

    for (const supportedVsCurrency of supportedVsCurrencies) {
      this.supportedVsCurrencies.add(supportedVsCurrency);
    }

    this.logger.verbose(
      `Fetched ${this.supportedVsCurrencies.size} supported vs currencies`
    );
  }

  async getPrice([pair1, pair2]: [string, string]): Promise<BigNumber> {
    const vsCurrency = pair1.toLowerCase();
    const coin = pair2.toLowerCase();

    if (!this.supportedVsCurrencies.has(vsCurrency)) {
      throw new Error(`Not supported ${vsCurrency} as VS currency`);
    }

    const coinId = this.symbolToId.get(coin);

    if (coinId === undefined) {
      throw new Error(`Not supported ${coin} as coin`);
    }

    let response: AxiosResponse;
    try {
      const response$ = this.httpService.get(`${this.baseUrl}/simple/price`, {
        params: {
          ids: this.symbolToId.get(coin),
          vs_currencies: vsCurrency,
        },
        //headers: {
        //  'x-messari-api-key': this.config.messariApiKey,
        //},
      });

      response = await firstValueFrom(response$);
    } catch (e) {
      throw new Error(
        `Failed to fetch supportedVsCurrencies data from Coingecko, the price fetcher won't work correctly: ${e.toString()}`
      );
    }

    return response.data[coinId][vsCurrency];
  }
}
