from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_linked_contract
from mavryk.types.governance_satellite.tezos_parameters.update_general_contracts import UpdateGeneralContractsParameter
from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.types.governance_satellite.tezos_storage import GovernanceSatelliteStorage
from dipdup.context import HandlerContext
import mavryk.models as models

async def update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: TzktTransaction[UpdateGeneralContractsParameter, GovernanceSatelliteStorage],
) -> None:

    try:
        # Perists general contract
        await persist_linked_contract(ctx, models.GovernanceSatellite, models.GovernanceSatelliteGeneralContract, update_general_contracts)

    except BaseException as e:
        await save_error_report(e)

