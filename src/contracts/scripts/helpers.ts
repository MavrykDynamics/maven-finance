import { OriginationOperation, TezosToolkit } from '@taquito/taquito'
import { char2Bytes } from '@taquito/utils'
import { execSync } from 'child_process'
import * as fs from 'fs'

import env from '../env'
import { confirmOperation } from './confirmation'

export const getLigo = (

    isDockerizedLigo: boolean,
    ligoVersion: string = env.ligoVersion,
    isAppleSilicon: string = 'false',

) => {

    let path: string = 'ligo'
    let isAppleM1 = JSON.parse(isAppleSilicon)

    if (isDockerizedLigo) {
        if (isAppleM1) {
            path = `docker run --platform=linux/amd64 -v $PWD:$PWD --rm -i ligolang/ligo:${ligoVersion}`
        } else {
            path = `docker run -v $PWD:$PWD --rm -i ligolang/ligo:${ligoVersion}`
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
                path = `docker run --platform=linux/amd64 -v $PWD:$PWD --rm -i ligolang/ligo:next`
            } else {
                path = `docker run -v $PWD:$PWD --rm -i ligolang/ligo:${ligoVersion}`
            }

            execSync(`${path}  --help`)
        }
    }

    return path
}



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



export const compile = async (

    format: string,
    contract: string = undefined,
    contractsDir: string = env.contractsDir,
    outputDir: string = env.buildDir,
    ligoVersion: string = env.ligoVersion,
    isAppleSilicon: string = 'false',

) => {

    const ligo: string = getLigo(true, ligoVersion, isAppleSilicon)
    const contracts: string[] = !contract ? getContractsList() : [contract]

    contracts.forEach((contract) => {

    const michelson: string = execSync(
        `${ligo} compile contract $PWD/${contractsDir}/${contract}.ligo ${
            format === 'json' ? '--michelson-format json' : ''
        } --protocol kathmandu`,
        { 
            maxBuffer: 1024 * 1024 * 1024 * 1024,
            timeout: 1024 * 1024 * 1024 * 1024
         },
    ).toString()

    try {

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir)
        }

        if (format === 'json') {
            const artifacts: any = JSON.stringify(
            {
                contractName: contract,
                michelson: JSON.parse(michelson),
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

            fs.writeFileSync(`${outputDir}/${contract}.json`, artifacts)

        } else {

            fs.writeFileSync(`${outputDir}/${contract}.tz`, michelson)

        }

    } catch (e) {
        console.error(e)
    }

  })
}


export const compileContract = async (

    contract: string = undefined,
    contractsDir: string = env.contractsDir,
    michelsonOutputDir: string = env.michelsonBuildDir,
    jsonOutputDir: string = env.buildDir,
    ligoVersion: string = env.ligoVersion,
    isAppleSilicon: string = 'false',

) => {

    const ligo: string = getLigo(true, ligoVersion, isAppleSilicon)
    const contracts: string[] = contract.split(',');

    // loop over contracts
    contracts.forEach((contract) => {

        const pwd: string = execSync('echo $PWD').toString()
        const lambdaIndexJson : string = `contracts/partials/contractLambdas/${contract}/${contract}LambdaIndex.json`
        const lambdas: any = JSON.parse(fs.readFileSync(`${pwd.slice(0, pwd.length - 1)}/${lambdaIndexJson}`).toString())
        let res: any[] = []

        const michelsonFormat: string = execSync(
            `${ligo} compile contract $PWD/${contractsDir}/${contract}.ligo --protocol kathmandu`,
            { 
                maxBuffer: 1024 * 1024 * 1024 * 1024,
                timeout: 1024 * 1024 * 1024 * 1024
            },
        ).toString()

        const jsonFormat: string = execSync(
            `${ligo} compile contract $PWD/${contractsDir}/${contract}.ligo --michelson-format json --protocol kathmandu`,
            { 
                maxBuffer: 1024 * 1024 * 1024 * 1024,
                timeout: 1024 * 1024 * 1024 * 1024
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
                    `${ligo} compile expression pascaligo 'Bytes.pack(${lambda.name})' --michelson-format json --init-file $PWD/contracts/main/${contract}.ligo --protocol kathmandu`,
                    { 
                        maxBuffer: 1024 * 1024 * 1024 * 1024,
                        timeout: 1024 * 1024 * 1024 * 1024
                    },
                ).toString()
        
                res.push(JSON.parse(michelson).bytes)
        
                console.log(lambda.index + 1 + '. ' + lambda.name + ' successfully compiled.')
                }
        
                if (!fs.existsSync(`${env.buildDir}/lambdas`)) {
                    fs.mkdirSync(`${env.buildDir}/lambdas`)
                }
        
                fs.writeFileSync(`${env.buildDir}/lambdas/${contract}Lambdas.json`, JSON.stringify(res))
        
        } catch (e) {

        console.error(e)

        }    
    })
}



