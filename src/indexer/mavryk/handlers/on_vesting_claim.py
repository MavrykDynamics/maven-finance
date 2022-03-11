
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
    #TODO: could not be tested because of how the contract works
    # Get operation values
    vestingAddress                      = claim.data.target_address
    vesteeAddress                       = claim.data.sender_address
    vesteeLedgerRecord                  = claim.storage.vesteeLedger[vesteeAddress]
    vesteeMonthsRemaining               = int(vesteeLedgerRecord.monthsRemaining)
    vesteeMonthsClaimed                 = int(vesteeLedgerRecord.monthsClaimed)
    vesteeNextRedemptionBlock           = int(vesteeLedgerRecord.nextRedemptionBlock)
    vesteeNextRedemptionTimestamp       = parser.parse(vesteeLedgerRecord.nextRedemptionTimestamp)
    vesteeLastClaimedBlock              = int(vesteeLedgerRecord.lastClaimedBlock)
    vesteeLastClaimedTimestamp          = parser.parse(vesteeLedgerRecord.lastClaimedTimestamp)
    vesteeTotalClaimed                  = int(vesteeLedgerRecord.totalClaimed)
    vesteeTotalRemainder                = int(vesteeLedgerRecord.totalRemainder)
    vestingTotalVestedAmount            = int(claim.storage.totalVestedAmount)

    # Update and create record
    vesting = await models.Vesting.get(
        address=vestingAddress
    )
    vestee = await models.MavrykUser.get(
        address=vesteeAddress
    )
    vesteeRecord    = await models.VestingVesteeRecord.get(
        vestee=vestee,
        vesting=vesting
    )
    vesteeRecord.months_remaining               = vesteeMonthsRemaining
    vesteeRecord.months_claimed                 = vesteeMonthsClaimed
    vesteeRecord.next_redemption_block          = vesteeNextRedemptionBlock
    vesteeRecord.next_redemption_timestamp      = vesteeNextRedemptionTimestamp
    vesteeRecord.last_claimed_block             = vesteeLastClaimedBlock
    vesteeRecord.last_claimed_timestamp         = vesteeLastClaimedTimestamp
    vesteeRecord.total_claimed                  = vesteeTotalClaimed
    vesteeRecord.total_remainder                = vesteeTotalRemainder
    vesting.months_remaining                    = vestingTotalVestedAmount
    await vesting.save()
    await vesteeRecord.save()