from dipdup.context import HandlerContext
from mavryk.utils.council_actions import persist_council_action
from mavryk.types.council.storage import CouncilStorage
from dipdup.models import Transaction
from mavryk.types.council.parameter.council_action_change_member import CouncilActionChangeMemberParameter

async def on_council_council_action_change_member(
    ctx: HandlerContext,
    council_action_change_member: Transaction[CouncilActionChangeMemberParameter, CouncilStorage],
) -> None:
    await persist_council_action(council_action_change_member)