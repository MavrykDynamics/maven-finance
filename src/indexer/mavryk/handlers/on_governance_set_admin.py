
from mavryk.types.governance.parameter.set_admin import SetAdminParameter
from dipdup.context import HandlerContext
from mavryk.types.governance.storage import GovernanceStorage
from dipdup.models import Transaction

async def on_governance_set_admin(
    ctx: HandlerContext,
    set_admin: Transaction[SetAdminParameter, GovernanceStorage],
) -> None:
    ...