
from mavryk.types.governance_financial.storage import GovernanceFinancialStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.governance_financial.parameter.set_contract_baker import SetContractBakerParameter

async def on_governance_financial_set_contract_baker(
    ctx: HandlerContext,
    set_contract_baker: Transaction[SetContractBakerParameter, GovernanceFinancialStorage],
) -> None:
    ...