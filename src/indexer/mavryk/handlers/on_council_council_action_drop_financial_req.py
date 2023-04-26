from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Transaction
from mavryk.utils.persisters import persist_council_action
from mavryk.types.council.parameter.council_action_drop_financial_req import CouncilActionDropFinancialReqParameter
from dipdup.context import HandlerContext
from mavryk.types.council.storage import CouncilStorage

async def on_council_council_action_drop_financial_req(
    ctx: HandlerContext,
    council_action_drop_financial_req: Transaction[CouncilActionDropFinancialReqParameter, CouncilStorage],
) -> None:

    try:
        await persist_council_action(council_action_drop_financial_req)
    except BaseException:
         await save_error_report()

