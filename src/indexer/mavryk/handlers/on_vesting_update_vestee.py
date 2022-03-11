
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
    # Get operation values
    vestingAddress                      = update_vestee.data.target_address
    vesteeAddress                       = update_vestee.parameter.address
    vesteeLedgerRecord                  = update_vestee.storage.vesteeLedger[vesteeAddress]
    vesteeTotalAllocatedAmount          = int(vesteeLedgerRecord.totalAllocatedAmount)
    vesteeClaimAmountPerMonth           = int(vesteeLedgerRecord.claimAmountPerMonth)
    vesteeStartBlock                    = int(vesteeLedgerRecord.startBlock)
    vesteeStartTimestamp                = parser.parse(vesteeLedgerRecord.startTimestamp)
    vesteeVestingMonths                 = int(vesteeLedgerRecord.vestingMonths)
    vesteeCliffMonths                   = int(vesteeLedgerRecord.cliffMonths)
    vesteeEndCliffBlock                 = int(vesteeLedgerRecord.endCliffBlock)
    vesteeEndCliffTimestamp             = parser.parse(vesteeLedgerRecord.endCliffDateTime)
    vesteeEndVestingBlock               = int(vesteeLedgerRecord.endVestingBlock)
    vesteeEndVestingTimestamp           = parser.parse(vesteeLedgerRecord.endVestingDateTime)
    vesteeStatus                        = vesteeLedgerRecord.status
    vesteeTotalRemainder                = int(vesteeLedgerRecord.totalRemainder)
    vesteeTotalClaimed                  = int(vesteeLedgerRecord.totalClaimed)
    vesteeMonthsClaimed                 = int(vesteeLedgerRecord.monthsClaimed)
    vesteeMonthsRemaining               = int(vesteeLedgerRecord.monthsRemaining)
    vesteeNextRedemptionBlock           = int(vesteeLedgerRecord.nextRedemptionBlock)
    vesteeNextRedemptionTimestamp       = parser.parse(vesteeLedgerRecord.nextRedemptionTimestamp)
    vesteeLastClaimedBlock              = int(vesteeLedgerRecord.lastClaimedBlock)
    vesteeLastClaimedTimestamp          = parser.parse(vesteeLedgerRecord.lastClaimedTimestamp)
    vesteeLocked = False
    if vesteeStatus == 'LOCKED':
        vesteeLocked    = True

    # Create and update records
    user, _ = await models.MavrykUser.get_or_create(
        address = vesteeAddress
    )
    vesting = await models.Vesting.get(
        address = vestingAddress
    )
    vesteeRecord    = await models.VestingVesteeRecord.get(
        vesting                         = vesting,
        vestee                          = user
    )
    vesteeRecord.total_allocated_amount          = vesteeTotalAllocatedAmount
    vesteeRecord.claim_amount_per_month          = vesteeClaimAmountPerMonth
    vesteeRecord.start_block                     = vesteeStartBlock
    vesteeRecord.start_timestamp                 = vesteeStartTimestamp
    vesteeRecord.vesting_months                  = vesteeVestingMonths
    vesteeRecord.cliff_months                    = vesteeCliffMonths
    vesteeRecord.end_cliff_block                 = vesteeEndCliffBlock
    vesteeRecord.end_cliff_timestamp             = vesteeEndCliffTimestamp
    vesteeRecord.end_vesting_block               = vesteeEndVestingBlock
    vesteeRecord.end_vesting_timestamp           = vesteeEndVestingTimestamp
    vesteeRecord.locked                          = vesteeLocked
    vesteeRecord.total_remainder                 = vesteeTotalRemainder
    vesteeRecord.total_claimed                   = vesteeTotalClaimed
    vesteeRecord.months_claimed                  = vesteeMonthsClaimed
    vesteeRecord.months_remaining                = vesteeMonthsRemaining
    vesteeRecord.next_redemption_block           = vesteeNextRedemptionBlock
    vesteeRecord.next_redemption_timestamp       = vesteeNextRedemptionTimestamp
    vesteeRecord.last_claimed_block              = vesteeLastClaimedBlock
    vesteeRecord.last_claimed_timestamp          = vesteeLastClaimedTimestamp
    await vesteeRecord.save()