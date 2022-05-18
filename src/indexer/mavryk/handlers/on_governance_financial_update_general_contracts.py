
from mavryk.utils.persisters import persist_general_contract
from mavryk.types.governance_financial.storage import GovernanceFinancialStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.governance_financial.parameter.update_general_contracts import UpdateGeneralContractsParameter

async def on_governance_financial_update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: Transaction[UpdateGeneralContractsParameter, GovernanceFinancialStorage],
) -> None:

    # Perists general contract
    await persist_general_contract(update_general_contracts)