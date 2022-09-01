
from dipdup.models import Transaction
from mavryk.utils.persisters import persist_lambda
from mavryk.types.governance_financial.storage import GovernanceFinancialStorage
from mavryk.types.governance_financial.parameter.set_lambda import SetLambdaParameter
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_governance_financial_set_lambda(
    ctx: HandlerContext,
    set_lambda: Transaction[SetLambdaParameter, GovernanceFinancialStorage],
) -> None:

    # Persist lambda
    await persist_lambda(models.GovernanceFinancial, models.GovernanceFinancialLambda, set_lambda)
