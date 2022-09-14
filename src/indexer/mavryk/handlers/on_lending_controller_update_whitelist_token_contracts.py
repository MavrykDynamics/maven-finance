
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.lending_controller.parameter.update_whitelist_token_contracts import UpdateWhitelistTokenContractsParameter
from mavryk.types.lending_controller.storage import LendingControllerStorage

async def on_lending_controller_update_whitelist_token_contracts(
    ctx: HandlerContext,
    update_whitelist_token_contracts: Transaction[UpdateWhitelistTokenContractsParameter, LendingControllerStorage],
) -> None:

    breakpoint()
