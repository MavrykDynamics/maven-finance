
from mavryk.types.governance_satellite.parameter.update_general_contracts import UpdateGeneralContractsParameter
from dipdup.models import Transaction
from mavryk.types.governance_satellite.storage import GovernanceSatelliteStorage
from dipdup.context import HandlerContext

async def on_governance_satellite_update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: Transaction[UpdateGeneralContractsParameter, GovernanceSatelliteStorage],
) -> None:
    breakpoint()