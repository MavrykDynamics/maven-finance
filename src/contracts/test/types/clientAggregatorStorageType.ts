import { BigNumber } from "bignumber.js";

export type clientAggregatorStorageType = {
    decimals                : BigNumber;
    round                   : BigNumber;
    data                    : BigNumber;
    percentOracleResponse   : BigNumber;
    lastUpdatedAt           : string;
};
