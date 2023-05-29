from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from mavryk.utils.persisters import persist_governance
from mavryk.types.council.storage import CouncilStorage
from dipdup.models import Transaction
from mavryk.types.council.parameter.set_governance import SetGovernanceParameter
import mavryk.models as models

async def on_council_set_governance(
    ctx: HandlerContext,
    set_governance: Transaction[SetGovernanceParameter, CouncilStorage],
) -> None:

    try:    
        # Get operation info
        target_contract = set_governance.data.target_address
        contract        = await models.Council.get(network=ctx.datasource.network, address= target_contract)
    
        # Persist new admin
        await persist_governance(ctx, set_governance, contract)

    except BaseException as e:
         await save_error_report(e)

