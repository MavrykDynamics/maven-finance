
from mavryk.types.doorman.parameter.set_governance import SetGovernanceParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.doorman.storage import DoormanStorage

async def on_doorman_set_governance(
    ctx: HandlerContext,
    set_governance: Transaction[SetGovernanceParameter, DoormanStorage],
) -> None:
    ...