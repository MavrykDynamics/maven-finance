import { MichelsonMap } from '@taquito/michelson-encoder'

import { BigNumber } from 'bignumber.js'

const { bob } = require('../scripts/sandbox/accounts')

import { zeroAddress } from '../test/helpers/Utils'

import { governanceSatelliteStorageType } from '../test/types/governanceSatelliteStorageType'

const config = {
  governanceSatelliteApprovalPercentage  : 6700,
  governanceSatelliteDurationInDays      : 3,
  governancePurposeMaxLength             : 400
}

const metadata = MichelsonMap.fromLiteral({
  '': Buffer.from('tezos-storage:data', 'ascii').toString('hex'),
  data: Buffer.from(
    JSON.stringify({
      name: 'MAVRYK Governance Satellite Contract',
      version: 'v1.0.0',
      authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
    }),
    'ascii',
  ).toString('hex'),
})

export const governanceSatelliteStorage: governanceSatelliteStorageType = {

  admin                               : bob.pkh,
  config                              : config,
  metadata                            : metadata,
  
  mvkTokenAddress                     : zeroAddress,
  governanceProxyAddress              : zeroAddress,

  whitelistContracts                  : MichelsonMap.fromLiteral({}),
  generalContracts                    : MichelsonMap.fromLiteral({}),

  governanceSatelliteLedger           : MichelsonMap.fromLiteral({}),
  governanceSatelliteSnapshotLedger   : MichelsonMap.fromLiteral({}),
  governanceSatelliteCounter          : new BigNumber(1),

  snapshotStakedMvkTotalSupply        :  new BigNumber(1),
  
  lambdaLedger                        : MichelsonMap.fromLiteral({})

}
