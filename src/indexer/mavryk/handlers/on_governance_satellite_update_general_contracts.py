
from mavryk.utils.persisters import persist_general_contract
from mavryk.types.governance_satellite.parameter.update_general_contracts import UpdateGeneralContractsParameter
from dipdup.models import Transaction
from mavryk.types.governance_satellite.storage import GovernanceSatelliteStorage
from dipdup.context import HandlerContext

async def on_governance_satellite_update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: Transaction[UpdateGeneralContractsParameter, GovernanceSatelliteStorage],
) -> None:

    # Perists general contract
    await persist_general_contract(update_general_contracts)
