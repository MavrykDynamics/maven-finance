
from dipdup.models import Transaction
from mavryk.types.governance.parameter.setup_lambda_function import SetupLambdaFunctionParameter
from dipdup.context import HandlerContext
from mavryk.types.governance.storage import GovernanceStorage
import mavryk.models as models

async def on_governance_setup_lambda_function(
    ctx: HandlerContext,
    setup_lambda_function: Transaction[SetupLambdaFunctionParameter, GovernanceStorage],
) -> None:
    # Get operation values
    governanceAddress       = setup_lambda_function.data.target_address
    lambdaID                = int(setup_lambda_function.parameter.id)
    lambdaFunc              = setup_lambda_function.parameter.func_bytes
    
    # Create record
    governance  = await models.Governance.get(
        address = governanceAddress
    )
    lambdaRecord            = models.GovernanceLambdaRecord(
        governance          = governance,
        id                  = lambdaID,
        lambda_function     = lambdaFunc
    )
    await lambdaRecord.save()
