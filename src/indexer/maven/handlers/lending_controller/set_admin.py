from maven.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from maven.utils.persisters import persist_admin
from maven.types.lending_controller.tezos_parameters.set_admin import SetAdminParameter
from dipdup.models.tezos_tzkt import TzktTransaction
from maven.types.lending_controller.tezos_storage import LendingControllerStorage
import maven.models as models

async def set_admin(
    ctx: HandlerContext,
    set_admin: TzktTransaction[SetAdminParameter, LendingControllerStorage],
) -> None:

    try:

        # Persist new admin
        await persist_admin(ctx, models.LendingController, set_admin)

    except BaseException as e:
        await save_error_report(e)

