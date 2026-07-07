import assert from "assert"

import { getOracleAccounts } from "../helpers/oracleAccounts"
import { MAV, MVN, Utils } from "../helpers/Utils"
// import { RpcClient } from '@taquito/rpc';

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

// ------------------------------------------------------------------------------
// Contract Address
// ------------------------------------------------------------------------------

import contractDeployments from '../contractDeployments.json'

// ------------------------------------------------------------------------------
// Contract Helpers
// ------------------------------------------------------------------------------

import { bob } from '../../scripts/sandbox/accounts'
import {
    signerFactory,
    updateOperators,
} from './../helpers/helperFunctions'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Satellite Setup', async () => {

    var utils: Utils
    var tezos
    // var client

    const tokenId = 0
    const minMvrkBalance = MAV(5)
    const minMvrkTopUpAmount = 5
    const minMvrkTopUpMutez = MAV(minMvrkTopUpAmount)
    const bobMvrkGasBuffer = MAV(2)
    const stakeBuffer = MVN(1)

    before('setup', async () => {
        try {
            utils = new Utils()
            await utils.init(bob.sk)
            tezos = utils.tezos

            // const delegationAddress = "KT1UYq7QC9W52BgryWj6nP9CRCMZz99RbhtR";
            // const doormanAddress    = "KT1H6fMjcEAPvprxMsQrXn5mxVzzRpo3LT4n";
            // const mvnTokenAddress   = "KT1TmMonQxCChhiSXJiE1dafZAy66KBJDqtH";

            const delegationAddress = contractDeployments.delegation.address;
            const doormanAddress    = contractDeployments.doorman.address;
            const mvnTokenAddress   = contractDeployments.mvnToken.address;

            const delegationInstance: any = await utils.tezos.contract.at(delegationAddress)
            const doormanInstance: any    = await utils.tezos.contract.at(doormanAddress)
            const mvnTokenInstance: any   = await utils.tezos.contract.at(mvnTokenAddress)

            let delegationStorage: any = await delegationInstance.storage()
            let doormanStorage: any = await doormanInstance.storage()
            let mvnTokenStorage: any = await mvnTokenInstance.storage()

            assert.equal(delegationStorage.breakGlassConfig.registerAsSatelliteIsPaused, false)

            const accountsToRegister: Array<any> = getOracleAccounts()
            let missingSatelliteCount = 0
            for (const account of accountsToRegister) {
                const satelliteRecord = await delegationStorage.satelliteLedger.get(account.pkh)
                if (satelliteRecord === undefined) {
                    missingSatelliteCount += 1
                }
            }

            const satelliteCounter = delegationStorage.satelliteCounter.toNumber()
            const maxSatellites = delegationStorage.config.maxSatellites.toNumber()
            if (satelliteCounter + missingSatelliteCount > maxSatellites) {
                await signerFactory(tezos, bob.sk)
                const updateConfigOperation = await delegationInstance.methods.updateConfig(
                    satelliteCounter + missingSatelliteCount,
                    "configMaxSatellites"
                ).send()
                await updateConfigOperation.confirmation()
                delegationStorage = await delegationInstance.storage()
            }

            const minimumStakedMvnBalance = delegationStorage.config.minimumStakedMvnBalance.toNumber()
            const minMvnStakeAmount = doormanStorage.config.minMvnAmount.toNumber()
            const requiredStakedMvnBalance = Math.max(minimumStakedMvnBalance, minMvnStakeAmount) + stakeBuffer
            let requiredMvrkTopUpTotal = 0
            let requiredMvnTopUpTotal = 0

            for (const account of accountsToRegister) {
                const satelliteRecord = await delegationStorage.satelliteLedger.get(account.pkh)
                if (satelliteRecord !== undefined) {
                    continue
                }

                const accountMvrkBalance = await utils.tezos.tz.getBalance(account.pkh)
                if (accountMvrkBalance.toNumber() < minMvrkBalance) {
                    requiredMvrkTopUpTotal += minMvrkTopUpMutez
                }

                const userStakeRecord = await doormanStorage.userStakeBalanceLedger.get(account.pkh)
                const userStakedMvnBalance = userStakeRecord === undefined ? 0 : userStakeRecord.balance.toNumber()
                const stakeAmount = Math.max(0, requiredStakedMvnBalance - userStakedMvnBalance)

                if (stakeAmount > 0) {
                    const userMvnBalanceRecord = await mvnTokenStorage.ledger.get(account.pkh)
                    const userMvnBalance = userMvnBalanceRecord === undefined ? 0 : userMvnBalanceRecord.toNumber()
                    requiredMvnTopUpTotal += Math.max(0, stakeAmount - userMvnBalance)
                }
            }

            const bobMvrkBalance = await utils.tezos.tz.getBalance(bob.pkh)
            const requiredBobMvrkBalance = requiredMvrkTopUpTotal + bobMvrkGasBuffer
            if (bobMvrkBalance.toNumber() < requiredBobMvrkBalance) {
                throw new Error(
                    `Bob needs at least ${requiredBobMvrkBalance / 10**6} MVRK for oracle setup, ` +
                    `but only has ${bobMvrkBalance.toNumber() / 10**6} MVRK. Fund ${bob.pkh} before running oracleSetup.`
                )
            }

            if (requiredMvnTopUpTotal > 0) {
                const bobMvnBalanceRecord = await mvnTokenStorage.ledger.get(bob.pkh)
                const bobMvnBalance = bobMvnBalanceRecord === undefined ? 0 : bobMvnBalanceRecord.toNumber()
                const bobMvnShortfall = Math.max(0, requiredMvnTopUpTotal - bobMvnBalance)

                if (bobMvnShortfall > 0) {
                    const bobCanMint = await mvnTokenStorage.whitelistContracts.get(bob.pkh)

                    if (bobCanMint === undefined) {
                        throw new Error(
                            `Bob needs ${requiredMvnTopUpTotal / 10**9} MVN for oracle setup, ` +
                            `but only has ${bobMvnBalance / 10**9} MVN and is not whitelisted to mint MVN. ` +
                            `Mint or transfer at least ${bobMvnShortfall / 10**9} MVN to ${bob.pkh} before running oracleSetup.`
                        )
                    }

                    await signerFactory(tezos, bob.sk)
                    console.log(`Minting ${bobMvnShortfall / 10**9} MVN to ${bob.pkh}`)
                    const mintMvnOperation = await mvnTokenInstance.methods.mint(bob.pkh, bobMvnShortfall).send()
                    await mintMvnOperation.confirmation()
                    mvnTokenStorage = await mvnTokenInstance.storage()
                }
            }

            for (const indexStr in accountsToRegister) {
                const index = parseInt(indexStr)
                const account: any = accountsToRegister[index]

                delegationStorage = await delegationInstance.storage()
                const satelliteRecord = await delegationStorage.satelliteLedger.get(account.pkh)
                if (satelliteRecord !== undefined) {
                    continue
                }

                const delegateRecord = await delegationStorage.delegateLedger.get(account.pkh)
                assert.equal(delegateRecord, undefined)

                await signerFactory(tezos, bob.sk)

                const accountMvrkBalance = await utils.tezos.tz.getBalance(account.pkh)
                if (accountMvrkBalance.toNumber() < minMvrkBalance) {
                    console.log(`Topping up ${account.pkh} with ${minMvrkTopUpAmount} MVRK`)
                    const topUpMvrkOperation = await utils.tezos.contract.transfer({
                        to: account.pkh,
                        amount: minMvrkTopUpAmount,
                    })
                    await topUpMvrkOperation.confirmation()
                }

                doormanStorage = await doormanInstance.storage()
                mvnTokenStorage = await mvnTokenInstance.storage()

                const userStakeRecord = await doormanStorage.userStakeBalanceLedger.get(account.pkh)
                const userStakedMvnBalance = userStakeRecord === undefined ? 0 : userStakeRecord.balance.toNumber()
                const stakeAmount = Math.max(0, requiredStakedMvnBalance - userStakedMvnBalance)

                if (stakeAmount > 0) {
                    const userMvnBalanceRecord = await mvnTokenStorage.ledger.get(account.pkh)
                    const userMvnBalance = userMvnBalanceRecord === undefined ? 0 : userMvnBalanceRecord.toNumber()

                    if (userMvnBalance < stakeAmount) {
                        await signerFactory(tezos, bob.sk)
                        console.log(`Topping up ${account.pkh} with ${(stakeAmount - userMvnBalance) / 10**9} MVN`)
                        const topUpMvnOperation = await mvnTokenInstance.methods.transfer([
                            {
                                from_: bob.pkh,
                                txs: [
                                    {
                                        to_: account.pkh,
                                        token_id: tokenId,
                                        amount: stakeAmount - userMvnBalance,
                                    }
                                ],
                            },
                        ]).send()
                        await topUpMvnOperation.confirmation()
                    }

                    await signerFactory(tezos, account.sk)
                    console.log(`Staking ${stakeAmount} MVN for ${account.pkh}`)
                    const updateOperatorsOperation = await updateOperators(
                        mvnTokenInstance,
                        account.pkh,
                        contractDeployments.doorman.address,
                        tokenId
                    )
                    await updateOperatorsOperation.confirmation()

                    const stakeOperation = await doormanInstance.methods.stakeMvn(stakeAmount).send()
                    await stakeOperation.confirmation()
                } else {
                    await signerFactory(tezos, account.sk)
                }

                const satelliteName = `Random Satellite ${index + 1}`
                const satelliteDescription = `Random satellite ${index + 1}`
                const satelliteImage = `https://placeholder.com/satellite-${index + 1}.png`
                const satelliteWebsite = `https://placeholder.com/satellite-${index + 1}`
                const satelliteFee = 500
                const oraclePublicKey = account.pk
                const oraclePeerId = account.peerId

                console.log(`Registering ${account.pkh} as satellite ${satelliteName}`)
                const registerAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite(
                    satelliteName,
                    satelliteDescription,
                    satelliteImage,
                    satelliteWebsite,
                    satelliteFee,
                    oraclePublicKey,
                    oraclePeerId
                ).send()
                await registerAsSatelliteOperation.confirmation()

                delegationStorage = await delegationInstance.storage()
                doormanStorage = await doormanInstance.storage()

                const updatedSatelliteRecord = await delegationStorage.satelliteLedger.get(account.pkh)
                const updatedRewardsRecord = await delegationStorage.satelliteRewardsLedger.get(account.pkh)
                const updatedUserStakeRecord = await doormanStorage.userStakeBalanceLedger.get(account.pkh)

                assert.equal(updatedSatelliteRecord.name, satelliteName)
                assert.equal(updatedSatelliteRecord.description, satelliteDescription)
                assert.equal(updatedSatelliteRecord.image, satelliteImage)
                assert.equal(updatedSatelliteRecord.website, satelliteWebsite)
                assert.equal(updatedSatelliteRecord.satelliteFee.toNumber(), satelliteFee)
                assert.equal(updatedSatelliteRecord.oraclePublicKey, oraclePublicKey)
                assert.equal(updatedSatelliteRecord.oraclePeerId, oraclePeerId)
                assert.equal(updatedSatelliteRecord.stakedMvnBalance.toNumber(), updatedUserStakeRecord.balance.toNumber())
                assert.equal(updatedSatelliteRecord.totalDelegatedAmount.toNumber(), 0)
                assert.equal(updatedSatelliteRecord.status, "ACTIVE")
                assert.notEqual(updatedRewardsRecord, undefined)
            }

            console.log("Satellites setup")
        } catch (e) {
            console.dir(e, { depth: 5 })
            throw e
        }

    })

    it(`satellites setup`, async () => {
        try {
            console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
        } catch (e) {
            console.log(e)
        }
    })

})
