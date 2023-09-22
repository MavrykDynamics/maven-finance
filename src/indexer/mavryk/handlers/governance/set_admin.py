from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_admin
from mavryk.types.governance.tezos_parameters.set_admin import SetAdminParameter
from dipdup.context import HandlerContext
from mavryk.types.governance.tezos_storage import GovernanceStorage
from dipdup.models.tezos_tzkt import TzktTransaction
import mavryk.models as models

async def set_admin(
    ctx: HandlerContext,
    set_admin: TzktTransaction[SetAdminParameter, GovernanceStorage],
) -> None:

    try:

        # Persist new admin
        await persist_admin(ctx, models.Governance, set_admin)

    except BaseException as e:
        await save_error_report(e)

