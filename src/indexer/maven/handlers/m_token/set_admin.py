from maven.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from dipdup.models.tezos import TezosTransaction
from maven.utils.persisters import persist_admin
from maven.types.m_token.tezos_parameters.set_admin import SetAdminParameter
from maven.types.m_token.tezos_storage import MTokenStorage
import maven.models as models


async def set_admin(
    ctx: HandlerContext,
    set_admin: TezosTransaction[SetAdminParameter, MTokenStorage],
) -> None:

    try:

        # Persist new admin
        await persist_admin(ctx, models.MToken, set_admin)

    except BaseException as e:
        await save_error_report(e)

