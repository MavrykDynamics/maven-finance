from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from mavryk.utils.persisters import persist_governance
from mavryk.types.lending_controller.tezos_storage import LendingControllerStorage
from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.types.lending_controller.tezos_parameters.set_governance import SetGovernanceParameter
import mavryk.models as models

async def set_governance(
    ctx: HandlerContext,
    set_governance: TzktTransaction[SetGovernanceParameter, LendingControllerStorage],
) -> None:

    try:

        # Persist new governance
        await persist_governance(ctx, models.LendingController, set_governance)

    except BaseException as e:
        await save_error_report(e)

