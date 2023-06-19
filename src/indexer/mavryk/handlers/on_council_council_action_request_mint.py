from mavryk.utils.error_reporting import save_error_report
from mavryk.utils.persisters import persist_council_action
from mavryk.types.council.parameter.council_action_request_mint import CouncilActionRequestMintParameter
from mavryk.types.council.storage import CouncilStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction

async def on_council_council_action_request_mint(
    ctx: HandlerContext,
    council_action_request_mint: Transaction[CouncilActionRequestMintParameter, CouncilStorage],
) -> None:

    try:
        await persist_council_action(ctx, council_action_request_mint)
    except BaseException as e:
         await save_error_report(e)