export const compileContractNoLambdas = async (

    contract: string,
    contractsDir: string = env.contractsDir,
    michelsonOutputDir: string = env.michelsonBuildDir,
    jsonOutputDir: string = env.buildDir,
    ligoVersion: string = env.ligoVersion,
    isAppleSilicon: string = 'false',

) => {

    const ligo: string = getLigo(true, ligoVersion, isAppleSilicon)
    const contracts: string[] = contract.split(',');
    
    // loop over contracts
    contracts.forEach((contract) => {

        const michelsonFormat: string = execSync(
            `${ligo} compile contract $PWD/${contractsDir}/${contract}.ligo --protocol kathmandu`,
            { 
                maxBuffer: 1024 * 1024 * 1024 * 1024,
                timeout: 1024 * 1024 * 1024 * 1024
            },
        ).toString()

        const jsonFormat: string = execSync(
            `${ligo} compile contract $PWD/${contractsDir}/${contract}.ligo --michelson-format json --protocol kathmandu`,
            {
                maxBuffer: 1024 * 1024 * 1024 * 1024,
                timeout: 1024 * 1024 * 1024 * 1024
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

            console.log('--- --- ---')
        
        } catch (e) {

        console.error(e)

        }    
    })
}


export const compileLambdas = async (

    json: string, 
    contract: string, 
    name: string, 
    ligoVersion: string = env.ligoVersion

) => {

    const ligo: string = getLigo(true, ligoVersion)
    const pwd: string = execSync('echo $PWD').toString()
    const lambdas: any = JSON.parse(fs.readFileSync(`${pwd.slice(0, pwd.length - 1)}/${json}`).toString())
    let res: any[] = []

    try {
            
        for (const lambda of lambdas) {

            const michelson = execSync(
                `${ligo} compile expression pascaligo 'Bytes.pack(${lambda.name})' --michelson-format json --init-file $PWD/${contract} --protocol kathmandu`,
                {
                    maxBuffer: 1024 * 1024 * 1024 * 1024,
                    timeout: 1024 * 1024 * 1024 * 1024
                },
            ).toString()

            res.push(JSON.parse(michelson).bytes)

            console.log(lambda.index + 1 + '. ' + lambda.name + ' successfully compiled.')
        }

        if (!fs.existsSync(`${env.buildDir}/lambdas`)) {
            
            fs.mkdirSync(`${env.buildDir}/lambdas`)

        }

        fs.writeFileSync(`${env.buildDir}/lambdas/${name}.json`, JSON.stringify(res))

    } catch (e) {
        console.log('error in compiling lambdas')
        console.error(e)
    }
}


export const compileContractLambdas = async (  
    
    contract: string, 
    ligoVersion: string = env.ligoVersion

) => {
        
    const ligo: string = getLigo(true, ligoVersion)
    const contracts: string[] = contract.split(',');
    
    // loop over contracts
    contracts.forEach((contract) => {

        const pwd: string = execSync('echo $PWD').toString()
        const lambdaIndexJson : string = `contracts/partials/contractLambdas/${contract}/${contract}LambdaIndex.json`
        const lambdas: any = JSON.parse(fs.readFileSync(`${pwd.slice(0, pwd.length - 1)}/${lambdaIndexJson}`).toString())
        let res: any[] = []

        try {
            for (const lambda of lambdas) {

                const michelson = execSync(
                    `${ligo} compile expression pascaligo 'Bytes.pack(${lambda.name})' --michelson-format json --init-file $PWD/contracts/main/${contract}.ligo --protocol kathmandu`,
                    {
                        maxBuffer: 1024 * 1024 * 1024 * 1024,
                        timeout: 1024 * 1024 * 1024 * 1024
                    },
                ).toString()

                res.push(JSON.parse(michelson).bytes)

                console.log(lambda.index + 1 + '. ' + lambda.name + ' successfully compiled.')

            }

            if (!fs.existsSync(`${env.buildDir}/lambdas`)) {
                fs.mkdirSync(`${env.buildDir}/lambdas`)
            }

            fs.writeFileSync(`${env.buildDir}/lambdas/${contract}Lambdas.json`, JSON.stringify(res))

        } catch (e) {
            console.log('error in compiling lambdas')
            console.error(e)
        }
    })
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
        .catch((e) => {
            console.error(e)

            return null
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
