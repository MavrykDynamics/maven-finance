from mavryk.utils.error_reporting import save_error_report

from mavryk.types.aggregator.parameter.remove_oracle import RemoveOracleParameter
from mavryk.types.aggregator.storage import AggregatorStorage
from dipdup.models import Transaction
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_aggregator_remove_oracle(
    ctx: HandlerContext,
    remove_oracle: Transaction[RemoveOracleParameter, AggregatorStorage],
) -> None:

    try:
        # Get operation info
        aggregator_address      = remove_oracle.data.target_address
        oracle_address          = remove_oracle.parameter.__root__
    
        # Remove records
        oracle                  = await models.mavryk_user_cache.get(address=oracle_address)
        aggregator              = await models.Aggregator.get(address   = aggregator_address)
        aggregator_oracle       = await models.AggregatorOracle.filter(
            aggregator  = aggregator,
            user        = oracle
        ).first()
    
        oracle_observations     = await models.AggregatorOracleObservation.filter(oracle = aggregator_oracle).all()
    
        for oracle_observation in oracle_observations:
            await oracle_observation.delete()
    
        await aggregator_oracle.delete()

    except BaseException:
         await save_error_report()

