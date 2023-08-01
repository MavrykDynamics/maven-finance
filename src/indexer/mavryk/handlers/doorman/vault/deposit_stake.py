from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.types.doorman.tezos_parameters.on_vault_deposit_stake import OnVaultDepositStakeParameter
from mavryk.types.doorman.tezos_storage import DoormanStorage


async def deposit_stake(
    ctx: HandlerContext,
    on_vault_deposit_stake: TzktTransaction[OnVaultDepositStakeParameter, DoormanStorage],
) -> None:
    ...