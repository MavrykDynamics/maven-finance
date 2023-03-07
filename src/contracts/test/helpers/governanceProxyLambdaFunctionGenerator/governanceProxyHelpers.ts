import { TezosToolkit } from '@taquito/taquito'

const packLambdaFunction    = async(tezos: TezosToolkit, governanceProxyContractAddress: string, lambdaFunction : Array<any>) => {
    const governanceProxyInstance   = await tezos.contract.at(governanceProxyContractAddress);
    const param                     = governanceProxyInstance.methods.dataPackingHelper(lambdaFunction).toTransferParams();
    if(param.parameter){
        const paramValue                = param.parameter.value;
        const lambdaEntrypointType      = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
    
        const packed                    = await tezos.rpc.packData({
            data: paramValue,
            type: lambdaEntrypointType
        }).catch(e => console.error('error:', e));
    
        var packedParam;
        if (packed) {
            packedParam = packed.packed
            console.log('packed success reward param: ' + packedParam);
        } else {
        throw `packing failed`
        };
    }
    return packedParam;
}

export const setAdmin       = async(tezos: TezosToolkit, governanceProxyContractAddress: string, contractAddress: string, newAdminAddress: string) => {
    // Prepare proposal metadata
    const lambdaFunction    = [ 
        { "prim": "DROP" },
        { "prim": "PUSH",
            "args":
            [ { "prim": "address" },
                { "string": `${contractAddress}` } ] },
        { "prim": "CONTRACT", "args": [ { "prim": "address" } ],
            "annots": [ "%setAdmin" ] },
        { "prim": "IF_NONE",
            "args":
            [ [ { "prim": "PUSH",
                    "args": [ { "prim": "nat" }, { "int": "24" } ] },
                { "prim": "FAILWITH" } ], [] ] },
        { "prim": "PUSH",
            "args": [ { "prim": "mutez" }, { "int": "0" } ] },
        { "prim": "PUSH",
            "args":
            [ { "prim": "address" },
                { "string":`${newAdminAddress}` } ] },
        { "prim": "TRANSFER_TOKENS" },
        { "prim": "NIL", "args": [ { "prim": "operation" } ] },
        { "prim": "SWAP" }, { "prim": "CONS" } 
    ];    
    return await packLambdaFunction(tezos, governanceProxyContractAddress, lambdaFunction)
}

export const setGovernance  = async(tezos: TezosToolkit, governanceProxyContractAddress: string, contractAddress: string, newAdminAddress: string) => {
    // Prepare proposal metadata
    const lambdaFunction    = [ 
        { "prim": "DROP" },
        { "prim": "PUSH",
            "args":
            [ { "prim": "address" },
                { "string": `${contractAddress}` } ] },
        { "prim": "CONTRACT", "args": [ { "prim": "address" } ],
            "annots": [ "%setGovernance" ] },
        { "prim": "IF_NONE",
            "args":
            [ [ { "prim": "PUSH",
                    "args": [ { "prim": "nat" }, { "int": "24" } ] },
                { "prim": "FAILWITH" } ], [] ] },
        { "prim": "PUSH",
            "args": [ { "prim": "mutez" }, { "int": "0" } ] },
        { "prim": "PUSH",
            "args":
            [ { "prim": "address" },
                { "string":`${newAdminAddress}` } ] },
        { "prim": "TRANSFER_TOKENS" },
        { "prim": "NIL", "args": [ { "prim": "operation" } ] },
        { "prim": "SWAP" }, { "prim": "CONS" } 
    ];    
    return await packLambdaFunction(tezos, governanceProxyContractAddress, lambdaFunction)
}

export const setName  = async(tezos: TezosToolkit, governanceProxyContractAddress: string, contractAddress: string, newName: string) => {
    // Prepare proposal metadata
    const lambdaFunction    = [ 
        { "prim": "DROP" },
        { "prim": "PUSH",
        "args":
            [ { "prim": "address" },
            { "string": `${contractAddress}` } ] },
        { "prim": "CONTRACT", "args": [ { "prim": "string" } ],
        "annots": [ "%setName" ] },
        { "prim": "IF_NONE",
        "args":
            [ [ { "prim": "PUSH",
                "args": [ { "prim": "nat" }, { "int": "0" } ] },
                { "prim": "FAILWITH" } ], [] ] },
        { "prim": "PUSH",
        "args": [ { "prim": "mutez" }, { "int": "0" } ] },
        { "prim": "PUSH",
        "args":
            [ { "prim": "string" }, { "string": `${newName}` } ] },
        { "prim": "TRANSFER_TOKENS" },
        { "prim": "NIL", "args": [ { "prim": "operation" } ] },
        { "prim": "SWAP" }, { "prim": "CONS" }
    ];    
    return await packLambdaFunction(tezos, governanceProxyContractAddress, lambdaFunction)
}

export const setLambda  = async(tezos: TezosToolkit, governanceProxyContractAddress: string, contractAddress: string, lambdaName: string, lambdaBytes: string) => {
    // Prepare proposal metadata
    const lambdaFunction    = [ 
        { "prim": "DROP" },
        { "prim": "PUSH",
        "args":
            [ { "prim": "address" },
            { "string": `${contractAddress}` } ] },
        { "prim": "CONTRACT",
        "args":
            [ { "prim": "pair",
                "args":
                [ { "prim": "string", "annots": [ "%name" ] },
                    { "prim": "bytes",
                    "annots": [ "%func_bytes" ] } ] } ],
        "annots": [ "%setLambda" ] },
        { "prim": "IF_NONE",
        "args":
            [ [ { "prim": "PUSH",
                "args": [ { "prim": "nat" }, { "int": "0" } ] },
                { "prim": "FAILWITH" } ], [] ] },
        { "prim": "PUSH",
        "args": [ { "prim": "mutez" }, { "int": "0" } ] },
        { "prim": "PUSH",
        "args":
            [ { "prim": "bytes" },
            { "bytes": `${lambdaBytes}` } ] },
        { "prim": "PUSH",
        "args":
            [ { "prim": "string" }, { "string": `${lambdaName}` } ] },
        { "prim": "PAIR" }, { "prim": "TRANSFER_TOKENS" },
        { "prim": "NIL", "args": [ { "prim": "operation" } ] },
        { "prim": "SWAP" }, { "prim": "CONS" }
    ];    
    return await packLambdaFunction(tezos, governanceProxyContractAddress, lambdaFunction)
}

export const setProductLambda  = async(tezos: TezosToolkit, governanceProxyContractAddress: string, contractAddress: string, lambdaName: string, lambdaBytes: string) => {
    // Prepare proposal metadata
    const lambdaFunction    = [ 
        { "prim": "DROP" },
        { "prim": "PUSH",
        "args":
            [ { "prim": "address" },
            { "string": `${contractAddress}` } ] },
        { "prim": "CONTRACT",
        "args":
            [ { "prim": "pair",
                "args":
                [ { "prim": "string", "annots": [ "%name" ] },
                    { "prim": "bytes",
                    "annots": [ "%func_bytes" ] } ] } ],
        "annots": [ "%setProductLambda" ] },
        { "prim": "IF_NONE",
        "args":
            [ [ { "prim": "PUSH",
                "args": [ { "prim": "nat" }, { "int": "0" } ] },
                { "prim": "FAILWITH" } ], [] ] },
        { "prim": "PUSH",
        "args": [ { "prim": "mutez" }, { "int": "0" } ] },
        { "prim": "PUSH",
        "args":
            [ { "prim": "bytes" },
            { "bytes": `${lambdaBytes}` } ] },
        { "prim": "PUSH",
        "args":
            [ { "prim": "string" }, { "string": `${lambdaName}` } ] },
        { "prim": "PAIR" }, { "prim": "TRANSFER_TOKENS" },
        { "prim": "NIL", "args": [ { "prim": "operation" } ] },
        { "prim": "SWAP" }, { "prim": "CONS" }
    ];    
    return await packLambdaFunction(tezos, governanceProxyContractAddress, lambdaFunction)
}

export const updateMetadata  = async(tezos: TezosToolkit, governanceProxyContractAddress: string, contractAddress: string, metadataKey: string, metadataHash: string) => {
    // Prepare proposal metadata
    const lambdaFunction    = [ 
        { "prim": "DROP" },
        { "prim": "PUSH",
        "args":
            [ { "prim": "address" },
            { "string": `${contractAddress}` } ] },
        { "prim": "CONTRACT",
        "args":
            [ { "prim": "pair",
                "args":
                [ { "prim": "string",
                    "annots": [ "%metadataKey" ] },
                    { "prim": "bytes",
                    "annots": [ "%metadataHash" ] } ] } ],
        "annots": [ "%updateMetadata" ] },
        { "prim": "IF_NONE",
        "args":
            [ [ { "prim": "PUSH",
                "args": [ { "prim": "nat" }, { "int": "0" } ] },
                { "prim": "FAILWITH" } ], [] ] },
        { "prim": "PUSH",
        "args": [ { "prim": "mutez" }, { "int": "0" } ] },
        { "prim": "PUSH",
        "args":
            [ { "prim": "bytes" },
            { "bytes": `${metadataHash}` } ] },
        { "prim": "PUSH",
        "args": [ { "prim": "string" }, { "string": `${metadataKey}` } ] },
        { "prim": "PAIR" }, { "prim": "TRANSFER_TOKENS" },
        { "prim": "NIL", "args": [ { "prim": "operation" } ] },
        { "prim": "SWAP" }, { "prim": "CONS" }
    ];    
    return await packLambdaFunction(tezos, governanceProxyContractAddress, lambdaFunction)
}

export const updateWhitelistContracts  = async(tezos: TezosToolkit, governanceProxyContractAddress: string, contractAddress: string, whitelistContractName: string, whitelistContractAddress: string) => {
    // Prepare proposal metadata
    const lambdaFunction    = [ 
        { "prim": "DROP" },
        { "prim": "PUSH",
        "args":
            [ { "prim": "address" },
            { "string": `${contractAddress}` } ] },
        { "prim": "CONTRACT",
        "args":
            [ { "prim": "pair",
                "args":
                [ { "prim": "string",
                    "annots": [ "%whitelistContractName" ] },
                    { "prim": "address",
                    "annots": [ "%whitelistContractAddress" ] } ] } ],
        "annots": [ "%updateWhitelistContracts" ] },
        { "prim": "IF_NONE",
        "args":
            [ [ { "prim": "PUSH",
                "args": [ { "prim": "nat" }, { "int": "0" } ] },
                { "prim": "FAILWITH" } ], [] ] },
        { "prim": "PUSH",
        "args": [ { "prim": "mutez" }, { "int": "0" } ] },
        { "prim": "PUSH",
        "args":
            [ { "prim": "address" },
            { "string": `${whitelistContractAddress}` } ] },
        { "prim": "PUSH",
        "args":
            [ { "prim": "string" }, { "string": `${whitelistContractName}` } ] },
        { "prim": "PAIR" }, { "prim": "TRANSFER_TOKENS" },
        { "prim": "NIL", "args": [ { "prim": "operation" } ] },
        { "prim": "SWAP" }, { "prim": "CONS" }
    ];    
    return await packLambdaFunction(tezos, governanceProxyContractAddress, lambdaFunction)
}

