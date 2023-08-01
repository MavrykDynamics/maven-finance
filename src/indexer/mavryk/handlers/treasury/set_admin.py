from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_admin
from mavryk.types.treasury.tezos_storage import TreasuryStorage
from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.types.treasury.tezos_parameters.set_admin import SetAdminParameter
from dipdup.context import HandlerContext
import mavryk.models as models

async def set_admin(
    ctx: HandlerContext,
    set_admin: TzktTransaction[SetAdminParameter, TreasuryStorage],
) -> None:

    try:

        # Persist new admin
        await persist_admin(ctx, models.Treasury, set_admin)

    except BaseException as e:
        await save_error_report(e)

