from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_linked_contract
from mavryk.types.governance_financial.storage import GovernanceFinancialStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.governance_financial.parameter.update_general_contracts import UpdateGeneralContractsParameter
import mavryk.models as models

async def on_governance_financial_update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: Transaction[UpdateGeneralContractsParameter, GovernanceFinancialStorage],
) -> None:

    try:
        # Perists general contract
        await persist_linked_contract(models.GovernanceFinancial, models.GovernanceFinancialGeneralContract, update_general_contracts)

    except BaseException:
         await save_error_report()

