
from dipdup.models import Origination
from mavryk.types.governance_satellite.storage import GovernanceSatelliteStorage
from dipdup.context import HandlerContext

async def on_governance_satellite_origination(
    ctx: HandlerContext,
    governance_satellite_origination: Origination[GovernanceSatelliteStorage],
) -> None:
    breakpoint()