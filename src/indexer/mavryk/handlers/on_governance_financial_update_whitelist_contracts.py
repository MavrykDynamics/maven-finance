from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_linked_contract
from mavryk.types.governance_financial.parameter.update_whitelist_contracts import UpdateWhitelistContractsParameter
from mavryk.types.governance_financial.storage import GovernanceFinancialStorage
from dipdup.models import Transaction
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_governance_financial_update_whitelist_contracts(
    ctx: HandlerContext,
    update_whitelist_contracts: Transaction[UpdateWhitelistContractsParameter, GovernanceFinancialStorage],
) -> None:

    try:
        # Persist whitelist contract
        await persist_linked_contract(ctx, models.GovernanceFinancial, models.GovernanceFinancialWhitelistContract, update_whitelist_contracts)

    except BaseException as e:
         await save_error_report(e)

