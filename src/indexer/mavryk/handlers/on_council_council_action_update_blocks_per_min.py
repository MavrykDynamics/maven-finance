
from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.utils.persisters import persist_council_action
from mavryk.types.council.storage import CouncilStorage
from mavryk.types.council.parameter.council_action_update_blocks_per_min import CouncilActionUpdateBlocksPerMinParameter

async def on_council_council_action_update_blocks_per_min(
    ctx: HandlerContext,
    council_action_update_blocks_per_min: Transaction[CouncilActionUpdateBlocksPerMinParameter, CouncilStorage],
) -> None:
    await persist_council_action(council_action_update_blocks_per_min)