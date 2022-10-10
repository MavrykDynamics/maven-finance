import { alice, bob, eve, mallory, oscar, trudy, oracleMaintainer } from "../../scripts/sandbox/accounts";
import BigNumber from 'bignumber.js';

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

    let newLoanOutstandingTotal = 0
    
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


export const calculateInterestSentToRewardPool = (interestSentToTreasury, totalInterestPaid) => {
    return totalInterestPaid - interestSentToTreasury
}


export const calculateVaultCollateralValue = (tokenOracles, collateralBalanceLedger) => {
    
    let mockFa12Balance             = collateralBalanceLedger.get('mockFa12') == undefined ? 0 : collateralBalanceLedger.get('mockFa12');
    let mockFa2Balance              = collateralBalanceLedger.get('mockFa2')  == undefined ? 0 : collateralBalanceLedger.get('mockFa2');
    let xtzBalance                  = collateralBalanceLedger.get('tez')      == undefined ? 0 : collateralBalanceLedger.get('tez');

    let mockFa12TokenPrice          = tokenOracles.find(o => o.name === "mockFa12").price;
    let mockFa2TokenPrice           = tokenOracles.find(o => o.name === "mockFa2").price;
    let tezPrice                    = tokenOracles.find(o => o.name === "tez").price;

    let mockFa12TokenPriceDecimals  = tokenOracles.find(o => o.name === "mockFa12").priceDecimals;
    let mockFa2TokenPriceDecimals   = tokenOracles.find(o => o.name === "mockFa2").priceDecimals;
    let tezPriceDecimals            = tokenOracles.find(o => o.name === "tez").priceDecimals;

    let mockFa12TokenDecimals       = tokenOracles.find(o => o.name === "mockFa12").tokenDecimals;
    let mockFa2TokenDecimals        = tokenOracles.find(o => o.name === "mockFa2").tokenDecimals;
    let tezTokenDecimals            = tokenOracles.find(o => o.name === "tez").tokenDecimals;

    // rebased to no decimals (Math.floor to simulate smart contract division)
    let vaultMockFa12TokenValue     = Math.floor(Math.floor(mockFa12Balance / (10 ** mockFa12TokenDecimals)) * mockFa12TokenPrice) / (10 ** mockFa12TokenPriceDecimals);
    let vaultMockFa2TokenValue      = Math.floor(Math.floor(mockFa2Balance  / (10 ** mockFa2TokenDecimals))  * mockFa2TokenPrice)  / (10 ** mockFa2TokenPriceDecimals);
    let vaultXtzValue               = Math.floor(Math.floor(xtzBalance      / (10 ** tezTokenDecimals))      * tezPrice)           / (10 ** tezPriceDecimals);
    
    let vaultCollateralValue        = vaultMockFa12TokenValue + vaultMockFa2TokenValue + vaultXtzValue;

    return vaultCollateralValue
}


export const multiplyByTokenPrice = (tokenName, tokenOracles, tokenAmount) => {

    if(tokenName = "mockFa12"){
        
        let mockFa12TokenPrice = tokenOracles.find(o => o.name === "mockFa12").price;
        return tokenAmount * mockFa12TokenPrice;

    } else if(tokenName = "mockFa2"){

        let mockFa2TokenPrice = tokenOracles.find(o => o.name === "mockFa2").price;
        return tokenAmount * mockFa2TokenPrice;

    } else if(tokenName = "tez"){

        let tezPrice = tokenOracles.find(o => o.name === "tez").price;
        return tokenAmount * tezPrice;

    } else if(tokenName = "mvk"){

        let mvkPrice = tokenOracles.find(o => o.name === "mvk").price;
        return tokenAmount * mvkPrice;

    }
}


