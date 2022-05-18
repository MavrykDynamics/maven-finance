
from dipdup.context import HandlerContext
from mavryk.utils.persisters import persist_general_contract
from mavryk.types.council.parameter.update_general_contracts import UpdateGeneralContractsParameter
from dipdup.models import Transaction
from mavryk.types.council.storage import CouncilStorage

async def on_council_update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: Transaction[UpdateGeneralContractsParameter, CouncilStorage],
) -> None:

    # Perists general contract
    await persist_general_contract(update_general_contracts)