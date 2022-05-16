import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { PriceFetcher } from '@mavryk-oracle-node/price-fetcher';
import { MessariFetcherConfig } from './messari-fetcher.config';
import BigNumber from 'bignumber.js';

@Injectable()
export class MessariFetcherService implements PriceFetcher {
  private readonly logger = new Logger(MessariFetcherService.name);
  private readonly baseUrl = 'https://data.messari.io/api/v1';

  constructor(
    private readonly httpService: HttpService,
    private readonly config: MessariFetcherConfig
  ) {
    if (config.messariApiKey === '') {
      this.logger.warn(
        'No Messari API key set. You may hit the api request limit. Set the MESSARI_API_KEY env variable with your API Key'
      );
    }
  }

  async getPrice([pair1, pair2]: [string, string]): Promise<BigNumber> {
    const vsCurrency = pair1.toLowerCase();
    const coin = pair2.toLowerCase();

    let response: AxiosResponse;
    try {
      const response$ = this.httpService.get(
        `${this.baseUrl}/assets/${coin}/metrics/market-data`,
        {
          headers: {
            'x-messari-api-key': this.config.messariApiKey,
          },
        }
      );

      response = await firstValueFrom(response$);
    } catch (e) {
      throw new Error(
        `Failed to fetch market data of coin ${coin} from Messari API: ${e.toString()}`
      );
    }

    const price: number =
      response.data?.data?.market_data?.[`price_${vsCurrency}`];

    if (price === undefined || price === null) {
      this.logger.verbose(
        `Could not parse price from response: ${JSON.stringify(response)}`
      );
      this.logger.error('Could not parse price from response');
      throw new Error('Could not parse price from response');
    }

    return new BigNumber(price);
  }
}
