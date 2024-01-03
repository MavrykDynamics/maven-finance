import yargs from 'yargs'

import { runMigrations, generateLambdaIndexes, oldCompileContract } from './helpers'

yargs

.command(
    'migrate [network] [from] [to]',
    'run migrations',
    {
        from: {
            description: 'the migrations counter to start with',
            alias: 'f',
            type: 'number',
        },
        to: {
            description: 'the migrations counter to end with',
            alias: 't',
            type: 'number',
        },
        network: {
            description: 'the network to deploy',
            alias: 'n',
            type: 'string',
        },
    },
    async (argv) => {
        
        runMigrations(argv.from, argv.to, argv.network)

    },
)


.command(
    'old-compile-contract [contract] [contracts_dir] [michelson_output_dir] [json_output_dir] [ligo_version] [is_apple_silicon]',
    'compiles the contract into michelson and json, and also compiles the contract lambdas',
    {        
        contract: {
            description: 'the contract to compile',
            alias: 'c',
            type: 'string',
        },
        contracts_dir: {
            description: 'contracts directory',
            alias: 'p',
            type: 'string',
        },
        michelson_output_dir: {
            description: 'michelson output directory',
            alias: 'a',
            type: 'string',
        },
        json_output_dir: {
            description: 'json output directory',
            alias: 'b',
            type: 'string',
        },
        ligo_version: {
            description: 'ligo version',
            alias: 'v',
            type: 'string',
        },
        is_apple_silicon: {
            description: 'cpu is an apple silicon boolean',
            alias: 'm',
            type: 'string',
        },
    },
    async (argv) => {
        
        oldCompileContract(argv.contract, argv.contracts_dir, argv.michelson_output_dir, argv.json_output_dir, argv.ligo_version, argv.is_apple_silicon)

    },
)



.command(
    'generate-lambda-indexes',
    'generate lambda indexes for contracts',
    {
        contract: {
            description: 'input file relative path (with lambdas Ligo code)',
            alias: 'c',
            type: 'string',
        },
    },
    async (argv) => {
        generateLambdaIndexes(argv.contract)
    },
)


.help()
.strictCommands()
.demandCommand(1)
.alias('help', 'h').argv
