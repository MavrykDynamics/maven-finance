from maven.utils.error_reporting import save_error_report

from maven.utils.contracts import get_contract_metadata
from maven.types.aggregator.tezos_storage import AggregatorStorage
from maven.types.aggregator.tezos_parameters.update_metadata import UpdateMetadataParameter
from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
import maven.models as models

async def update_metadata(
    ctx: HandlerContext,
    update_metadata: TzktTransaction[UpdateMetadataParameter, AggregatorStorage],
) -> None:

    try:    
        # Get operation info
        aggregator_address  = update_metadata.data.target_address
    
        # Get contract metadata
        contract_metadata   = await get_contract_metadata(
            ctx=ctx,
            contract_address=aggregator_address
        )

        # Update record
        await models.Aggregator.filter(
            address = aggregator_address,
            network = ctx.datasource.name.replace('mvkt_','')
        ).update(
            metadata = contract_metadata
        )

    except BaseException as e:
        await save_error_report(e)

