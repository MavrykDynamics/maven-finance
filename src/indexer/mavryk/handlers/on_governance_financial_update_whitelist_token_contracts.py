from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_linked_contract
from mavryk.types.governance_financial.storage import GovernanceFinancialStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.governance_financial.parameter.update_whitelist_token_contracts import UpdateWhitelistTokenContractsParameter
import mavryk.models as models

async def on_governance_financial_update_whitelist_token_contracts(
    ctx: HandlerContext,
    update_whitelist_token_contracts: Transaction[UpdateWhitelistTokenContractsParameter, GovernanceFinancialStorage],
) -> None:

    try:    
        # Persist whitelist token contract
        await persist_linked_contract(models.GovernanceFinancial, models.GovernanceFinancialWhitelistTokenContract, update_whitelist_token_contracts, ctx)
    except BaseException:
         await save_error_report()

