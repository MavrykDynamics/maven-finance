
from dipdup.models import Transaction
from mavryk.types.vesting.parameter.add_vestee import AddVesteeParameter
from dipdup.context import HandlerContext
from mavryk.types.vesting.storage import VestingStorage
from dateutil import parser 
import mavryk.models as models

async def on_vesting_add_vestee(
    ctx: HandlerContext,
    add_vestee: Transaction[AddVesteeParameter, VestingStorage],
) -> None:
    # Get operation values
    vestingAddress                      = add_vestee.data.target_address
    vesteeAddress                       = add_vestee.parameter.address
    vesteeLedgerRecord                  = add_vestee.storage.vesteeLedger[vesteeAddress]
    vesteeTotalAllocatedAmount          = int(vesteeLedgerRecord.totalAllocatedAmount)
    vesteeClaimAmountPerMonth           = int(vesteeLedgerRecord.claimAmountPerMonth)
    vesteeStartTimestamp                = parser.parse(vesteeLedgerRecord.startTimestamp)
    vesteeVestingMonths                 = int(vesteeLedgerRecord.vestingMonths)
    vesteeCliffMonths                   = int(vesteeLedgerRecord.cliffMonths)
    vesteeEndCliffTimestamp             = parser.parse(vesteeLedgerRecord.endCliffDateTime)
    vesteeEndVestingTimestamp           = parser.parse(vesteeLedgerRecord.endVestingDateTime)
    vesteeStatus                        = vesteeLedgerRecord.status
    vesteeTotalRemainder                = int(vesteeLedgerRecord.totalRemainder)
    vesteeTotalClaimed                  = int(vesteeLedgerRecord.totalClaimed)
    vesteeMonthsClaimed                 = int(vesteeLedgerRecord.monthsClaimed)
    vesteeMonthsRemaining               = int(vesteeLedgerRecord.monthsRemaining)
    vesteeNextRedemptionTimestamp       = parser.parse(vesteeLedgerRecord.nextRedemptionTimestamp)
    vesteeLastClaimedTimestamp          = parser.parse(vesteeLedgerRecord.lastClaimedTimestamp)
    vesteeLocked = False
    if vesteeStatus == 'LOCKED':
        vesteeLocked    = True

    # Create and update records
    user, _ = await models.MavrykUser.get_or_create(
        address = vesteeAddress
    )
    await user.save()
    vesting = await models.Vesting.get(
        address = vestingAddress
    )
    vesteeRecord    = models.VestingVesteeRecord(
        vesting                         = vesting,
        vestee                          = user,
        total_allocated_amount          = vesteeTotalAllocatedAmount,
        claim_amount_per_month          = vesteeClaimAmountPerMonth,
        start_timestamp                 = vesteeStartTimestamp,
        vesting_months                  = vesteeVestingMonths,
        cliff_months                    = vesteeCliffMonths,
        end_cliff_timestamp             = vesteeEndCliffTimestamp, 
        end_vesting_timestamp           = vesteeEndVestingTimestamp,
        locked                          = vesteeLocked,
        total_remainder                 = vesteeTotalRemainder,
        total_claimed                   = vesteeTotalClaimed,
        months_claimed                  = vesteeMonthsClaimed,
        months_remaining                = vesteeMonthsRemaining,
        next_redemption_timestamp       = vesteeNextRedemptionTimestamp,
        last_claimed_timestamp          = vesteeLastClaimedTimestamp  
    )
    await vesteeRecord.save()