
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.doorman.storage import DoormanStorage
from mavryk.types.doorman.parameter.farm_claim import FarmClaimParameter
import mavryk.models as models

async def on_doorman_farm_claim(
    ctx: HandlerContext,
    farm_claim: Transaction[FarmClaimParameter, DoormanStorage],
) -> None:
    
    # Get operation info
    doorman_address                 = farm_claim.data.target_address
    sender_address                  = farm_claim.data.sender_address
    sender_stake_balance_ledger     = farm_claim.storage.userStakeBalanceLedger[sender_address]
    smvk_balance                    = float(sender_stake_balance_ledger.balance)
    participation_fees_per_share    = sender_stake_balance_ledger.participationFeesPerShare
    timestamp                       = farm_claim.data.timestamp
    doorman                         = await models.Doorman.get(address=doorman_address)
    unclaimed_rewards               = float(farm_claim.storage.unclaimedRewards)
    accumulated_fees_per_share      = float(farm_claim.storage.accumulatedFeesPerShare)

    # Get or create the interacting user
    user, _ = await models.MavrykUser.get_or_create(
        address=sender_address
    )
    user.doorman                        = doorman
    amount                              = smvk_balance - user.smvk_balance
    user.smvk_balance                   = smvk_balance
    user.participation_fees_per_share   = participation_fees_per_share
    await user.save()

    # Calculate the MLI
    # TODO: IS IT OK?
    # mvkToken                    = await models.MVKToken.get(address=farm_claim.storage.mvkTokenAddress)
    # previous_mvk_total_supply   = float(mvkToken.total_supply)
    # previous_smvk_total_supply  = smvk_total_supply - amount
    # mli = 0.0
    # if previous_mvk_total_supply > 0.0:
    #     mli = previous_smvk_total_supply / previous_mvk_total_supply
    
    # Create a stake record
    stake_record = models.StakeRecord(
        timestamp           = timestamp,
        type                = models.StakeType.farm_claim,
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