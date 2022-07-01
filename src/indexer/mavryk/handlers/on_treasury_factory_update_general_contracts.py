
from mavryk.utils.persisters import persist_general_contract
from mavryk.types.treasury_factory.storage import TreasuryFactoryStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.treasury_factory.parameter.update_general_contracts import UpdateGeneralContractsParameter

async def on_treasury_factory_update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: Transaction[UpdateGeneralContractsParameter, TreasuryFactoryStorage],
) -> None:

    # Perists general contract
    await persist_general_contract(update_general_contracts)