
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.council.parameter.council_action_set_baker import CouncilActionSetBakerParameter
from mavryk.types.council.storage import CouncilStorage

async def on_council_council_action_set_baker(
    ctx: HandlerContext,
    council_action_set_baker: Transaction[CouncilActionSetBakerParameter, CouncilStorage],
) -> None:
    ...