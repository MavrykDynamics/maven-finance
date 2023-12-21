import BigNumber from 'bignumber.js';

import { alice, eve, susie } from "../../scripts/sandbox/accounts";

// ------------------------------------------------------------------
//
//
// Lending Helpers
// - Calculations to simulate smart contract calculation and interaction
// - Oracle/Aggregator sample data of token prices
//
//
// ------------------------------------------------------------------


const secondsInYears     = 31536000
const fixedPointAccuracy = 10**27


// 
// General Helpers
//



// 
// Interest Helpers
//

    
export const calculateCompoundedInterest = (interestRate, lastUpdatedBlockLevel, blockLevel) => {

    let interestRateOverSecondsInYear = Math.floor(interestRate / secondsInYears)
    let exp = blockLevel - lastUpdatedBlockLevel

    let expMinusOne = exp - 1
    let expMinusTwo = exp - 2

    let basePowerTwo = Math.floor((interestRateOverSecondsInYear ** 2) / (secondsInYears ** 2))
    let basePowerThree = Math.floor((interestRateOverSecondsInYear ** 3) / (secondsInYears ** 3))

    let firstTerm  = Math.floor(exp * interestRateOverSecondsInYear)
    let secondTerm = Math.floor((exp * expMinusOne * basePowerTwo) / 2)
    let thirdTerm  = Math.floor((exp * expMinusOne * expMinusTwo * basePowerThree) / 6)

    let compoundedInterest = fixedPointAccuracy + firstTerm + secondTerm + thirdTerm

    return compoundedInterest

}


export const calculateUtilisationRate = (tokenPoolTotal, totalBorrowed) => {

    let utilisationRate = Math.floor(totalBorrowed / tokenPoolTotal)
    return utilisationRate

}


export const calculateCurrentInterestRate = (utilisationRate, optimalUtilisationRate, baseInterestRate, interestRateBelowOptimalUtilisation, interestRateAboveOptimalUtilisation) => {

    let currentInterestRate
    let firstTerm = baseInterestRate

    if(utilisationRate > optimalUtilisationRate){

        let secondTerm = interestRateBelowOptimalUtilisation

        let utilisationRateLessOptimalRate = utilisationRate - optimalUtilisationRate
        let coefficientDenominator = fixedPointAccuracy - optimalUtilisationRate

        let thirdTerm = Math.floor((utilisationRateLessOptimalRate / coefficientDenominator) * interestRateAboveOptimalUtilisation)

        currentInterestRate = firstTerm + secondTerm + thirdTerm

    } else {

        let secondTermCoefficient = Math.floor(utilisationRate / optimalUtilisationRate)
        let secondTerm = Math.floor(secondTermCoefficient * interestRateBelowOptimalUtilisation)

        currentInterestRate = firstTerm + secondTerm
    }

    return currentInterestRate
}


export const calculateBorrowIndex = (compoundedInterest, currentBorrowIndex) => {
    return Math.floor((currentBorrowIndex * compoundedInterest) / fixedPointAccuracy)
}


export const calculateAccruedInterest = (currentLoanOutstandingTotal, vaultBorrowIndex, tokenBorrowIndex) => {

    let newLoanOutstandingTotal = currentLoanOutstandingTotal
    
    if(currentLoanOutstandingTotal > 0){
        if(vaultBorrowIndex > 0){
            newLoanOutstandingTotal = Math.floor((currentLoanOutstandingTotal * tokenBorrowIndex) / vaultBorrowIndex)
        }
    }

    return newLoanOutstandingTotal
}


export const calculateTotalInterestPaid = (repayAmount, loanInterestTotal) => {
    if(repayAmount > loanInterestTotal){
        // loan interest total is less than repayAmount amount
        // there is some loan principal reduction to be calculated subsequently
        return loanInterestTotal;
    } else {
        // repayAmount amount is less than total interest
        // there is no loan principal reduction to be calculated subsequently
        return repayAmount;
    }
}


