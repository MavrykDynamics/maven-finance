
from mavryk.utils.persisters import persist_whitelist_contract
from mavryk.types.governance_financial.parameter.update_whitelist_contracts import UpdateWhitelistContractsParameter
from mavryk.types.governance_financial.storage import GovernanceFinancialStorage
from dipdup.models import Transaction
from dipdup.context import HandlerContext

async def on_governance_financial_update_whitelist_contracts(
    ctx: HandlerContext,
    update_whitelist_contracts: Transaction[UpdateWhitelistContractsParameter, GovernanceFinancialStorage],
) -> None:

    # Persist whitelist contract
    await persist_whitelist_contract(update_whitelist_contracts)
