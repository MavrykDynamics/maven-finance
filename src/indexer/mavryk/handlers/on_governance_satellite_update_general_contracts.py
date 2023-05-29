from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_linked_contract
from mavryk.types.governance_satellite.parameter.update_general_contracts import UpdateGeneralContractsParameter
from dipdup.models import Transaction
from mavryk.types.governance_satellite.storage import GovernanceSatelliteStorage
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_governance_satellite_update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: Transaction[UpdateGeneralContractsParameter, GovernanceSatelliteStorage],
) -> None:

    try:
        # Perists general contract
        await persist_linked_contract(ctx, models.GovernanceSatellite, models.GovernanceSatelliteGeneralContract, update_general_contracts)

    except BaseException as e:
         await save_error_report(e)

