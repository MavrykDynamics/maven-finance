from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.types.doorman.tezos_parameters.on_vault_liquidate_stake import OnVaultLiquidateStakeParameter
from mavryk.types.doorman.tezos_storage import DoormanStorage


async def liquidate_stake(
    ctx: HandlerContext,
    on_vault_liquidate_stake: TzktTransaction[OnVaultLiquidateStakeParameter, DoormanStorage],
) -> None:
    ...