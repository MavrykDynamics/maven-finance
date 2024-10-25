from maven.utils.error_reporting import save_error_report

from maven.utils.persisters import persist_linked_contract
from maven.types.aggregator.tezos_parameters.update_general_contracts import UpdateGeneralContractsParameter
from maven.types.aggregator.tezos_storage import AggregatorStorage
from dipdup.models.tezos_tzkt import TzktTransaction
from dipdup.context import HandlerContext
import maven.models as models

async def update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: TzktTransaction[UpdateGeneralContractsParameter, AggregatorStorage],
) -> None:

    try:
        # Perists general contract
        await persist_linked_contract(ctx, models.Aggregator, models.AggregatorGeneralContract, update_general_contracts)

    except BaseException as e:
        await save_error_report(e)

