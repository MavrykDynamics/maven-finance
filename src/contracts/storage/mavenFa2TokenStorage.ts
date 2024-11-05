import { MichelsonMap } from "@mavrykdynamics/taquito-michelson-encoder"
import { BigNumber } from "bignumber.js"
import { Buffer } from "buffer"
import { zeroAddress } from "../test/helpers/Utils"
import { bob, alice, eve, mallory } from '../scripts/sandbox/accounts'
import { mavenFa2TokenStorageType } from "./storageTypes/mavenFa2TokenStorageType"

const totalSupply      = 20000000000;
const initialSupply    = new BigNumber(totalSupply); // 20,000 MOCK FA2 Tokens in mu (10^6)
const singleUserSupply = new BigNumber(totalSupply / 4);

const metadata = MichelsonMap.fromLiteral({
    '': Buffer.from('mavryk-storage:data', 'ascii').toString('hex'),
    data: Buffer.from(
        JSON.stringify({
        name: 'Maven Finance - Mock FA2',
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
                symbol: Buffer.from('FA2').toString('hex'),
                name: Buffer.from('Maven Finance MockFA2').toString('hex'),
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

export const ledger = MichelsonMap.fromLiteral({
    [bob.pkh]: singleUserSupply,
    [alice.pkh]: singleUserSupply,
    [eve.pkh]: singleUserSupply,
    [mallory.pkh]: singleUserSupply
})

const token_metadata = MichelsonMap.fromLiteral({
    0: {
        token_id: '0',
        token_info: MichelsonMap.fromLiteral({
            symbol: Buffer.from('FA2').toString('hex'),
            name: Buffer.from('Maven Finance MockFA2').toString('hex'),
            decimals: Buffer.from('6').toString('hex'),
            icon: Buffer.from('ipfs://QmYQq6R3xkEhZdEThD6dGftF5wohrmeL7VgjU7jpqAkS5H').toString('hex'),
            shouldPreferSymbol: '74727565',
            thumbnailUri: Buffer.from('ipfs://QmYQq6R3xkEhZdEThD6dGftF5wohrmeL7VgjU7jpqAkS5H').toString('hex')
        }),
    },
})

export const mavenFa2TokenStorage: mavenFa2TokenStorageType = {
    
    admin: bob.pkh,
    metadata: metadata,
    governanceAddress: zeroAddress,

    whitelistContracts:  MichelsonMap.fromLiteral({}),

    token_metadata: token_metadata,
    totalSupply: initialSupply,
    ledger: ledger,
    operators:  MichelsonMap.fromLiteral({})

};
