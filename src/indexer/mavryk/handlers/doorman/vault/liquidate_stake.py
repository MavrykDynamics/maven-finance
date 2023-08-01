from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.doorman.parameter.on_vault_liquidate_stake import OnVaultLiquidateStakeParameter
from mavryk.types.doorman.storage import DoormanStorage


async def liquidate_stake(
    ctx: HandlerContext,
    on_vault_liquidate_stake: Transaction[OnVaultLiquidateStakeParameter, DoormanStorage],
) -> None:
    ...