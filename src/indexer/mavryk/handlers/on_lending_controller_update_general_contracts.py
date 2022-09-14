
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.lending_controller.parameter.update_general_contracts import UpdateGeneralContractsParameter
from mavryk.types.lending_controller.storage import LendingControllerStorage

async def on_lending_controller_update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: Transaction[UpdateGeneralContractsParameter, LendingControllerStorage],
) -> None:

    breakpoint()
