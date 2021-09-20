const Decimal = require('decimal.js');

export function calcRelativeDiff(expected: any, actual: any) {
    return ((Decimal(expected).minus(Decimal(actual))).div(expected)).abs();
}

export function calcSpotPrice(tokenBalanceIn: number, tokenWeightIn: number, tokenBalanceOut: number, tokenWeightOut: number, swapFee: number) {
    const numer = Decimal(tokenBalanceIn).div(Decimal(tokenWeightIn));
    const denom = Decimal(tokenBalanceOut).div(Decimal(tokenWeightOut));
    const ratio = numer.div(denom);
    const scale = Decimal(1).div(Decimal(1).sub(Decimal(swapFee)));
    const spotPrice = ratio.mul(scale);
    return spotPrice;
}

export function calcOutGivenIn(tokenBalanceIn: number, tokenWeightIn: number, tokenBalanceOut: number, tokenWeightOut: number, tokenAmountIn: number, swapFee: number) {
    const weightRatio = Decimal(tokenWeightIn).div(Decimal(tokenWeightOut));
    const adjustedIn = Decimal(tokenAmountIn).times((Decimal(1).minus(Decimal(swapFee))));
    const y = Decimal(tokenBalanceIn).div(Decimal(tokenBalanceIn).plus(adjustedIn));
    const foo = y.pow(weightRatio);
    const bar = Decimal(1).minus(foo);
    const tokenAmountOut = Decimal(tokenBalanceOut).times(bar);
    return tokenAmountOut;
}

export function calcInGivenOut(tokenBalanceIn: number, tokenWeightIn: number, tokenBalanceOut: number, tokenWeightOut: number, tokenAmountOut: number, swapFee: number) {
    const weightRatio = Decimal(tokenWeightOut).div(Decimal(tokenWeightIn));
    const diff = Decimal(tokenBalanceOut).minus(tokenAmountOut);
    const y = Decimal(tokenBalanceOut).div(diff);
    const foo = y.pow(weightRatio).minus(Decimal(1));
    const tokenAmountIn = (Decimal(tokenBalanceIn).times(foo)).div(Decimal(1).minus(Decimal(swapFee)));
    return tokenAmountIn;
}

export function calcPoolOutGivenSingleIn(tokenBalanceIn: number, tokenWeightIn: number, poolSupply: number, totalWeight: number, tokenAmountIn: number, swapFee: number) {
    const normalizedWeight = Decimal(tokenWeightIn).div(Decimal(totalWeight));
    const zaz = Decimal(1).sub(Decimal(normalizedWeight)).mul(Decimal(swapFee));
    const tokenAmountInAfterFee = Decimal(tokenAmountIn).mul(Decimal(1).sub(zaz));
    const newTokenBalanceIn = Decimal(tokenBalanceIn).add(tokenAmountInAfterFee);
    const tokenInRatio = newTokenBalanceIn.div(Decimal(tokenBalanceIn));
    const poolRatio = tokenInRatio.pow(normalizedWeight);
    const newPoolSupply = poolRatio.mul(Decimal(poolSupply));
    const poolAmountOut = newPoolSupply.sub(Decimal(poolSupply));
    return poolAmountOut;
}

export function calcSingleInGivenPoolOut(tokenBalanceIn: number, tokenWeightIn: number, poolSupply: number, totalWeight: number, poolAmountOut: number, swapFee: number) {
    const normalizedWeight = Decimal(tokenWeightIn).div(Decimal(totalWeight));
    const newPoolSupply = Decimal(poolSupply).plus(Decimal(poolAmountOut));
    const poolRatio = newPoolSupply.div(Decimal(poolSupply));
    const boo = Decimal(1).div(normalizedWeight);
    const tokenInRatio = poolRatio.pow(boo);
    const newTokenBalanceIn = tokenInRatio.mul(Decimal(tokenBalanceIn));
    const tokenAmountInAfterFee = newTokenBalanceIn.sub(Decimal(tokenBalanceIn));
    const zar = (Decimal(1).sub(normalizedWeight)).mul(Decimal(swapFee));
    const tokenAmountIn = tokenAmountInAfterFee.div(Decimal(1).sub(zar));
    return tokenAmountIn;
}
