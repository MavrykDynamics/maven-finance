from maven.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from maven.utils.persisters import persist_governance
from maven.types.lending_controller.tezos_storage import LendingControllerStorage
from dipdup.models.tezos import TezosTransaction
from maven.types.lending_controller.tezos_parameters.set_governance import SetGovernanceParameter
from maven import models as models

async def set_governance(
    ctx: HandlerContext,
    set_governance: TezosTransaction[SetGovernanceParameter, LendingControllerStorage],
) -> None:

    try:

        # Persist new governance
        await persist_governance(ctx, models.LendingController, set_governance)

    except BaseException as e:
        await save_error_report(e)