export const updateGeneralContracts  = async(tezos: TezosToolkit, governanceProxyContractAddress: string, contractAddress: string, generalContractName: string, generalContractAddress: string) => {
    // Prepare proposal metadata
    const lambdaFunction    = [ 
        { "prim": "DROP" },
        { "prim": "PUSH",
        "args":
            [ { "prim": "address" },
            { "string": `${contractAddress}` } ] },
        { "prim": "CONTRACT",
        "args":
            [ { "prim": "pair",
                "args":
                [ { "prim": "string",
                    "annots": [ "%generalContractName" ] },
                    { "prim": "address",
                    "annots": [ "%generalContractAddress" ] } ] } ],
        "annots": [ "%updateGeneralContracts" ] },
        { "prim": "IF_NONE",
        "args":
            [ [ { "prim": "PUSH",
                "args": [ { "prim": "nat" }, { "int": "0" } ] },
                { "prim": "FAILWITH" } ], [] ] },
        { "prim": "PUSH",
        "args": [ { "prim": "mutez" }, { "int": "0" } ] },
        { "prim": "PUSH",
        "args":
            [ { "prim": "address" },
            { "string": `${generalContractAddress}` } ] },
        { "prim": "PUSH",
        "args":
            [ { "prim": "string" }, { "string": `${generalContractName}` } ] },
        { "prim": "PAIR" }, { "prim": "TRANSFER_TOKENS" },
        { "prim": "NIL", "args": [ { "prim": "operation" } ] },
        { "prim": "SWAP" }, { "prim": "CONS" }
    ];    
    return await packLambdaFunction(tezos, governanceProxyContractAddress, lambdaFunction)
}

export const updateWhitelistTokenContracts  = async(tezos: TezosToolkit, governanceProxyContractAddress: string, contractAddress: string, tokenContractName: string, tokenContractAddress: string) => {
    // Prepare proposal metadata
    const lambdaFunction    = [ 
        { "prim": "DROP" },
        { "prim": "PUSH",
        "args":
            [ { "prim": "address" },
            { "string": `${contractAddress}` } ] },
        { "prim": "CONTRACT",
        "args":
            [ { "prim": "pair",
                "args":
                [ { "prim": "string",
                    "annots": [ "%tokenContractName" ] },
                    { "prim": "address",
                    "annots": [ "%tokenContractAddress" ] } ] } ],
        "annots": [ "%updateWhitelistTokenContracts" ] },
        { "prim": "IF_NONE",
        "args":
            [ [ { "prim": "PUSH",
                "args": [ { "prim": "nat" }, { "int": "0" } ] },
                { "prim": "FAILWITH" } ], [] ] },
        { "prim": "PUSH",
        "args": [ { "prim": "mutez" }, { "int": "0" } ] },
        { "prim": "PUSH",
        "args":
            [ { "prim": "address" },
            { "string": `${tokenContractAddress}` } ] },
        { "prim": "PUSH",
        "args":
            [ { "prim": "string" }, { "string": `${tokenContractName}` } ] },
        { "prim": "PAIR" }, { "prim": "TRANSFER_TOKENS" },
        { "prim": "NIL", "args": [ { "prim": "operation" } ] },
        { "prim": "SWAP" }, { "prim": "CONS" }
    ];    
    return await packLambdaFunction(tezos, governanceProxyContractAddress, lambdaFunction)
}

export const pauseAll  = async(tezos: TezosToolkit, governanceProxyContractAddress: string, contractAddress: string) => {
    // Prepare proposal metadata
    const lambdaFunction    = [ 
        { "prim": "DROP" },
        { "prim": "PUSH",
        "args":
            [ { "prim": "address" },
            { "string": `${contractAddress}` } ] },
        { "prim": "CONTRACT", "args": [ { "prim": "unit" } ],
        "annots": [ "%pauseAll" ] },
        { "prim": "IF_NONE",
        "args":
            [ [ { "prim": "PUSH",
                "args": [ { "prim": "nat" }, { "int": "0" } ] },
                { "prim": "FAILWITH" } ], [] ] },
        { "prim": "PUSH",
        "args": [ { "prim": "mutez" }, { "int": "0" } ] },
        { "prim": "UNIT" }, { "prim": "TRANSFER_TOKENS" },
        { "prim": "NIL", "args": [ { "prim": "operation" } ] },
        { "prim": "SWAP" }, { "prim": "CONS" }
    ];    
    return await packLambdaFunction(tezos, governanceProxyContractAddress, lambdaFunction)
}

export const unpauseAll  = async(tezos: TezosToolkit, governanceProxyContractAddress: string, contractAddress: string) => {
    // Prepare proposal metadata
    const lambdaFunction    = [ 
        { "prim": "DROP" },
        { "prim": "PUSH",
        "args":
            [ { "prim": "address" },
            { "string": `${contractAddress}` } ] },
        { "prim": "CONTRACT", "args": [ { "prim": "unit" } ],
        "annots": [ "%unpauseAll" ] },
        { "prim": "IF_NONE",
        "args":
            [ [ { "prim": "PUSH",
                "args": [ { "prim": "nat" }, { "int": "0" } ] },
                { "prim": "FAILWITH" } ], [] ] },
        { "prim": "PUSH",
        "args": [ { "prim": "mutez" }, { "int": "0" } ] },
        { "prim": "UNIT" }, { "prim": "TRANSFER_TOKENS" },
        { "prim": "NIL", "args": [ { "prim": "operation" } ] },
        { "prim": "SWAP" }, { "prim": "CONS" }
    ];    
    return await packLambdaFunction(tezos, governanceProxyContractAddress, lambdaFunction)
}

export const updateWhitelistDevelopers  = async(tezos: TezosToolkit, governanceProxyContractAddress: string, contractAddress: string, developerAddress: string) => {
    // Prepare proposal metadata
    const lambdaFunction    = [ 
        { "prim": "DROP" },
        { "prim": "PUSH",
        "args":
            [ { "prim": "address" },
            { "string": `${contractAddress}` } ] },
        { "prim": "CONTRACT", "args": [ { "prim": "address" } ],
        "annots": [ "%updateWhitelistDevelopers" ] },
        { "prim": "IF_NONE",
        "args":
            [ [ { "prim": "PUSH",
                "args": [ { "prim": "nat" }, { "int": "0" } ] },
                { "prim": "FAILWITH" } ], [] ] },
        { "prim": "PUSH",
        "args": [ { "prim": "mutez" }, { "int": "0" } ] },
        { "prim": "PUSH",
        "args":
            [ { "prim": "address" },
            { "string": `${developerAddress}` } ] },
        { "prim": "TRANSFER_TOKENS" },
        { "prim": "NIL", "args": [ { "prim": "operation" } ] },
        { "prim": "SWAP" }, { "prim": "CONS" }
    ];    
    return await packLambdaFunction(tezos, governanceProxyContractAddress, lambdaFunction)
}

export const setGovernanceProxy  = async(tezos: TezosToolkit, governanceProxyContractAddress: string, contractAddress: string, newGovernanceProxyContractAddress: string) => {
    // Prepare proposal metadata
    const lambdaFunction    = [ 
        { "prim": "DROP" },
        { "prim": "PUSH",
        "args":
            [ { "prim": "address" },
            { "string": `${contractAddress}` } ] },
        { "prim": "CONTRACT", "args": [ { "prim": "address" } ],
        "annots": [ "%setGovernanceProxy" ] },
        { "prim": "IF_NONE",
        "args":
            [ [ { "prim": "PUSH",
                "args": [ { "prim": "nat" }, { "int": "0" } ] },
                { "prim": "FAILWITH" } ], [] ] },
        { "prim": "PUSH",
        "args": [ { "prim": "mutez" }, { "int": "0" } ] },
        { "prim": "PUSH",
        "args":
            [ { "prim": "address" },
            { "string": `${newGovernanceProxyContractAddress}` } ] },
        { "prim": "TRANSFER_TOKENS" },
        { "prim": "NIL", "args": [ { "prim": "operation" } ] },
        { "prim": "SWAP" }, { "prim": "CONS" }
    ];    
    return await packLambdaFunction(tezos, governanceProxyContractAddress, lambdaFunction)
}

