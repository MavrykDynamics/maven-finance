from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_financial_request
from mavryk.types.governance_financial.tezos_storage import GovernanceFinancialStorage
from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.types.governance_financial.tezos_parameters.request_tokens import RequestTokensParameter
import mavryk.models as models

async def request_tokens(
    ctx: HandlerContext,
    request_tokens: TzktTransaction[RequestTokensParameter, GovernanceFinancialStorage],
) -> None:

    try:    
        # Persist request
        await persist_financial_request(ctx, request_tokens)

    except BaseException as e:
        await save_error_report(e)