export const calculateRemainingInterest = (repayAmount, totalInterest) => {
    return totalInterest - repayAmount < 0 ? 0 : totalInterest - repayAmount;
}


export const calculateFinalLoanOutstandingTotal = (repayAmount, loanOutstandingWithAccruedInterest) => {
    return repayAmount > loanOutstandingWithAccruedInterest ? 0 : loanOutstandingWithAccruedInterest - repayAmount; 
}


export const calculateFinalLoanPrincipalTotal = (repayAmount, loanOutstandingWithAccruedInterest, remainingInterest, initialVaultPrincipalTotal) => {
    if(remainingInterest > 0){
        return initialVaultPrincipalTotal;
    } else {
        if(repayAmount > loanOutstandingWithAccruedInterest){
            return 0;
        } else {
            return loanOutstandingWithAccruedInterest - repayAmount;
        }
    }    
}


export const calculateFinalLoanInterestTotal = (remainingInterest) => {
    return remainingInterest > 0 ? remainingInterest : 0;
}


export const calculateInterestSentToTreasury = (interestTreasuryShare, totalInterestPaid) => {
    let interestSentToTreasury = Math.floor((totalInterestPaid * interestTreasuryShare) / 10000);
    return interestSentToTreasury
}


export const calculateInterestRewards = (interestSentToTreasury, totalInterestPaid) => {
    return totalInterestPaid - interestSentToTreasury
}


export const calculateNewRewardIndex = (interestRewards, tokenPoolTotal, currentRewardIndex) => {
    const incrementRewardIndex = Math.floor((interestRewards * fixedPointAccuracy )/ tokenPoolTotal);
    const newRewardIndex = currentRewardIndex.toNumber() + incrementRewardIndex;
    return newRewardIndex;
}


export const calculateScaledTokenBalance = (initialTokenBalance, initialUserRewardIndex, tokenRewardIndex) => {
    const currentRewardsPerShare = tokenRewardIndex - initialUserRewardIndex;
    const additionalRewards = (currentRewardsPerShare * initialTokenBalance) / fixedPointAccuracy;
    const newTokenBalance = initialTokenBalance + additionalRewards;
    return newTokenBalance;
}


export const calculateVaultCollateralValue = (tokenOracles, collateralBalanceLedger) => {
    
    let usdtBalance                 = collateralBalanceLedger.get('usdt') == undefined ? 0 : collateralBalanceLedger.get('usdt');
    let eurlBalance                 = collateralBalanceLedger.get('eurl') == undefined ? 0 : collateralBalanceLedger.get('eurl');
    let xtzBalance                  = collateralBalanceLedger.get('tez')  == undefined ? 0 : collateralBalanceLedger.get('tez');
    let mvnBalance                  = collateralBalanceLedger.get("smvn") == undefined ? 0 : collateralBalanceLedger.get("smvn");

    let usdtTokenPrice              = tokenOracles.find(o => o.name === "usdt").price;
    let eurlTokenPrice              = tokenOracles.find(o => o.name === "eurl").price;
    let tezPrice                    = tokenOracles.find(o => o.name === "tez").price;
    let mvnPrice                    = tokenOracles.find(o => o.name === "smvn").price;

    let usdtTokenPriceDecimals      = tokenOracles.find(o => o.name === "usdt").priceDecimals;
    let eurlTokenPriceDecimals      = tokenOracles.find(o => o.name === "eurl").priceDecimals;
    let tezPriceDecimals            = tokenOracles.find(o => o.name === "tez").priceDecimals;
    let mvnPriceDecimals            = tokenOracles.find(o => o.name === "smvn").priceDecimals;

    let usdtTokenDecimals           = tokenOracles.find(o => o.name === "usdt").tokenDecimals;
    let eurlTokenDecimals           = tokenOracles.find(o => o.name === "eurl").tokenDecimals;
    let tezTokenDecimals            = tokenOracles.find(o => o.name === "tez").tokenDecimals;
    let mvnTokenDecimals            = tokenOracles.find(o => o.name === "smvn").tokenDecimals;

    // rebased to no decimals (Math.floor to simulate smart contract division)
    let vaultMockFa12TokenValue     = Math.floor(Math.floor(usdtBalance  / (10 ** usdtTokenDecimals )) * usdtTokenPrice  ) / (10 ** usdtTokenPriceDecimals);
    let vaultMockFa2TokenValue      = Math.floor(Math.floor(eurlBalance  / (10 ** eurlTokenDecimals )) * eurlTokenPrice  ) / (10 ** eurlTokenPriceDecimals);
    let vaultXtzValue               = Math.floor(Math.floor(xtzBalance   / (10 ** tezTokenDecimals  )) * tezPrice        ) / (10 ** tezPriceDecimals);
    let vaultMvnValue               = Math.floor(Math.floor(mvnBalance   / (10 ** mvnTokenDecimals  )) * mvnPrice        ) / (10 ** mvnPriceDecimals);
    
    let vaultCollateralValue        = vaultMockFa12TokenValue + vaultMockFa2TokenValue + vaultXtzValue + vaultMvnValue;

    return vaultCollateralValue
}


