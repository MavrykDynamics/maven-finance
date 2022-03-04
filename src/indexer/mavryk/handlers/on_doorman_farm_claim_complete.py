
from mavryk.types.doorman.parameter.farm_claim_complete import FarmClaimCompleteParameter
from dipdup.context import HandlerContext
from mavryk.types.doorman.storage import DoormanStorage
from dipdup.models import Transaction
import mavryk.models as models

async def on_doorman_farm_claim_complete(
    ctx: HandlerContext,
    farm_claim_complete: Transaction[FarmClaimCompleteParameter, DoormanStorage],
) -> None:
    # Get operation values
    timestamp = farm_claim_complete.data.timestamp
    userAddress = farm_claim_complete.parameter.address
    userSMVKBalance = int(farm_claim_complete.storage.userStakeBalanceLedger[userAddress].balance)
    userParticipation = float(farm_claim_complete.storage.userStakeBalanceLedger[userAddress].participationFeesPerShare)
    farmClaim = farm_claim_complete.parameter.nat
    doormanAddress = farm_claim_complete.data.target_address
    doormanSMVKBalance = int(farm_claim_complete.storage.stakedMvkTotalSupply)
    doormanAccumulated = float(farm_claim_complete.storage.accumulatedFeesPerShare)

    # Get doorman
    doorman = await models.Doorman.get(
        address = doormanAddress
    )
    doorman.smvk_total_supply = doormanSMVKBalance
    doorman.accumulated_fees_per_share = doormanAccumulated
    await doorman.save()

    # Get user
    user = await models.User.get(
        address = userAddress
    )
    user.smvk_balance = userSMVKBalance
    user.doorman = doorman
    user.participation_fees_per_share = userParticipation
    await user.save()

    # Calculate the MLI
    mvk_total_supply = int(farm_claim_complete.data.storage['tempMvkTotalSupply'])
    smvk_total_supply = doorman.smvk_total_supply
    mli = 0.0
    if mvk_total_supply > 0.0:
        mli = smvk_total_supply / mvk_total_supply

    # Create a stake record
    stakeRecord = models.StakeRecord(
        timestamp                       = timestamp,
        type                            = models.StakeType.FARM_CLAIM,
        mvk_loyalty_index               = mli,
        exit_fee                        = 0,
        from_                           = user,
        desired_amount                  = farmClaim,
        final_amount                    = farmClaim,
        doorman                         = doorman
    )
    await stakeRecord.save()