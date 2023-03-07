import env from '../env';
import * as fs from 'fs'
import { execSync } from 'child_process';
import { TezosToolkit } from '@taquito/taquito'

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
    governanceProxyContractAddress: string = 'KT1MAAW37c1849xRudegcw7VGAs9F5DPWicR',
    lambdaFunctionArgs: string[] = [],
    inputFile: string   = './contracts/main/governanceProxyLambdaFunctionTemplate.ligo',
    outputFile: string   = './contracts/main/governanceProxyLambdaFunction.ligo',

) => {

    // Read the contents of the input file specified in the first command line argument
    var args: string[] = [];
    if (require.main === module) {
        // Script called from terminal
        args = process.argv.slice(2);
      } else {
        // Script called from typescript
        args = lambdaFunctionArgs;
      }
    const lambdaFunctionUsed = args[0];

    // Read the contents of the input file
    const data  = fs.readFileSync(inputFile, 'utf8');

    // Find all words starting with "${" and ending with "}"
    const regex = /\$\{.*?\}/g;
    const matches: RegExpMatchArray | null = data.match(regex);

    if(matches){
        // Find all words starting with "function " and ending with "("
        const functionRegex = /function\s+\w+\s*\(/g;
        const functionNames = data.match(functionRegex);

        // Print the matched words
        var modifiedData = "";
        if (functionNames) {
            const functionNamesFixed: string[] = [];
            functionNames.forEach(functionName => {
                var functionNameFixed: string   = functionName.replace('function ', '').replace(' (', '');
                functionNamesFixed.push(functionNameFixed)
            });
            if(functionNamesFixed.includes(lambdaFunctionUsed)){
                // Replace words in the text
                const regex     = new RegExp(escapeRegExp("${LAMBDA_FUNCTION}").trim(), 'g')
                modifiedData    = data.replace(regex, lambdaFunctionUsed+"()");

                var relatedVarsCounter = 0;
                matches.forEach(match => {
                    // Only print related variables
                    if(match.startsWith("${"+lambdaFunctionUsed.toUpperCase())){
                        relatedVarsCounter++;
                    }
                });
                const expectedParameterLength   = relatedVarsCounter + 1;

                // Check the correct amount of parameters
                if(expectedParameterLength != args.length){
                    console.log("This lambda function expects more parameters.");
                    console.log("List of expected parameters:");

                    matches.forEach(match => {
                        // Only print related variables
                        if(match.startsWith("${"+lambdaFunctionUsed.toUpperCase())){
                            console.log(match.replace("${" + lambdaFunctionUsed.toUpperCase() + '_', '').replace("}", ''))
                        }
                    });
                    throw new Error("Parameters mismatch");
                } else {
                    var argIndex    = 1;
                    matches.forEach(match => {
                        // Format the variable properly
                        const regex                         = new RegExp(escapeRegExp(match).trim(), 'g')
                        const typeRegex                     = /:.*?\}/g;
                        const type: RegExpMatchArray | null = match.match(typeRegex);
                        if(match!=="${LAMBDA_FUNCTION}"){
                            if(type){
                                const formattedType = type[0].replace(': ', '').replace('}', '')
                                var formattedVar    = formatArgs(formattedType, args[argIndex]);
                                if(match.startsWith("${"+lambdaFunctionUsed.toUpperCase())){
                                    formattedVar  = formatArgs(formattedType, args[argIndex]);
                                    argIndex++;
                                }
                                else {
                                    formattedVar  = formatArgs(formattedType);
                                }
                                if(formattedVar){
                                    modifiedData    = modifiedData.replace(regex, formattedVar);
                                }
                                else {
                                    throw new Error("Variable could not be formatted properly");
                                }
                            }
                            else {
                                throw new Error("No type found for the given variable");
                            }
                        }
                    });
                }

            } else{
                throw new Error("Lambda function not found");
            }
        } else {
            throw new Error("No matches found");
        }

        // Write the result to the output file
        fs.writeFileSync(outputFile, modifiedData);

        // Start the compiling process
        const lambdaFunctionJson    = await compileLambdaFunctionContract(outputFile);
        const networkConfig: any    = env.networks[network]
        const tezos: TezosToolkit   = new TezosToolkit(networkConfig.rpc)
        const packedLambdaFunction  = await packLambdaFunction(tezos, governanceProxyContractAddress, lambdaFunctionJson)
        return packedLambdaFunction;
    }
    else {
        throw new Error("No variables found in given template");
    }
}

compileLambdaFunction();
