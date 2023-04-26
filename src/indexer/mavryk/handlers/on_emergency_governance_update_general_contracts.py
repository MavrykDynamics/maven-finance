from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from mavryk.utils.persisters import persist_linked_contract
from mavryk.types.emergency_governance.parameter.update_general_contracts import UpdateGeneralContractsParameter
from dipdup.models import Transaction
from mavryk.types.emergency_governance.storage import EmergencyGovernanceStorage
import mavryk.models as models

async def on_emergency_governance_update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: Transaction[UpdateGeneralContractsParameter, EmergencyGovernanceStorage],
) -> None:

    try:
        # Perists general contract
        await persist_linked_contract(models.EmergencyGovernance, models.EmergencyGovernanceGeneralContract, update_general_contracts)
    except BaseException:
         await save_error_report()

