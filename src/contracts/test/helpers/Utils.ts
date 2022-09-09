import { InMemorySigner } from '@taquito/signer'
import { MichelsonMap, PollingSubscribeProvider, TezosToolkit, TransactionOperation } from '@taquito/taquito'
import { BigNumber } from 'bignumber.js'
import { Schema } from '@taquito/michelson-encoder';
import { MichelsonType, packDataBytes } from '@taquito/michel-codec';

import env from '../../env'
import mvkTokenDecimals from '../../helpers/mvkTokenDecimals.json';
import { confirmOperation } from '../../scripts/confirmation'

const defaultNetwork = 'development'
const network = env.network || defaultNetwork

export class Utils {
  tezos: TezosToolkit
  network: string

  async init(providerSK: string): Promise<void> {
    this.network = process.env.NETWORK_TO_MIGRATE_TO || network
    const networkConfig = env.networks[this.network]
    this.tezos = new TezosToolkit(networkConfig.rpc)

    this.tezos.setProvider({
      config: {
        confirmationPollingTimeoutSecond: env.confirmationPollingTimeoutSecond,
      },
      signer: await InMemorySigner.fromSecretKey(providerSK),
    })
    this.tezos.setStreamProvider(this.tezos.getFactory(PollingSubscribeProvider)({
      pollingIntervalMilliseconds: 2000
    }));
  }

  async setProvider(newProviderSK: string): Promise<void> {
    this.tezos.setProvider({
      signer: await InMemorySigner.fromSecretKey(newProviderSK),
    })
  }

  async bakeBlocks(count: number) {
    for (let i: number = 0; i < count; ++i) {
      const operation: TransactionOperation = await this.tezos.contract.transfer({
        to: await this.tezos.signer.publicKeyHash(),
        amount: 1,
      })

      await confirmOperation(this.tezos, operation.hash)
    }
  }

  async getLastBlockTimestamp(): Promise<number> {
    return Date.parse((await this.tezos.rpc.getBlockHeader()).timestamp)
  }

  async signOraclePriceResponses(
    oraclePriceResponsesForPack: MichelsonMap<string, any>
  ): Promise<string> {
    const signature_observations = await this.tezos.signer.sign(
      `0x${await packObservations(oraclePriceResponsesForPack)}`
    );
    return signature_observations.sig;
  }

  static destructObj(obj: any) {
    const strs: string[] = ['tez', 'fa12', 'fa2', 'tokan_a', 'tokan_b']
    let arr: any[] = []

    Object.keys(obj).map(function (k) {
      if (strs.includes(k)) {
        arr.push(k)
      }

      if (obj[k] instanceof BigNumber) {
        arr.push(obj[k].toString())
      } else if (obj[k] instanceof MichelsonMap || Array.isArray(obj[k])) {
        arr.push(obj[k])
      } else if (
        typeof obj[k] === 'object' &&
        (!(obj[k] instanceof Date) || !(obj[k] instanceof null) || !(obj[k] instanceof undefined))
      ) {
        arr = arr.concat(Utils.destructObj(obj[k]))
      } else {
        arr.push(obj[k])
      }
    })

    return arr
  }
}

export const zeroAddress: string = 'tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg'

// MVK Formatter
export const MVK = (value: number = 1) => {
  return value * 10**parseInt(mvkTokenDecimals.decimals)
}

export const packObservations = async (
  oraclePriceResponsesForPack: MichelsonMap<string, any>
): Promise<string>  => {
  const typeMap: MichelsonType = {
    prim: 'map',
    args: [
      { prim: 'address' },
      {
        prim: 'pair',
        args: [
          { prim: 'nat', annots: ['%price'] },
          {
            prim: 'pair',
            args: [
              { prim: 'nat', annots: ['%epoch'] },
              {
                prim: 'pair',
                args: [
                  { prim: 'nat', annots: ['%round'] },
                  { prim: 'address', annots: ['%aggregatorAddress'] }
                ]
              }
            ]
          }
        ]
      }
    ],
    annots: ['%oraclePriceResponsesForPack']
  };

  const params = oraclePriceResponsesForPack;
  const schema = new Schema(typeMap);
  const toPack = schema.Encode(params);
  const priceCodec = packDataBytes(toPack, typeMap);
  return priceCodec.bytes;
}
