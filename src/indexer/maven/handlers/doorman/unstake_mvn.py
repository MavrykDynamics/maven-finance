from maven.utils.error_reporting import save_error_report

from maven.types.mvn_token.tezos_parameters.transfer import TransferParameter
from maven.types.doorman.tezos_storage import DoormanStorage
from dipdup.models.tezos_tzkt import TzktTransaction
from dipdup.context import HandlerContext
from maven.types.doorman.tezos_parameters.unstake_mvn import UnstakeMvnParameter
from maven.types.mvn_token.tezos_storage import MvnTokenStorage
import maven.models as models

async def unstake_mvn(
    ctx: HandlerContext,
    unstake_mvn: TzktTransaction[UnstakeMvnParameter, DoormanStorage],
    transfer: TzktTransaction[TransferParameter, MvnTokenStorage],
) -> None:

    try:
        # Get operation info
        doorman_address                         = unstake_mvn.data.target_address
        initiator_address                       = unstake_mvn.data.sender_address
        initiator_stake_balance_ledger          = unstake_mvn.storage.userStakeBalanceLedger[initiator_address]
        smvn_balance                            = float(initiator_stake_balance_ledger.balance)
        mvn_balance                             = float(transfer.storage.ledger[initiator_address])
        total_exit_fee_rewards_claimed          = float(initiator_stake_balance_ledger.totalExitFeeRewardsClaimed)
        total_satellite_rewards_claimed         = float(initiator_stake_balance_ledger.totalSatelliteRewardsClaimed)
        total_farm_rewards_claimed              = float(initiator_stake_balance_ledger.totalFarmRewardsClaimed)
        participation_fees_per_share            = float(initiator_stake_balance_ledger.participationFeesPerShare)
        timestamp                               = unstake_mvn.data.timestamp
        desired_amount                          = float(unstake_mvn.parameter.__root__)
        final_amount                            = float(transfer.parameter.__root__[0].txs[0].amount)
        doorman                                 = await models.Doorman.get(network=ctx.datasource.name.replace('tzkt_',''), address=doorman_address)
        unclaimed_rewards                       = float(unstake_mvn.storage.unclaimedRewards)
        accumulated_fees_per_share              = float(unstake_mvn.storage.accumulatedFeesPerShare)

        # Get or create the interacting user
        user                                    = await models.maven_user_cache.get(network=ctx.datasource.name.replace('tzkt_',''), address=initiator_address)
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
            type                = models.StakeType.UNSTAKE,
            desired_amount      = desired_amount,
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

