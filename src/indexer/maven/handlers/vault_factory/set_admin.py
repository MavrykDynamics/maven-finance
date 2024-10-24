from maven.utils.error_reporting import save_error_report
from maven.utils.persisters import persist_admin
from maven.types.vault_factory.tezos_storage import VaultFactoryStorage
from dipdup.context import HandlerContext
from dipdup.models.tezos import TezosTransaction
from maven.types.vault_factory.tezos_parameters.set_admin import SetAdminParameter
import maven.models as models

async def set_admin(
    ctx: HandlerContext,
    set_admin: TezosTransaction[SetAdminParameter, VaultFactoryStorage],
) -> None:

    try:

        # Persist new admin
        await persist_admin(ctx, models.VaultFactory, set_admin)

    except BaseException as e:
        await save_error_report(e)

