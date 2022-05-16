
from mavryk.types.delegation.parameter.set_admin import SetAdminParameter
from dipdup.context import HandlerContext
from mavryk.types.delegation.storage import DelegationStorage
from dipdup.models import Transaction

async def on_delegation_set_admin(
    ctx: HandlerContext,
    set_admin: Transaction[SetAdminParameter, DelegationStorage],
) -> None:
    ...