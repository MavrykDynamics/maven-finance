
from mavryk.types.mvk.parameter.transfer import TransferParameter
from mavryk.types.doorman.storage import DoormanStorage
from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.doorman.parameter.unstake import UnstakeParameter
from mavryk.types.mvk.storage import MvkStorage
import mavryk.models as models

async def on_doorman_unstake(
    ctx: HandlerContext,
    unstake: Transaction[UnstakeParameter, DoormanStorage],
    transfer: Transaction[TransferParameter, MvkStorage],
) -> None:

    # Get operation info
    doorman_address                         = unstake.data.target_address
    initiator_address                       = unstake.data.sender_address
    initiator_stake_balance_ledger          = unstake.storage.userStakeBalanceLedger[initiator_address]
    smvk_balance                            = float(initiator_stake_balance_ledger.balance)
    mvk_balance                             = float(transfer.storage.ledger[initiator_address])
    participation_fees_per_share            = float(initiator_stake_balance_ledger.participationFeesPerShare)
    timestamp                               = unstake.data.timestamp
    desired_amount                          = float(unstake.parameter.__root__)
    final_amount                            = float(transfer.parameter.__root__[0].txs[0].amount)
    doorman                                 = await models.Doorman.get(address=doorman_address)
    unclaimed_rewards                       = float(unstake.storage.unclaimedRewards)
    accumulated_fees_per_share              = float(unstake.storage.accumulatedFeesPerShare)
    smvk_total_supply                       = float(unstake.storage.stakedMvkTotalSupply)

    # Get or create the interacting user
    user, _ = await models.MavrykUser.get_or_create(
        address=initiator_address
    )
    user.doorman                            = doorman
    user.mvk_balance                        = mvk_balance
    user.smvk_balance                       = smvk_balance
    user.participation_fees_per_share       = participation_fees_per_share
    await user.save()

    # Calculate the new MLI
    previous_mvk_total_supply   = float(transfer.storage.totalSupply) - final_amount
    previous_smvk_total_supply  = smvk_total_supply + final_amount
    mli = 0.0
    if previous_mvk_total_supply > 0.0:
        mli = previous_smvk_total_supply / previous_mvk_total_supply

    # Create a stake record
    stake_record = models.StakeRecord(
        timestamp           = timestamp,
        type                = models.StakeType.UNSTAKE,
        desired_amount      = desired_amount,
        final_amount        = final_amount,
        doorman             = doorman,
        from_               = user,
        mvk_loyalty_index   = mli
    )
    await stake_record.save()

    # Update doorman contract
    doorman.unclaimed_rewards               = unclaimed_rewards
    doorman.accumulated_fees_per_share      = accumulated_fees_per_share
    doorman.smvk_total_supply               = smvk_total_supply
    await doorman.save()
