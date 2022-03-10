
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
    doorman_address = stake.data.target_address
    sender_address = stake.data.sender_address
    sender_stake_balance_ledger = stake.data.storage['userStakeBalanceLedger'][sender_address]
    smvk_balance = int(sender_stake_balance_ledger['balance'])
    mvk_balance = int(transfer.data.storage['ledger'][sender_address])
    participation_fees_per_share = sender_stake_balance_ledger['participationFeesPerShare']
    timestamp = stake.data.timestamp
    amount = int(stake.parameter.__root__)
    doorman = await models.Doorman.get(address=doorman_address)
    unclaimed_rewards = int(stake.data.storage['unclaimedRewards'])
    accumulated_fees_per_share = int(stake.data.storage['accumulatedFeesPerShare'])

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
    mvk_total_supply = int(transfer.data.storage['totalSupply'])
    smvk_total_supply = doorman.smvk_total_supply
    mli = 0.0
    if mvk_total_supply > 0.0:
        mli = smvk_total_supply / mvk_total_supply
    
    # Create a stake record
    stake_record = models.StakeRecord(
        timestamp=timestamp,
        type=models.StakeType.STAKE,
        desired_amount=amount,
        final_amount=amount,
        doorman=doorman,
        from_=user,
        mvk_loyalty_index=mli
    )
    await stake_record.save()

    # Update doorman contract
    doorman.unclaimed_rewards = unclaimed_rewards
    doorman.accumulated_fees_per_share = accumulated_fees_per_share
    doorman.smvk_total_supply += amount
    await doorman.save()