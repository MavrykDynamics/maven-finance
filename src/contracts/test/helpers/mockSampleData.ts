import { MichelsonMap } from "@taquito/michelson-encoder";

export const mTokenMockData = {

    "mTokenUsdt": {

        "loanToken": "usdt",
        "metadata": MichelsonMap.fromLiteral({
            '': Buffer.from('tezos-storage:data', 'ascii').toString('hex'),
            data: Buffer.from(
                JSON.stringify({
                version: 'v1.0.0',
                description: 'Mavryk mUSDT Token',
                authors: ['Mavryk Dev Team <info@mavryk.io>'],
                source: {
                    tools: ['Ligo', 'Flextesa'],
                    location: 'https://ligolang.org/',
                },
                interfaces: ['TZIP-7', 'TZIP-12', 'TZIP-16', 'TZIP-21'],
                errors: [],
                views: [],
                assets: [
                    {
                    symbol: Buffer.from('mUSDT').toString('hex'),
                    name: Buffer.from('mUSDT').toString('hex'),
                    decimals: Buffer.from('6').toString('hex'),
                    icon: Buffer.from('https://infura-ipfs.io/ipfs/Qmf99wTUgVsEndqhmoQLrpSiDoGMTZCCFLz7KEc5vfp8h1').toString('hex'),
                    shouldPreferSymbol: true,
                    thumbnailUri: 'https://infura-ipfs.io/ipfs/Qmf99wTUgVsEndqhmoQLrpSiDoGMTZCCFLz7KEc5vfp8h1'
                    }
                ]
                }),
                'ascii',
            ).toString('hex'),
        }),
        "token_metadata": MichelsonMap.fromLiteral({
            0: {
                token_id: '0',
                token_info: MichelsonMap.fromLiteral({
                    symbol: Buffer.from('mUSDT').toString('hex'),
                    name: Buffer.from('mUSDT').toString('hex'),
                    decimals: Buffer.from('6').toString('hex'),
                    icon: Buffer.from('https://infura-ipfs.io/ipfs/Qmf99wTUgVsEndqhmoQLrpSiDoGMTZCCFLz7KEc5vfp8h1').toString('hex'),
                    shouldPreferSymbol: Buffer.from(new Uint8Array([1])).toString('hex'),
                    thumbnailUri: Buffer.from('https://infura-ipfs.io/ipfs/Qmf99wTUgVsEndqhmoQLrpSiDoGMTZCCFLz7KEc5vfp8h1').toString('hex')
                }),
            },
        })
    },

    "mTokenEurl": {

        "loanToken": "usdt",
        "metadata": MichelsonMap.fromLiteral({
            '': Buffer.from('tezos-storage:data', 'ascii').toString('hex'),
            data: Buffer.from(
                JSON.stringify({
                version: 'v1.0.0',
                description: 'Mavryk mEURL Token',
                authors: ['Mavryk Dev Team <info@mavryk.io>'],
                source: {
                    tools: ['Ligo', 'Flextesa'],
                    location: 'https://ligolang.org/',
                },
                interfaces: ['TZIP-7', 'TZIP-12', 'TZIP-16', 'TZIP-21'],
                errors: [],
                views: [],
                assets: [
                    {
                    symbol: Buffer.from('mEURL').toString('hex'),
                    name: Buffer.from('mEURL').toString('hex'),
                    decimals: Buffer.from('6').toString('hex'),
                    icon: Buffer.from('https://infura-ipfs.io/ipfs/QmY9jnbME9dxEsHapLsqt7b2juRgJXUpn41NgweMqCm5L4').toString('hex'),
                    shouldPreferSymbol: true,
                    thumbnailUri: 'https://infura-ipfs.io/ipfs/QmY9jnbME9dxEsHapLsqt7b2juRgJXUpn41NgweMqCm5L4'
                    }
                ]
                }),
                'ascii',
            ).toString('hex'),
        }),
        "token_metadata": MichelsonMap.fromLiteral({
            0: {
                token_id: '0',
                token_info: MichelsonMap.fromLiteral({
                    symbol: Buffer.from('mEURL').toString('hex'),
                    name: Buffer.from('mEURL').toString('hex'),
                    decimals: Buffer.from('6').toString('hex'),
                    icon: Buffer.from('https://infura-ipfs.io/ipfs/QmY9jnbME9dxEsHapLsqt7b2juRgJXUpn41NgweMqCm5L4').toString('hex'),
                    shouldPreferSymbol: Buffer.from(new Uint8Array([1])).toString('hex'),
                    thumbnailUri: Buffer.from('https://infura-ipfs.io/ipfs/QmY9jnbME9dxEsHapLsqt7b2juRgJXUpn41NgweMqCm5L4').toString('hex')
                }),
            },
        })
    },

    "mTokenTez": {

        "loanToken": "tez",
        "metadata": MichelsonMap.fromLiteral({
            '': Buffer.from('tezos-storage:data', 'ascii').toString('hex'),
            data: Buffer.from(
                JSON.stringify({
                version: 'v1.0.0',
                description: 'Mavryk mXTZ Token',
                authors: ['Mavryk Dev Team <info@mavryk.io>'],
                source: {
                    tools: ['Ligo', 'Flextesa'],
                    location: 'https://ligolang.org/',
                },
                interfaces: ['TZIP-7', 'TZIP-12', 'TZIP-16', 'TZIP-21'],
                errors: [],
                views: [],
                assets: [
                    {
                    symbol: Buffer.from('mXTZ').toString('hex'),
                    name: Buffer.from('mXTZ').toString('hex'),
                    decimals: Buffer.from('6').toString('hex'),
                    icon: Buffer.from('https://infura-ipfs.io/ipfs/QmaHqm92e6rCgw4eNFZ8SxJ5s9hsSgS5tJS4r4Af4zcy89').toString('hex'),
                    shouldPreferSymbol: true,
                    thumbnailUri: 'https://infura-ipfs.io/ipfs/QmaHqm92e6rCgw4eNFZ8SxJ5s9hsSgS5tJS4r4Af4zcy89'
                    }
                ]
                }),
                'ascii',
            ).toString('hex'),
        }),
        "token_metadata": MichelsonMap.fromLiteral({
            0: {
                token_id: '0',
                token_info: MichelsonMap.fromLiteral({
                    symbol: Buffer.from('mXTZ').toString('hex'),
                    name: Buffer.from('mXTZ').toString('hex'),
                    decimals: Buffer.from('6').toString('hex'),
                    icon: Buffer.from('https://infura-ipfs.io/ipfs/QmaHqm92e6rCgw4eNFZ8SxJ5s9hsSgS5tJS4r4Af4zcy89').toString('hex'),
                    shouldPreferSymbol: Buffer.from(new Uint8Array([1])).toString('hex'),
                    thumbnailUri: Buffer.from('https://infura-ipfs.io/ipfs/QmaHqm92e6rCgw4eNFZ8SxJ5s9hsSgS5tJS4r4Af4zcy89').toString('hex')
                }),
            },
        })
    },

    "mTokenTzBtc": {

        "loanToken": "tzBtc",
        "metadata": MichelsonMap.fromLiteral({
            '': Buffer.from('tezos-storage:data', 'ascii').toString('hex'),
            data: Buffer.from(
                JSON.stringify({
                version: 'v1.0.0',
                description: 'Mavryk mTzBTC Token',
                authors: ['Mavryk Dev Team <info@mavryk.io>'],
                source: {
                    tools: ['Ligo', 'Flextesa'],
                    location: 'https://ligolang.org/',
                },
                interfaces: ['TZIP-7', 'TZIP-12', 'TZIP-16', 'TZIP-21'],
                errors: [],
                views: [],
                assets: [
                    {
                    symbol: Buffer.from('mTzBTC').toString('hex'),
                    name: Buffer.from('mTzBTC').toString('hex'),
                    decimals: Buffer.from('8').toString('hex'),
                    icon: Buffer.from('https://infura-ipfs.io/ipfs/Qme1GSg6KA3kbh3T6pwzVf3VcDRKY88fDYG6dzT6yFueME').toString('hex'),
                    shouldPreferSymbol: true,
                    thumbnailUri: 'https://infura-ipfs.io/ipfs/Qme1GSg6KA3kbh3T6pwzVf3VcDRKY88fDYG6dzT6yFueME'
                    }
                ]
                }),
                'ascii',
            ).toString('hex'),
        }),
        "token_metadata": MichelsonMap.fromLiteral({
            0: {
                token_id: '0',
                token_info: MichelsonMap.fromLiteral({
                    symbol: Buffer.from('mTzBTC').toString('hex'),
                    name: Buffer.from('mTzBTC').toString('hex'),
                    decimals: Buffer.from('8').toString('hex'),
                    icon: Buffer.from('https://infura-ipfs.io/ipfs/Qme1GSg6KA3kbh3T6pwzVf3VcDRKY88fDYG6dzT6yFueME').toString('hex'),
                    shouldPreferSymbol: Buffer.from(new Uint8Array([1])).toString('hex'),
                    thumbnailUri: Buffer.from('https://infura-ipfs.io/ipfs/Qme1GSg6KA3kbh3T6pwzVf3VcDRKY88fDYG6dzT6yFueME').toString('hex')
                }),
            },
        })
    }

}

export const aggregatorMockData = {

    

}