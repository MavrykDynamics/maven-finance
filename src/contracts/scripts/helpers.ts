import { OriginationOperation, TezosToolkit } from '@mavrykdynamics/taquito'
import { char2Bytes } from '@mavrykdynamics/taquito-utils'
import { execSync } from 'child_process'
import * as fs from 'fs'

import env from '../env'
import { confirmOperation } from './confirmation'

type Nullable<T> = T | null;

export const getContractsList = () => {
    return fs
        .readdirSync(env.contractsDir)
        .filter((file) => file.endsWith('.ligo'))
        .map((file) => file.slice(0, file.length - 5))
}



export const getMigrationsList = () => {
    return fs
        .readdirSync(env.migrationsDir)
        .filter((file) => file.endsWith('.js'))
        .map((file) => file.slice(0, file.length - 3))
}



export const migrate = async (tezos: TezosToolkit, contract: string, storage: any) => {
    try {
    
        console.log(`${env.buildDir}/${contract}.json`)

        const artifacts: any = JSON.parse(fs.readFileSync(`${env.buildDir}/${contract}.json`).toString())

        const operation: OriginationOperation = await tezos.contract
        .originate({
            code: artifacts.michelson,
            storage: storage,
        })

        console.log('show operation')
        console.log(operation)

        await confirmOperation(tezos, operation.hash)

        artifacts.networks[env.network] = { [contract]: operation.contractAddress }

        if (!fs.existsSync(env.buildDir)) {
        fs.mkdirSync(env.buildDir)
        }

        fs.writeFileSync(`${env.buildDir}/${contract}.json`, JSON.stringify(artifacts, null, 2))

        return operation.contractAddress

    } catch (e) {

        console.error(e)

    }
}

export const getDeployedAddress = (contract: string) => {
    try {
        const artifacts: any = JSON.parse(fs.readFileSync(`${env.buildDir}/${contract}.json`).toString())

        return artifacts.networks[env.network][contract]
    } catch (e) {
        console.error(e)
    }
}

export const runMigrations = async (
    
    from: number = 0,
    to: number = getMigrationsList().length,
    network: string = 'development',

) => {

    try {
    
        const migrations: string[] = getMigrationsList()
        const networkConfig: any = env.networks[network]
        const tezos: TezosToolkit = new TezosToolkit(networkConfig.rpc)

        for (let i: number = from; i < to; ++i) {

            const execMigration: any = require(`../${env.migrationsDir}/${migrations[i]}.js`)
            await execMigration(tezos)

        }
        
    } catch (e) {

        console.error(e)

    }
}


