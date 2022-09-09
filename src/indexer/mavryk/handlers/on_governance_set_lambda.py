
from dipdup.models import Transaction
from mavryk.utils.persisters import persist_lambda
from mavryk.types.governance.parameter.set_lambda import SetLambdaParameter
from mavryk.types.governance.storage import GovernanceStorage
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_governance_set_lambda(
    ctx: HandlerContext,
    set_lambda: Transaction[SetLambdaParameter, GovernanceStorage],
) -> None:

    # Persist lambda
    await persist_lambda(models.Governance, models.GovernanceLambda, set_lambda)
