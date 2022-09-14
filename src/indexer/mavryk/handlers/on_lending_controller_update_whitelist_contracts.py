
from dipdup.context import HandlerContext
from mavryk.types.lending_controller.parameter.update_whitelist_contracts import UpdateWhitelistContractsParameter
from dipdup.models import Transaction
from mavryk.types.lending_controller.storage import LendingControllerStorage

async def on_lending_controller_update_whitelist_contracts(
    ctx: HandlerContext,
    update_whitelist_contracts: Transaction[UpdateWhitelistContractsParameter, LendingControllerStorage],
) -> None:

    breakpoint()