export const getLigo = (

    isDockerizedLigo: boolean,
    ligoVersion: string = env.ligoVersion,
    isAppleSilicon: string = 'false',

) => {

    let path: string = 'ligo'
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


export const oldCompileContract = async (

    contract : string = "",
    contractsDir: string = env.contractsDir,
    michelsonOutputDir: string = env.michelsonBuildDir,
    jsonOutputDir: string = env.buildDir,
    ligoVersion: string = env.ligoVersion,
    isAppleSilicon: string = 'false',

) => {

    const ligo: string = getLigo(true, ligoVersion, isAppleSilicon)
    
    const contracts : string[] = contract.toString().split(',');

    // loop over contracts
    contracts.forEach((contract) => {

        if(contract !== ""){

            const pwd: string = execSync('echo $PWD').toString()
            const lambdaIndexJson : string = `contracts/partials/lambdaIndexes/${contract}LambdaIndex.json`
            const lambdas: any = JSON.parse(fs.readFileSync(`${pwd.slice(0, pwd.length - 1)}/${lambdaIndexJson}`).toString())
            
            // let res: any[] = []

            let res: object = {};

            const michelsonFormat: string = execSync(
                `${ligo} compile contract $PWD/${contractsDir}/${contract}.ligo --protocol atlas`,
                { 
                    maxBuffer: 1024 * 1024 * 1024 * 1024,
                    timeout: 1024 * 1024 * 1024 * 1024
                },
            ).toString()

            const jsonFormat: string = execSync(
                `${ligo} compile contract $PWD/${contractsDir}/${contract}.ligo --michelson-format json --protocol atlas`,
                { 
                    maxBuffer: 1024 * 1024,
                    timeout: 1024 * 1024
                },
            ).toString()
            
            try {

                // create michelson output dir if not exists - i.e. /contracts/compiled
                if (!fs.existsSync(michelsonOutputDir)) {
                    fs.mkdirSync(michelsonOutputDir)
                }

                // create json output dir if not exists - i.e. /build
                if (!fs.existsSync(jsonOutputDir)) {
                    fs.mkdirSync(jsonOutputDir)
                }

                // save contract in michelson
                fs.writeFileSync(`${michelsonOutputDir}/${contract}.tz`, michelsonFormat)
                console.log(contract + " michelson compiled")

                // format contract json
                const artifacts: any = JSON.stringify(
                    {
                        contractName: contract,
                        michelson: JSON.parse(jsonFormat),
                        networks: {},
                        compiler: {
                        name: 'ligo',
                        version: ligoVersion,
                        },
                        networkType: 'tezos',
                    },
                    null,
                    2,
                )

                // save contract in json
                fs.writeFileSync(`${jsonOutputDir}/${contract}.json`, artifacts)
                console.log(contract + " json build compiled")

                console.log("--- compiling lambdas ---")
                // compile and save contract lambdas
                for (const lambda of lambdas) {
                    
                    const michelson = execSync(
                        `${ligo} compile expression pascaligo 'Bytes.pack(${lambda.name})' --michelson-format json --init-file $PWD/contracts/main/${contract}.ligo --protocol atlas`,
                        { 
                            maxBuffer: 1024 * 1024,
                            timeout: 1024 * 1024
                        },
                    ).toString()

                    // console.log(lambda.name);
                    // console.log(JSON.parse(michelson).bytes);
                    // console.log(`${lambda.name} : ${JSON.parse(michelson).bytes}`);
            
                    // res.push(`${lambda.name} : ${JSON.parse(michelson).bytes}`)
                    res[lambda.name] = JSON.parse(michelson).bytes;
            
                    console.log(lambda.index + 1 + '. ' + lambda.name + ' successfully compiled.')
                    }
            
                    if (!fs.existsSync(`${env.buildDir}/lambdas`)) {
                        fs.mkdirSync(`${env.buildDir}/lambdas`)
                    }
            
                    fs.writeFileSync(`${env.buildDir}/lambdas/${contract}Lambdas.json`, JSON.stringify(res, null, 4))
            
            } catch (e) {

                console.error(e)

            }    
        }
    })
}



export const generateLambdaIndexes = async (
    
    contract : string, 

) => {
    
    let contracts : string[] = []

    if(contract !== undefined){
        contracts = contract.split(',')
        console.log(contracts);
    }

    const overallLambdaIndexJson : string = `contracts/partials/contractsLambdaIndex.json`
    const contractLambdaIndexes: any = JSON.parse(fs.readFileSync(overallLambdaIndexJson).toString())

    try {

        for (const contract in contractLambdaIndexes) {

            let res: any[] = []
            let counter : number = 0
            const contractName : string = contract;

            if(contracts.length == 0 || contracts.includes(contractName)){

                for (const lambdaIndex of contractLambdaIndexes[contract]) {

                    const index = {
                        "index" : counter,
                        "name": lambdaIndex
                    }
                    counter += 1;

                    res.push(index);
                }

                if (!fs.existsSync(`contracts/partials/contractLambdas/${contractName}`)) {
                    fs.mkdirSync(`contracts/partials/contractLambdas/${contractName}`)
                }

                fs.writeFileSync(`contracts/partials/lambdaIndexes/${contractName}LambdaIndex.json`, JSON.stringify(res, null, '\t'))
            }
        }

    } catch (e) {
        console.log('error in generating lambda index')
        console.error(e)
    }

}

