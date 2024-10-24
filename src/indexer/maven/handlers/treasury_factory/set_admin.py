from maven.utils.error_reporting import save_error_report

from dipdup.models.tezos import TezosTransaction
from maven.utils.persisters import persist_admin
from maven.types.treasury_factory.tezos_parameters.set_admin import SetAdminParameter
from dipdup.context import HandlerContext
from maven.types.treasury_factory.tezos_storage import TreasuryFactoryStorage
import maven.models as models

async def set_admin(
    ctx: HandlerContext,
    set_admin: TezosTransaction[SetAdminParameter, TreasuryFactoryStorage],
) -> None:

    try:

        # Persist new admin
        await persist_admin(ctx, models.TreasuryFactory, set_admin)

    except BaseException as e:
        await save_error_report(e)

