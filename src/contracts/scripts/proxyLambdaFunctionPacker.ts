import env from '../env';
import * as fs from 'fs'
import { execSync } from 'child_process';
import { TezosToolkit } from '@taquito/taquito'
import { generateProxyContract } from './proxyLambdaFunction'

const packLambdaFunction    = async(

    tezos: TezosToolkit, 
    governanceProxyContractAddress: string, 
    lambdaFunction : Array<any>
    
) => {

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
            console.log(packedParam);
        } else {
            throw `packing failed`
        };
    }
    return packedParam;

}

// Fix special characters in regex string
const escapeRegExp = (

    string: string

) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

// Format stdin args for pascaligo
const formatArgs = (
    
    type: string, 
    lambdaVar: string | undefined=undefined
    
) => {
    switch(type){
        case "address":
            return lambdaVar ? "\""+lambdaVar+"\"" : "\"tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg\"";
        case "aggregatorUpdateConfigActionType":
            return lambdaVar ? lambdaVar : "ConfigDecimals";
        case "bytes":
            return lambdaVar ? "\""+lambdaVar+"\"" : "\"74657a6f732d73746f726167653a64617461\"";
        case "bool":
            return lambdaVar ? (lambdaVar.toUpperCase() === "TRUE" ? "True" : "False") : "False" ;
        case "nat":
            return lambdaVar ? lambdaVar + "n" : "0n";
        case "string":
            return lambdaVar ? "\""+lambdaVar+"\"" : "\"null\"";
        case "tokenType":
            return lambdaVar ? lambdaVar : "Tez";
        default: 
            return null;
    }
}

function getLigo (

    isDockerizedLigo: boolean,
    ligoVersion: string = env.ligoVersion,
    isAppleSilicon: string = 'false',

) {

    let path = 'ligo'
    let isAppleM1 = JSON.parse(isAppleSilicon)

    if (isDockerizedLigo) {
        if (isAppleM1) {
            path = `docker run --platform=linux/amd64 -v $PWD:$PWD --rm -i mavrykdynamics/ligo:${ligoVersion}`
        } else {
            path = `docker run -v $PWD:$PWD --rm -i mavrykdynamics/ligo:${ligoVersion}`
        }

        try {
            execSync(`${path}  --help`)
        } catch (err) {
            path = 'ligo'
            execSync(`${path}  --help`)
        }
    } else {
        try {
            
            execSync(`${path}  --help`)

        } catch (err) {

            if (isAppleM1) {
                path = `docker run --platform=linux/amd64 -v $PWD:$PWD --rm -i mavrykdynamics/ligo:${ligoVersion}`
            } else {
                path = `docker run -v $PWD:$PWD --rm -i mavrykdynamics/ligo:${ligoVersion}`
            }

            execSync(`${path}  --help`)
        }
    }

    return path
}

const compileLambdaFunctionContract = async(

    contractPath: string = "",
    ligoVersion: string = env.ligoVersion,
    isAppleSilicon: string = 'false',

) => {

    const ligo = getLigo(true, ligoVersion, isAppleSilicon);

    const jsonFormat = execSync(
        `${ligo} compile contract $PWD/${contractPath} --michelson-format json --protocol lima`,
        { 
            maxBuffer: 1024 * 1024,
            timeout: 1024 * 1024
        },
    ).toString()

    // Get the lambda function from the compiled code
    return JSON.parse(jsonFormat)[2].args[0][1].args[0];
}

export const compileLambdaFunction  = async(

    network: string = 'development',
    governanceProxyContractAddress: string = 'KT1RAuWGnxyYx7i1VZafrNt4zLdLUgQdJQe5',
    outputFile: string   = './contracts/main/governanceProxyLambdaFunction.ligo',
    lambdaFunctionName: string = "",
    lambdaFunctionParameters: Array<any> = []

) => {

    // Read the contents of the input file specified in the first command line argument
    var args: string[] = [];
    if (require.main === module) {
        // Script called from terminal
        lambdaFunctionName          = process.argv[2];
        args                        = process.argv.slice(3);
        lambdaFunctionParameters    = args;
    }

    // Read the contents of the input file specified in the first command line argument
    const generatedContract: string = generateProxyContract(
        lambdaFunctionName,
        lambdaFunctionParameters
    );

    // Write the result to the output file
    fs.writeFileSync(outputFile, generatedContract);

    // Start the compiling process
    const lambdaFunctionJson    = await compileLambdaFunctionContract(outputFile);
    const networkConfig: any    = env.networks[network]
    const tezos: TezosToolkit   = new TezosToolkit(networkConfig.rpc)
    const packedLambdaFunction  = await packLambdaFunction(tezos, governanceProxyContractAddress, lambdaFunctionJson)
    return packedLambdaFunction;
}

compileLambdaFunction();