export const divideByTokenPrice = (tokenName, tokenOracles, dollarValue) => {

    if(tokenName = "mockFa12"){
        
        let mockFa12TokenPrice = tokenOracles.find(o => o.name === "mockFa12").price;
        return Math.floor(dollarValue / mockFa12TokenPrice);

    } else if(tokenName = "mockFa2"){

        let mockFa2TokenPrice = tokenOracles.find(o => o.name === "mockFa2").price;
        return Math.floor(dollarValue / mockFa2TokenPrice);

    } else if(tokenName = "tez"){

        let tezPrice = tokenOracles.find(o => o.name === "tez").price;
        return Math.floor(dollarValue / tezPrice);

    } else if(tokenName = "mvk"){

        let mvkPrice = tokenOracles.find(o => o.name === "mvk").price;
        return Math.floor(dollarValue / mvkPrice);

    }
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


export const calculateTokenValueRebased = (tokenBalance, tokenPrice, rebaseDecimals) => {
    const tokenValueRaw     = tokenBalance * tokenPrice;
    const tokenValueRebased = tokenValueRaw * (10 ** rebaseDecimals);
    return tokenValueRebased
}


export const calculateTokenProportion = (tokenValueRebased, vaultCollateralValueRebased) => {
    return Math.floor(tokenValueRebased / vaultCollateralValueRebased);
}


export const calculateLiquidationIncentive = (liquidationFeePercent, liquidationAmount) => {
    return Math.floor((liquidationFeePercent * liquidationAmount) / 10000);
}


export const calculateAdminLiquidationFee = (adminLiquidationFeePercent, liquidationAmount) => {
    return Math.floor((adminLiquidationFeePercent * liquidationAmount) / 10000);
}


export const calculateVaultMaxLiquidationAmount = (newLoanOutstandingTotal, maxVaultLiquidationPercent) => {
    return Math.floor((newLoanOutstandingTotal * maxVaultLiquidationPercent) / 10000);
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
        "name" : "mockFa12",
        "medianPrice": 1500000, // 1,500,000 -> $1.50
        "observations" : [ 
            {
                "oracle": bob.pkh,
                "data" :new BigNumber(1499995)
            },
            {
                "oracle": eve.pkh,
                "data" :new BigNumber(1500000)
            },
            {
                "oracle": mallory.pkh,
                "data" :new BigNumber(1500000)
            },
            {
                "oracle": oscar.pkh,
                "data" :new BigNumber(1500005)
            }
        ]
    },

    {
        "name": "mockFa2",
        "medianPrice": 3500000, // 3,500,000 -> $3.50
        "observations" : [
            {
                "oracle": bob.pkh,
                "data" :new BigNumber(3499995)
            },
            {
                "oracle": eve.pkh,
                "data" :new BigNumber(3500000)
            },
            {
                "oracle": mallory.pkh,
                "data" :new BigNumber(3500000)
            },
            {
                "oracle": oscar.pkh,
                "data" :new BigNumber(3500005)
            }
        ]
    },

    {
        "name": "tez",
        "medianPrice": 1800000, // 1,800,000 -> $1.80
        "observations" : [
            {
                "oracle": bob.pkh,
                "data" :new BigNumber(1799995)
            },
            {
                "oracle": eve.pkh,
                "data" :new BigNumber(1800000)
            },
            {
                "oracle": mallory.pkh,
                "data" :new BigNumber(1800000)
            },
            {
                "oracle": oscar.pkh,
                "data" :new BigNumber(1800005)
            }
        ]
    },


    {
        "name": "mvk",
        "medianPrice": 1000000000, // 1,000,000,000 -> $1
        "observations" : [ 
            {
                "oracle": bob.pkh,
                "data" :new BigNumber(999999995)
            },
            {
                "oracle": eve.pkh,
                "data" :new BigNumber(1000000000)
            },
            {
                "oracle": mallory.pkh,
                "data" :new BigNumber(1000000000)
            },
            {
                "oracle": oscar.pkh,
                "data" :new BigNumber(1000000005)
            }
        ]
    },
    
];


