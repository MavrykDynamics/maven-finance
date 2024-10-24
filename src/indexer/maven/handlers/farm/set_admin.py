from maven.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from maven.utils.persisters import persist_admin
from maven.types.farm.tezos_storage import FarmStorage
from dipdup.models.tezos import TezosTransaction
from maven.types.farm.tezos_parameters.set_admin import SetAdminParameter
import maven.models as models

async def set_admin(
    ctx: HandlerContext,
    set_admin: TezosTransaction[SetAdminParameter, FarmStorage],
) -> None:

    try:

        # Persist new admin
        await persist_admin(ctx, models.Farm, set_admin)

    except BaseException as e:
        await save_error_report(e)

