from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_admin
from mavryk.types.mvk_token.parameter.set_admin import SetAdminParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.mvk_token.storage import MvkTokenStorage
import mavryk.models as models

async def set_admin(
    ctx: HandlerContext,
    set_admin: Transaction[SetAdminParameter, MvkTokenStorage],
) -> None:

    try:

        # Persist new admin
        await persist_admin(ctx, models.MVKToken, set_admin)

    except BaseException as e:
        await save_error_report(e)

