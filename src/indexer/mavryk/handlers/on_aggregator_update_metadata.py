from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_contract_metadata
from mavryk.types.aggregator.storage import AggregatorStorage
from mavryk.types.aggregator.parameter.update_metadata import UpdateMetadataParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction

async def on_aggregator_update_metadata(
    ctx: HandlerContext,
    update_metadata: Transaction[UpdateMetadataParameter, AggregatorStorage],
) -> None:

    try:    
        # Get operation info
        aggregator_address  = update_metadata.data.target_address
    
        # Persist contract metadata
        await persist_contract_metadata(
            ctx=ctx,
            contract_address=aggregator_address
        )

    except BaseException:
         await save_error_report()

