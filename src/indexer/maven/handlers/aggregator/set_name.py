from maven.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from maven.types.aggregator.tezos_storage import AggregatorStorage
from maven.types.aggregator.tezos_parameters.set_name import SetNameParameter
from dipdup.models.tezos import TezosTransaction
from maven import models as models

async def set_name(
    ctx: HandlerContext,
    set_name: TezosTransaction[SetNameParameter, AggregatorStorage],
) -> None:

    try:
        # Get operation info
        aggregator_address      = set_name.data.target_address
        name                    = set_name.parameter.root
    
        # Update contract
        await models.Aggregator.filter(
            network = 'atlasnet',
            address = aggregator_address
        ).update(
            name    = name
        )

    except BaseException as e:
        await save_error_report(e)