export const multiplyByTokenPrice = (tokenName, tokenOracles, tokenAmount) => {

    let tokenPrice = tokenOracles.find(o => o.name === tokenName).price;
    return tokenAmount * tokenPrice;

}


export const divideByTokenPrice = (tokenName, tokenOracles, dollarValue) => {

    let tokenPrice = tokenOracles.find(o => o.name === tokenName).price;
    return Math.floor(dollarValue / tokenPrice);

}



export const convertLoanTokenToCollateralToken = (loanTokenName, collateralTokenName, tokenOracles, loanTokenAmount) => {

    let loanTokenPrice               = tokenOracles.find(o => o.name === loanTokenName).price;
    let loanTokenDecimals            = tokenOracles.find(o => o.name === loanTokenName).tokenDecimals;
    let loanTokenPriceDecimals       = tokenOracles.find(o => o.name === loanTokenName).priceDecimals;

    let collateralTokenPrice         = tokenOracles.find(o => o.name === collateralTokenName).price;
    let collateralTokenDecimals      = tokenOracles.find(o => o.name === collateralTokenName).tokenDecimals;
    let collateralTokenPriceDecimals = tokenOracles.find(o => o.name === collateralTokenName).priceDecimals;

    const tokenDecimalsMultiplyExponent      = collateralTokenDecimals > loanTokenDecimals ? (10 ** (collateralTokenDecimals - loanTokenDecimals)) : 1;
    const tokenDecimalsDivideExponent        = collateralTokenDecimals < loanTokenDecimals ? (10 ** (loanTokenDecimals - collateralTokenDecimals)) : 1;

    const priceTokenDecimalsMultiplyExponent = collateralTokenPriceDecimals > loanTokenPriceDecimals ? (10 ** (collateralTokenPriceDecimals - loanTokenPriceDecimals)) : 1;
    const priceTokenDecimalsDivideExponent   = collateralTokenPriceDecimals < loanTokenPriceDecimals ? (10 ** (loanTokenPriceDecimals - collateralTokenPriceDecimals)) : 1;

    const loanTokenValue         = loanTokenAmount * loanTokenPrice;
    const adjustedLoanTokenValue = Math.floor(loanTokenValue * tokenDecimalsMultiplyExponent * priceTokenDecimalsMultiplyExponent / (tokenDecimalsDivideExponent * priceTokenDecimalsDivideExponent));
    const collateralTokenQty     = Math.floor(adjustedLoanTokenValue / collateralTokenPrice);

    return collateralTokenQty

}



export const isUnderCollaterized = (collateralRatio, loanOutstandingTotal, vaultCollateralValue) => {
    let maxLoanValue = (vaultCollateralValue * collateralRatio) / 1000;
    if(loanOutstandingTotal > maxLoanValue){
        // is under collaterized (not enough collateral for loans)
        return true;
    } else {
        // is over collaterized (enough collateral for loans)
        return false;
    }
}


