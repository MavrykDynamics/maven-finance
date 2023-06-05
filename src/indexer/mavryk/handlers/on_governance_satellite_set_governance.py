from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_governance
from mavryk.types.governance_satellite.storage import GovernanceSatelliteStorage
from dipdup.models import Transaction
from mavryk.types.governance_satellite.parameter.set_governance import SetGovernanceParameter
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_governance_satellite_set_governance(
    ctx: HandlerContext,
    set_governance: Transaction[SetGovernanceParameter, GovernanceSatelliteStorage],
) -> None:

    try:    
        # Get operation info
        target_contract = set_governance.data.target_address
        contract        = await models.GovernanceSatellite.get(address = target_contract)
    
        # Persist new admin
        await persist_governance(set_governance, contract)

    except BaseException as e:
         await save_error_report(e)

