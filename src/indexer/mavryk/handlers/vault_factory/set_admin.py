from mavryk.utils.error_reporting import save_error_report
from mavryk.utils.persisters import persist_admin
from mavryk.types.vault_factory.tezos_storage import VaultFactoryStorage
from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.types.vault_factory.tezos_parameters.set_admin import SetAdminParameter
import mavryk.models as models

async def set_admin(
    ctx: HandlerContext,
    set_admin: TzktTransaction[SetAdminParameter, VaultFactoryStorage],
) -> None:

    try:

        # Persist new admin
        await persist_admin(ctx, models.VaultFactory, set_admin)

    except BaseException as e:
        await save_error_report(e)

