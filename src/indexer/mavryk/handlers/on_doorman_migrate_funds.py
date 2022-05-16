
from mavryk.types.doorman.storage import DoormanStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.doorman.parameter.migrate_funds import MigrateFundsParameter

async def on_doorman_migrate_funds(
    ctx: HandlerContext,
    migrate_funds: Transaction[MigrateFundsParameter, DoormanStorage],
) -> None:
    ...