// price drops by 2/3 (relative to default)
export const priceDecreaseObservations = [
    
    {
        "name": "mockFa12",
        "medianPrice": 500000, // 500,000 -> $0.50
        "observations" : [
            {
                "oracle": bob.pkh,
                "data" :new BigNumber(499995)
            },
            {
                "oracle": eve.pkh,
                "data" :new BigNumber(500000)
            },
            {
                "oracle": mallory.pkh,
                "data" :new BigNumber(500000)
            },
            {
                "oracle": oscar.pkh,
                "data" :new BigNumber(500005)
            }
        ]
    },

    {
        "name": "mockFa2",
        "medianPrice": 1166666, // 1,166,666 -> $1.16
        "observations" : [
            {
                "oracle": bob.pkh,
                "data" :new BigNumber(1166660)
            },
            {
                "oracle": eve.pkh,
                "data" :new BigNumber(1166666)
            },
            {
                "oracle": mallory.pkh,
                "data" :new BigNumber(1166666)
            },
            {
                "oracle": oscar.pkh,
                "data" :new BigNumber(1166671)
            }
        ]
    },

    {
        "name": "tez",
        "medianPrice": 600000, // 600,000 -> $0.60
        "observations" : [ 
            {
                "oracle": bob.pkh,
                "data" :new BigNumber(599995)
            },
            {
                "oracle": eve.pkh,
                "data" :new BigNumber(600000)
            },
            {
                "oracle": mallory.pkh,
                "data" :new BigNumber(600000)
            },
            {
                "oracle": oscar.pkh,
                "data" :new BigNumber(600005)
            }
        ]
    },

    {
        "name": "mvk",
        "medianPrice": 333333333, // 333,333,333 -> $0.33
        "observations" : [
            {
                "oracle": bob.pkh,
                "data" :new BigNumber(333333328)
            },
            {
                "oracle": eve.pkh,
                "data" :new BigNumber(333333333)
            },
            {
                "oracle": mallory.pkh,
                "data" :new BigNumber(333333333)
            },
            {
                "oracle": oscar.pkh,
                "data" :new BigNumber(333333338)
            }
        ]
    },
    
];



// price increases by 2/3 (relative to default)
export const priceIncreaseObservations = [
    
    {
        "name": "mockFa12",
        "medianPrice": 2500000, // 2,500,000 -> $2.50
        "observations" : [
            {
                "oracle": bob.pkh,
                "data" :new BigNumber(2499995)
            },
            {
                "oracle": eve.pkh,
                "data" :new BigNumber(2500000)
            },
            {
                "oracle": mallory.pkh,
                "data" :new BigNumber(2500000)
            },
            {
                "oracle": oscar.pkh,
                "data" :new BigNumber(2500005)
            }
        ]
    },

    {
        "name": "mockFa2",
        "medianPrice": 5833333, // 5,833,333 -> $5.83
        "observations" : [
            {
                "oracle": bob.pkh,
                "data" :new BigNumber(5833328)
            },
            {
                "oracle": eve.pkh,
                "data" :new BigNumber(5833333)
            },
            {
                "oracle": mallory.pkh,
                "data" :new BigNumber(5833333)
            },
            {
                "oracle": oscar.pkh,
                "data" :new BigNumber(5833338)
            }
        ]
    },

    {
        "name": "tez",
        "medianPrice": 3000000, // 3,000,000 -> $3.00
        "observations" : [
            {
                "oracle": bob.pkh,
                "data" :new BigNumber(2999995)
            },
            {
                "oracle": eve.pkh,
                "data" :new BigNumber(3000000)
            },
            {
                "oracle": mallory.pkh,
                "data" :new BigNumber(3000000)
            },
            {
                "oracle": oscar.pkh,
                "data" :new BigNumber(3000005)
            }
        ]
    },

    {
        "name": "mvk",
        "medianPrice": 1666666666, // 1,666,666,666 -> $1.66
        "observations" : [
            {
                "oracle": bob.pkh,
                "data" :new BigNumber(1666666661)
            },
            {
                "oracle": eve.pkh,
                "data" :new BigNumber(1666666666)
            },
            {
                "oracle": mallory.pkh,
                "data" :new BigNumber(1666666666)
            },
            {
                "oracle": oscar.pkh,
                "data" :new BigNumber(1666666671)
            }
        ]
    },

    
];