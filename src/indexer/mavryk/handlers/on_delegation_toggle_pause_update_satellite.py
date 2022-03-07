
from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.delegation.storage import DelegationStorage
from mavryk.types.delegation.parameter.toggle_pause_delegate_to_satellite import TogglePauseDelegateToSatelliteParameter

async def on_delegation_toggle_pause_update_satellite(
    ctx: HandlerContext,
    toggle_pause_delegate_to_satellite: Transaction[TogglePauseDelegateToSatelliteParameter, DelegationStorage],
) -> None:
    ...