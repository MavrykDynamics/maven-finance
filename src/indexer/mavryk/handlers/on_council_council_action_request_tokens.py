from mavryk.utils.persisters import persist_council_action
from mavryk.types.council.parameter.council_action_request_tokens import CouncilActionRequestTokensParameter
from mavryk.types.council.storage import CouncilStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction

async def on_council_council_action_request_tokens(
    ctx: HandlerContext,
    council_action_request_tokens: Transaction[CouncilActionRequestTokensParameter, CouncilStorage],
) -> None:

    await persist_council_action(council_action_request_tokens)