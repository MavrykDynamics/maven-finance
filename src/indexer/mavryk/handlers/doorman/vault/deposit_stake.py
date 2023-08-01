from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.doorman.parameter.on_vault_deposit_stake import OnVaultDepositStakeParameter
from mavryk.types.doorman.storage import DoormanStorage


async def deposit_stake(
    ctx: HandlerContext,
    on_vault_deposit_stake: Transaction[OnVaultDepositStakeParameter, DoormanStorage],
) -> None:
    ...