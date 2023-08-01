from mavryk.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.utils.persisters import persist_admin
from mavryk.types.m_farm.tezos_parameters.set_admin import SetAdminParameter
from mavryk.types.m_farm.tezos_storage import MFarmStorage
import mavryk.models as models

async def set_admin(
    ctx: HandlerContext,
    set_admin: TzktTransaction[SetAdminParameter, MFarmStorage],
) -> None:

    try:

        # Persist new admin
        await persist_admin(ctx, models.Farm, set_admin)

    except BaseException as e:
        await save_error_report(e)

