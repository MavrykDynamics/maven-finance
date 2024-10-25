from maven.utils.error_reporting import save_error_report

from maven.utils.persisters import persist_admin
from maven.types.governance_financial.tezos_storage import GovernanceFinancialStorage
from dipdup.context import HandlerContext
from maven.types.governance_financial.tezos_parameters.set_admin import SetAdminParameter
from dipdup.models.tezos_tzkt import TzktTransaction
import maven.models as models

async def set_admin(
    ctx: HandlerContext,
    set_admin: TzktTransaction[SetAdminParameter, GovernanceFinancialStorage],
) -> None:

    try:

        # Persist new admin
        await persist_admin(ctx, models.GovernanceFinancial, set_admin)

    except BaseException as e:
        await save_error_report(e)

