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
        interfaces: [ 'TZIP-12', 'TZIP-16', 'TZIP-21' ],
        assets: [
            {
                symbol: Buffer.from('mToken').toString('hex'),
                name: Buffer.from('mToken').toString('hex'),
                decimals: Buffer.from('6').toString('hex'),
                icon: Buffer.from('https://front-dev.mavryk-finance-dapp-frontend.pages.dev/images/MVN_token.svg').toString('hex'),
                shouldPreferSymbol: true,
                thumbnailUri: 'https://front-dev.mavryk-finance-dapp-frontend.pages.dev/images/MVN_token.svg'
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
            icon: Buffer.from('https://front-dev.mavryk-finance-dapp-frontend.pages.dev/images/MVN_token.svg').toString('hex'),
            shouldPreferSymbol: '74727565',
            thumbnailUri: Buffer.from('https://front-dev.mavryk-finance-dapp-frontend.pages.dev/images/MVN_token.svg').toString('hex')
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
