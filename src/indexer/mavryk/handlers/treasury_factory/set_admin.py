from mavryk.utils.error_reporting import save_error_report

from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.utils.persisters import persist_admin
from mavryk.types.treasury_factory.tezos_parameters.set_admin import SetAdminParameter
from dipdup.context import HandlerContext
from mavryk.types.treasury_factory.tezos_storage import TreasuryFactoryStorage
import mavryk.models as models

async def set_admin(
    ctx: HandlerContext,
    set_admin: TzktTransaction[SetAdminParameter, TreasuryFactoryStorage],
) -> None:

    try:

        # Persist new admin
        await persist_admin(ctx, models.TreasuryFactory, set_admin)

    except BaseException as e:
        await save_error_report(e)

