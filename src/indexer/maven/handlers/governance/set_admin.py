from maven.utils.error_reporting import save_error_report

from maven.utils.persisters import persist_admin
from maven.types.governance.tezos_parameters.set_admin import SetAdminParameter
from dipdup.context import HandlerContext
from maven.types.governance.tezos_storage import GovernanceStorage
from dipdup.models.tezos import TezosTransaction
import maven.models as models

async def set_admin(
    ctx: HandlerContext,
    set_admin: TezosTransaction[SetAdminParameter, GovernanceStorage],
) -> None:

    try:

        # Persist new admin
        await persist_admin(ctx, models.Governance, set_admin)

    except BaseException as e:
        await save_error_report(e)

