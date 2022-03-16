from mavryk.utils.actions import persist_council_action
from mavryk.types.council.parameter.council_action_toggle_vestee_lock import CouncilActionToggleVesteeLockParameter
from mavryk.types.council.storage import CouncilStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction

async def on_council_council_action_toggle_vestee_lock(
    ctx: HandlerContext,
    council_action_toggle_vestee_lock: Transaction[CouncilActionToggleVesteeLockParameter, CouncilStorage],
) -> None:
    await persist_council_action(council_action_toggle_vestee_lock)