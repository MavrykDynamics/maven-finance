from mavryk.utils.error_reporting import save_error_report

from mavryk.types.aggregator.tezos_parameters.remove_oracle import RemoveOracleParameter
from mavryk.types.aggregator.tezos_storage import AggregatorStorage
from dipdup.models.tezos_tzkt import TzktTransaction
from dipdup.context import HandlerContext
import mavryk.models as models

async def remove_oracle(
    ctx: HandlerContext,
    remove_oracle: TzktTransaction[RemoveOracleParameter, AggregatorStorage],
) -> None:

    try:
        # Get operation info
        aggregator_address              = remove_oracle.data.target_address
        oracle_address                  = remove_oracle.parameter.__root__
    
        # Remove records
        oracle                          = await models.mavryk_user_cache.get(network=ctx.datasource.network, address=oracle_address)
        aggregator                      = await models.Aggregator.get(network=ctx.datasource.network, address= aggregator_address)
        aggregator_oracle               = await models.AggregatorOracle.get(
            aggregator  = aggregator,
            user        = oracle
        )
    
        oracle_observations     = await models.AggregatorOracleObservation.filter(oracle = aggregator_oracle).all()
    
        for oracle_observation in oracle_observations:
            await oracle_observation.delete()
    
        await aggregator_oracle.delete()

    except BaseException as e:
        await save_error_report(e)

