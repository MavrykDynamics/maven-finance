const secondsInYears = 31536000
const fixedPointAccuracy = 10**27
    
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

export const calculateInterestTreasuryShare = (interestTreasuryShare, totalInterestPaid) => {
    let interestSentToTreasury = Math.floor((totalInterestPaid * interestTreasuryShare) / 10000);
    return interestSentToTreasury
}


export const rebaseTokenValue = (tokenValueRaw, rebaseDecimals) => {
    return tokenValueRaw * (10 ** rebaseDecimals);
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