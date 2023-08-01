from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.mvk_token.storage import MvkTokenStorage
from mavryk.types.mvk_token.parameter.update_inflation_rate import UpdateInflationRateParameter
import mavryk.models as models

async def update_inflation_rate(
    ctx: HandlerContext,
    update_inflation_rate: Transaction[UpdateInflationRateParameter, MvkTokenStorage],
) -> None:

    try:    
        # Get operation info
        mvk_address                 = update_inflation_rate.data.target_address
        inflation_rate              = int(update_inflation_rate.parameter.__root__)
    
        # Update record
        await models.MVKToken.filter(network=ctx.datasource.network, address= mvk_address).update(
            inflation_rate    = inflation_rate
        )

    except BaseException as e:
        await save_error_report(e)

