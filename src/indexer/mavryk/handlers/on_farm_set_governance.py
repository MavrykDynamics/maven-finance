
from mavryk.types.farm.parameter.set_governance import SetGovernanceParameter
from dipdup.context import HandlerContext
from mavryk.types.farm.storage import FarmStorage
from dipdup.models import Transaction

async def on_farm_set_governance(
    ctx: HandlerContext,
    set_governance: Transaction[SetGovernanceParameter, FarmStorage],
) -> None:
    ...