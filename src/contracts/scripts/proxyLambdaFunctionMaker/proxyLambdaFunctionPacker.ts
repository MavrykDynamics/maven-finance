import env from '../../env';
import * as fs from 'fs'
import { execSync } from 'child_process';
import { TezosToolkit } from '@taquito/taquito'
import { generateProxyContract } from './proxyLambdaFunctionLibrary'

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

function getLigo (

    isDockerizedLigo: boolean,
    ligoVersion: string = env.ligoVersion,
    isAppleSilicon: string = 'true',

) {

    let path = 'ligo'
    let isAppleM1 = JSON.parse(isAppleSilicon)

    if (isDockerizedLigo) {
        if (isAppleM1) {
            path = `docker run --platform=linux/arm64 -v $PWD:$PWD --rm -i mavrykdynamics/ligo:${ligoVersion}`
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
    isAppleSilicon: string = 'true',

) => {

    const ligo = getLigo(true, ligoVersion, isAppleSilicon);

    // console.log('show ligo command:');
    // console.log(`${ligo} compile contract ${contractPath} --michelson-format json --protocol lima --deprecated`);

    const jsonFormat = execSync(
        `${ligo} compile contract ${contractPath} --michelson-format json --protocol lima --deprecated`,
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
    governanceProxyContractAddress: string = "",
    lambdaFunctionName: string = "",
    lambdaFunctionParameters: Array<any> = []

) => {

    // Read the contents of the input file specified in the first command line argument
    var args: string[] = [];
    if (require.main === module) {
        // Script called from terminal
        network                         = process.argv[2];
        governanceProxyContractAddress  = process.argv[3];
        lambdaFunctionName              = process.argv[4];
        args                            = process.argv.slice(5);
        lambdaFunctionParameters        = args;
    }

    // Read the contents of the input file specified in the first command line argument
    const generatedContract: string = generateProxyContract(
        lambdaFunctionName,
        lambdaFunctionParameters
    );

    // Write the result to the output file
    const outputFile: string        = __dirname + "/governanceProxyLambdaFunction.ligo";
    fs.writeFileSync(outputFile, generatedContract);

    // Start the compiling process
    const lambdaFunctionJson    = await compileLambdaFunctionContract(outputFile);
    const networkConfig: any    = env.networks[network]
    const tezos: TezosToolkit   = new TezosToolkit(networkConfig.rpc)
    const packedLambdaFunction  = await packLambdaFunction(tezos, governanceProxyContractAddress, lambdaFunctionJson)

    return packedLambdaFunction;
}

compileLambdaFunction();
