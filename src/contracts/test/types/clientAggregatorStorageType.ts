import { BigNumber } from "bignumber.js";

export type clientAggregatorStorageType = {
    decimals: BigNumber;
    round: BigNumber;
    price: BigNumber;
    percentOracleResponse: BigNumber;
    priceDateTime: string;
};
