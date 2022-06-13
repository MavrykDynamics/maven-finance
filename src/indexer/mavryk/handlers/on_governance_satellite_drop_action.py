
from mavryk.types.governance_satellite.storage import GovernanceSatelliteStorage
from dipdup.models import Transaction
from mavryk.types.governance_satellite.parameter.drop_action import DropActionParameter
from dipdup.context import HandlerContext

async def on_governance_satellite_drop_action(
    ctx: HandlerContext,
    drop_action: Transaction[DropActionParameter, GovernanceSatelliteStorage],
) -> None:
    breakpoint()