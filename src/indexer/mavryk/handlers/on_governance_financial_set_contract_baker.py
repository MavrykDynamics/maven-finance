from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from mavryk.utils.persisters import persist_financial_request
from mavryk.types.governance_financial.storage import GovernanceFinancialStorage
from dipdup.models import Transaction
from mavryk.types.governance_financial.parameter.set_contract_baker import SetContractBakerParameter

async def on_governance_financial_set_contract_baker(
    ctx: HandlerContext,
    set_contract_baker: Transaction[SetContractBakerParameter, GovernanceFinancialStorage],
) -> None:

    try:    
        # Persist request
        await persist_financial_request(ctx, set_contract_baker)
    except BaseException as e:
         await save_error_report(e)

