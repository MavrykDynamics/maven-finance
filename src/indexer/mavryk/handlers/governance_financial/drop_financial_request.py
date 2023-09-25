from mavryk.utils.error_reporting import save_error_report

from mavryk.types.governance_financial.tezos_storage import GovernanceFinancialStorage
from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.types.governance_financial.tezos_parameters.drop_financial_request import DropFinancialRequestParameter
import mavryk.models as models

async def drop_financial_request(
    ctx: HandlerContext,
    drop_financial_request: TzktTransaction[DropFinancialRequestParameter, GovernanceFinancialStorage],
) -> None:

    try:    
        # Get operation info
        financial_address   = drop_financial_request.data.target_address
        request_id          = int(drop_financial_request.parameter.__root__)
        request_storage     = drop_financial_request.storage.financialRequestLedger[drop_financial_request.parameter.__root__]
        status              = models.GovernanceActionStatus.DROPPED
        status_timestamp    = drop_financial_request.data.timestamp
        if request_storage.status:
            status              = models.GovernanceActionStatus.ACTIVE
            status_timestamp    = None
    
        # Update record
        governance_financial    = await models.GovernanceFinancial.get(network=ctx.datasource.name.replace('tzkt_',''), address= financial_address)
        await models.GovernanceFinancialRequest.filter(
            governance_financial    = governance_financial,
            internal_id             = request_id
        ).update(
            status              = status,
            dropped_datetime    = status_timestamp
        )

    except BaseException as e:
        await save_error_report(e)

