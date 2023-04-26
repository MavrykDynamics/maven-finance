from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_financial_request
from mavryk.types.governance_financial.storage import GovernanceFinancialStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.governance_financial.parameter.request_tokens import RequestTokensParameter
import mavryk.models as models

async def on_governance_financial_request_tokens(
    ctx: HandlerContext,
    request_tokens: Transaction[RequestTokensParameter, GovernanceFinancialStorage],
) -> None:

    try:    
        # Persist request
        await persist_financial_request(ctx, request_tokens)

    except BaseException:
         await save_error_report()

