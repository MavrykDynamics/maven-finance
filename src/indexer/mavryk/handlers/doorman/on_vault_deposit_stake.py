from mavryk.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.types.doorman.tezos_parameters.deposit_stake import OnVaultDepositStakeParameter
from mavryk.types.doorman.tezos_storage import DoormanStorage
import mavryk.models as models

async def deposit_stake(
    ctx: HandlerContext,
    deposit_stake: TzktTransaction[OnVaultDepositStakeParameter, DoormanStorage],
) -> None:

    try:
        # Get operation info
        timestamp                                   = deposit_stake.data.timestamp
        doorman_address                             = deposit_stake.data.target_address
        vault_owner_address                         = deposit_stake.parameter.vaultOwner
        vault_owner_stake_balance_ledger            = deposit_stake.storage.userStakeBalanceLedger[vault_owner_address]
        vault_owner_smvk_balance                    = float(vault_owner_stake_balance_ledger.balance)
        vault_owner_total_exit_fee_rewards_claimed  = float(vault_owner_stake_balance_ledger.totalExitFeeRewardsClaimed)
        vault_owner_total_satellite_rewards_claimed = float(vault_owner_stake_balance_ledger.totalSatelliteRewardsClaimed)
        vault_owner_total_farm_rewards_claimed      = float(vault_owner_stake_balance_ledger.totalFarmRewardsClaimed)
        vault_owner_participation_fees_per_share    = float(vault_owner_stake_balance_ledger.participationFeesPerShare)
        vault_address                               = deposit_stake.parameter.vaultAddress
        vault_stake_balance_ledger                  = deposit_stake.storage.userStakeBalanceLedger[vault_address]
        vault_smvk_balance                          = float(vault_stake_balance_ledger.balance)
        vault_participation_fees_per_share          = float(vault_stake_balance_ledger.participationFeesPerShare)
        unclaimed_rewards                           = float(deposit_stake.storage.unclaimedRewards)
        accumulated_fees_per_share                  = float(deposit_stake.storage.accumulatedFeesPerShare)
    
        # Update records
        doorman                                     = await models.Doorman.get(
            network = ctx.datasource.network,
            address = doorman_address
        )
        
        # Vault owner
        vault_owner                     = await models.mavryk_user_cache.get(network=ctx.datasource.network, address=vault_owner_address)
        vault_owner_smvk_amount         = vault_owner_smvk_balance - vault_owner.smvk_balance
        vault_owner.smvk_balance        = vault_owner_smvk_balance
        await vault_owner.save()
        
        vault_owner_stake_account, _    = await models.DoormanStakeAccount.get_or_create(
            user    = vault_owner,
            doorman = doorman
        )
        vault_owner_stake_account.participation_fees_per_share      = vault_owner_participation_fees_per_share
        vault_owner_stake_account.total_exit_fee_rewards_claimed    = vault_owner_total_exit_fee_rewards_claimed
        vault_owner_stake_account.total_satellite_rewards_claimed   = vault_owner_total_satellite_rewards_claimed
        vault_owner_stake_account.total_farm_rewards_claimed        = vault_owner_total_farm_rewards_claimed
        vault_owner_stake_account.smvk_balance                      = vault_owner_smvk_balance
        await vault_owner_stake_account.save()
        
        # Vault
        vault                           = await models.mavryk_user_cache.get(network=ctx.datasource.network, address=vault_address)
        vault_smvk_amount               = vault_smvk_balance - vault.smvk_balance
        vault.smvk_balance              = vault_smvk_balance
        await vault_owner.save()
        
        vault_stake_account, _          = await models.DoormanStakeAccount.get_or_create(
            user    = vault_owner,
            doorman = doorman
        )
        vault_stake_account.participation_fees_per_share        = vault_participation_fees_per_share
        vault_stake_account.smvk_balance                        = vault_smvk_balance
        await vault_stake_account.save()
        
        # Get doorman info
        doorman_user        = await models.mavryk_user_cache.get(network=ctx.datasource.network, address=doorman_address)
        smvk_total_supply   = doorman_user.mvk_balance
        smvk_users          = await models.MavrykUser.filter(smvk_balance__gt=0).count()
        avg_smvk_per_user   = float(smvk_total_supply) / float(smvk_users)
        await doorman_user.save()
    
        # Create two stake records
        vault_owner_stake_record = models.StakeHistoryData(
            timestamp           = timestamp,
            type                = models.StakeType.VAULT_DEPOSIT_STAKED_TOKEN,
            desired_amount      = vault_owner_smvk_amount,
            final_amount        = vault_owner_smvk_amount,
            doorman             = doorman,
            from_               = vault_owner,
            smvk_total_supply   = smvk_total_supply,
            avg_smvk_per_user   = avg_smvk_per_user
        )
        await vault_owner_stake_record.save()
    
        vault_stake_record = models.StakeHistoryData(
            timestamp           = timestamp,
            type                = models.StakeType.VAULT_DEPOSIT_STAKED_TOKEN,
            desired_amount      = vault_smvk_amount,
            final_amount        = vault_smvk_amount,
            doorman             = doorman,
            from_               = vault,
            smvk_total_supply   = smvk_total_supply,
            avg_smvk_per_user   = avg_smvk_per_user
        )
        await vault_stake_record.save()
    
        # Update doorman contract
        doorman.unclaimed_rewards           = unclaimed_rewards
        doorman.accumulated_fees_per_share  = accumulated_fees_per_share
        await doorman.save()

    except BaseException as e:
        await save_error_report(e)

