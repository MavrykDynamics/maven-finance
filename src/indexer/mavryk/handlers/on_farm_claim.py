
from dipdup.context import HandlerContext
from mavryk.types.farm.storage import FarmStorage
from mavryk.types.farm.parameter.claim import ClaimParameter
from dipdup.models import Transaction
import mavryk.models as models

async def on_farm_claim(
    ctx: HandlerContext,
    claim: Transaction[ClaimParameter, FarmStorage],
) -> None:
    breakpoint()
    # Get operation data
    userParticipation = float(claim.data.diffs[-1]['content']['value']['participationMVKPerShare'])
    userAddress = claim.data.sender_address
    farmAddress = claim.data.target_address
    farmAccumulated = float(claim.storage.accumulatedMVKPerShare)
    farmLastBlock = int(claim.storage.lastBlockUpdate)

    # Update values
    farm = await models.Farm.get(
        address = farmAddress
    )
    farm.accumulated_mvk_per_share = farmAccumulated
    farm.last_block_update = farmLastBlock
    await farm.save()

    user, _ = await models.MavrykUser.get_or_create(
        address = userAddress
    )
    await user.save()

    farmAccount, _ = await models.FarmAccount.get_or_create(
        user = user,
        farm = farm
    )
    farmAccount.participation_mvk_per_share = userParticipation
    await farmAccount.save()
