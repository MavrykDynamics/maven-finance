from maven.utils.error_reporting import save_error_report

from dipdup.models.tezos import TezosTransaction
from maven.utils.persisters import persist_lambda
from maven.types.emergency_governance.tezos_parameters.set_lambda import SetLambdaParameter
from maven.types.emergency_governance.tezos_storage import EmergencyGovernanceStorage
from dipdup.context import HandlerContext
import maven.models as models

async def set_lambda(
    ctx: HandlerContext,
    set_lambda: TezosTransaction[SetLambdaParameter, EmergencyGovernanceStorage],
) -> None:

    try:

        # Persist lambda
        await persist_lambda(ctx, models.EmergencyGovernance, models.EmergencyGovernanceLambda, set_lambda)

    except BaseException as e:
        await save_error_report(e)

