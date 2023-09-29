from mavryk.utils.error_reporting import save_error_report

from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.types.vesting.tezos_parameters.update_vestee import UpdateVesteeParameter
from mavryk.types.vesting.tezos_storage import VestingStorage
from dipdup.context import HandlerContext
from dateutil import parser 
import mavryk.models as models

async def update_vestee(
    ctx: HandlerContext,
    update_vestee: TzktTransaction[UpdateVesteeParameter, VestingStorage],
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
        user    = await models.mavryk_user_cache.get(network=ctx.datasource.name.replace('tzkt_',''), address=vestee_address)
        vesting = await models.Vesting.get(
            network = ctx.datasource.name.replace('tzkt_',''),
            address = vesting_address
        )
        await models.VestingVestee.filter(
            vesting                         = vesting,
            vestee                          = user
        ).update(
            total_allocated_amount          = total_allocated_amount,
            claim_amount_per_month          = claim_amount_per_month,
            start_timestamp                 = start_timestamp,
            vesting_months                  = vesting_months,
            cliff_months                    = cliff_months,
            end_cliff_timestamp             = end_cliff_timestamp,
            end_vesting_timestamp           = end_vesting_timestamp,
            locked                          = locked,
            total_remainder                 = total_remainder,
            total_claimed                   = total_claimed,
            months_claimed                  = months_claimed,
            months_remaining                = months_remaining,
            next_redemption_timestamp       = next_redemption_timestamp,
            last_claimed_timestamp          = last_claimed_timestamp
        )

    except BaseException as e:
        await save_error_report(e)

