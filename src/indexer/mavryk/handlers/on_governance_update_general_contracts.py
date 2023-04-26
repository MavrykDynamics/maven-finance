from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_linked_contract
from mavryk.types.governance.parameter.update_general_contracts import UpdateGeneralContractsParameter
from dipdup.context import HandlerContext
from mavryk.types.governance.storage import GovernanceStorage
from dipdup.models import Transaction
import mavryk.models as models

async def on_governance_update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: Transaction[UpdateGeneralContractsParameter, GovernanceStorage],
) -> None:

    try:
        # Perists general contract
        await persist_linked_contract(models.Governance, models.GovernanceGeneralContract, update_general_contracts)
    except BaseException:
         await save_error_report()

