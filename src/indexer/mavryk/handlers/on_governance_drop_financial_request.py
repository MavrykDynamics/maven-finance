from dipdup.context import HandlerContext
from mavryk.types.governance.storage import GovernanceStorage
from mavryk.types.governance.parameter.drop_financial_request import DropFinancialRequestParameter
from dipdup.models import Transaction
import mavryk.models as models

async def on_governance_drop_financial_request(
    ctx: HandlerContext,
    drop_financial_request: Transaction[DropFinancialRequestParameter, GovernanceStorage],
) -> None:
    # Get operation values
    requestID           = int(drop_financial_request.parameter.__root__)
    requestStorage      = drop_financial_request.storage.financialRequestLedger[drop_financial_request.parameter.__root__]
    requestStatus       = requestStorage.status
    statusType          = models.GovernanceRecordStatus.ACTIVE
    if not requestStatus:
        statusType  = models.GovernanceRecordStatus.DROPPED

    # Update record
    request = await models.GovernanceFinancialRequestRecord.get(
        id = requestID
    )
    request.status  = statusType
