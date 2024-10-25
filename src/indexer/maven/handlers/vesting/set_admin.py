from maven.utils.error_reporting import save_error_report

from maven.utils.persisters import persist_admin
from maven.types.vesting.tezos_storage import VestingStorage
from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
from maven.types.vesting.tezos_parameters.set_admin import SetAdminParameter
import maven.models as models

async def set_admin(
    ctx: HandlerContext,
    set_admin: TzktTransaction[SetAdminParameter, VestingStorage],
) -> None:

    try:

        # Persist new admin
        await persist_admin(ctx, models.Vesting, set_admin)

    except BaseException as e:
        await save_error_report(e)

