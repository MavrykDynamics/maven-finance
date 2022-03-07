
from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.delegation.parameter.update_config import UpdateConfigParameter
from mavryk.types.delegation.storage import DelegationStorage

async def on_delegation_update_config(
    ctx: HandlerContext,
    update_config: Transaction[UpdateConfigParameter, DelegationStorage],
) -> None:
    ...