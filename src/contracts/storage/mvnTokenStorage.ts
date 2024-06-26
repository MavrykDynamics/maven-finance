import { MichelsonMap } from '@mavrykdynamics/taquito-michelson-encoder'
import { BigNumber } from 'bignumber.js'
import { Buffer } from 'buffer'
import { bob, alice, eve, mallory, oscar, trudy, susie, david, isaac, ivan, baker } from '../scripts/sandbox/accounts'
import { MVN } from '../test/helpers/Utils'
import { mvnTokenStorageType } from './storageTypes/mvnTokenStorageType'
import { mockTokenData } from 'test/helpers/mockSampleData'

export const mvnTokenDecimals = 9

const totalSupply       = MVN(2200000)
const maximumSupply     = MVN(10**9)
const initialSupply     = new BigNumber(totalSupply)        // 2,200,000 MVN Tokens (1e9)
const singleUserSupply  = new BigNumber(totalSupply / 11)   // 200,000 MVN Tokens (1e9)

const metadata = mockTokenData.mvnToken.metadata

export const ledger = MichelsonMap.fromLiteral({
    [bob.pkh]       : singleUserSupply,
    [alice.pkh]     : singleUserSupply,
    [eve.pkh]       : singleUserSupply,
    [mallory.pkh]   : singleUserSupply,
    [oscar.pkh]     : singleUserSupply,
    [trudy.pkh]     : singleUserSupply,
    [susie.pkh]     : singleUserSupply,
    [david.pkh]     : singleUserSupply,
    [ivan.pkh]      : singleUserSupply,
    [isaac.pkh]     : singleUserSupply,
    [baker.pkh]     : singleUserSupply
})

const token_metadata = MichelsonMap.fromLiteral({
    0: {
        token_id: '0',
        token_info: MichelsonMap.fromLiteral({
            symbol: Buffer.from('MVN').toString('hex'),
            name: Buffer.from('MAVEN').toString('hex'),
            decimals: Buffer.from(mvnTokenDecimals.toString()).toString('hex'),
            icon: Buffer.from('https://front-dev.mavryk-finance-dapp-frontend.pages.dev/images/MVN_token.svg').toString('hex'),
            shouldPreferSymbol: '74727565',
            thumbnailUri: Buffer.from('https://front-dev.mavryk-finance-dapp-frontend.pages.dev/images/MVN_token.svg').toString('hex'),
        }),
    },
})

// Calculate one year from now
const currentTimestamp        = new Date();
currentTimestamp.setDate(currentTimestamp.getDate() + 365);
const nextInflationTimestamp  = Math.round(currentTimestamp.getTime() / 1000);

export const mvnTokenStorage: mvnTokenStorageType = {
    
    admin: bob.pkh,
    governanceAddress: bob.pkh,
    
    generalContracts: MichelsonMap.fromLiteral({}),
    whitelistContracts: MichelsonMap.fromLiteral({}),

    metadata: metadata,
    token_metadata: token_metadata,

    totalSupply: initialSupply,
    maximumSupply: new BigNumber(maximumSupply),
    inflationRate: new BigNumber(500),
    nextInflationTimestamp: nextInflationTimestamp.toString(),

    ledger: ledger,
    operators: MichelsonMap.fromLiteral({}),

}
