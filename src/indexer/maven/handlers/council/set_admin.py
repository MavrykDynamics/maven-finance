from maven.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from maven.utils.persisters import persist_admin
from maven.types.council.tezos_parameters.set_admin import SetAdminParameter
from dipdup.models.tezos import TezosTransaction
from maven.types.council.tezos_storage import CouncilStorage
from maven import models as models

async def set_admin(
    ctx: HandlerContext,
    set_admin: TezosTransaction[SetAdminParameter, CouncilStorage],
) -> None:

    try:

        # Persist new admin
        await persist_admin(ctx, models.Council, set_admin)

    except BaseException as e:
        await save_error_report(e)

