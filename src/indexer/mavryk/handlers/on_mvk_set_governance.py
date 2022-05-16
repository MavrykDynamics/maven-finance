
from mavryk.types.mvk.parameter.set_governance import SetGovernanceParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.mvk.storage import MvkStorage

async def on_mvk_set_governance(
    ctx: HandlerContext,
    set_governance: Transaction[SetGovernanceParameter, MvkStorage],
) -> None:
    ...