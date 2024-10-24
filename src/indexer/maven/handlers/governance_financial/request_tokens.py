from maven.utils.error_reporting import save_error_report

from maven.utils.persisters import persist_financial_request
from maven.types.governance_financial.tezos_storage import GovernanceFinancialStorage
from dipdup.context import HandlerContext
from dipdup.models.tezos import TezosTransaction
from maven.types.governance_financial.tezos_parameters.request_tokens import RequestTokensParameter
import maven.models as models

async def request_tokens(
    ctx: HandlerContext,
    request_tokens: TezosTransaction[RequestTokensParameter, GovernanceFinancialStorage],
) -> None:

    try:    
        # Persist request
        await persist_financial_request(ctx, request_tokens)

    except BaseException as e:
        await save_error_report(e)

