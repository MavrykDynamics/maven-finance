from maven.utils.error_reporting import save_error_report

from maven.utils.persisters import persist_admin
from maven.types.mvn_token.tezos_parameters.set_admin import SetAdminParameter
from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
from maven.types.mvn_token.tezos_storage import MvnTokenStorage
import maven.models as models

async def set_admin(
    ctx: HandlerContext,
    set_admin: TzktTransaction[SetAdminParameter, MvnTokenStorage],
) -> None:

    try:

        # Persist new admin
        await persist_admin(ctx, models.MVNToken, set_admin)

    except BaseException as e:
        await save_error_report(e)