export const createFarm = async(tezos: TezosToolkit, governanceProxyContractAddress: string, contractAddress: string, farmName: string, addToGeneralContracts: boolean, forceRewardFromTransfer: boolean, infinite: boolean, totalBlocks: number, currentRewardPerBlock: number, metadataBytes: string, lpTokenAddress: string, lpTokenId: number, lpTokenStandard: "FA12" | "FA2") => {
    // Prepare proposal metadata
    const lambdaFunction    = [ 
        { "prim": "DROP" },
        { "prim": "PUSH",
        "args":
            [ { "prim": "address" },
            { "string": `${contractAddress}` } ] },
        { "prim": "CONTRACT",
        "args":
            [ { "prim": "pair",
                "args":
                [ { "prim": "string", "annots": [ "%name" ] },
                    { "prim": "bool",
                    "annots": [ "%addToGeneralContracts" ] },
                    { "prim": "bool",
                    "annots": [ "%forceRewardFromTransfer" ] },
                    { "prim": "bool", "annots": [ "%infinite" ] },
                    { "prim": "pair",
                    "args":
                        [ { "prim": "nat",
                            "annots": [ "%totalBlocks" ] },
                        { "prim": "nat",
                            "annots": [ "%currentRewardPerBlock" ] } ],
                    "annots": [ "%plannedRewards" ] },
                    { "prim": "bytes", "annots": [ "%metadata" ] },
                    { "prim": "pair",
                    "args":
                        [ { "prim": "address",
                            "annots": [ "%tokenAddress" ] },
                        { "prim": "nat",
                            "annots": [ "%tokenId" ] },
                        { "prim": "or",
                            "args":
                            [ { "prim": "unit",
                                "annots": [ "%fa12" ] },
                                { "prim": "unit",
                                "annots": [ "%fa2" ] } ],
                            "annots": [ "%tokenStandard" ] } ],
                    "annots": [ "%lpToken" ] } ] } ],
        "annots": [ "%createFarm" ] },
        { "prim": "IF_NONE",
        "args":
            [ [ { "prim": "PUSH",
                "args": [ { "prim": "nat" }, { "int": "0" } ] },
                { "prim": "FAILWITH" } ], [] ] },
        { "prim": "PUSH",
        "args": [ { "prim": "mutez" }, { "int": "0" } ] },
        { "prim": "UNIT" },
        { "prim": lpTokenStandard == "FA2" ? "RIGHT" : "LEFT", "args": [ { "prim": "unit" } ] },
        { "prim": "PUSH",
        "args": [ { "prim": "nat" }, { "int": `${lpTokenId.toString()}` } ] },
        { "prim": "PUSH",
        "args":
            [ { "prim": "address" },
            { "string": `${lpTokenAddress}` } ] },
        { "prim": "PAIR", "args": [ { "int": "3" } ] },
        { "prim": "PUSH",
        "args":
            [ { "prim": "bytes" },
            { "bytes": `${metadataBytes}` } ] },
        { "prim": "PUSH",
        "args": [ { "prim": "nat" }, { "int": `${currentRewardPerBlock.toString()}` } ] },
        { "prim": "PUSH",
        "args": [ { "prim": "nat" }, { "int": `${totalBlocks.toString()}` } ] },
        { "prim": "PAIR" },
        { "prim": "PUSH",
        "args": [ { "prim": "bool" }, { "prim": infinite ? "True" : "False" } ] },
        { "prim": "PUSH",
        "args": [ { "prim": "bool" }, { "prim": forceRewardFromTransfer ? "True" : "False" } ] },
        { "prim": "PUSH",
        "args": [ { "prim": "bool" }, { "prim": addToGeneralContracts ? "True" : "False" } ] },
        { "prim": "PUSH",
        "args":
            [ { "prim": "string" }, { "string": `${farmName}` } ] },
        { "prim": "PAIR", "args": [ { "int": "7" } ] },
        { "prim": "TRANSFER_TOKENS" },
        { "prim": "NIL", "args": [ { "prim": "operation" } ] },
        { "prim": "SWAP" }, { "prim": "CONS" }
    ]; 
    return await packLambdaFunction(tezos, governanceProxyContractAddress, lambdaFunction)
}

export const initFarm = async(tezos: TezosToolkit, governanceProxyContractAddress: string, contractAddress: string, forceRewardFromTransfer: boolean, infinite: boolean, totalBlocks: number, currentRewardPerBlock: number) => {
    // Prepare proposal metadata
    const lambdaFunction    = [ 
        { "prim": "DROP" },
        { "prim": "PUSH",
        "args":
            [ { "prim": "address" },
            { "string": `${contractAddress}` } ] },
        { "prim": "CONTRACT",
        "args":
            [ { "prim": "pair",
                "args":
                [ { "prim": "nat", "annots": [ "%totalBlocks" ] },
                    { "prim": "nat",
                    "annots": [ "%currentRewardPerBlock" ] },
                    { "prim": "bool",
                    "annots": [ "%forceRewardFromTransfer" ] },
                    { "prim": "bool", "annots": [ "%infinite" ] } ] } ],
        "annots": [ "%initFarm" ] },
        { "prim": "IF_NONE",
        "args":
            [ [ { "prim": "PUSH",
                "args": [ { "prim": "nat" }, { "int": "0" } ] },
                { "prim": "FAILWITH" } ], [] ] },
        { "prim": "PUSH",
        "args": [ { "prim": "mutez" }, { "int": "0" } ] },
        { "prim": "PUSH",
        "args": [ { "prim": "bool" }, { "prim": infinite ? "True" : "False" } ] },
        { "prim": "PUSH",
        "args": [ { "prim": "bool" }, { "prim": forceRewardFromTransfer ? "True" : "False" } ] },
        { "prim": "PUSH",
        "args": [ { "prim": "nat" }, { "int": `${currentRewardPerBlock.toString()}` } ] },
        { "prim": "PUSH",
        "args": [ { "prim": "nat" }, { "int": `${totalBlocks.toString()}` } ] },
        { "prim": "PAIR", "args": [ { "int": "4" } ] },
        { "prim": "TRANSFER_TOKENS" },
        { "prim": "NIL", "args": [ { "prim": "operation" } ] },
        { "prim": "SWAP" }, { "prim": "CONS" }
    ]; 
    return await packLambdaFunction(tezos, governanceProxyContractAddress, lambdaFunction)
}

export const closeFarm = async(tezos: TezosToolkit, governanceProxyContractAddress: string, contractAddress: string) => {
    // Prepare proposal metadata
    const lambdaFunction    = [ 
        { "prim": "DROP" },
        { "prim": "PUSH",
        "args":
            [ { "prim": "address" },
            { "string": `${contractAddress}` } ] },
        { "prim": "CONTRACT", "args": [ { "prim": "unit" } ],
        "annots": [ "%closeFarm" ] },
        { "prim": "IF_NONE",
        "args":
            [ [ { "prim": "PUSH",
                "args": [ { "prim": "nat" }, { "int": "0" } ] },
                { "prim": "FAILWITH" } ], [] ] },
        { "prim": "PUSH",
        "args": [ { "prim": "mutez" }, { "int": "0" } ] },
        { "prim": "UNIT" }, { "prim": "TRANSFER_TOKENS" },
        { "prim": "NIL", "args": [ { "prim": "operation" } ] },
        { "prim": "SWAP" }, { "prim": "CONS" }
    ]; 
    return await packLambdaFunction(tezos, governanceProxyContractAddress, lambdaFunction)
}

export const createTreasury = async(tezos: TezosToolkit, governanceProxyContractAddress: string, contractAddress: string, treasuryName: string, addToGeneralContracts: boolean, metadataBytes: string) => {
    // Prepare proposal metadata
    const lambdaFunction    = [ 
        { "prim": "DROP" },
        { "prim": "PUSH",
        "args":
            [ { "prim": "address" },
            { "string": `${contractAddress}` } ] },
        { "prim": "CONTRACT",
        "args":
            [ { "prim": "pair",
                "args":
                [ { "prim": "string", "annots": [ "%name" ] },
                    { "prim": "bool",
                    "annots": [ "%addToGeneralContracts" ] },
                    { "prim": "bytes", "annots": [ "%metadata" ] } ] } ],
        "annots": [ "%createTreasury" ] },
        { "prim": "IF_NONE",
        "args":
            [ [ { "prim": "PUSH",
                "args": [ { "prim": "nat" }, { "int": "0" } ] },
                { "prim": "FAILWITH" } ], [] ] },
        { "prim": "PUSH",
        "args": [ { "prim": "mutez" }, { "int": "0" } ] },
        { "prim": "PUSH",
        "args":
            [ { "prim": "bytes" },
            { "bytes": `${metadataBytes}` } ] },
        { "prim": "PUSH",
        "args": [ { "prim": "bool" }, { "prim": addToGeneralContracts ? "True" : "False" } ] },
        { "prim": "PUSH",
        "args":
            [ { "prim": "string" }, { "string": `${treasuryName}` } ] },
        { "prim": "PAIR", "args": [ { "int": "3" } ] },
        { "prim": "TRANSFER_TOKENS" },
        { "prim": "NIL", "args": [ { "prim": "operation" } ] },
        { "prim": "SWAP" }, { "prim": "CONS" }
    ]; 
    return await packLambdaFunction(tezos, governanceProxyContractAddress, lambdaFunction)
}

export const mintMvkAndTransfer = async(tezos: TezosToolkit, governanceProxyContractAddress: string, contractAddress: string, to_: string, amt: number) => {
    // Prepare proposal metadata
    const lambdaFunction    = [ 
        { "prim": "DROP" },
        { "prim": "PUSH",
        "args":
            [ { "prim": "address" },
            { "string": `${contractAddress}` } ] },
        { "prim": "CONTRACT",
        "args":
            [ { "prim": "pair",
                "args":
                [ { "prim": "address", "annots": [ "%to_" ] },
                    { "prim": "nat", "annots": [ "%amt" ] } ] } ],
        "annots": [ "%mintMvkAndTransfer" ] },
        { "prim": "IF_NONE",
        "args":
            [ [ { "prim": "PUSH",
                "args": [ { "prim": "nat" }, { "int": "0" } ] },
                { "prim": "FAILWITH" } ], [] ] },
        { "prim": "PUSH",
        "args": [ { "prim": "mutez" }, { "int": "0" } ] },
        { "prim": "PUSH",
        "args": [ { "prim": "nat" }, { "int": `${amt.toString()}` } ] },
        { "prim": "PUSH",
        "args":
            [ { "prim": "address" },
            { "string": `${to_}` } ] },
        { "prim": "PAIR" }, { "prim": "TRANSFER_TOKENS" },
        { "prim": "NIL", "args": [ { "prim": "operation" } ] },
        { "prim": "SWAP" }, { "prim": "CONS" }
    ]; 
    return await packLambdaFunction(tezos, governanceProxyContractAddress, lambdaFunction)
}

export const stakeMvk = async(tezos: TezosToolkit, governanceProxyContractAddress: string, contractAddress: string, amt: number) => {
    // Prepare proposal metadata
    const lambdaFunction    = [ 
        { "prim": "DROP" },
        { "prim": "PUSH",
        "args":
            [ { "prim": "address" },
            { "string": `${contractAddress}` } ] },
        { "prim": "CONTRACT", "args": [ { "prim": "nat" } ],
        "annots": [ "%stakeMvk" ] },
        { "prim": "IF_NONE",
        "args":
            [ [ { "prim": "PUSH",
                "args": [ { "prim": "nat" }, { "int": "0" } ] },
                { "prim": "FAILWITH" } ], [] ] },
        { "prim": "PUSH",
        "args": [ { "prim": "mutez" }, { "int": "0" } ] },
        { "prim": "PUSH",
        "args": [ { "prim": "nat" }, { "int": `${amt.toString()}` } ] },
        { "prim": "TRANSFER_TOKENS" },
        { "prim": "NIL", "args": [ { "prim": "operation" } ] },
        { "prim": "SWAP" }, { "prim": "CONS" }
    ]; 
    return await packLambdaFunction(tezos, governanceProxyContractAddress, lambdaFunction)
}

