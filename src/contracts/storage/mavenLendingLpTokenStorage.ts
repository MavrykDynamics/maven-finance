import { MichelsonMap } from "@mavrykdynamics/taquito-michelson-encoder"
import { BigNumber } from "bignumber.js"
import { Buffer } from "buffer"
import { zeroAddress } from "../test/helpers/Utils"
import { bob, alice, eve, mallory } from '../scripts/sandbox/accounts'
import { mavenLendingLpTokenStorageType } from "./storageTypes/mavenLendingLpTokenStorageType"

const totalSupply      = 20000000000;
const initialSupply    = new BigNumber(totalSupply); // 20,000 MOCK FA2 Tokens in mu (10^6)
const singleUserSupply = new BigNumber(totalSupply / 4);

const metadata = MichelsonMap.fromLiteral({
    '': Buffer.from('mavryk-storage:data', 'ascii').toString('hex'),
    data: Buffer.from(
        JSON.stringify({
        name: 'Maven Finance - Lending LP Token',
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
            location: "https://github.com/MavrykDynamics/maven-finance"
        },
        interfaces: [ 'MIP-12', 'MIP-16', 'MIP-21' ],
        assets: [
            {
                symbol: Buffer.from('LLP').toString('hex'),
                name: Buffer.from('Maven Finance Lending LP').toString('hex'),
                decimals: Buffer.from('6').toString('hex'),
                icon: Buffer.from('ipfs://QmYQq6R3xkEhZdEThD6dGftF5wohrmeL7VgjU7jpqAkS5H').toString('hex'),
                shouldPreferSymbol: '74727565',
                thumbnailUri: Buffer.from('ipfs://QmYQq6R3xkEhZdEThD6dGftF5wohrmeL7VgjU7jpqAkS5H').toString('hex'),
            }
        ]
        }),
        'ascii',
    ).toString('hex'),
})

const ledger = MichelsonMap.fromLiteral({
    [bob.pkh]: singleUserSupply,
    [alice.pkh]: singleUserSupply,
    [eve.pkh]: singleUserSupply,
    [mallory.pkh]: singleUserSupply
})

const token_metadata = MichelsonMap.fromLiteral({
    0: {
        token_id: '0',
        token_info: MichelsonMap.fromLiteral({
            symbol: Buffer.from('LLP').toString('hex'),
            name: Buffer.from('Maven Finance Lending LP').toString('hex'),
            decimals: Buffer.from('6').toString('hex'),
            icon: Buffer.from('ipfs://QmYQq6R3xkEhZdEThD6dGftF5wohrmeL7VgjU7jpqAkS5H').toString('hex'),
            shouldPreferSymbol: '74727565',
            thumbnailUri: Buffer.from('ipfs://QmYQq6R3xkEhZdEThD6dGftF5wohrmeL7VgjU7jpqAkS5H').toString('hex')
        }),
    },
})

export const mavenLendingLpTokenStorage: mavenLendingLpTokenStorageType = {
    
    admin               : bob.pkh,
    metadata            : metadata,

    loanToken           : 'something',                   // reference to Lending Controller loan token

    governanceAddress   : zeroAddress,

    whitelistContracts  :  MichelsonMap.fromLiteral({}),

    token_metadata      : token_metadata,
    totalSupply         : initialSupply,
    ledger              : ledger,
    operators           :  MichelsonMap.fromLiteral({})

};
