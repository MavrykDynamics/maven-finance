
from dipdup.models import Origination
from dipdup.context import HandlerContext
from mavryk.types.lending_controller.storage import LendingControllerStorage

async def on_lending_controller_origination(
    ctx: HandlerContext,
    lending_controller_origination: Origination[LendingControllerStorage],
) -> None:

    breakpoint()
