from mavryk.utils.error_reporting import save_error_report

from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.utils.persisters import persist_lambda
from mavryk.types.governance_financial.tezos_storage import GovernanceFinancialStorage
from mavryk.types.governance_financial.tezos_parameters.set_lambda import SetLambdaParameter
from dipdup.context import HandlerContext
import mavryk.models as models

async def set_lambda(
    ctx: HandlerContext,
    set_lambda: TzktTransaction[SetLambdaParameter, GovernanceFinancialStorage],
) -> None:

    try:
        # Persist lambda
        await persist_lambda(ctx, models.GovernanceFinancial, models.GovernanceFinancialLambda, set_lambda)

    except BaseException as e:
        await save_error_report(e)

