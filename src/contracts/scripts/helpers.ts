import { OriginationOperation, TezosToolkit } from '@taquito/taquito'
import { char2Bytes } from '@taquito/utils'
import { execSync } from 'child_process'
import * as fs from 'fs'

import env from '../env'
import { confirmOperation } from './confirmation'


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
