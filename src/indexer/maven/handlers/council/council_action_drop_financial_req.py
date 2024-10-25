from maven.utils.error_reporting import save_error_report

from dipdup.models.tezos_tzkt import TzktTransaction
from maven.utils.persisters import persist_council_action
from maven.types.council.tezos_parameters.council_action_drop_financial_req import CouncilActionDropFinancialReqParameter
from dipdup.context import HandlerContext
from maven.types.council.tezos_storage import CouncilStorage

async def council_action_drop_financial_req(
    ctx: HandlerContext,
    council_action_drop_financial_req: TzktTransaction[CouncilActionDropFinancialReqParameter, CouncilStorage],
) -> None:

    try:
        await persist_council_action(ctx, council_action_drop_financial_req)
    except BaseException as e:
        await save_error_report(e)

