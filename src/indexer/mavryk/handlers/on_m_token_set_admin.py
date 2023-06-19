from mavryk.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.utils.persisters import persist_admin
from mavryk.types.m_token.parameter.set_admin import SetAdminParameter
from mavryk.types.m_token.storage import MTokenStorage
import mavryk.models as models


async def on_m_token_set_admin(
    ctx: HandlerContext,
    set_admin: Transaction[SetAdminParameter, MTokenStorage],
) -> None:

    try:

        # Persist new admin
        await persist_admin(ctx, models.MToken, set_admin)

    except BaseException as e:
         await save_error_report(e)

