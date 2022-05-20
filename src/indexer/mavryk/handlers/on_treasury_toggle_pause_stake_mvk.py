
from dipdup.context import HandlerContext
from mavryk.types.treasury.parameter.toggle_pause_stake_mvk import TogglePauseStakeMvkParameter
from mavryk.types.treasury.storage import TreasuryStorage
from dipdup.models import Transaction

async def on_treasury_toggle_pause_stake_mvk(
    ctx: HandlerContext,
    toggle_pause_stake_mvk: Transaction[TogglePauseStakeMvkParameter, TreasuryStorage],
) -> None:
    ...