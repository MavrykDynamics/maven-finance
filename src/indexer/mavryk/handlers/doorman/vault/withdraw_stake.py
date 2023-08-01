from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.types.doorman.tezos_parameters.on_vault_withdraw_stake import OnVaultWithdrawStakeParameter
from mavryk.types.doorman.tezos_storage import DoormanStorage


async def withdraw_stake(
    ctx: HandlerContext,
    on_vault_withdraw_stake: TzktTransaction[OnVaultWithdrawStakeParameter, DoormanStorage],
) -> None:
    ...