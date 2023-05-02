import { MichelsonMap } from "@taquito/michelson-encoder";
import { alice, bob, eve, mallory, oscar, ivan, trudy } from "../../scripts/sandbox/accounts";
export const mvkTokenDecimals = 9

// ------------------------------------------------------------------------------
// Mock Data Start
// ------------------------------------------------------------------------------

export const mockTokenData = {

    "mvkToken" : {

        "metadata": MichelsonMap.fromLiteral({
            '': Buffer.from('tezos-storage:data', 'ascii').toString('hex'),
            data: Buffer.from(
                JSON.stringify({
                    name: 'MAVRYK',
                    description: 'MAVRYK Token',
                    authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
                    source: {
                        tools: ['Ligo', 'Flextesa'],
                        location: 'https://ligolang.org/',
                    },
                    interfaces: ['TZIP-7', 'TZIP-12', 'TZIP-16', 'TZIP-21'],
                    errors: [],
                    views: [],
                    assets: [
                        {
                        symbol: Buffer.from('MVK').toString('hex'),
                        name: Buffer.from('MAVRYK').toString('hex'),
                        decimals: Buffer.from(mvkTokenDecimals.toString()).toString('hex'),
                        icon: Buffer.from('https://mavryk.finance/logo192.png').toString('hex'),
                        shouldPreferSymbol: true,
                        thumbnailUri: 'https://mavryk.finance/logo192.png',
                        },
                    ],
                }),
                'ascii',
            ).toString('hex'),
        }),

        "metadataHex": Buffer.from(
            JSON.stringify({
                name: 'MAVRYK',
                description: 'MAVRYK Token',
                authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
                source: {
                tools: ['Ligo', 'Flextesa'],
                location: 'https://ligolang.org/',
                },
                interfaces: ['TZIP-7', 'TZIP-12', 'TZIP-16', 'TZIP-21'],
                errors: [],
                views: [],
                assets: [
                {
                    symbol: Buffer.from('MVK').toString('hex'),
                    name: Buffer.from('MAVRYK').toString('hex'),
                    decimals: Buffer.from("9").toString('hex'),
                    icon: Buffer.from('https://mavryk.finance/logo192.png').toString('hex'),
                    shouldPreferSymbol: true,
                    thumbnailUri: 'https://mavryk.finance/logo192.png',
                },
                ],
            }),
            'ascii',
        ).toString('hex')
    }

}

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


export const mockSatelliteData = {

    "alice" : {
        name            : "Alice Dynamics",
        desc            : "The Alice Dynamics belongs to one of the core teams contributing to Mavryk Finance. The team as Mavryk Dynamics are heavily focused on building the future of financial independence while ensuring a smooth and simple user experience.",
        image           : "https://infura-ipfs.io/ipfs/QmaqwZAnSWj89kGomozvk8Ng2M5SrSzwibvFyRijWeRbjg",
        website         : "https://mavryk.finance/", 
        satelliteFee    : 500,
        oraclePublicKey : alice.pk,
        oraclePeerId    : alice.peerId
    },

    "bob" : {
        name            : "Mavryk Dynamics",
        desc            : "The Mavryk Dynamics belongs to one of the core teams contributing to Mavryk Finance. The team as Mavryk Dynamics are heavily focused on building the future of financial independence while ensuring a smooth and simple user experience.",
        image           : "https://infura-ipfs.io/ipfs/QmaqwZAnSWj89kGomozvk8Ng2M5SrSzwibvFyRijWeRbjg",
        website         : "https://mavryk.finance/", 
        satelliteFee    : 500,
        oraclePublicKey : bob.pk,
        oraclePeerId    : bob.peerId
    },

    "eve" : {
        name            : "Buzz Lightyear",
        desc            : "Buzz is a fabled part of our childhood. He was created by Disney and Pixar mainly voiced by Tim Allen. He is a Superhero toy action figure based on the in-universe media franchise Toy Story, consisting of a blockbuster feature film and animated series, a Space Ranger.", 
        image           : "https://infura-ipfs.io/ipfs/QmcbigzB5PVfawr1jhctTWDgGTmLBZFbHPNfosDfq9zckQ",
        website         : "https://toystory.disney.com/buzz-lightyear", 
        satelliteFee    : 350,
        oraclePublicKey : eve.pk,
        oraclePeerId    : eve.peerId
    },

    "mallory" : {
        name            : "Captain Kirk",
        desc            : "James Tiberius \"Jim\" Kirk is a legendary Starfleet officer who lived during the 23rd century. His time in Starfleet, made Kirk arguably one of the most famous and sometimes infamous starship captains in Starfleet history.",
        image           : "https://infura-ipfs.io/ipfs/QmT5aHNdawngnruJ2QtKxGd38H642fYjV7xqZ7HX5CuwRn",
        website         : "https://intl.startrek.com/",
        satelliteFee    : 700,
        oraclePublicKey : mallory.pk,
        oraclePeerId    : mallory.peerId
    },

    "oscar" : {
        name            : "Oscar Wilde",
        desc            : "Oscar Fingal O'Fflahertie Wills Wilde was an Irish poet and playwright. After writing in different forms throughout the 1880s, he became one of the most popular playwrights in London in the early 1890s.",
        image           : "https://infura-ipfs.io/ipfs/QmT5aHNdawngnruJ2QtKxGd38H642fYjV7xqZ7HX5CuwRn",
        website         : "https://intl.startrek.com/",
        satelliteFee    : 700,
        oraclePublicKey : oscar.pk,
        oraclePeerId    : oscar.peerId
    },

    "ivan" : {
        name            : "Ivan Pavlov",
        desc            : "Ivan Petrovich Pavlov, was a Russian and Soviet experimental neurologist, psychologist and physiologist known for his discovery of classical conditioning through his experiments with dogs.",
        image           : "https://infura-ipfs.io/ipfs/QmT5aHNdawngnruJ2QtKxGd38H642fYjV7xqZ7HX5CuwRn",
        website         : "https://intl.startrek.com/",
        satelliteFee    : 600,
        oraclePublicKey : ivan.pk,
        oraclePeerId    : ivan.peerId
    },

    "trudy" : {
        name            : "Trudy",
        desc            : "Lorem ipsum about trudy.",
        image           : "https://infura-ipfs.io/ipfs/QmT5aHNdawngnruJ2QtKxGd38H642fYjV7xqZ7HX5CuwRn",
        website         : "https://intl.startrek.com/",
        satelliteFee    : 500,
        oraclePublicKey : trudy.pk,
        oraclePeerId    : trudy.peerId
    }
    
    
}


