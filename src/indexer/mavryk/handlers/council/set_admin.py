from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from mavryk.utils.persisters import persist_admin
from mavryk.types.council.tezos_parameters.set_admin import SetAdminParameter
from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.types.council.tezos_storage import CouncilStorage
import mavryk.models as models

async def set_admin(
    ctx: HandlerContext,
    set_admin: TzktTransaction[SetAdminParameter, CouncilStorage],
) -> None:

    try:

        # Persist new admin
        await persist_admin(ctx, models.Council, set_admin)

    except BaseException as e:
        await save_error_report(e)

