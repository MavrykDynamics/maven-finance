
from mavryk.utils.persisters import persist_linked_contract
from mavryk.types.farm_factory.storage import FarmFactoryStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.farm_factory.parameter.update_general_contracts import UpdateGeneralContractsParameter
import mavryk.models as models

async def on_farm_factory_update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: Transaction[UpdateGeneralContractsParameter, FarmFactoryStorage],
) -> None:

    # Perists general contract
    await persist_linked_contract(models.FarmFactory, models.FarmFactoryGeneralContract, update_general_contracts)