//
// Liquidation Helpers
//


export const isLiquidatable = (liquidationRatio, loanOutstandingTotal, vaultCollateralValue) => {
    let liquidationThresholdValue = (vaultCollateralValue * liquidationRatio) / 1000;
    if(loanOutstandingTotal > liquidationThresholdValue){
        // is liquidatable
        return true;
    } else {
        // is not liquidatable
        return false;
    }
}


export const calculateTokenRebaseDecimals = (maxDecimals, tokenDecimals, priceDecimals) => {
    return maxDecimals - tokenDecimals - priceDecimals;
}


export const rebaseTokenValueRaw = (tokenValueRaw, rebaseDecimals) => {
    return tokenValueRaw * (10 ** rebaseDecimals);
}


export const calculateTokenValue = (tokenBalance, tokenName, tokenOracles) => {
    
    let tokenPrice          = tokenOracles.find(o => o.name === tokenName).price;
    let tokenPriceDecimals  = tokenOracles.find(o => o.name === tokenName).priceDecimals;
    let tokenDecimals       = tokenOracles.find(o => o.name === tokenName).tokenDecimals;

    const tokenValue        = tokenBalance * tokenPrice / (10 ** (tokenPriceDecimals + tokenDecimals));

    return tokenValue
}


export const calculateTokenValueRebased = (tokenBalance, tokenPrice, rebaseDecimals) => {
    const tokenValueRaw     = tokenBalance * tokenPrice;
    const tokenValueRebased = tokenValueRaw * (10 ** rebaseDecimals);
    return tokenValueRebased
}


export const calculateTokenProportion = (tokenValue, vaultCollateralValue) => {
    return tokenValue / vaultCollateralValue;
}


export const calculateLiquidationIncentive = (liquidationFeePercent, liquidationAmount) => {
    return Math.floor((liquidationFeePercent * liquidationAmount) / 10000);
}


export const calculateAdminLiquidationFee = (adminLiquidationFeePercent, liquidationAmount) => {
    return Math.floor((adminLiquidationFeePercent * liquidationAmount) / 10000);
}


export const calculateVaultMaxLiquidationAmount = (loanOutstandingTotal, maxVaultLiquidationPercent) => {
    return Math.floor((loanOutstandingTotal * maxVaultLiquidationPercent) / 10000);
}


export const calculateTotalLiquidationAmount = (liquidationAmount, vaultMaxLiquidationAmount) => {
    if(liquidationAmount > vaultMaxLiquidationAmount){
        return vaultMaxLiquidationAmount; 
    } else {
        return liquidationAmount
    };
}



// 
// Oracle prices for tokens 
//



export const defaultPriceObservations = [
        
    {
        "name" : "usdt",
        "medianPrice": 1500000, // 1,500,000 -> $1.50
        "observations" : [ 
            {
                "oracle": alice.pkh,
                "data" :new BigNumber(1499995)
            },
            {
                "oracle": eve.pkh,
                "data" :new BigNumber(1500000)
            },
            {
                "oracle": susie.pkh,
                "data" :new BigNumber(1500000)
            }
        ]
    },

    {
        "name": "eurl",
        "medianPrice": 3500000, // 3,500,000 -> $3.50
        "observations" : [
            {
                "oracle": alice.pkh,
                "data" :new BigNumber(3499995)
            },
            {
                "oracle": eve.pkh,
                "data" :new BigNumber(3500000)
            },
            {
                "oracle": susie.pkh,
                "data" :new BigNumber(3500000)
            }
        ]
    },

    {
        "name": "tez",
        "medianPrice": 1800000, // 1,800,000 -> $1.80
        "observations" : [
            {
                "oracle": alice.pkh,
                "data" :new BigNumber(1799995)
            },
            {
                "oracle": eve.pkh,
                "data" :new BigNumber(1800000)
            },
            {
                "oracle": susie.pkh,
                "data" :new BigNumber(1800000)
            }
        ]
    },


    {
        "name": "smvn",
        "medianPrice": 1000000000, // 1,000,000,000 -> $1
        "observations" : [ 
            {
                "oracle": alice.pkh,
                "data" :new BigNumber(999999995)
            },
            {
                "oracle": eve.pkh,
                "data" :new BigNumber(1000000000)
            },
            {
                "oracle": susie.pkh,
                "data" :new BigNumber(1000000000)
            }
        ]
    },
    
];


