
from mavryk.utils.persisters import persist_governance
from mavryk.types.aggregator.storage import AggregatorStorage
from dipdup.models import Transaction
from mavryk.types.aggregator.parameter.set_governance import SetGovernanceParameter
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_aggregator_set_governance(
    ctx: HandlerContext,
    set_governance: Transaction[SetGovernanceParameter, AggregatorStorage],
) -> None:
    
    # Get operation info
    target_contract = set_governance.data.target_address
    contract        = await models.AggregatorFactory.get(address = target_contract)

    # Persist new admin
    await persist_governance(set_governance, contract)
