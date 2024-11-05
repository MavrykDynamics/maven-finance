import { MichelsonMap } from "@mavrykdynamics/taquito-michelson-encoder"
import { BigNumber } from "bignumber.js"
import { Buffer } from "buffer"
import { zeroAddress } from "../test/helpers/Utils"
import { bob } from '../scripts/sandbox/accounts'
import { mTokenStorageType } from "./storageTypes/mTokenStorageType"

const metadata = MichelsonMap.fromLiteral({
    '': Buffer.from('mavryk-storage:data', 'ascii').toString('hex'),
    data: Buffer.from(
        JSON.stringify({
        name: 'Maven Finance - Mock mToken (mToken)',
        version: 'v1.0.0',
        authors: ['Mavryk Dynamics <info@mavryk.io>'],
        homepage: "https://mavenfinance.io",
        license: {
            name: "MIT"
        },
        source: {
            tools: [
                "MavrykLIGO 0.60.0",
                "Flexmasa atlas-update-run"
            ],
            location: "https://github.com/mavenfinance/maven-finance"
        },
        interfaces: [ 'MIP-12', 'MIP-16', 'MIP-21' ],
        assets: [
            {
                symbol: Buffer.from('mToken').toString('hex'),
                name: Buffer.from('mToken').toString('hex'),
                decimals: Buffer.from('6').toString('hex'),
                icon: Buffer.from('ipfs://QmYQq6R3xkEhZdEThD6dGftF5wohrmeL7VgjU7jpqAkS5H').toString('hex'),
                shouldPreferSymbol: '74727565',
                thumbnailUri: Buffer.from('ipfs://QmYQq6R3xkEhZdEThD6dGftF5wohrmeL7VgjU7jpqAkS5H').toString('hex')
            }
        ]
        }),
        'ascii',
    ).toString('hex'),
  })

const ledger = MichelsonMap.fromLiteral({})

const token_metadata = MichelsonMap.fromLiteral({
    0: {
        token_id: '0',
        token_info: MichelsonMap.fromLiteral({
            symbol: Buffer.from('mToken').toString('hex'),
            name: Buffer.from('mToken').toString('hex'),
            decimals: Buffer.from('6').toString('hex'),
            icon: Buffer.from('ipfs://QmYQq6R3xkEhZdEThD6dGftF5wohrmeL7VgjU7jpqAkS5H').toString('hex'),
            shouldPreferSymbol: '74727565',
            thumbnailUri: Buffer.from('ipfs://QmYQq6R3xkEhZdEThD6dGftF5wohrmeL7VgjU7jpqAkS5H').toString('hex')
        }),
    },
})

export const mTokenStorage: mTokenStorageType = {
    
    admin               : bob.pkh,
    metadata            : metadata,

    loanToken           : "something",
    tokenRewardIndex    : new BigNumber(1),
    rewardIndexLedger   :  MichelsonMap.fromLiteral({}),

    governanceAddress   : zeroAddress,

    whitelistContracts  :  MichelsonMap.fromLiteral({}),

    token_metadata      : token_metadata,
    totalSupply         : new BigNumber(0),
    ledger              : ledger,
    operators           :  MichelsonMap.fromLiteral({})

};
