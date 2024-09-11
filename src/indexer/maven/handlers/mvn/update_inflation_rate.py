from maven.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
from maven.types.mvn_token.tezos_storage import MvnTokenStorage
from maven.types.mvn_token.tezos_parameters.update_inflation_rate import UpdateInflationRateParameter
import maven.models as models

async def update_inflation_rate(
    ctx: HandlerContext,
    update_inflation_rate: TzktTransaction[UpdateInflationRateParameter, MvnTokenStorage],
) -> None:

    try:    
        # Get operation info
        mvn_address                 = update_inflation_rate.data.target_address
        inflation_rate              = int(update_inflation_rate.parameter.__root__)
    
        # Update record
        await models.MVNToken.filter(network=ctx.datasource.name.replace('mvkt_',''), address= mvn_address).update(
            inflation_rate    = inflation_rate
        )

    except BaseException as e:
        await save_error_report(e)

