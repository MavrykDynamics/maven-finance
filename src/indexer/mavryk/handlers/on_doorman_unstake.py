
from mavryk.types.mvk.parameter.transfer import TransferParameter
from mavryk.types.doorman.storage import DoormanStorage
from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.doorman.parameter.unstake import UnstakeParameter
from mavryk.types.mvk.storage import MvkStorage
from mavryk.types.doorman.parameter.unstake_complete import UnstakeCompleteParameter
import mavryk.models as models

async def on_doorman_unstake(
    ctx: HandlerContext,
    unstake: Transaction[UnstakeParameter, DoormanStorage],
    unstake_complete: Transaction[UnstakeCompleteParameter, DoormanStorage],
    transfer: Transaction[TransferParameter, MvkStorage],
) -> None:
    # Get operation info
    doorman_address = unstake_complete.data.target_address
    initiator_address = unstake_complete.data.initiator_address
    initiator_stake_balance_ledger = unstake_complete.data.storage['userStakeBalanceLedger'][initiator_address]
    smvk_balance = int(initiator_stake_balance_ledger['balance'])
    mvk_balance = int(transfer.data.storage['ledger'][initiator_address])
    participation_fees_per_share = initiator_stake_balance_ledger['participationFeesPerShare']
    timestamp = unstake_complete.data.timestamp
    desired_amount = int(unstake.parameter.__root__)
    final_amount = int(transfer.parameter.__root__[0].txs[0].amount)
    exit_fee = desired_amount - final_amount
    doorman = await models.Doorman.get(address=doorman_address)
    unclaimed_rewards = int(unstake_complete.data.storage['unclaimedRewards'])
    accumulated_fees_per_share = int(unstake_complete.data.storage['accumulatedFeesPerShare'])

    # Get or create the interacting user
    user, _ = await models.MavrykUser.get_or_create(
        address=initiator_address
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
        type=models.StakeType.UNSTAKE,
        desired_amount=desired_amount,
        final_amount=final_amount,
        exit_fee=exit_fee,
        doorman=doorman,
        from_=user,
        mvk_loyalty_index=mli
    )
    await stake_record.save()

    # Update doorman contract
    doorman.unclaimed_rewards = unclaimed_rewards
    doorman.accumulated_fees_per_share = accumulated_fees_per_share
    doorman.smvk_total_supply -= final_amount
    await doorman.save()