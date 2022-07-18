
from mavryk.utils.persisters import persist_governance
from mavryk.types.doorman.parameter.set_governance import SetGovernanceParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.doorman.storage import DoormanStorage
import mavryk.models as models

async def on_doorman_set_governance(
    ctx: HandlerContext,
    set_governance: Transaction[SetGovernanceParameter, DoormanStorage],
) -> None:
    
    # Get operation info
    target_contract = set_governance.data.target_address
    contract        = await models.Doorman.get(address = target_contract)

    # Persist new admin
    await persist_governance(set_governance, contract)