
from mavryk.types.governance_satellite.storage import GovernanceSatelliteStorage
from mavryk.types.governance_satellite.parameter.update_config import UpdateConfigParameter
from dipdup.models import Transaction
from dipdup.context import HandlerContext

async def on_governance_satellite_update_config(
    ctx: HandlerContext,
    update_config: Transaction[UpdateConfigParameter, GovernanceSatelliteStorage],
) -> None:
    breakpoint()