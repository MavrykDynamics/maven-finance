import { MichelsonMap } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";

const { bob } = require('../scripts/sandbox/accounts')

import { tokenSaleStorageType } from "../test/types/tokenSaleStorageType";


const config = {
    
    maxWhitelistCount            : 100,
    maxAmountPerWhitelistWallet  : 100000000,
    maxAmountPerWalletTotal      : 200000000, 
    
    whitelistStartTimestamp      : Date.now(),
    whitelistEndTimestamp        : Date.now(),
    
    whitelistMaxAmountCap        : 1000000000,    
    overallMaxAmountCap          : 2000000000  

}

const metadata = MichelsonMap.fromLiteral({
    '': Buffer.from('tezos-storage:data', 'ascii').toString('hex'),
    data: Buffer.from(
        JSON.stringify({
            name: 'MAVRYK Token Sale Contract',
            version: 'v1.0.0',
            authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
        }),
        'ascii',
    ).toString('hex'),
})

export const tokenSaleStorage: tokenSaleStorageType = {
    
    admin                     : bob.pkh,
    metadata                  : metadata,
    config                    : config,

    governanceAddress         : "",
    treasuryAddress           : "",
    mvkTokenAddress           : "",

    whitelistedAddresses      : MichelsonMap.fromLiteral({}),
    tokenSaleLedger           : MichelsonMap.fromLiteral({}),

    tokenSaleHasStarted       : false,
    whitelistAmountTotal      : new BigNumber(0),
    overallAmountTotal        : new BigNumber(0),

};
