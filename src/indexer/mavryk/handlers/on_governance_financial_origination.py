
from mavryk.types.governance_financial.storage import GovernanceFinancialStorage
from dipdup.context import HandlerContext
from dipdup.models import Origination
import mavryk.models as models

async def on_governance_financial_origination(
    ctx: HandlerContext,
    governance_financial_origination: Origination[GovernanceFinancialStorage],
) -> None:

    # Get operation values
    address                     = governance_financial_origination.data.originated_contract_address
    admin                       = governance_financial_origination.storage.admin
    governance_address          = governance_financial_origination.storage.governanceAddress
    fin_req_approval_percentage = int(governance_financial_origination.storage.config.financialRequestApprovalPercentage)
    fin_req_duration_in_days    = int(governance_financial_origination.storage.config.financialRequestDurationInDays)
    fin_req_counter             = int(governance_financial_origination.storage.financialRequestCounter)
    timestamp                   = governance_financial_origination.data.timestamp

    # Get or create governance record
    governance, _ = await models.Governance.get_or_create(address=governance_address)
    await governance.save();

    # Create farm factory
    governance_financial = models.GovernanceFinancial(
        address                     = address,
        admin                       = admin,
        last_updated_at             = timestamp,
        governance                  = governance,
        fin_req_approval_percentage = fin_req_approval_percentage,
        fin_req_duration_in_days    = fin_req_duration_in_days,
        fin_req_counter             = fin_req_counter,
    )

    await governance_financial.save()