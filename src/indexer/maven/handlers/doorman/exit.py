from dipdup.context import HandlerContext
from dipdup.models.tezos import TezosTransaction
from maven.types.doorman.tezos_parameters.exit import ExitParameter
from maven.types.doorman.tezos_storage import DoormanStorage
from maven.types.mvn_token.tezos_parameters.transfer import TransferParameter
from maven.types.mvn_token.tezos_storage import MvnTokenStorage
from maven import models as models
from maven.utils.error_reporting import save_error_report

async def exit(
    ctx: HandlerContext,
    exit: TezosTransaction[ExitParameter, DoormanStorage],
    transfer: TezosTransaction[TransferParameter, MvnTokenStorage],
) -> None:

    try:
        # Get operation info
        doorman_address                         = exit.data.target_address
        initiator_address                       = exit.data.sender_address
        initiator_stake_balance_ledger          = exit.storage.userStakeBalanceLedger[initiator_address]
        smvn_balance                            = float(initiator_stake_balance_ledger.balance)
        mvn_balance                             = float(transfer.storage.ledger[initiator_address])
        total_exit_fee_rewards_claimed          = float(initiator_stake_balance_ledger.totalExitFeeRewardsClaimed)
        total_satellite_rewards_claimed         = float(initiator_stake_balance_ledger.totalSatelliteRewardsClaimed)
        total_farm_rewards_claimed              = float(initiator_stake_balance_ledger.totalFarmRewardsClaimed)
        participation_fees_per_share            = float(initiator_stake_balance_ledger.participationFeesPerShare)
        timestamp                               = exit.data.timestamp
        final_amount                            = float(transfer.parameter.root[0].txs[0].amount)
        doorman                                 = await models.Doorman.get(address=doorman_address)
        unclaimed_rewards                       = float(exit.storage.unclaimedRewards)
        accumulated_fees_per_share              = float(exit.storage.accumulatedFeesPerShare)

        # Get or create the interacting user
        user                                    = await models.maven_user_cache.get(network='atlasnet', address=initiator_address)
        user.mvn_balance                        = mvn_balance
        user.smvn_balance                       = smvn_balance
        await user.save()
        
        stake_account, _    = await models.DoormanStakeAccount.get_or_create(
            user    = user,
            doorman = doorman
        )
        stake_account.participation_fees_per_share      = participation_fees_per_share
        stake_account.total_exit_fee_rewards_claimed    = total_exit_fee_rewards_claimed
        stake_account.total_satellite_rewards_claimed   = total_satellite_rewards_claimed
        stake_account.total_farm_rewards_claimed        = total_farm_rewards_claimed
        stake_account.smvn_balance                      = smvn_balance
        await stake_account.save()

        # Create a stakeMvn record
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
