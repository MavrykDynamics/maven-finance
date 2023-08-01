from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_admin
from mavryk.types.delegation.parameter.set_admin import SetAdminParameter
from dipdup.context import HandlerContext
from mavryk.types.delegation.storage import DelegationStorage
from dipdup.models import Transaction
import mavryk.models as models

async def set_admin(
    ctx: HandlerContext,
    set_admin: Transaction[SetAdminParameter, DelegationStorage],
) -> None:

    try:

        # Persist new admin
        await persist_admin(ctx, models.Delegation, set_admin)

    except BaseException as e:
        await save_error_report(e)

