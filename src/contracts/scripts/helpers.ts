import fs from 'fs'

import { execSync } from 'child_process'

import { OriginationOperation, TezosToolkit } from '@taquito/taquito'
import { char2Bytes } from '@taquito/utils'

import { confirmOperation } from './confirmation'

import env from '../env'

export const getLigo = (
  isDockerizedLigo: boolean,
  ligoVersion: string = env.ligoVersion,
  isAppleSilicon: string = 'false',
) => {
  let path: string = 'ligo'
  let isAppleM1 = JSON.parse(isAppleSilicon)
  console.log(`Processer type is ${isAppleM1}`)
  if (isDockerizedLigo) {
    if (isAppleSilicon) {
      path = `docker run --platform=linux/arm64/v8 -v $PWD:$PWD --rm -i ligolang/ligo:${ligoVersion}`
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
      path = `docker run -v $PWD:$PWD --rm -i ligolang/ligo:${ligoVersion}`

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
) => {
  const ligo: string = getLigo(true, ligoVersion)
  const contracts: string[] = !contract ? getContractsList() : [contract]

  contracts.forEach((contract) => {
    const michelson: string = execSync(
      `${ligo} compile contract $PWD/${contractsDir}/${contract}.ligo ${
        format === 'json' ? '--michelson-format json' : ''
      } --protocol hangzhou`,
      { maxBuffer: 1024 * 500 * 1024 },
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

export const compileLambdas = async (json: string, contract: string, ligoVersion: string = env.ligoVersion) => {
  const ligo: string = getLigo(true, ligoVersion)
  const pwd: string = execSync('echo $PWD').toString()
  const lambdas: any = JSON.parse(fs.readFileSync(`${pwd.slice(0, pwd.length - 1)}/${json}`).toString())
  let res: any[] = []

  try {
    for (const lambda of lambdas) {
      const michelson = execSync(
        `${ligo} compile expression pascaligo 'Bytes.pack(${lambda.name})' --michelson-format json --init-file $PWD/${contract} --protocol hangzhou`,
        { maxBuffer: 1024 * 500 },
      ).toString()

      res.push(JSON.parse(michelson).bytes)

      console.log(lambda.index + 1 + '. ' + lambda.name + ' successfully compiled.')
    }

    if (!fs.existsSync(`${env.buildDir}/lambdas`)) {
      fs.mkdirSync(`${env.buildDir}/lambdas`)
    }

    fs.writeFileSync(`${env.buildDir}/lambdas/governanceLambdas.json`, JSON.stringify(res))
  } catch (e) {
    console.log('error in compiling lambdas')
    console.error(e)
  }
}

export const compileParameters = async (json: string, contract: string, ligoVersion: string = env.ligoVersion) => {
  const ligo: string = getLigo(true, ligoVersion)
  const pwd: string = execSync('echo $PWD').toString()
  const lambdaParams: any = JSON.parse(fs.readFileSync(`${pwd.slice(0, pwd.length - 1)}/${json}`).toString())
  let res: any[] = []

  try {
    for (const lambdaParam of lambdaParams) {
      const michelson = execSync(
        `${ligo} compile parameter $PWD/${contract} '${lambdaParam.action}' --entry-point main --michelson-format json --syntax pascaligo --protocol hangzhou`,
        { maxBuffer: 1024 * 500 },
      ).toString()

      res.push(JSON.parse(michelson))

      console.log(lambdaParam.index + 1 + '. ' + lambdaParam.name + ' lambda successfully compiled.')
    }

    if (!fs.existsSync(`${env.buildDir}/lambdas`)) {
      fs.mkdirSync(`${env.buildDir}/lambdas`)
    }

    fs.writeFileSync(`${env.buildDir}/lambdas/governanceLambdaParameters.json`, JSON.stringify(res))
  } catch (e) {
    console.log('error in compiling lambda parameters')
    console.error(e)
  }
}

export const packParameters = async (json: string, contract: string, ligoVersion: string = env.ligoVersion) => {
  const ligo: string = getLigo(true, ligoVersion)
  const pwd: string = execSync('echo $PWD').toString()
  const lambdaParams: any = JSON.parse(fs.readFileSync(`${pwd.slice(0, pwd.length - 1)}/${json}`).toString())

  let res_michelson: any[] = []
  let res_bytes: any[] = []

  try {
    for (const lambdaParam of lambdaParams) {
      const michelson = execSync(
        `${ligo} compile parameter $PWD/${contract} '${lambdaParam.action}' --entry-point main --michelson-format json --syntax pascaligo --protocol hangzhou`,
        { maxBuffer: 1024 * 500 },
      ).toString()

      res_michelson.push(JSON.parse(michelson))

      // console.log("michelson:")
      // console.log(michelson);

      const bytes = char2Bytes(michelson)

      // console.log("bytes:")
      // console.log(bytes);

      res_bytes.push(bytes)

      console.log(lambdaParam.index + 1 + '. ' + lambdaParam.name + ' successfully compiled and packed to bytes.')
    }

    if (!fs.existsSync(`${env.buildDir}/lambdas`)) {
      fs.mkdirSync(`${env.buildDir}/lambdas`)
    }

    fs.writeFileSync(`${env.buildDir}/lambdas/governanceLambdaParametersBytes.json`, JSON.stringify(res_bytes))

    fs.writeFileSync(`${env.buildDir}/lambdas/governanceLambdaParameters.json`, JSON.stringify(res_michelson))
  } catch (e) {
    console.log('error in compiling lambda parameters')
    console.error(e)
  }
}

export const migrate = async (tezos: TezosToolkit, contract: string, storage: any) => {
  try {
    console.log(`${env.buildDir}/${contract}.json`)

    const artifacts: any = JSON.parse(fs.readFileSync(`${env.buildDir}/${contract}.json`).toString())

    // console.log('running migrations')
    // console.log(tezos)
    // console.log('artifacts')
    // console.log(artifacts)

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
