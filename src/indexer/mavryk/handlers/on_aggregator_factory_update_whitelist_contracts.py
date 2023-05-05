from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Transaction
from mavryk.utils.persisters import persist_linked_contract
from mavryk.types.aggregator_factory.storage import AggregatorFactoryStorage
from mavryk.types.aggregator_factory.parameter.update_whitelist_contracts import UpdateWhitelistContractsParameter
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_aggregator_factory_update_whitelist_contracts(
    ctx: HandlerContext,
    update_whitelist_contracts: Transaction[UpdateWhitelistContractsParameter, AggregatorFactoryStorage],
) -> None:

    try:
        # Persist whitelist contract
        await persist_linked_contract(models.AggregatorFactory, models.AggregatorFactoryWhitelistContract, update_whitelist_contracts)

    except BaseException as e:
         await save_error_report(e)

