from mavryk.utils.error_reporting import save_error_report

from mavryk.types.vesting.storage import VestingStorage
from dipdup.models import Transaction
from mavryk.types.vesting.parameter.claim import ClaimParameter
from dipdup.context import HandlerContext
from dateutil import parser 
import mavryk.models as models

async def on_vesting_claim(
    ctx: HandlerContext,
    claim: Transaction[ClaimParameter, VestingStorage],
) -> None:

    try:
        # Get operation values
        vesting_address                     = claim.data.target_address
        vestee_address                      = claim.data.sender_address
        vestee_storage                      = claim.storage.vesteeLedger[vestee_address]
        months_remaining                    = int(vestee_storage.monthsRemaining)
        months_claimed                      = int(vestee_storage.monthsClaimed)
        next_redemption_timestamp           = parser.parse(vestee_storage.nextRedemptionTimestamp)
        last_claimed_timestamp              = parser.parse(vestee_storage.lastClaimedTimestamp)
        total_claimed                       = float(vestee_storage.totalClaimed)
        total_remainder                     = float(vestee_storage.totalRemainder)
        total_vested_amount                 = float(claim.storage.totalVestedAmount)
    
        # Update and create record
        vesting = await models.Vesting.get(
            network = ctx.datasource.network,
            address = vesting_address
        )
        vestee  = await models.mavryk_user_cache.get(network=ctx.datasource.network, address=vestee_address)
        await models.VestingVestee.filter(
            vestee  = vestee,
            vesting = vesting
        ).update(
            months_remaining               = months_remaining,
            months_claimed                 = months_claimed,
            next_redemption_timestamp      = next_redemption_timestamp,
            last_claimed_timestamp         = last_claimed_timestamp,
            total_claimed                  = total_claimed,
            total_remainder                = total_remainder
        )
        vesting.months_remaining                    = total_vested_amount
        await vesting.save()
    except BaseException as e:
         await save_error_report(e)

