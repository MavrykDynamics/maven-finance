from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.doorman.parameter.exit import ExitParameter
from mavryk.types.doorman.storage import DoormanStorage
from mavryk.types.mvk_token.parameter.transfer import TransferParameter
from mavryk.types.mvk_token.storage import MvkTokenStorage
import mavryk.models as models

async def on_doorman_exit(
    ctx: HandlerContext,
    exit: Transaction[ExitParameter, DoormanStorage],
    transfer: Transaction[TransferParameter, MvkTokenStorage],
) -> None:

    # Get operation info
    doorman_address                         = exit.data.target_address
    initiator_address                       = exit.data.sender_address
    initiator_stake_balance_ledger          = exit.storage.userStakeBalanceLedger[initiator_address]
    smvk_balance                            = float(initiator_stake_balance_ledger.balance)
    mvk_balance                             = float(transfer.storage.ledger[initiator_address])
    participation_fees_per_share            = float(initiator_stake_balance_ledger.participationFeesPerShare)
    timestamp                               = exit.data.timestamp
    final_amount                            = float(transfer.parameter.__root__[0].txs[0].amount)
    doorman                                 = await models.Doorman.get(address=doorman_address)
    unclaimed_rewards                       = float(exit.storage.unclaimedRewards)
    accumulated_fees_per_share              = float(exit.storage.accumulatedFeesPerShare)

    # Get or create the interacting user
    user                                    = await models.mavryk_user_cache.get(address=initiator_address)
    user.mvk_balance                        = mvk_balance
    user.smvk_balance                       = smvk_balance
    await user.save()
    
    stake_account, _    = await models.DoormanStakeAccount.get_or_create(
        user    = user,
        doorman = doorman
    )
    stake_account.participation_fees_per_share  = participation_fees_per_share
    stake_account.smvk_balance                  = smvk_balance
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
