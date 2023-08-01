from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_governance
from mavryk.types.farm.tezos_parameters.set_governance import SetGovernanceParameter
from dipdup.context import HandlerContext
from mavryk.types.farm.tezos_storage import FarmStorage
from dipdup.models.tezos_tzkt import TzktTransaction
import mavryk.models as models

async def set_governance(
    ctx: HandlerContext,
    set_governance: TzktTransaction[SetGovernanceParameter, FarmStorage],
) -> None:

    try:

        # Persist new governance
        await persist_governance(ctx, models.Farm, set_governance)

    except BaseException as e:
        await save_error_report(e)

