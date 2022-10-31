import yargs from 'yargs'

import { runMigrations } from './helpers'

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

.help()
.strictCommands()
.demandCommand(1)
.alias('help', 'h').argv
