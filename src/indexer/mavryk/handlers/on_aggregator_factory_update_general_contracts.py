from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_linked_contract
from mavryk.types.aggregator_factory.parameter.update_general_contracts import UpdateGeneralContractsParameter
from dipdup.models import Transaction
from mavryk.types.aggregator_factory.storage import AggregatorFactoryStorage
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_aggregator_factory_update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: Transaction[UpdateGeneralContractsParameter, AggregatorFactoryStorage],
) -> None:

    try:
        # Perists general contract
        await persist_linked_contract(ctx, models.AggregatorFactory, models.AggregatorFactoryGeneralContract, update_general_contracts)

    except BaseException as e:
         await save_error_report(e)

