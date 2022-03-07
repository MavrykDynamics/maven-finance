
from mavryk.types.delegation.parameter.toggle_pause_undelegate_satellite import TogglePauseUndelegateSatelliteParameter
from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.delegation.storage import DelegationStorage

async def on_delegation_toggle_pause_undelegate_satellite(
    ctx: HandlerContext,
    toggle_pause_undelegate_satellite: Transaction[TogglePauseUndelegateSatelliteParameter, DelegationStorage],
) -> None:
    ...