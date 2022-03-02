
from mavryk.types.doorman.parameter.compound import CompoundParameter
from mavryk.types.doorman.storage import DoormanStorage
from dipdup.models import Transaction
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_doorman_compound(
    ctx: HandlerContext,
    compound: Transaction[CompoundParameter, DoormanStorage],
) -> None:
    # Get operation info
    doorman_address = compound.data.target_address
    sender_address = compound.data.sender_address
    sender_stake_balance_ledger = compound.data.storage['userStakeBalanceLedger'][sender_address]
    smvk_balance = int(sender_stake_balance_ledger['balance'])
    participation_fees_per_share = sender_stake_balance_ledger['participationFeesPerShare']
    timestamp = compound.data.timestamp
    doorman = await models.Doorman.get(address=doorman_address)
    unclaimed_rewards = int(compound.data.storage['unclaimedRewards'])
    accumulated_fees_per_share = int(compound.data.storage['accumulatedFeesPerShare'])

    # Get or create the interacting user
    user, _ = await models.User.get_or_create(
        address=sender_address
    )
    user.doorman = doorman
    amount = smvk_balance - user.smvk_balance
    user.smvk_balance = smvk_balance
    user.participation_fees_per_share = participation_fees_per_share
    await user.save()

    # Calculate the MLI
    mvk_total_supply = int(compound.data.storage['tempMvkTotalSupply'])
    smvk_total_supply = doorman.smvk_total_supply
    mli = 0.0
    if mvk_total_supply > 0.0:
        mli = smvk_total_supply / mvk_total_supply
    
    # Create a stake record
    stake_record = models.StakeRecord(
        timestamp=timestamp,
        type=models.StakeType.COMPOUND,
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
    await doorman.save()