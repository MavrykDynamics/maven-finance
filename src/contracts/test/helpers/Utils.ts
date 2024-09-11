import { MichelsonType, packDataBytes } from '@mavrykdynamics/taquito-michel-codec';
import { Schema } from '@mavrykdynamics/taquito-michelson-encoder';
import { InMemorySigner } from '@mavrykdynamics/taquito-signer'
import { MichelsonMap, PollingSubscribeProvider, TezosToolkit, TransactionOperation } from '@mavrykdynamics/taquito'
import { BigNumber } from 'bignumber.js'

import env from '../../env'
import mvnTokenDecimals from '../../helpers/mvnTokenDecimals.json';
import { confirmOperation } from '../../scripts/confirmation'

const defaultNetwork = 'development'
const network = env.network || defaultNetwork

export class Utils {
  tezos: TezosToolkit
  network: string
  production: string

  async init(providerSK: string): Promise<void> {
    this.network = process.env.NETWORK_TO_MIGRATE_TO || network
    this.production = process.env.PRODUCTION || "false"
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

  async signOracleDataResponses(
    oracleDataResponsesForPack: MichelsonMap<string, any>
  ): Promise<string> {
    const signature_observations = await this.tezos.signer.sign(
      `0x${await packObservations(oracleDataResponsesForPack)}`
    );
    return signature_observations.sig;
  }

}

export const zeroAddress: string = 'mv2ZZZZZZZZZZZZZZZZZZZZZZZZZZZDXMF2d'

// MVN Formatter
export const MVN = (value : number = 1) => {
  return value * 10**parseInt(mvnTokenDecimals.decimals)
}



// MAV Formatter
export const MAV = (value: number = 1) => {
  return value * 10**6
}



export const packObservations = async (
  oracleDataResponsesForPack: MichelsonMap<string, any>
): Promise<string>  => {
  const typeMap: MichelsonType = {
    prim: 'map',
    args: [
      { prim: 'address' },
      {
        prim: 'pair',
        args: [
          { prim: 'nat', annots: ['%data'] },
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
    annots: ['%oracleDataResponsesForPack']
  };

  const params = oracleDataResponsesForPack;
  const schema = new Schema(typeMap);
  const toPack = schema.Encode(params);
  const dataCodec = packDataBytes(toPack, typeMap);
  return dataCodec.bytes;
}
