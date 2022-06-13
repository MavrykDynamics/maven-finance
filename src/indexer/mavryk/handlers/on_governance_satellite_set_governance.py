
from mavryk.types.governance_satellite.storage import GovernanceSatelliteStorage
from dipdup.models import Transaction
from mavryk.types.governance_satellite.parameter.set_governance import SetGovernanceParameter
from dipdup.context import HandlerContext

async def on_governance_satellite_set_governance(
    ctx: HandlerContext,
    set_governance: Transaction[SetGovernanceParameter, GovernanceSatelliteStorage],
) -> None:
    breakpoint()