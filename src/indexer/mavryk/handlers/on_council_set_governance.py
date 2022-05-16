
from dipdup.context import HandlerContext
from mavryk.types.council.storage import CouncilStorage
from dipdup.models import Transaction
from mavryk.types.council.parameter.set_governance import SetGovernanceParameter

async def on_council_set_governance(
    ctx: HandlerContext,
    set_governance: Transaction[SetGovernanceParameter, CouncilStorage],
) -> None:
    ...