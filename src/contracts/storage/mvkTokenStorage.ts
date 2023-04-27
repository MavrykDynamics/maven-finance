import { MichelsonMap } from '@taquito/michelson-encoder'
import { BigNumber } from 'bignumber.js'
import { Buffer } from 'buffer'
import { bob, alice, eve, mallory, oscar, trudy, susie } from '../scripts/sandbox/accounts'
import { MVK } from '../test/helpers/Utils'
import { mvkTokenStorageType } from './storageTypes/mvkTokenStorageType'
import { mockTokenData } from 'test/helpers/mockSampleData'

export const mvkTokenDecimals = 9

const totalSupply       = MVK(1400000)
const maximumSupply     = MVK(10**9)
const initialSupply     = new BigNumber(totalSupply)        // 1,400,000 MVK Tokens (1e9)
const singleUserSupply  = new BigNumber(totalSupply / 7)    // 200,000 MVK Tokens (1e9)

const metadata = mockTokenData.mvkToken.metadata

export const ledger = MichelsonMap.fromLiteral({
    [bob.pkh]       : singleUserSupply,
    [alice.pkh]     : singleUserSupply,
    [eve.pkh]       : singleUserSupply,
    [mallory.pkh]   : singleUserSupply,
    [oscar.pkh]     : singleUserSupply,
    [trudy.pkh]     : singleUserSupply,
    [susie.pkh]     : singleUserSupply
})

const token_metadata = MichelsonMap.fromLiteral({
    0: {
        token_id: '0',
        token_info: MichelsonMap.fromLiteral({
            symbol: Buffer.from('MVK').toString('hex'),
            name: Buffer.from('MAVRYK').toString('hex'),
            decimals: Buffer.from(mvkTokenDecimals.toString()).toString('hex'),
            icon: Buffer.from('https://mavryk.finance/logo192.png').toString('hex'),
            shouldPreferSymbol: Buffer.from(new Uint8Array([1])).toString('hex'),
            thumbnailUri: Buffer.from('https://mavryk.finance/logo192.png').toString('hex'),
        }),
    },
})

// Calculate one year from now
const currentTimestamp        = new Date();
currentTimestamp.setDate(currentTimestamp.getDate() + 365);
const nextInflationTimestamp  = Math.round(currentTimestamp.getTime() / 1000);

export const mvkTokenStorage: mvkTokenStorageType = {
    
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
