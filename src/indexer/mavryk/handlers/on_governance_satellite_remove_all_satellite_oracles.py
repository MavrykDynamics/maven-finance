
from mavryk.types.governance_satellite.parameter.remove_all_satellite_oracles import RemoveAllSatelliteOraclesParameter
from mavryk.types.governance_satellite.storage import GovernanceSatelliteStorage
from dipdup.models import Transaction
from dipdup.context import HandlerContext

async def on_governance_satellite_remove_all_satellite_oracles(
    ctx: HandlerContext,
    remove_all_satellite_oracles: Transaction[RemoveAllSatelliteOraclesParameter, GovernanceSatelliteStorage],
) -> None:
    breakpoint()