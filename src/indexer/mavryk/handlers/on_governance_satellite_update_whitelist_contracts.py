from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_linked_contract
from mavryk.types.governance_satellite.storage import GovernanceSatelliteStorage
from dipdup.models import Transaction
from mavryk.types.governance_satellite.parameter.update_whitelist_contracts import UpdateWhitelistContractsParameter
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_governance_satellite_update_whitelist_contracts(
    ctx: HandlerContext,
    update_whitelist_contracts: Transaction[UpdateWhitelistContractsParameter, GovernanceSatelliteStorage],
) -> None:

    try:
        # Persist whitelist contract
        await persist_linked_contract(models.GovernanceSatellite, models.GovernanceSatelliteWhitelistContract, update_whitelist_contracts)

    except BaseException:
         await save_error_report()

