from maven.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from dipdup.models.tezos import TezosTransaction
from maven.types.doorman.tezos_parameters.on_vault_deposit_stake import OnVaultDepositStakeParameter
from maven.types.doorman.tezos_storage import DoormanStorage
from maven import models as models

async def on_vault_deposit_stake(
    ctx: HandlerContext,
    on_vault_deposit_stake: TezosTransaction[OnVaultDepositStakeParameter, DoormanStorage],
) -> None:

    try:
        # Get operation info
        timestamp                                   = on_vault_deposit_stake.data.timestamp
        doorman_address                             = on_vault_deposit_stake.data.target_address
        vault_owner_address                         = on_vault_deposit_stake.parameter.vaultOwner
        vault_owner_stake_balance_ledger            = on_vault_deposit_stake.storage.userStakeBalanceLedger[vault_owner_address]
        vault_owner_smvn_balance                    = float(vault_owner_stake_balance_ledger.balance)
        vault_owner_total_exit_fee_rewards_claimed  = float(vault_owner_stake_balance_ledger.totalExitFeeRewardsClaimed)
        vault_owner_total_satellite_rewards_claimed = float(vault_owner_stake_balance_ledger.totalSatelliteRewardsClaimed)
        vault_owner_total_farm_rewards_claimed      = float(vault_owner_stake_balance_ledger.totalFarmRewardsClaimed)
        vault_owner_participation_fees_per_share    = float(vault_owner_stake_balance_ledger.participationFeesPerShare)
        vault_address                               = on_vault_deposit_stake.parameter.vaultAddress
        vault_stake_balance_ledger                  = on_vault_deposit_stake.storage.userStakeBalanceLedger[vault_address]
        vault_smvn_balance                          = float(vault_stake_balance_ledger.balance)
        vault_participation_fees_per_share          = float(vault_stake_balance_ledger.participationFeesPerShare)
        unclaimed_rewards                           = float(on_vault_deposit_stake.storage.unclaimedRewards)
        accumulated_fees_per_share                  = float(on_vault_deposit_stake.storage.accumulatedFeesPerShare)
    
        # Update records
        doorman                                     = await models.Doorman.get(
            network = 'atlasnet',
            address = doorman_address
        )
        
        # Vault owner
        vault_owner                     = await models.maven_user_cache.get(network='atlasnet', address=vault_owner_address)
        vault_owner_smvn_amount         = vault_owner_smvn_balance - vault_owner.smvn_balance
        vault_owner.smvn_balance        = vault_owner_smvn_balance
        await vault_owner.save()
        
        vault_owner_stake_account, _    = await models.DoormanStakeAccount.get_or_create(
            user    = vault_owner,
            doorman = doorman
        )
        vault_owner_stake_account.participation_fees_per_share      = vault_owner_participation_fees_per_share
        vault_owner_stake_account.total_exit_fee_rewards_claimed    = vault_owner_total_exit_fee_rewards_claimed
        vault_owner_stake_account.total_satellite_rewards_claimed   = vault_owner_total_satellite_rewards_claimed
        vault_owner_stake_account.total_farm_rewards_claimed        = vault_owner_total_farm_rewards_claimed
        vault_owner_stake_account.smvn_balance                      = vault_owner_smvn_balance
        await vault_owner_stake_account.save()
        
        # Vault
        vault                           = await models.maven_user_cache.get(network='atlasnet', address=vault_address)
        vault_smvn_amount               = vault_smvn_balance - vault.smvn_balance
        vault.smvn_balance              = vault_smvn_balance
        await vault_owner.save()
        
        vault_stake_account, _          = await models.DoormanStakeAccount.get_or_create(
            user    = vault_owner,
            doorman = doorman
        )
        vault_stake_account.participation_fees_per_share        = vault_participation_fees_per_share
        vault_stake_account.smvn_balance                        = vault_smvn_balance
        await vault_stake_account.save()
        
        # Get doorman info
        doorman_user        = await models.maven_user_cache.get(network='atlasnet', address=doorman_address)
        smvn_total_supply   = doorman_user.mvn_balance
        smvn_users          = await models.MavenUser.filter(smvn_balance__gt=0).count()
        avg_smvn_per_user   = float(smvn_total_supply) / float(smvn_users)
        await doorman_user.save()
    
        # Create two stakeMvn records
        vault_owner_stake_record = models.StakeHistoryData(
            timestamp           = timestamp,
            type                = models.StakeType.VAULT_DEPOSIT_STAKED_TOKEN,
            desired_amount      = vault_owner_smvn_amount,
            final_amount        = vault_owner_smvn_amount,
            doorman             = doorman,
            from_               = vault_owner,
            smvn_total_supply   = smvn_total_supply,
            avg_smvn_per_user   = avg_smvn_per_user
        )
        await vault_owner_stake_record.save()
    
        vault_stake_record = models.StakeHistoryData(
            timestamp           = timestamp,
            type                = models.StakeType.VAULT_DEPOSIT_STAKED_TOKEN,
            desired_amount      = vault_smvn_amount,
            final_amount        = vault_smvn_amount,
            doorman             = doorman,
            from_               = vault,
            smvn_total_supply   = smvn_total_supply,
            avg_smvn_per_user   = avg_smvn_per_user
        )
        await vault_stake_record.save()
    
        # Update doorman contract
        doorman.unclaimed_rewards           = unclaimed_rewards
        doorman.accumulated_fees_per_share  = accumulated_fees_per_share
        await doorman.save()

    except BaseException as e:
        await save_error_report(e)

