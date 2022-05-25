
from dipdup.context import HandlerContext
from mavryk.types.governance.storage import GovernanceStorage
from dipdup.models import Transaction
from mavryk.types.governance.parameter.break_glass import BreakGlassParameter
import mavryk.models as models

async def on_governance_break_glass(
    ctx: HandlerContext,
    break_glass: Transaction[BreakGlassParameter, GovernanceStorage],
) -> None:
    
    # Get operation info
    governance_address  = break_glass.data.target_address
    admin               = break_glass.storage.admin

    # Update record
    governance  = await models.Governance.get(address   = governance_address)
    governance.admin    = admin
    await governance.save()
