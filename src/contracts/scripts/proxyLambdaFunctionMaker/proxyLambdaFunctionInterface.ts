export interface fa12 {
    fa12                                        : string;
}

export interface fa2 {
    fa2                                     : {
        tokenContractAddress                    : string;
        tokenId                                 : number;
    }
}

export interface transferItem {
    to_     : string;
    amount  : number;
    token   : fa12 | fa2 | "tez"
}

export interface addOperator {
    addOperator: {
        owner: string,
        operator: string,
        tokenId: number
    }
}

export interface removeOperator {
    removeOperator: {
        owner: string,
        operator: string,
        tokenId: number
    }
}

export interface oracleInformation {
    oracleAddress           : string,
    oraclePublicKey         : string,
    oraclePeerId            : string
}

export interface createLoanToken {
    createLoanToken                         : {
        tokenName                               : string;
        tokenDecimals                           : number;
        oracleAddress                           : string;
        mTokenAddress                           : string;
        reserveRatio                            : number;
        optimalUtilisationRate                  : number;
        baseInterestRate                        : number;
        maxInterestRate                         : number;
        interestRateBelowOptimalUtilisation     : number;
        interestRateAboveOptimalUtilisation     : number;
        minRepaymentAmount                      : number;
        tokenType                               : fa12 | fa2 | "tez"; 
    }
} 

export interface updateLoanToken {
    updateLoanToken                         : {
        tokenName                               : string;
        oracleAddress                           : string;
        reserveRatio                            : number;
        optimalUtilisationRate                  : number;
        baseInterestRate                        : number;
        maxInterestRate                         : number;
        interestRateBelowOptimalUtilisation     : number;
        interestRateAboveOptimalUtilisation     : number;
        minRepaymentAmount                      : number;
        isPaused                                : boolean;
    }
}

export interface createCollateralToken {
    createCollateralToken                   : {
        tokenName                               : string,
        tokenContractAddress                    : string,
        tokenDecimals                           : number,
        oracleAddress                           : string,
        protected                               : boolean,
        isScaledToken                           : boolean,
        isStakedToken                           : boolean,
        stakingContractAddress                  : string | undefined,
        maxDepositAmount                        : number | undefined,
        tokenType                               : fa12 | fa2 | "tez"
    }
} 

export interface updateCollateralToken {
    updateCollateralToken                   : {
        tokenName                               : string,
        oracleAddress                           : string,
        isPaused                                : boolean,
        stakingContractAddress                  : string | undefined,
        maxDepositAmount                        : number | undefined,
    }
}
