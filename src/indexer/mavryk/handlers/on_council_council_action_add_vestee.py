from mavryk.utils.council_actions import persist_council_action
from mavryk.types.council.parameter.council_action_add_vestee import CouncilActionAddVesteeParameter
from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.council.storage import CouncilStorage

async def on_council_council_action_add_vestee(
    ctx: HandlerContext,
    council_action_add_vestee: Transaction[CouncilActionAddVesteeParameter, CouncilStorage],
) -> None:
    await persist_council_action(council_action_add_vestee)