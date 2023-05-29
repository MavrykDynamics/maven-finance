from mavryk.utils.error_reporting import save_error_report

from mavryk.types.governance_financial.storage import GovernanceFinancialStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.governance_financial.parameter.drop_financial_request import DropFinancialRequestParameter
import mavryk.models as models

async def on_governance_financial_drop_financial_request(
    ctx: HandlerContext,
    drop_financial_request: Transaction[DropFinancialRequestParameter, GovernanceFinancialStorage],
) -> None:

    try:    
        # Get operation info
        financial_address   = drop_financial_request.data.target_address
        request_id          = int(drop_financial_request.parameter.__root__)
        request_storage     = drop_financial_request.storage.financialRequestLedger[drop_financial_request.parameter.__root__]
        status              = models.GovernanceActionStatus.DROPPED
        if request_storage.status:
            status          = models.GovernanceActionStatus.ACTIVE
    
        # Update record
        governance_financial    = await models.GovernanceFinancial.get(network=ctx.datasource.network, address= financial_address)
        request                 = await models.GovernanceFinancialRequest.filter(
            governance_financial    = governance_financial,
            internal_id             = request_id
        ).first()
        request.status      = status
        await request.save()

    except BaseException as e:
         await save_error_report(e)

