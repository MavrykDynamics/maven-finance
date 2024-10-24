from maven.utils.error_reporting import save_error_report

from dipdup.models.tezos import TezosTransaction
from maven.types.vesting.tezos_parameters.add_vestee import AddVesteeParameter
from dipdup.context import HandlerContext
from maven.types.vesting.tezos_storage import VestingStorage
from dateutil import parser 
import maven.models as models

async def add_vestee(
    ctx: HandlerContext,
    add_vestee: TezosTransaction[AddVesteeParameter, VestingStorage],
) -> None:

    try:
        # Get operation values
        vesting_address                     = add_vestee.data.target_address
        vestee_address                      = add_vestee.parameter.vesteeAddress
        vestee_storage                      = add_vestee.storage.vesteeLedger[vestee_address]
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
        user    = await models.maven_user_cache.get(network='atlasnet', address=vestee_address)
        vesting = await models.Vesting.get(
            network = 'atlasnet',
            address = vesting_address
        )
        vestee_record   = models.VestingVestee(
            vesting                         = vesting,
            vestee                          = user,
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
        await vestee_record.save()
    except BaseException as e:
        await save_error_report(e)

