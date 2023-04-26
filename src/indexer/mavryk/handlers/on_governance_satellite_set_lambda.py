from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Transaction
from mavryk.utils.persisters import persist_lambda
from mavryk.types.governance_satellite.storage import GovernanceSatelliteStorage
from mavryk.types.governance_satellite.parameter.set_lambda import SetLambdaParameter
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_governance_satellite_set_lambda(
    ctx: HandlerContext,
    set_lambda: Transaction[SetLambdaParameter, GovernanceSatelliteStorage],
) -> None:

    try:
        # Persist lambda
        await persist_lambda(models.GovernanceSatellite, models.GovernanceSatelliteLambda, set_lambda)

    except BaseException:
         await save_error_report()

