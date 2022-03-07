
from mavryk.types.delegation.parameter.toggle_pause_register_satellite import TogglePauseRegisterSatelliteParameter
from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.delegation.storage import DelegationStorage

async def on_delegation_toggle_pause_register_satellite(
    ctx: HandlerContext,
    toggle_pause_register_satellite: Transaction[TogglePauseRegisterSatelliteParameter, DelegationStorage],
) -> None:
    ...