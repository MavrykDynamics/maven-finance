
from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.delegation.storage import DelegationStorage
from mavryk.types.delegation.parameter.toggle_pause_unregister_satellite import TogglePauseUnregisterSatelliteParameter

async def on_delegation_toggle_pause_unregister_satellite(
    ctx: HandlerContext,
    toggle_pause_unregister_satellite: Transaction[TogglePauseUnregisterSatelliteParameter, DelegationStorage],
) -> None:
    ...