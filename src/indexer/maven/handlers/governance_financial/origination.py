from maven.utils.error_reporting import save_error_report

from maven.utils.contracts import get_contract_metadata
from maven.types.governance_financial.tezos_storage import GovernanceFinancialStorage
from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktOrigination
import maven.models as models

async def origination(
    ctx: HandlerContext,
    governance_financial_origination: TzktOrigination[GovernanceFinancialStorage],
) -> None:

    try:
        # Get operation values
        address                     = governance_financial_origination.data.originated_contract_address
        admin                       = governance_financial_origination.storage.admin
        approval_percentage         = int(governance_financial_origination.storage.config.approvalPercentage)
        fin_req_duration_in_days    = int(governance_financial_origination.storage.config.financialRequestDurationInDays)
        fin_req_counter             = int(governance_financial_origination.storage.financialRequestCounter)
        timestamp                   = governance_financial_origination.data.timestamp
    
        # Get contract metadata
        contract_metadata = await get_contract_metadata(
            ctx=ctx,
            contract_address=address
        )
        
        # Get governance record
        governance                  = await models.Governance.get(network = ctx.datasource.name.replace('tzkt_',''))
    
        # Create farm factory
        governance_financial = models.GovernanceFinancial(
            address                     = address,
            network                     = ctx.datasource.name.replace('tzkt_',''),
            metadata                    = contract_metadata,
            admin                       = admin,
            last_updated_at             = timestamp,
            governance                  = governance,
            approval_percentage         = approval_percentage,
            fin_req_duration_in_days    = fin_req_duration_in_days,
            fin_req_counter             = fin_req_counter,
        )
    
        await governance_financial.save()
    except BaseException as e:
        await save_error_report(e)

