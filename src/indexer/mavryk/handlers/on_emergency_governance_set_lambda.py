from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Transaction
from mavryk.utils.persisters import persist_lambda
from mavryk.types.emergency_governance.parameter.set_lambda import SetLambdaParameter
from mavryk.types.emergency_governance.storage import EmergencyGovernanceStorage
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_emergency_governance_set_lambda(
    ctx: HandlerContext,
    set_lambda: Transaction[SetLambdaParameter, EmergencyGovernanceStorage],
) -> None:

    try:
        # Persist lambda
        await persist_lambda(models.EmergencyGovernance, models.EmergencyGovernanceLambda, set_lambda)

    except BaseException as e:
         await save_error_report(e)

