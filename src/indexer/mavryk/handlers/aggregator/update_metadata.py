from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.contracts import get_contract_metadata
from mavryk.types.aggregator.storage import AggregatorStorage
from mavryk.types.aggregator.parameter.update_metadata import UpdateMetadataParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction
import mavryk.models as models

async def update_metadata(
    ctx: HandlerContext,
    update_metadata: Transaction[UpdateMetadataParameter, AggregatorStorage],
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
            network = ctx.datasource.network
        ).update(
            metadata = contract_metadata
        )

    except BaseException as e:
        await save_error_report(e)

