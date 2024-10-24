from maven.utils.error_reporting import save_error_report

from maven.utils.persisters import persist_linked_contract
from maven.types.aggregator_factory.tezos_parameters.update_general_contracts import UpdateGeneralContractsParameter
from dipdup.models.tezos import TezosTransaction
from maven.types.aggregator_factory.tezos_storage import AggregatorFactoryStorage
from dipdup.context import HandlerContext
import maven.models as models

async def update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: TezosTransaction[UpdateGeneralContractsParameter, AggregatorFactoryStorage],
) -> None:

    try:
        # Perists general contract
        await persist_linked_contract(ctx, models.AggregatorFactory, models.AggregatorFactoryGeneralContract, update_general_contracts)

    except BaseException as e:
        await save_error_report(e)