export const unstakeMvk = async(tezos: TezosToolkit, governanceProxyContractAddress: string, contractAddress: string, amt: number) => {
    // Prepare proposal metadata
    const lambdaFunction    = [ 
        { "prim": "DROP" },
        { "prim": "PUSH",
        "args":
            [ { "prim": "address" },
            { "string": `${contractAddress}` } ] },
        { "prim": "CONTRACT", "args": [ { "prim": "nat" } ],
        "annots": [ "%unstakeMvk" ] },
        { "prim": "IF_NONE",
        "args":
            [ [ { "prim": "PUSH",
                "args": [ { "prim": "nat" }, { "int": "0" } ] },
                { "prim": "FAILWITH" } ], [] ] },
        { "prim": "PUSH",
        "args": [ { "prim": "mutez" }, { "int": "0" } ] },
        { "prim": "PUSH",
        "args": [ { "prim": "nat" }, { "int": `${amt.toString()}` } ] },
        { "prim": "TRANSFER_TOKENS" },
        { "prim": "NIL", "args": [ { "prim": "operation" } ] },
        { "prim": "SWAP" }, { "prim": "CONS" }
    ]; 
    return await packLambdaFunction(tezos, governanceProxyContractAddress, lambdaFunction)
}

export const updateInflationRate = async(tezos: TezosToolkit, governanceProxyContractAddress: string, contractAddress: string, inflationRate: number) => {
    // Prepare proposal metadata
    const lambdaFunction    = [ 
        { "prim": "DROP" },
        { "prim": "PUSH",
        "args":
            [ { "prim": "address" },
            { "string": `${contractAddress}` } ] },
        { "prim": "CONTRACT", "args": [ { "prim": "nat" } ],
        "annots": [ "%updateInflationRate" ] },
        { "prim": "IF_NONE",
        "args":
            [ [ { "prim": "PUSH",
                "args": [ { "prim": "nat" }, { "int": "0" } ] },
                { "prim": "FAILWITH" } ], [] ] },
        { "prim": "PUSH",
        "args": [ { "prim": "mutez" }, { "int": "0" } ] },
        { "prim": "PUSH",
        "args": [ { "prim": "nat" }, { "int": `${inflationRate.toString()}` } ] },
        { "prim": "TRANSFER_TOKENS" },
        { "prim": "NIL", "args": [ { "prim": "operation" } ] },
        { "prim": "SWAP" }, { "prim": "CONS" }
    ]; 
    return await packLambdaFunction(tezos, governanceProxyContractAddress, lambdaFunction)
}

export const triggerInflation = async(tezos: TezosToolkit, governanceProxyContractAddress: string, contractAddress: string) => {
    // Prepare proposal metadata
    const lambdaFunction    = [ 
        { "prim": "DROP" },
        { "prim": "PUSH",
        "args":
            [ { "prim": "address" },
            { "string": `${contractAddress}` } ] },
        { "prim": "CONTRACT", "args": [ { "prim": "unit" } ],
        "annots": [ "%triggerInflation" ] },
        { "prim": "IF_NONE",
        "args":
            [ [ { "prim": "PUSH",
                "args": [ { "prim": "nat" }, { "int": "0" } ] },
                { "prim": "FAILWITH" } ], [] ] },
        { "prim": "PUSH",
        "args": [ { "prim": "mutez" }, { "int": "0" } ] },
        { "prim": "UNIT" }, { "prim": "TRANSFER_TOKENS" },
        { "prim": "NIL", "args": [ { "prim": "operation" } ] },
        { "prim": "SWAP" }, { "prim": "CONS" }
    ]; 
    return await packLambdaFunction(tezos, governanceProxyContractAddress, lambdaFunction)
}

export const trackProductContract = async(tezos: TezosToolkit, governanceProxyContractAddress: string, contractAddress: string, productContractType: "Aggregator" | "Farm" | "Treasury", productContractAddress: string) => {
    // Prepare proposal metadata
    const entrypointToCall  = "%track" + productContractType;
    const lambdaFunction    = [ 
        { "prim": "DROP" },
        { "prim": "PUSH",
        "args":
            [ { "prim": "address" },
            { "string": `${contractAddress}` } ] },
        { "prim": "CONTRACT", "args": [ { "prim": "address" } ],
        "annots": [ `${entrypointToCall}` ] },
        { "prim": "IF_NONE",
        "args":
            [ [ { "prim": "PUSH",
                "args": [ { "prim": "nat" }, { "int": "0" } ] },
                { "prim": "FAILWITH" } ], [] ] },
        { "prim": "PUSH",
        "args": [ { "prim": "mutez" }, { "int": "0" } ] },
        { "prim": "PUSH",
        "args":
            [ { "prim": "address" },
            { "string": `${productContractAddress}` } ] },
        { "prim": "TRANSFER_TOKENS" },
        { "prim": "NIL", "args": [ { "prim": "operation" } ] },
        { "prim": "SWAP" }, { "prim": "CONS" }
    ]; 
    return await packLambdaFunction(tezos, governanceProxyContractAddress, lambdaFunction)
}

export const untrackProductContract = async(tezos: TezosToolkit, governanceProxyContractAddress: string, contractAddress: string, productContractType: "Aggregator" | "Farm" | "Treasury", productContractAddress: string) => {
    // Prepare proposal metadata
    const entrypointToCall  = "%untrack" + productContractType;
    const lambdaFunction    = [ 
        { "prim": "DROP" },
        { "prim": "PUSH",
        "args":
            [ { "prim": "address" },
            { "string": `${contractAddress}` } ] },
        { "prim": "CONTRACT", "args": [ { "prim": "address" } ],
        "annots": [ `${entrypointToCall}` ] },
        { "prim": "IF_NONE",
        "args":
            [ [ { "prim": "PUSH",
                "args": [ { "prim": "nat" }, { "int": "0" } ] },
                { "prim": "FAILWITH" } ], [] ] },
        { "prim": "PUSH",
        "args": [ { "prim": "mutez" }, { "int": "0" } ] },
        { "prim": "PUSH",
        "args":
            [ { "prim": "address" },
            { "string": `${productContractAddress}` } ] },
        { "prim": "TRANSFER_TOKENS" },
        { "prim": "NIL", "args": [ { "prim": "operation" } ] },
        { "prim": "SWAP" }, { "prim": "CONS" }
    ]; 
    return await packLambdaFunction(tezos, governanceProxyContractAddress, lambdaFunction)
}

export const addVestee = async(tezos: TezosToolkit, governanceProxyContractAddress: string, contractAddress: string, vesteeAddress: string, totalAllocatedAmount: number, cliffInMonths: number, vestingInMonths: number) => {
    // Prepare proposal metadata
    const lambdaFunction    = [ 
        { "prim": "DROP" },
        { "prim": "PUSH",
        "args":
            [ { "prim": "address" },
            { "string": `${contractAddress}` } ] },
        { "prim": "CONTRACT",
        "args":
            [ { "prim": "pair",
                "args":
                [ { "prim": "address",
                    "annots": [ "%vesteeAddress" ] },
                    { "prim": "nat",
                    "annots": [ "%totalAllocatedAmount" ] },
                    { "prim": "nat",
                    "annots": [ "%cliffInMonths" ] },
                    { "prim": "nat",
                    "annots": [ "%vestingInMonths" ] } ] } ],
        "annots": [ "%addVestee" ] },
        { "prim": "IF_NONE",
        "args":
            [ [ { "prim": "PUSH",
                "args": [ { "prim": "nat" }, { "int": "0" } ] },
                { "prim": "FAILWITH" } ], [] ] },
        { "prim": "PUSH",
        "args": [ { "prim": "mutez" }, { "int": "0" } ] },
        { "prim": "PUSH",
        "args": [ { "prim": "nat" }, { "int": `${vestingInMonths.toString()}` } ] },
        { "prim": "PUSH",
        "args": [ { "prim": "nat" }, { "int": `${cliffInMonths.toString()}` } ] },
        { "prim": "PUSH",
        "args": [ { "prim": "nat" }, { "int": `${totalAllocatedAmount.toString()}` } ] },
        { "prim": "PUSH",
        "args":
            [ { "prim": "address" },
            { "string": `${vesteeAddress}` } ] },
        { "prim": "PAIR", "args": [ { "int": "4" } ] },
        { "prim": "TRANSFER_TOKENS" },
        { "prim": "NIL", "args": [ { "prim": "operation" } ] },
        { "prim": "SWAP" }, { "prim": "CONS" }
    ]; 
    return await packLambdaFunction(tezos, governanceProxyContractAddress, lambdaFunction)
}

export const removeVestee = async(tezos: TezosToolkit, governanceProxyContractAddress: string, contractAddress: string, vesteeAddress: string) => {
    // Prepare proposal metadata
    const lambdaFunction    = [ 
        { "prim": "DROP" },
        { "prim": "PUSH",
        "args":
            [ { "prim": "address" },
            { "string": `${contractAddress}` } ] },
        { "prim": "CONTRACT", "args": [ { "prim": "address" } ],
        "annots": [ "%removeVestee" ] },
        { "prim": "IF_NONE",
        "args":
            [ [ { "prim": "PUSH",
                "args": [ { "prim": "nat" }, { "int": "0" } ] },
                { "prim": "FAILWITH" } ], [] ] },
        { "prim": "PUSH",
        "args": [ { "prim": "mutez" }, { "int": "0" } ] },
        { "prim": "PUSH",
        "args":
            [ { "prim": "address" },
            { "string": `${vesteeAddress}` } ] },
        { "prim": "TRANSFER_TOKENS" },
        { "prim": "NIL", "args": [ { "prim": "operation" } ] },
        { "prim": "SWAP" }, { "prim": "CONS" }
    ]; 
    return await packLambdaFunction(tezos, governanceProxyContractAddress, lambdaFunction)
}