export const mockPackedLambdaData = {

    // update council config action expiry days to 1234
    "updateCouncilConfig" : "05020000019f03200743036e0a00000016018b2d71a13cb5d32c24f0537b1adae30ff7200256000655076504620000001525757064617465436f6e6669674e657756616c7565086407640764046c0000001725636f6e666967416374696f6e45787069727944617973046c0000001c25636f6e666967436f756e63696c496d6167654d61784c656e6774680764046c0000001b25636f6e666967436f756e63696c4e616d654d61784c656e677468046c0000001e25636f6e666967436f756e63696c576562736974654d61784c656e67746807640764046c0000001e25636f6e66696752657175657374507572706f73654d61784c656e677468046c0000002025636f6e66696752657175657374546f6b656e4e616d654d61784c656e677468046c0000001025636f6e6669675468726573686f6c640000001325757064617465436f6e666967416374696f6e0000000d25757064617465436f6e666967072f0200000008074303620000032702000000000743036a0000034f0533036c05330764036c036c053307640764036c036c036c074303620092130342034d053d036d034c031b",

    // update governance config success reward to 1200
    "updateGovernanceConfig" : "05020000030d03200743036e0a00000016014b4347c7945108940c8455c0e866a7cfb80bc0af000655076504620000001525757064617465436f6e6669674e657756616c75650864076407640764046c0000001d25636f6e666967426c6f636b7350657250726f706f73616c526f756e64046c0000001d25636f6e666967426c6f636b7350657254696d656c6f636b526f756e640764046c0000001b25636f6e666967426c6f636b73506572566f74696e67526f756e64046c0000001825636f6e6669674379636c65566f7465727352657761726407640764046c0000001f25636f6e6669674d617850726f706f73616c73506572536174656c6c697465046c0000001e25636f6e6669674d696e50726f706f73616c526f756e64566f74655063740764046c0000001f25636f6e6669674d696e50726f706f73616c526f756e64566f746573526571046c0000001a25636f6e6669674d696e51756f72756d50657263656e74616765076407640764046c0000001b25636f6e6669674d696e596179566f746550657263656e74616765046c0000001c25636f6e66696750726f706f73616c436f64654d61784c656e6774680764046c0000002025636f6e66696750726f706f73616c4461745469746c654d61784c656e677468046c0000001c25636f6e66696750726f706f73616c446573634d61784c656e67746807640764046c0000001f25636f6e66696750726f706f73616c496e766f6963654d61784c656e677468046c0000001d25636f6e66696750726f706f73616c5469746c654d61784c656e6774680764046c0000001625636f6e66696750726f706f73654665654d7574657a046c0000001425636f6e666967537563636573735265776172640000001325757064617465436f6e666967416374696f6e0000000d25757064617465436f6e666967072f0200000008074303620000032702000000000743036a0000034f0544036c05440764036c036c054407640764036c036c0764036c036c0544076407640764036c036c0764036c036c07640764036c036c0764036c036c0743036200b0120342034d053d036d034c031b"

}