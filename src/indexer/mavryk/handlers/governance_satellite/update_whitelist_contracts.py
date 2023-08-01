from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_linked_contract
from mavryk.types.governance_satellite.tezos_storage import GovernanceSatelliteStorage
from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.types.governance_satellite.tezos_parameters.update_whitelist_contracts import UpdateWhitelistContractsParameter
from dipdup.context import HandlerContext
import mavryk.models as models

async def update_whitelist_contracts(
    ctx: HandlerContext,
    update_whitelist_contracts: TzktTransaction[UpdateWhitelistContractsParameter, GovernanceSatelliteStorage],
) -> None:

    try:
        # Persist whitelist contract
        await persist_linked_contract(ctx, models.GovernanceSatellite, models.GovernanceSatelliteWhitelistContract, update_whitelist_contracts)

    except BaseException as e:
        await save_error_report(e)

