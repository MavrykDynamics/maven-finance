
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.utils.persisters import persist_general_contract
from mavryk.types.treasury.parameter.update_general_contracts import UpdateGeneralContractsParameter
from mavryk.types.treasury.storage import TreasuryStorage

async def on_treasury_update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: Transaction[UpdateGeneralContractsParameter, TreasuryStorage],
) -> None:

    # Perists general contract
    await persist_general_contract(update_general_contracts)