export const updateVestee = async(tezos: TezosToolkit, governanceProxyContractAddress: string, contractAddress: string, vesteeAddress: string, newTotalAllocatedAmount: number, newCliffInMonths: number, newVestingInMonths: number) => {
    // Prepare proposal metadata
    const lambdaFunction    = [ 
        { "prim": "DROP" },
        { "prim": "PUSH",
        "args":
            [ { "prim": "address" },
            { "string": `${contractAddress}` } ] },
        { "prim": "CONTRACT",
        "args":
            [ { "prim": "pair",
                "args":
                [ { "prim": "address",
                    "annots": [ "%vesteeAddress" ] },
                    { "prim": "nat",
                    "annots": [ "%newTotalAllocatedAmount" ] },
                    { "prim": "nat",
                    "annots": [ "%newCliffInMonths" ] },
                    { "prim": "nat",
                    "annots": [ "%newVestingInMonths" ] } ] } ],
        "annots": [ "%updateVestee" ] },
        { "prim": "IF_NONE",
        "args":
            [ [ { "prim": "PUSH",
                "args": [ { "prim": "nat" }, { "int": "0" } ] },
                { "prim": "FAILWITH" } ], [] ] },
        { "prim": "PUSH",
        "args": [ { "prim": "mutez" }, { "int": "0" } ] },
        { "prim": "PUSH",
        "args": [ { "prim": "nat" }, { "int": `${newVestingInMonths.toString()}` } ] },
        { "prim": "PUSH",
        "args": [ { "prim": "nat" }, { "int": `${newCliffInMonths.toString()}` } ] },
        { "prim": "PUSH",
        "args": [ { "prim": "nat" }, { "int": `${newTotalAllocatedAmount.toString()}` } ] },
        { "prim": "PUSH",
        "args":
            [ { "prim": "address" },
            { "string": `${vesteeAddress}` } ] },
        { "prim": "PAIR", "args": [ { "int": "4" } ] },
        { "prim": "TRANSFER_TOKENS" },
        { "prim": "NIL", "args": [ { "prim": "operation" } ] },
        { "prim": "SWAP" }, { "prim": "CONS" }
    ]; 
    return await packLambdaFunction(tezos, governanceProxyContractAddress, lambdaFunction)
}

export const toggleVesteeLock = async(tezos: TezosToolkit, governanceProxyContractAddress: string, contractAddress: string, vesteeAddress: string) => {
    // Prepare proposal metadata
    const lambdaFunction    = [ 
        { "prim": "DROP" },
        { "prim": "PUSH",
        "args":
            [ { "prim": "address" },
            { "string": `${contractAddress}` } ] },
        { "prim": "CONTRACT", "args": [ { "prim": "address" } ],
        "annots": [ "%toggleVesteeLock" ] },
        { "prim": "IF_NONE",
        "args":
            [ [ { "prim": "PUSH",
                "args": [ { "prim": "nat" }, { "int": "0" } ] },
                { "prim": "FAILWITH" } ], [] ] },
        { "prim": "PUSH",
        "args": [ { "prim": "mutez" }, { "int": "0" } ] },
        { "prim": "PUSH",
        "args":
            [ { "prim": "address" },
            { "string": `${vesteeAddress}` } ] },
        { "prim": "TRANSFER_TOKENS" },
        { "prim": "NIL", "args": [ { "prim": "operation" } ] },
        { "prim": "SWAP" }, { "prim": "CONS" }
    ]; 
    return await packLambdaFunction(tezos, governanceProxyContractAddress, lambdaFunction)
}

