
from mavryk.utils.persisters import persist_linked_contract
from mavryk.types.treasury_factory.storage import TreasuryFactoryStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.treasury_factory.parameter.update_general_contracts import UpdateGeneralContractsParameter
import mavryk.models as models

async def on_treasury_factory_update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: Transaction[UpdateGeneralContractsParameter, TreasuryFactoryStorage],
) -> None:

    # Perists general contract
    await persist_linked_contract(models.TreasuryFactory, models.TreasuryFactoryGeneralContract, update_general_contracts)