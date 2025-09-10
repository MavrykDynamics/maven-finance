from maven.utils.error_reporting import save_error_report

from maven.utils.persisters import persist_admin
from maven.types.farm_factory.tezos_storage import FarmFactoryStorage
from dipdup.context import HandlerContext
from dipdup.models.tezos import TezosTransaction
from maven.types.farm_factory.tezos_parameters.set_admin import SetAdminParameter
from maven import models as models

async def set_admin(
    ctx: HandlerContext,
    set_admin: TezosTransaction[SetAdminParameter, FarmFactoryStorage],
) -> None:

    try:

        # Persist new admin
        await persist_admin(ctx, models.FarmFactory, set_admin)

    except BaseException as e:
        await save_error_report(e)