// price drops by 2/3 (relative to default)
export const priceDecreaseObservations = [
    
    {
        "name": "usdt",
        "medianPrice": 500000, // 500,000 -> $0.50
        "observations" : [
            {
                "oracle": alice.pkh,
                "data" :new BigNumber(499995)
            },
            {
                "oracle": eve.pkh,
                "data" :new BigNumber(500000)
            },
            {
                "oracle": susie.pkh,
                "data" :new BigNumber(500000)
            }
        ]
    },

    {
        "name": "eurl",
        "medianPrice": 1166666, // 1,166,666 -> $1.16
        "observations" : [
            {
                "oracle": alice.pkh,
                "data" :new BigNumber(1166660)
            },
            {
                "oracle": eve.pkh,
                "data" :new BigNumber(1166666)
            },
            {
                "oracle": susie.pkh,
                "data" :new BigNumber(1166666)
            }
        ]
    },

    {
        "name": "tez",
        "medianPrice": 600000, // 600,000 -> $0.60
        "observations" : [ 
            {
                "oracle": alice.pkh,
                "data" :new BigNumber(599995)
            },
            {
                "oracle": eve.pkh,
                "data" :new BigNumber(600000)
            },
            {
                "oracle": susie.pkh,
                "data" :new BigNumber(600000)
            }
        ]
    },

    {
        "name": "smvn",
        "medianPrice": 333333333, // 333,333,333 -> $0.33
        "observations" : [
            {
                "oracle": alice.pkh,
                "data" :new BigNumber(333333328)
            },
            {
                "oracle": eve.pkh,
                "data" :new BigNumber(333333333)
            },
            {
                "oracle": susie.pkh,
                "data" :new BigNumber(333333333)
            }
        ]
    },
    
];



// price increases by 2/3 (relative to default)
export const priceIncreaseObservations = [
    
    {
        "name": "usdt",
        "medianPrice": 2500000, // 2,500,000 -> $2.50
        "observations" : [
            {
                "oracle": alice.pkh,
                "data" :new BigNumber(2499995)
            },
            {
                "oracle": eve.pkh,
                "data" :new BigNumber(2500000)
            },
            {
                "oracle": susie.pkh,
                "data" :new BigNumber(2500000)
            }
        ]
    },

    {
        "name": "eurl",
        "medianPrice": 5833333, // 5,833,333 -> $5.83
        "observations" : [
            {
                "oracle": alice.pkh,
                "data" :new BigNumber(5833328)
            },
            {
                "oracle": eve.pkh,
                "data" :new BigNumber(5833333)
            },
            {
                "oracle": susie.pkh,
                "data" :new BigNumber(5833333)
            }
        ]
    },

    {
        "name": "tez",
        "medianPrice": 3000000, // 3,000,000 -> $3.00
        "observations" : [
            {
                "oracle": alice.pkh,
                "data" :new BigNumber(2999995)
            },
            {
                "oracle": eve.pkh,
                "data" :new BigNumber(3000000)
            },
            {
                "oracle": susie.pkh,
                "data" :new BigNumber(3000000)
            }
        ]
    },

    {
        "name": "smvn",
        "medianPrice": 1666666666, // 1,666,666,666 -> $1.66
        "observations" : [
            {
                "oracle": alice.pkh,
                "data" :new BigNumber(1666666661)
            },
            {
                "oracle": eve.pkh,
                "data" :new BigNumber(1666666666)
            },
            {
                "oracle": susie.pkh,
                "data" :new BigNumber(1666666666)
            }
        ]
    }    
];
