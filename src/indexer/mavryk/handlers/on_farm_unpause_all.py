
from dipdup.context import HandlerContext
from mavryk.types.farm.parameter.unpause_all import UnpauseAllParameter
from mavryk.types.farm.storage import FarmStorage
from dipdup.models import Transaction
import mavryk.models as models

async def on_farm_unpause_all(
    ctx: HandlerContext,
    unpause_all: Transaction[UnpauseAllParameter, FarmStorage],
) -> None:
    # Get farm contract
    farmAddress = unpause_all.data.target_address
    farm = await models.Farm.get(address=farmAddress)

    # Update farm
    farm.deposit_paused = unpause_all.data.storage['breakGlassConfig']['depositIsPaused']
    farm.withdraw_paused = unpause_all.data.storage['breakGlassConfig']['withdrawIsPaused']
    farm.claim_paused = unpause_all.data.storage['breakGlassConfig']['claimIsPaused']
    await farm.save()