
from dipdup.models import Transaction
from mavryk.types.delegation.storage import DelegationStorage
from dipdup.context import HandlerContext
from mavryk.types.delegation.parameter.toggle_pause_entrypoint import TogglePauseEntrypointParameter

async def on_delegation_toggle_pause_entrypoint(
    ctx: HandlerContext,
    toggle_pause_entrypoint: Transaction[TogglePauseEntrypointParameter, DelegationStorage],
) -> None:
    ...