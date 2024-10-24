from maven.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from dipdup.models.tezos import TezosTransaction
from maven.utils.persisters import persist_governance
from maven.types.break_glass.tezos_parameters.set_governance import SetGovernanceParameter
from maven.types.break_glass.tezos_storage import BreakGlassStorage
import maven.models as models

async def set_governance(
    ctx: HandlerContext,
    set_governance: TezosTransaction[SetGovernanceParameter, BreakGlassStorage],
) -> None:

    try:

        # Persist new governance
        await persist_governance(ctx, models.BreakGlass, set_governance)

    except BaseException as e:
        await save_error_report(e)

