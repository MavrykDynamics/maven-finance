
from mavryk.types.farm_factory.storage import FarmFactoryStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.farm_factory.parameter.set_governance import SetGovernanceParameter

async def on_farm_factory_set_governance(
    ctx: HandlerContext,
    set_governance: Transaction[SetGovernanceParameter, FarmFactoryStorage],
) -> None:
    ...