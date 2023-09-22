from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.types.doorman.tezos_parameters.exit import ExitParameter
from mavryk.types.doorman.tezos_storage import DoormanStorage
from mavryk.types.mvk_token.tezos_parameters.transfer import TransferParameter
from mavryk.types.mvk_token.tezos_storage import MvkTokenStorage
import mavryk.models as models
from mavryk.utils.error_reporting import save_error_report

async def exit(
    ctx: HandlerContext,
    exit: TzktTransaction[ExitParameter, DoormanStorage],
    transfer: TzktTransaction[TransferParameter, MvkTokenStorage],
) -> None:

    try:
        # Get operation info
        doorman_address                         = exit.data.target_address
        initiator_address                       = exit.data.sender_address
        initiator_stake_balance_ledger          = exit.storage.userStakeBalanceLedger[initiator_address]
        smvk_balance                            = float(initiator_stake_balance_ledger.balance)
        mvk_balance                             = float(transfer.storage.ledger[initiator_address])
        total_exit_fee_rewards_claimed          = float(initiator_stake_balance_ledger.totalExitFeeRewardsClaimed)
        total_satellite_rewards_claimed         = float(initiator_stake_balance_ledger.totalSatelliteRewardsClaimed)
        total_farm_rewards_claimed              = float(initiator_stake_balance_ledger.totalFarmRewardsClaimed)
        participation_fees_per_share            = float(initiator_stake_balance_ledger.participationFeesPerShare)
        timestamp                               = exit.data.timestamp
        final_amount                            = float(transfer.parameter.__root__[0].txs[0].amount)
        doorman                                 = await models.Doorman.get(address=doorman_address)
        unclaimed_rewards                       = float(exit.storage.unclaimedRewards)
        accumulated_fees_per_share              = float(exit.storage.accumulatedFeesPerShare)

        # Get or create the interacting user
        user                                    = await models.mavryk_user_cache.get(network=ctx.datasource.name.replace('tzkt_',''), address=initiator_address)
        user.mvk_balance                        = mvk_balance
        user.smvk_balance                       = smvk_balance
        await user.save()
        
        stake_account, _    = await models.DoormanStakeAccount.get_or_create(
            user    = user,
            doorman = doorman
        )
        stake_account.participation_fees_per_share      = participation_fees_per_share
        stake_account.total_exit_fee_rewards_claimed    = total_exit_fee_rewards_claimed
        stake_account.total_satellite_rewards_claimed   = total_satellite_rewards_claimed
        stake_account.total_farm_rewards_claimed        = total_farm_rewards_claimed
        stake_account.smvk_balance                      = smvk_balance
        await stake_account.save()

        # Create a stake record
        stake_record = models.StakeHistoryData(
            timestamp           = timestamp,
            type                = models.StakeType.EXIT,
            desired_amount      = final_amount,
            final_amount        = final_amount,
            doorman             = doorman,
            from_               = user
        )
        await stake_record.save()

        # Update doorman contract
        doorman.unclaimed_rewards               = unclaimed_rewards
        doorman.accumulated_fees_per_share      = accumulated_fees_per_share
        await doorman.save()

    except BaseException as e:
         await save_error_report(e)
