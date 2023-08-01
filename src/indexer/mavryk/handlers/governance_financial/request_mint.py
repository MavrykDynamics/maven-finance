from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_financial_request
from mavryk.types.governance_financial.storage import GovernanceFinancialStorage
from dipdup.context import HandlerContext
from mavryk.types.governance_financial.parameter.request_mint import RequestMintParameter
from dipdup.models import Transaction

async def request_mint(
    ctx: HandlerContext,
    request_mint: Transaction[RequestMintParameter, GovernanceFinancialStorage],
) -> None:

    try:    
        # Persist request
        await persist_financial_request(ctx, request_mint)
    except BaseException as e:
        await save_error_report(e)

