from mavryk.utils.error_reporting import save_error_report
from mavryk.utils.persisters import persist_admin
from mavryk.types.vault_factory.storage import VaultFactoryStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.vault_factory.parameter.set_admin import SetAdminParameter
import mavryk.models as models

async def on_vault_factory_set_admin(
    ctx: HandlerContext,
    set_admin: Transaction[SetAdminParameter, VaultFactoryStorage],
) -> None:

    try:

        # Persist new admin
        await persist_admin(ctx, models.VaultFactory, set_admin)

    except BaseException as e:
         await save_error_report(e)

