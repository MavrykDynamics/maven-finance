
from mavryk.types.doorman.storage import DoormanStorage
from dipdup.context import HandlerContext
from mavryk.types.doorman.parameter.update_general_contracts import UpdateGeneralContractsParameter
from dipdup.models import Transaction

async def on_doorman_update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: Transaction[UpdateGeneralContractsParameter, DoormanStorage],
) -> None:
    ...