export const updateConfig = async(tezos: TezosToolkit, governanceProxyContractAddress: string, contractAddress: string, contractType: "Aggregator" | "AggregatorFactory" | "BreakGlass" | "Council" | "Delegation" | "Doorman" | "EmergencyGovernance" | "Farm" | "FarmFactory" | "Governance" | "GovernanceFinancial" | "GovernanceSatellite" | "LendingController" | "LendingControllerMockTime" | "TokenSale" | "TreasuryFactory" | "VaultFactory", configName: string, updatedValue: number, tokenSaleBuyOption: number = 0) => {
    // Prepare proposal metadata
    var lambdaFunction: any = undefined;
    switch(contractType) {
        case "Aggregator":
            lambdaFunction  = [
                { "prim": "DROP" },
                { "prim": "PUSH",
                "args":
                    [ { "prim": "address" },
                    { "string": `${contractAddress}` } ] },
                { "prim": "CONTRACT",
                "args":
                    [ { "prim": "pair",
                        "args":
                        [ { "prim": "nat",
                            "annots": [ "%updateConfigNewValue" ] },
                            { "prim": "or",
                            "args":
                                [ { "prim": "or",
                                    "args":
                                    [ { "prim": "or",
                                        "args":
                                            [ { "prim": "unit",
                                                "annots":
                                                [ "%configAlphaPercentPerThousand" ] },
                                            { "prim": "unit",
                                                "annots":
                                                [ "%configDecimals" ] } ] },
                                        { "prim": "or",
                                        "args":
                                            [ { "prim": "unit",
                                                "annots":
                                                [ "%configHeartBeatSeconds" ] },
                                            { "prim": "unit",
                                                "annots":
                                                [ "%configPercentOracleThreshold" ] } ] } ] },
                                { "prim": "or",
                                    "args":
                                    [ { "prim": "unit",
                                        "annots":
                                            [ "%configRewardAmountStakedMvk" ] },
                                        { "prim": "unit",
                                        "annots":
                                            [ "%configRewardAmountXtz" ] } ] } ],
                            "annots": [ "%updateConfigAction" ] } ] } ],
                "annots": [ "%updateConfig" ] },
                { "prim": "IF_NONE",
                "args":
                    [ [ { "prim": "PUSH",
                        "args": [ { "prim": "nat" }, { "int": "0" } ] },
                        { "prim": "FAILWITH" } ], [] ] },
                { "prim": "PUSH",
                "args": [ { "prim": "mutez" }, { "int": "0" } ] },
                { "prim": "UNIT" },
                { "prim": "RIGHT", "args": [ { "prim": "unit" } ] },
                { "prim": "LEFT",
                "args":
                    [ { "prim": "or",
                        "args": [ { "prim": "unit" }, { "prim": "unit" } ] } ] },
                { "prim": "LEFT",
                "args":
                    [ { "prim": "or",
                        "args": [ { "prim": "unit" }, { "prim": "unit" } ] } ] },
                { "prim": "PUSH",
                "args": [ { "prim": "nat" }, { "int": `${updatedValue.toString()}` } ] },
                { "prim": "PAIR" }, { "prim": "TRANSFER_TOKENS" },
                { "prim": "NIL", "args": [ { "prim": "operation" } ] },
                { "prim": "SWAP" }, { "prim": "CONS" }
            ]
            break;
        case "AggregatorFactory":
            lambdaFunction  = [
                { "prim": "DROP" },
                { "prim": "PUSH",
                "args":
                    [ { "prim": "address" },
                    { "string": `${contractAddress}` } ] },
                { "prim": "CONTRACT",
                "args":
                    [ { "prim": "pair",
                        "args":
                        [ { "prim": "nat",
                            "annots": [ "%updateConfigNewValue" ] },
                            { "prim": "or",
                            "args":
                                [ { "prim": "unit",
                                    "annots":
                                    [ "%configAggregatorNameMaxLength" ] },
                                { "prim": "unit",
                                    "annots": [ "%empty" ] } ],
                            "annots": [ "%updateConfigAction" ] } ] } ],
                "annots": [ "%updateConfig" ] },
                { "prim": "IF_NONE",
                "args":
                    [ [ { "prim": "PUSH",
                        "args": [ { "prim": "nat" }, { "int": "0" } ] },
                        { "prim": "FAILWITH" } ], [] ] },
                { "prim": "PUSH",
                "args": [ { "prim": "mutez" }, { "int": "0" } ] },
                { "prim": "UNIT" },
                { "prim": "LEFT", "args": [ { "prim": "unit" } ] },
                { "prim": "PUSH",
                "args": [ { "prim": "nat" }, { "int": `${updatedValue.toString()}` } ] },
                { "prim": "PAIR" }, { "prim": "TRANSFER_TOKENS" },
                { "prim": "NIL", "args": [ { "prim": "operation" } ] },
                { "prim": "SWAP" }, { "prim": "CONS" }
        ]
        break;
    case "BreakGlass":
        lambdaFunction  = [
            { "prim": "DROP" },
                { "prim": "PUSH",
                "args":
                    [ { "prim": "address" },
                    { "string": `${contractAddress}` } ] },
                { "prim": "CONTRACT",
                "args":
                    [ { "prim": "pair",
                        "args":
                        [ { "prim": "nat",
                            "annots": [ "%updateConfigNewValue" ] },
                            { "prim": "or",
                            "args":
                                [ { "prim": "or",
                                    "args":
                                    [ { "prim": "or",
                                        "args":
                                            [ { "prim": "unit",
                                                "annots":
                                                [ "%configActionExpiryDays" ] },
                                            { "prim": "unit",
                                                "annots":
                                                [ "%configCouncilImageMaxLength" ] } ] },
                                        { "prim": "or",
                                        "args":
                                            [ { "prim": "unit",
                                                "annots":
                                                [ "%configCouncilNameMaxLength" ] },
                                            { "prim": "unit",
                                                "annots":
                                                [ "%configCouncilWebsiteMaxLength" ] } ] } ] },
                                { "prim": "unit",
                                    "annots": [ "%configThreshold" ] } ],
                            "annots": [ "%updateConfigAction" ] } ] } ],
                "annots": [ "%updateConfig" ] },
                { "prim": "IF_NONE",
                "args":
                    [ [ { "prim": "PUSH",
                        "args": [ { "prim": "nat" }, { "int": "0" } ] },
                        { "prim": "FAILWITH" } ], [] ] },
                { "prim": "PUSH",
                "args": [ { "prim": "mutez" }, { "int": "0" } ] },
                { "prim": "UNIT" },
                { "prim": "RIGHT",
                "args":
                    [ { "prim": "or",
                        "args":
                        [ { "prim": "or",
                            "args":
                                [ { "prim": "unit" }, { "prim": "unit" } ] },
                            { "prim": "or",
                            "args":
                                [ { "prim": "unit" }, { "prim": "unit" } ] } ] } ] },
                { "prim": "PUSH",
                "args": [ { "prim": "nat" }, { "int": `${updatedValue.toString()}` } ] },
                { "prim": "PAIR" }, { "prim": "TRANSFER_TOKENS" },
                { "prim": "NIL", "args": [ { "prim": "operation" } ] },
                { "prim": "SWAP" }, { "prim": "CONS" }
            ]
            break;
        case "Council":
            lambdaFunction  = [
                { "prim": "DROP" },
                { "prim": "PUSH",
                "args":
                    [ { "prim": "address" },
                    { "string": `${contractAddress}` } ] },
                { "prim": "CONTRACT",
                "args":
                    [ { "prim": "pair",
                        "args":
                        [ { "prim": "nat",
                            "annots": [ "%updateConfigNewValue" ] },
                            { "prim": "or",
                            "args":
                                [ { "prim": "or",
                                    "args":
                                    [ { "prim": "or",
                                        "args":
                                            [ { "prim": "unit",
                                                "annots":
                                                [ "%configActionExpiryDays" ] },
                                            { "prim": "unit",
                                                "annots":
                                                [ "%configCouncilImageMaxLength" ] } ] },
                                        { "prim": "or",
                                        "args":
                                            [ { "prim": "unit",
                                                "annots":
                                                [ "%configCouncilNameMaxLength" ] },
                                            { "prim": "unit",
                                                "annots":
                                                [ "%configCouncilWebsiteMaxLength" ] } ] } ] },
                                { "prim": "or",
                                    "args":
                                    [ { "prim": "or",
                                        "args":
                                            [ { "prim": "unit",
                                                "annots":
                                                [ "%configRequestPurposeMaxLength" ] },
                                            { "prim": "unit",
                                                "annots":
                                                [ "%configRequestTokenNameMaxLength" ] } ] },
                                        { "prim": "unit",
                                        "annots": [ "%configThreshold" ] } ] } ],
                            "annots": [ "%updateConfigAction" ] } ] } ],
                "annots": [ "%updateConfig" ] },
                { "prim": "IF_NONE",
                "args":
                    [ [ { "prim": "PUSH",
                        "args": [ { "prim": "nat" }, { "int": "0" } ] },
                        { "prim": "FAILWITH" } ], [] ] },
                { "prim": "PUSH",
                "args": [ { "prim": "mutez" }, { "int": "0" } ] },
                { "prim": "UNIT" },
                { "prim": "RIGHT",
                "args":
                    [ { "prim": "or",
                        "args": [ { "prim": "unit" }, { "prim": "unit" } ] } ] },
                { "prim": "RIGHT",
                "args":
                    [ { "prim": "or",
                        "args":
                        [ { "prim": "or",
                            "args":
                                [ { "prim": "unit" }, { "prim": "unit" } ] },
                            { "prim": "or",
                            "args":
                                [ { "prim": "unit" }, { "prim": "unit" } ] } ] } ] },
                { "prim": "PUSH",
                "args": [ { "prim": "nat" }, { "int": `${updatedValue.toString()}` } ] },
                { "prim": "PAIR" }, { "prim": "TRANSFER_TOKENS" },
                { "prim": "NIL", "args": [ { "prim": "operation" } ] },
                { "prim": "SWAP" }, { "prim": "CONS" }
            ]
            break;
        case "Delegation":
            lambdaFunction  = [
                { "prim": "DROP" },
                { "prim": "PUSH",
                "args":
                    [ { "prim": "address" },
                    { "string": `${contractAddress}` } ] },
                { "prim": "CONTRACT",
                "args":
                    [ { "prim": "pair",
                        "args":
                        [ { "prim": "nat",
                            "annots": [ "%updateConfigNewValue" ] },
                            { "prim": "or",
                            "args":
                                [ { "prim": "or",
                                    "args":
                                    [ { "prim": "or",
                                        "args":
                                            [ { "prim": "unit",
                                                "annots":
                                                [ "%configDelegationRatio" ] },
                                            { "prim": "unit",
                                                "annots":
                                                [ "%configMaxSatellites" ] } ] },
                                        { "prim": "or",
                                        "args":
                                            [ { "prim": "unit",
                                                "annots":
                                                [ "%configMinimumStakedMvkBalance" ] },
                                            { "prim": "unit",
                                                "annots":
                                                [ "%configSatDescMaxLength" ] } ] } ] },
                                { "prim": "or",
                                    "args":
                                    [ { "prim": "or",
                                        "args":
                                            [ { "prim": "unit",
                                                "annots":
                                                [ "%configSatImageMaxLength" ] },
                                            { "prim": "unit",
                                                "annots":
                                                [ "%configSatNameMaxLength" ] } ] },
                                        { "prim": "unit",
                                        "annots":
                                            [ "%configSatWebsiteMaxLength" ] } ] } ],
                            "annots": [ "%updateConfigAction" ] } ] } ],
                "annots": [ "%updateConfig" ] },
                { "prim": "IF_NONE",
                "args":
                    [ [ { "prim": "PUSH",
                        "args": [ { "prim": "nat" }, { "int": "0" } ] },
                        { "prim": "FAILWITH" } ], [] ] },
                { "prim": "PUSH",
                "args": [ { "prim": "mutez" }, { "int": "0" } ] },
                { "prim": "UNIT" },
                { "prim": "LEFT", "args": [ { "prim": "unit" } ] },
                { "prim": "RIGHT",
                "args":
                    [ { "prim": "or",
                        "args": [ { "prim": "unit" }, { "prim": "unit" } ] } ] },
                { "prim": "LEFT",
                "args":
                    [ { "prim": "or",
                        "args":
                        [ { "prim": "or",
                            "args":
                                [ { "prim": "unit" }, { "prim": "unit" } ] },
                            { "prim": "unit" } ] } ] },
                { "prim": "PUSH",
                "args": [ { "prim": "nat" }, { "int": `${updatedValue.toString()}` } ] },
                { "prim": "PAIR" }, { "prim": "TRANSFER_TOKENS" },
                { "prim": "NIL", "args": [ { "prim": "operation" } ] },
                { "prim": "SWAP" }, { "prim": "CONS" }
            ]
            break;
        case "Doorman":
            lambdaFunction  = [
                { "prim": "DROP" },
                { "prim": "PUSH",
                "args":
                    [ { "prim": "address" },
                    { "string": `${contractAddress}` } ] },
                { "prim": "CONTRACT",
                "args":
                    [ { "prim": "pair",
                        "args":
                        [ { "prim": "nat",
                            "annots": [ "%updateConfigNewValue" ] },
                            { "prim": "or",
                            "args":
                                [ { "prim": "unit",
                                    "annots": [ "%configMinMvkAmount" ] },
                                { "prim": "unit",
                                    "annots": [ "%empty" ] } ],
                            "annots": [ "%updateConfigAction" ] } ] } ],
                "annots": [ "%updateConfig" ] },
                { "prim": "IF_NONE",
                "args":
                    [ [ { "prim": "PUSH",
                        "args": [ { "prim": "nat" }, { "int": "0" } ] },
                        { "prim": "FAILWITH" } ], [] ] },
                { "prim": "PUSH",
                "args": [ { "prim": "mutez" }, { "int": "0" } ] },
                { "prim": "UNIT" },
                { "prim": "LEFT", "args": [ { "prim": "unit" } ] },
                { "prim": "PUSH",
                "args": [ { "prim": "nat" }, { "int": `${updatedValue.toString()}` } ] },
                { "prim": "PAIR" }, { "prim": "TRANSFER_TOKENS" },
                { "prim": "NIL", "args": [ { "prim": "operation" } ] },
                { "prim": "SWAP" }, { "prim": "CONS" }
            ]
            break;
        case "EmergencyGovernance":
            lambdaFunction  = [
                { "prim": "DROP" },
                { "prim": "PUSH",
                "args":
                    [ { "prim": "address" },
                    { "string": `${contractAddress}` } ] },
                { "prim": "CONTRACT",
                "args":
                    [ { "prim": "pair",
                        "args":
                        [ { "prim": "nat",
                            "annots": [ "%updateConfigNewValue" ] },
                            { "prim": "or",
                            "args":
                                [ { "prim": "or",
                                    "args":
                                    [ { "prim": "or",
                                        "args":
                                            [ { "prim": "unit",
                                                "annots":
                                                [ "%configMinStakedMvkForTrigger" ] },
                                            { "prim": "unit",
                                                "annots":
                                                [ "%configMinStakedMvkForVoting" ] } ] },
                                        { "prim": "or",
                                        "args":
                                            [ { "prim": "unit",
                                                "annots":
                                                [ "%configProposalDescMaxLength" ] },
                                            { "prim": "unit",
                                                "annots":
                                                [ "%configProposalTitleMaxLength" ] } ] } ] },
                                { "prim": "or",
                                    "args":
                                    [ { "prim": "or",
                                        "args":
                                            [ { "prim": "unit",
                                                "annots":
                                                [ "%configRequiredFeeMutez" ] },
                                            { "prim": "unit",
                                                "annots":
                                                [ "%configStakedMvkPercentRequired" ] } ] },
                                        { "prim": "unit",
                                        "annots":
                                            [ "%configVoteExpiryDays" ] } ] } ],
                            "annots": [ "%updateConfigAction" ] } ] } ],
                "annots": [ "%updateConfig" ] },
                { "prim": "IF_NONE",
                "args":
                    [ [ { "prim": "PUSH",
                        "args": [ { "prim": "nat" }, { "int": "0" } ] },
                        { "prim": "FAILWITH" } ], [] ] },
                { "prim": "PUSH",
                "args": [ { "prim": "mutez" }, { "int": "0" } ] },
                { "prim": "UNIT" },
                { "prim": "RIGHT",
                "args":
                    [ { "prim": "or",
                        "args": [ { "prim": "unit" }, { "prim": "unit" } ] } ] },
                { "prim": "RIGHT",
                "args":
                    [ { "prim": "or",
                        "args":
                        [ { "prim": "or",
                            "args":
                                [ { "prim": "unit" }, { "prim": "unit" } ] },
                            { "prim": "or",
                            "args":
                                [ { "prim": "unit" }, { "prim": "unit" } ] } ] } ] },
                { "prim": "PUSH",
                "args": [ { "prim": "nat" }, { "int": `${updatedValue.toString()}` } ] },
                { "prim": "PAIR" }, { "prim": "TRANSFER_TOKENS" },
                { "prim": "NIL", "args": [ { "prim": "operation" } ] },
                { "prim": "SWAP" }, { "prim": "CONS" }
            ]
            break;
        case "Farm":
            lambdaFunction  = [
                { "prim": "DROP" },
                { "prim": "PUSH",
                "args":
                    [ { "prim": "address" },
                    { "string": `${contractAddress}` } ] },
                { "prim": "CONTRACT",
                "args":
                    [ { "prim": "pair",
                        "args":
                        [ { "prim": "nat",
                            "annots": [ "%updateConfigNewValue" ] },
                            { "prim": "or",
                            "args":
                                [ { "prim": "unit",
                                    "annots":
                                    [ "%configForceRewardFromTransfer" ] },
                                { "prim": "unit",
                                    "annots": [ "%configRewardPerBlock" ] } ],
                            "annots": [ "%updateConfigAction" ] } ] } ],
                "annots": [ "%updateConfig" ] },
                { "prim": "IF_NONE",
                "args":
                    [ [ { "prim": "PUSH",
                        "args": [ { "prim": "nat" }, { "int": "0" } ] },
                        { "prim": "FAILWITH" } ], [] ] },
                { "prim": "PUSH",
                "args": [ { "prim": "mutez" }, { "int": "0" } ] },
                { "prim": "UNIT" },
                { "prim": "RIGHT", "args": [ { "prim": "unit" } ] },
                { "prim": "PUSH",
                "args": [ { "prim": "nat" }, { "int": `${updatedValue.toString()}` } ] },
                { "prim": "PAIR" }, { "prim": "TRANSFER_TOKENS" },
                { "prim": "NIL", "args": [ { "prim": "operation" } ] },
                { "prim": "SWAP" }, { "prim": "CONS" }
            ]
            break;
        case "FarmFactory":
            lambdaFunction  = [
                { "prim": "DROP" },
                { "prim": "PUSH",
                "args":
                    [ { "prim": "address" },
                    { "string": `${contractAddress}` } ] },
                { "prim": "CONTRACT",
                "args":
                    [ { "prim": "pair",
                        "args":
                        [ { "prim": "nat",
                            "annots": [ "%updateConfigNewValue" ] },
                            { "prim": "or",
                            "args":
                                [ { "prim": "unit",
                                    "annots":
                                    [ "%configFarmNameMaxLength" ] },
                                { "prim": "unit",
                                    "annots": [ "%empty" ] } ],
                            "annots": [ "%updateConfigAction" ] } ] } ],
                "annots": [ "%updateConfig" ] },
                { "prim": "IF_NONE",
                "args":
                    [ [ { "prim": "PUSH",
                        "args": [ { "prim": "nat" }, { "int": "0" } ] },
                        { "prim": "FAILWITH" } ], [] ] },
                { "prim": "PUSH",
                "args": [ { "prim": "mutez" }, { "int": "0" } ] },
                { "prim": "UNIT" },
                { "prim": "LEFT", "args": [ { "prim": "unit" } ] },
                { "prim": "PUSH",
                "args": [ { "prim": "nat" }, { "int": `${updatedValue.toString()}` } ] },
                { "prim": "PAIR" }, { "prim": "TRANSFER_TOKENS" },
                { "prim": "NIL", "args": [ { "prim": "operation" } ] },
                { "prim": "SWAP" }, { "prim": "CONS" }
            ]
            break;
        case "Governance":
            lambdaFunction  = [
                { "prim": "DROP" },
                { "prim": "PUSH",
                "args":
                    [ { "prim": "address" },
                    { "string": `${contractAddress}` } ] },
                { "prim": "CONTRACT",
                "args":
                    [ { "prim": "pair",
                        "args":
                        [ { "prim": "nat",
                            "annots": [ "%updateConfigNewValue" ] },
                            { "prim": "or",
                            "args":
                                [ { "prim": "or",
                                    "args":
                                    [ { "prim": "or",
                                        "args":
                                            [ { "prim": "or",
                                                "args":
                                                [ { "prim": "unit",
                                                    "annots":
                                                        [ "%configBlocksPerProposalRound" ] },
                                                    { "prim": "unit",
                                                    "annots":
                                                        [ "%configBlocksPerTimelockRound" ] } ] },
                                            { "prim": "or",
                                                "args":
                                                [ { "prim": "unit",
                                                    "annots":
                                                        [ "%configBlocksPerVotingRound" ] },
                                                    { "prim": "unit",
                                                    "annots":
                                                        [ "%configCycleVotersReward" ] } ] } ] },
                                        { "prim": "or",
                                        "args":
                                            [ { "prim": "or",
                                                "args":
                                                [ { "prim": "unit",
                                                    "annots":
                                                        [ "%configMaxProposalsPerSatellite" ] },
                                                    { "prim": "unit",
                                                    "annots":
                                                        [ "%configMinProposalRoundVotePct" ] } ] },
                                            { "prim": "or",
                                                "args":
                                                [ { "prim": "unit",
                                                    "annots":
                                                        [ "%configMinProposalRoundVotesReq" ] },
                                                    { "prim": "unit",
                                                    "annots":
                                                        [ "%configMinQuorumPercentage" ] } ] } ] } ] },
                                { "prim": "or",
                                    "args":
                                    [ { "prim": "or",
                                        "args":
                                            [ { "prim": "or",
                                                "args":
                                                [ { "prim": "unit",
                                                    "annots":
                                                        [ "%configMinYayVotePercentage" ] },
                                                    { "prim": "unit",
                                                    "annots":
                                                        [ "%configProposalCodeMaxLength" ] } ] },
                                            { "prim": "or",
                                                "args":
                                                [ { "prim": "unit",
                                                    "annots":
                                                        [ "%configProposalDatTitleMaxLength" ] },
                                                    { "prim": "unit",
                                                    "annots":
                                                        [ "%configProposalDescMaxLength" ] } ] } ] },
                                        { "prim": "or",
                                        "args":
                                            [ { "prim": "or",
                                                "args":
                                                [ { "prim": "unit",
                                                    "annots":
                                                        [ "%configProposalInvoiceMaxLength" ] },
                                                    { "prim": "unit",
                                                    "annots":
                                                        [ "%configProposalTitleMaxLength" ] } ] },
                                            { "prim": "or",
                                                "args":
                                                [ { "prim": "unit",
                                                    "annots":
                                                        [ "%configProposeFeeMutez" ] },
                                                    { "prim": "unit",
                                                    "annots":
                                                        [ "%configSuccessReward" ] } ] } ] } ] } ],
                            "annots": [ "%updateConfigAction" ] } ] } ],
                "annots": [ "%updateConfig" ] },
                { "prim": "IF_NONE",
                "args":
                    [ [ { "prim": "PUSH",
                        "args": [ { "prim": "nat" }, { "int": "0" } ] },
                        { "prim": "FAILWITH" } ], [] ] },
                { "prim": "PUSH",
                "args": [ { "prim": "mutez" }, { "int": "0" } ] },
                { "prim": "UNIT" },
                { "prim": "RIGHT", "args": [ { "prim": "unit" } ] },
                { "prim": "RIGHT",
                "args":
                    [ { "prim": "or",
                        "args": [ { "prim": "unit" }, { "prim": "unit" } ] } ] },
                { "prim": "RIGHT",
                "args":
                    [ { "prim": "or",
                        "args":
                        [ { "prim": "or",
                            "args":
                                [ { "prim": "unit" }, { "prim": "unit" } ] },
                            { "prim": "or",
                            "args":
                                [ { "prim": "unit" }, { "prim": "unit" } ] } ] } ] },
                { "prim": "RIGHT",
                "args":
                    [ { "prim": "or",
                        "args":
                        [ { "prim": "or",
                            "args":
                                [ { "prim": "or",
                                    "args":
                                    [ { "prim": "unit" },
                                        { "prim": "unit" } ] },
                                { "prim": "or",
                                    "args":
                                    [ { "prim": "unit" },
                                        { "prim": "unit" } ] } ] },
                            { "prim": "or",
                            "args":
                                [ { "prim": "or",
                                    "args":
                                    [ { "prim": "unit" },
                                        { "prim": "unit" } ] },
                                { "prim": "or",
                                    "args":
                                    [ { "prim": "unit" },
                                        { "prim": "unit" } ] } ] } ] } ] },
                { "prim": "PUSH",
                "args": [ { "prim": "nat" }, { "int": `${updatedValue.toString()}` } ] },
                { "prim": "PAIR" }, { "prim": "TRANSFER_TOKENS" },
                { "prim": "NIL", "args": [ { "prim": "operation" } ] },
                { "prim": "SWAP" }, { "prim": "CONS" }
            ]
            break;
        case "GovernanceFinancial":
            lambdaFunction  = [
                { "prim": "DROP" },
                { "prim": "PUSH",
                "args":
                    [ { "prim": "address" },
                    { "string": `${contractAddress}` } ] },
                { "prim": "CONTRACT",
                "args":
                    [ { "prim": "pair",
                        "args":
                        [ { "prim": "nat",
                            "annots": [ "%updateConfigNewValue" ] },
                            { "prim": "or",
                            "args":
                                [ { "prim": "unit",
                                    "annots":
                                    [ "%configFinancialReqApprovalPct" ] },
                                { "prim": "unit",
                                    "annots":
                                    [ "%configFinancialReqDurationDays" ] } ],
                            "annots": [ "%updateConfigAction" ] } ] } ],
                "annots": [ "%updateConfig" ] },
                { "prim": "IF_NONE",
                "args":
                    [ [ { "prim": "PUSH",
                        "args": [ { "prim": "nat" }, { "int": "0" } ] },
                        { "prim": "FAILWITH" } ], [] ] },
                { "prim": "PUSH",
                "args": [ { "prim": "mutez" }, { "int": "0" } ] },
                { "prim": "UNIT" },
                { "prim": "LEFT", "args": [ { "prim": "unit" } ] },
                { "prim": "PUSH",
                "args": [ { "prim": "nat" }, { "int": `${updatedValue.toString()}` } ] },
                { "prim": "PAIR" }, { "prim": "TRANSFER_TOKENS" },
                { "prim": "NIL", "args": [ { "prim": "operation" } ] },
                { "prim": "SWAP" }, { "prim": "CONS" }
            ]
            break;
        case "GovernanceSatellite":
            lambdaFunction  = [
                { "prim": "DROP" },
                { "prim": "PUSH",
                "args":
                    [ { "prim": "address" },
                    { "string": `${contractAddress}` } ] },
                { "prim": "CONTRACT",
                "args":
                    [ { "prim": "pair",
                        "args":
                        [ { "prim": "nat",
                            "annots": [ "%updateConfigNewValue" ] },
                            { "prim": "or",
                            "args":
                                [ { "prim": "or",
                                    "args":
                                    [ { "prim": "unit",
                                        "annots":
                                            [ "%configApprovalPercentage" ] },
                                        { "prim": "unit",
                                        "annots":
                                            [ "%configMaxActionsPerSatellite" ] } ] },
                                { "prim": "or",
                                    "args":
                                    [ { "prim": "unit",
                                        "annots":
                                            [ "%configPurposeMaxLength" ] },
                                        { "prim": "unit",
                                        "annots":
                                            [ "%configSatelliteDurationInDays" ] } ] } ],
                            "annots": [ "%updateConfigAction" ] } ] } ],
                "annots": [ "%updateConfig" ] },
                { "prim": "IF_NONE",
                "args":
                    [ [ { "prim": "PUSH",
                        "args": [ { "prim": "nat" }, { "int": "0" } ] },
                        { "prim": "FAILWITH" } ], [] ] },
                { "prim": "PUSH",
                "args": [ { "prim": "mutez" }, { "int": "0" } ] },
                { "prim": "UNIT" },
                { "prim": "RIGHT", "args": [ { "prim": "unit" } ] },
                { "prim": "RIGHT",
                "args":
                    [ { "prim": "or",
                        "args": [ { "prim": "unit" }, { "prim": "unit" } ] } ] },
                { "prim": "PUSH",
                "args": [ { "prim": "nat" }, { "int": `${updatedValue.toString()}` } ] },
                { "prim": "PAIR" }, { "prim": "TRANSFER_TOKENS" },
                { "prim": "NIL", "args": [ { "prim": "operation" } ] },
                { "prim": "SWAP" }, { "prim": "CONS" }
            ]
            break;
        case "LendingController":
            lambdaFunction  = [
                { "prim": "DROP" },
                { "prim": "PUSH",
                "args":
                    [ { "prim": "address" },
                    { "string": `${contractAddress}` } ] },
                { "prim": "CONTRACT",
                "args":
                    [ { "prim": "pair",
                        "args":
                        [ { "prim": "nat",
                            "annots": [ "%updateConfigNewValue" ] },
                            { "prim": "or",
                            "args":
                                [ { "prim": "or",
                                    "args":
                                    [ { "prim": "or",
                                        "args":
                                            [ { "prim": "unit",
                                                "annots":
                                                [ "%configAdminLiquidationFee" ] },
                                            { "prim": "unit",
                                                "annots":
                                                [ "%configCollateralRatio" ] } ] },
                                        { "prim": "or",
                                        "args":
                                            [ { "prim": "unit",
                                                "annots":
                                                [ "%configInterestTreasuryShare" ] },
                                            { "prim": "unit",
                                                "annots":
                                                [ "%configLiquidationFeePercent" ] } ] } ] },
                                { "prim": "or",
                                    "args":
                                    [ { "prim": "or",
                                        "args":
                                            [ { "prim": "unit",
                                                "annots":
                                                [ "%configLiquidationRatio" ] },
                                            { "prim": "unit",
                                                "annots":
                                                [ "%configMinLoanFeeTreasuryShare" ] } ] },
                                        { "prim": "unit",
                                        "annots":
                                            [ "%configMinimumLoanFeePercent" ] } ] } ],
                            "annots": [ "%updateConfigAction" ] } ] } ],
                "annots": [ "%updateConfig" ] },
                { "prim": "IF_NONE",
                "args":
                    [ [ { "prim": "PUSH",
                        "args": [ { "prim": "nat" }, { "int": "0" } ] },
                        { "prim": "FAILWITH" } ], [] ] },
                { "prim": "PUSH",
                "args": [ { "prim": "mutez" }, { "int": "0" } ] },
                { "prim": "UNIT" },
                { "prim": "RIGHT", "args": [ { "prim": "unit" } ] },
                { "prim": "LEFT",
                "args":
                    [ { "prim": "or",
                        "args": [ { "prim": "unit" }, { "prim": "unit" } ] } ] },
                { "prim": "LEFT",
                "args":
                    [ { "prim": "or",
                        "args":
                        [ { "prim": "or",
                            "args":
                                [ { "prim": "unit" }, { "prim": "unit" } ] },
                            { "prim": "unit" } ] } ] },
                { "prim": "PUSH",
                "args": [ { "prim": "nat" }, { "int": `${updatedValue.toString()}` } ] },
                { "prim": "PAIR" }, { "prim": "TRANSFER_TOKENS" },
                { "prim": "NIL", "args": [ { "prim": "operation" } ] },
                { "prim": "SWAP" }, { "prim": "CONS" }
            ]
            break;
        case "TokenSale":
            lambdaFunction  = [
                { "prim": "DROP" },
                { "prim": "PUSH",
                "args":
                    [ { "prim": "address" },
                    { "string": `${contractAddress}` } ] },
                { "prim": "CONTRACT",
                "args":
                    [ { "prim": "pair",
                        "args":
                        [ { "prim": "nat",
                            "annots": [ "%updateConfigNewValue" ] },
                            { "prim": "or",
                            "args":
                                [ { "prim": "or",
                                    "args":
                                    [ { "prim": "or",
                                        "args":
                                            [ { "prim": "nat",
                                                "annots":
                                                [ "%configMaxAmountCap" ] },
                                            { "prim": "nat",
                                                "annots":
                                                [ "%configMaxAmountPerWalletTotal" ] } ] },
                                        { "prim": "or",
                                        "args":
                                            [ { "prim": "nat",
                                                "annots":
                                                [ "%configMinMvkAmount" ] },
                                            { "prim": "nat",
                                                "annots":
                                                [ "%configTokenXtzPrice" ] } ] } ] },
                                { "prim": "or",
                                    "args":
                                    [ { "prim": "or",
                                        "args":
                                            [ { "prim": "unit",
                                                "annots":
                                                [ "%configVestingPeriodDurationSec" ] },
                                            { "prim": "nat",
                                                "annots":
                                                [ "%configVestingPeriods" ] } ] },
                                        { "prim": "nat",
                                        "annots":
                                            [ "%configWhitelistMaxAmountTotal" ] } ] } ],
                            "annots": [ "%updateConfigAction" ] } ] } ],
                "annots": [ "%updateConfig" ] },
                { "prim": "IF_NONE",
                "args":
                    [ [ { "prim": "PUSH",
                        "args": [ { "prim": "nat" }, { "int": "0" } ] },
                        { "prim": "FAILWITH" } ], [] ] },
                { "prim": "PUSH",
                "args": [ { "prim": "mutez" }, { "int": "0" } ] },
                { "prim": "PUSH",
                "args": [ { "prim": "nat" }, { "int": `${tokenSaleBuyOption.toString()}` } ] },
                { "prim": "RIGHT", "args": [ { "prim": "nat" } ] },
                { "prim": "LEFT",
                "args":
                    [ { "prim": "or",
                        "args": [ { "prim": "nat" }, { "prim": "nat" } ] } ] },
                { "prim": "LEFT",
                "args":
                    [ { "prim": "or",
                        "args":
                        [ { "prim": "or",
                            "args":
                                [ { "prim": "unit" }, { "prim": "nat" } ] },
                            { "prim": "nat" } ] } ] },
                { "prim": "PUSH",
                "args": [ { "prim": "nat" }, { "int": `${updatedValue.toString()}` } ] },
                { "prim": "PAIR" }, { "prim": "TRANSFER_TOKENS" },
                { "prim": "NIL", "args": [ { "prim": "operation" } ] },
                { "prim": "SWAP" }, { "prim": "CONS" }
            ]
            break;
        case "TreasuryFactory":
            lambdaFunction  = [
                { "prim": "DROP" },
                { "prim": "PUSH",
                "args":
                    [ { "prim": "address" },
                    { "string": `${contractAddress}` } ] },
                { "prim": "CONTRACT",
                "args":
                    [ { "prim": "pair",
                        "args":
                        [ { "prim": "nat",
                            "annots": [ "%updateConfigNewValue" ] },
                            { "prim": "or",
                            "args":
                                [ { "prim": "unit",
                                    "annots":
                                    [ "%configTreasuryNameMaxLength" ] },
                                { "prim": "unit",
                                    "annots": [ "%empty" ] } ],
                            "annots": [ "%updateConfigAction" ] } ] } ],
                "annots": [ "%updateConfig" ] },
                { "prim": "IF_NONE",
                "args":
                    [ [ { "prim": "PUSH",
                        "args": [ { "prim": "nat" }, { "int": "0" } ] },
                        { "prim": "FAILWITH" } ], [] ] },
                { "prim": "PUSH",
                "args": [ { "prim": "mutez" }, { "int": "0" } ] },
                { "prim": "UNIT" },
                { "prim": "LEFT", "args": [ { "prim": "unit" } ] },
                { "prim": "PUSH",
                "args": [ { "prim": "nat" }, { "int": `${updatedValue.toString()}` } ] },
                { "prim": "PAIR" }, { "prim": "TRANSFER_TOKENS" },
                { "prim": "NIL", "args": [ { "prim": "operation" } ] },
                { "prim": "SWAP" }, { "prim": "CONS" }
            ]
            break;
        case "VaultFactory":
            lambdaFunction  = [
                { "prim": "DROP" },
                { "prim": "PUSH",
                "args":
                    [ { "prim": "address" },
                    { "string": `${contractAddress}` } ] },
                { "prim": "CONTRACT",
                "args":
                    [ { "prim": "pair",
                        "args":
                        [ { "prim": "nat",
                            "annots": [ "%updateConfigNewValue" ] },
                            { "prim": "or",
                            "args":
                                [ { "prim": "unit",
                                    "annots":
                                    [ "%configVaultNameMaxLength" ] },
                                { "prim": "unit",
                                    "annots": [ "%empty" ] } ],
                            "annots": [ "%updateConfigAction" ] } ] } ],
                "annots": [ "%updateConfig" ] },
                { "prim": "IF_NONE",
                "args":
                    [ [ { "prim": "PUSH",
                        "args": [ { "prim": "nat" }, { "int": "0" } ] },
                        { "prim": "FAILWITH" } ], [] ] },
                { "prim": "PUSH",
                "args": [ { "prim": "mutez" }, { "int": "0" } ] },
                { "prim": "UNIT" },
                { "prim": "LEFT", "args": [ { "prim": "unit" } ] },
                { "prim": "PUSH",
                "args": [ { "prim": "nat" }, { "int": `${updatedValue.toString()}` } ] },
                { "prim": "PAIR" }, { "prim": "TRANSFER_TOKENS" },
                { "prim": "NIL", "args": [ { "prim": "operation" } ] },
                { "prim": "SWAP" }, { "prim": "CONS" }
            ]
            break;
    }
    return await packLambdaFunction(tezos, governanceProxyContractAddress, lambdaFunction)
}
