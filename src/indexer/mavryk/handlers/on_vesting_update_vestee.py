from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Transaction
from mavryk.types.vesting.parameter.update_vestee import UpdateVesteeParameter
from mavryk.types.vesting.storage import VestingStorage
from dipdup.context import HandlerContext
from dateutil import parser 
import mavryk.models as models

async def on_vesting_update_vestee(
    ctx: HandlerContext,
    update_vestee: Transaction[UpdateVesteeParameter, VestingStorage],
) -> None:

    try:
        # Get operation values
        vesting_address                     = update_vestee.data.target_address
        vestee_address                      = update_vestee.parameter.vesteeAddress
        vestee_storage                      = update_vestee.storage.vesteeLedger[vestee_address]
        total_allocated_amount              = float(vestee_storage.totalAllocatedAmount)
        claim_amount_per_month              = float(vestee_storage.claimAmountPerMonth)
        start_timestamp                     = parser.parse(vestee_storage.startTimestamp)
        vesting_months                      = int(vestee_storage.vestingMonths)
        cliff_months                        = int(vestee_storage.cliffMonths)
        end_cliff_timestamp                 = parser.parse(vestee_storage.endCliffDateTime)
        end_vesting_timestamp               = parser.parse(vestee_storage.endVestingDateTime)
        status                              = vestee_storage.status
        total_remainder                     = float(vestee_storage.totalRemainder)
        total_claimed                       = float(vestee_storage.totalClaimed)
        months_claimed                      = int(vestee_storage.monthsClaimed)
        months_remaining                    = int(vestee_storage.monthsRemaining)
        next_redemption_timestamp           = parser.parse(vestee_storage.nextRedemptionTimestamp)
        last_claimed_timestamp              = parser.parse(vestee_storage.lastClaimedTimestamp)
        locked                              = False
        if status == 'LOCKED':
            locked    = True
    
        # Create and update records
        user    = await models.mavryk_user_cache.get(network=ctx.datasource.network, address=vestee_address)
        vesting = await models.Vesting.get(
            network = ctx.datasource.network,
            address = vesting_address
        )
        vestee_record    = await models.VestingVestee.filter(
            vesting                         = vesting,
            vestee                          = user
        ).first()
        vestee_record.total_allocated_amount          = total_allocated_amount
        vestee_record.claim_amount_per_month          = claim_amount_per_month
        vestee_record.start_timestamp                 = start_timestamp
        vestee_record.vesting_months                  = vesting_months
        vestee_record.cliff_months                    = cliff_months
        vestee_record.end_cliff_timestamp             = end_cliff_timestamp
        vestee_record.end_vesting_timestamp           = end_vesting_timestamp
        vestee_record.locked                          = locked
        vestee_record.total_remainder                 = total_remainder
        vestee_record.total_claimed                   = total_claimed
        vestee_record.months_claimed                  = months_claimed
        vestee_record.months_remaining                = months_remaining
        vestee_record.next_redemption_timestamp       = next_redemption_timestamp
        vestee_record.last_claimed_timestamp          = last_claimed_timestamp
        await vestee_record.save()
    except BaseException as e:
         await save_error_report(e)

