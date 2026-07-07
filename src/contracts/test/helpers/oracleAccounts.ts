import fs from "fs"
import path from "path"

export type OracleAccount = {
    pkh: string
    pk: string
    sk: string
    peerId: string
}

const generatedAccountsFile = path.resolve(__dirname, "mavryk-oracle-accounts.generated.json")

const getAccountsFile = (): string | undefined => {
    if (process.env.ORACLE_ACCOUNTS_FILE) {
        return path.resolve(process.cwd(), process.env.ORACLE_ACCOUNTS_FILE)
    }

    if (fs.existsSync(generatedAccountsFile)) {
        return generatedAccountsFile
    }

    return undefined
}

const validateOracleAccounts = (accounts: Array<OracleAccount>) => {
    if (!Array.isArray(accounts) || accounts.length === 0) {
        throw new Error("Oracle accounts file must contain at least one account")
    }

    accounts.forEach((account, index) => {
        assertAccountField(account.pkh, "pkh", "mv1", index)
        assertAccountField(account.pk, "pk", "edpk", index)
        assertAccountField(account.sk, "sk", "edsk", index)

        if (!account.peerId) {
            throw new Error(`Oracle account ${index + 1} is missing peerId`)
        }
    })
}

const assertAccountField = (value: string, field: string, prefix: string, index: number) => {
    if (!value || !value.startsWith(prefix)) {
        throw new Error(`Oracle account ${index + 1} has invalid ${field}`)
    }
}

export const getOracleAccounts = (): Array<OracleAccount> => {
    const accountsFile = getAccountsFile()
    if (accountsFile === undefined) {
        throw new Error(
            "Oracle accounts file not found. Set ORACLE_ACCOUNTS_FILE or run " +
            "`bash generate-mavryk-accounts.sh` from src/contracts to create the ignored local file."
        )
    }

    const accounts = JSON.parse(fs.readFileSync(accountsFile).toString())
    validateOracleAccounts(accounts)
    console.log(`Loaded ${accounts.length} oracle account(s) from ${accountsFile}`)

    return accounts
}
