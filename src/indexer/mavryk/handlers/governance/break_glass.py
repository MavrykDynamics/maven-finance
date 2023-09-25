from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from mavryk.types.governance.tezos_storage import GovernanceStorage
from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.types.governance.tezos_parameters.break_glass import BreakGlassParameter
import mavryk.models as models

async def break_glass(
    ctx: HandlerContext,
    break_glass: TzktTransaction[BreakGlassParameter, GovernanceStorage],
) -> None:

    try:    
        # Get operation info
        governance_address  = break_glass.data.target_address
        admin               = break_glass.storage.admin
    
        # Update record
        governance  = await models.Governance.get(network=ctx.datasource.name.replace('tzkt_',''), address= governance_address)
        governance.admin    = admin
        await governance.save()

    except BaseException as e:
        await save_error_report(e)

