from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.doorman.parameter.on_vault_withdraw_stake import OnVaultWithdrawStakeParameter
from mavryk.types.doorman.storage import DoormanStorage


async def withdraw_stake(
    ctx: HandlerContext,
    on_vault_withdraw_stake: Transaction[OnVaultWithdrawStakeParameter, DoormanStorage],
) -> None:
    ...