
from mavryk.types.governance_satellite.parameter.set_admin import SetAdminParameter
from mavryk.types.governance_satellite.storage import GovernanceSatelliteStorage
from dipdup.models import Transaction
from dipdup.context import HandlerContext

async def on_governance_satellite_set_admin(
    ctx: HandlerContext,
    set_admin: Transaction[SetAdminParameter, GovernanceSatelliteStorage],
) -> None:
    breakpoint()