from maven.utils.error_reporting import save_error_report

from maven.utils.persisters import persist_admin
from maven.types.doorman.tezos_storage import DoormanStorage
from dipdup.context import HandlerContext
from dipdup.models.tezos import TezosTransaction
from maven.types.doorman.tezos_parameters.set_admin import SetAdminParameter
import maven.models as models

async def set_admin(
    ctx: HandlerContext,
    set_admin: TezosTransaction[SetAdminParameter, DoormanStorage],
) -> None:

    try:

        # Persist new admin
        await persist_admin(ctx, models.Doorman, set_admin)

    except BaseException as e:
        await save_error_report(e)

