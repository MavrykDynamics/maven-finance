
from mavryk.types.mvk.parameter.transfer import TransferParameter
from dipdup.models import Transaction
from mavryk.types.doorman.parameter.stake import StakeParameter
from dipdup.context import HandlerContext
from mavryk.types.doorman.storage import DoormanStorage
from mavryk.types.mvk.storage import MvkStorage
import mavryk.models as models

async def on_doorman_stake(
    ctx: HandlerContext,
    stake: Transaction[StakeParameter, DoormanStorage],
    transfer: Transaction[TransferParameter, MvkStorage],
) -> None:

    # Get operation info
    doorman_address                     = stake.data.target_address
    sender_address                      = stake.data.sender_address
    sender_stake_balance_ledger         = stake.storage.userStakeBalanceLedger[sender_address]
    smvk_balance                        = float(sender_stake_balance_ledger.balance)
    mvk_balance                         = float(transfer.storage.ledger[sender_address])
    participation_fees_per_share        = float(sender_stake_balance_ledger.participationFeesPerShare)
    timestamp                           = stake.data.timestamp
    amount                              = float(stake.parameter.__root__)
    doorman                             = await models.Doorman.get(address=doorman_address)
    unclaimed_rewards                   = float(stake.storage.unclaimedRewards)
    accumulated_fees_per_share          = float(stake.storage.accumulatedFeesPerShare)

    # Get or create the interacting user
    user, _ = await models.MavrykUser.get_or_create(
        address=sender_address
    )
    user.doorman = doorman
    user.mvk_balance = mvk_balance
    user.smvk_balance = smvk_balance
    user.participation_fees_per_share = participation_fees_per_share
    await user.save()

    # Calculate the MLI
    # previous_mvk_total_supply   = float(transfer.storage.totalSupply) + amount
    # previous_smvk_total_supply  = smvk_total_supply - amount
    # mli = 0.0
    # if previous_mvk_total_supply > 0.0:
    #     mli = previous_smvk_total_supply / previous_mvk_total_supply
    
    # Create a stake record
    stake_record = models.StakeRecord(
        timestamp           = timestamp,
        type                = models.StakeType.STAKE,
        desired_amount      = amount,
        final_amount        = amount,
        doorman             = doorman,
        from_               = user,
        # mvk_loyalty_index   = mli
    )
    await stake_record.save()

    # Update doorman contract
    doorman.unclaimed_rewards           = unclaimed_rewards
    doorman.accumulated_fees_per_share  = accumulated_fees_per_share
    await doorman.save()