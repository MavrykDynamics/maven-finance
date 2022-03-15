
from dipdup.models import Transaction
from mavryk.utils.council_actions import persist_council_action
from mavryk.types.council.storage import CouncilStorage
from mavryk.types.council.parameter.flush_action import FlushActionParameter
from dipdup.context import HandlerContext

async def on_council_flush_action(
    ctx: HandlerContext,
    flush_action: Transaction[FlushActionParameter, CouncilStorage],
) -> None:
    await persist_council_action(flush_action)