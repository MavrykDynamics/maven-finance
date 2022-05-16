
from dipdup.context import HandlerContext
from mavryk.types.council.parameter.update_general_contracts import UpdateGeneralContractsParameter
from dipdup.models import Transaction
from mavryk.types.council.storage import CouncilStorage

async def on_council_update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: Transaction[UpdateGeneralContractsParameter, CouncilStorage],
) -> None:
    ...