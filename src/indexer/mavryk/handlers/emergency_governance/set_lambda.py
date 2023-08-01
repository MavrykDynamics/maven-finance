from mavryk.utils.error_reporting import save_error_report

from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.utils.persisters import persist_lambda
from mavryk.types.emergency_governance.tezos_parameters.set_lambda import SetLambdaParameter
from mavryk.types.emergency_governance.tezos_storage import EmergencyGovernanceStorage
from dipdup.context import HandlerContext
import mavryk.models as models

async def set_lambda(
    ctx: HandlerContext,
    set_lambda: TzktTransaction[SetLambdaParameter, EmergencyGovernanceStorage],
) -> None:

    try:

        # Persist lambda
        await persist_lambda(ctx, models.EmergencyGovernance, models.EmergencyGovernanceLambda, set_lambda)

    except BaseException as e:
        await save_error_report(e)

