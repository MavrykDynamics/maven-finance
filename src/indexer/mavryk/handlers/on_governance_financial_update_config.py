from mavryk.utils.error_reporting import save_error_report

from mavryk.types.governance_financial.storage import GovernanceFinancialStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.governance_financial.parameter.update_config import UpdateConfigParameter
import mavryk.models as models

async def on_governance_financial_update_config(
    ctx: HandlerContext,
    update_config: Transaction[UpdateConfigParameter, GovernanceFinancialStorage],
) -> None:

    try:
        # Get operation values
        financial_address       = update_config.data.target_address
        timestamp               = update_config.data.timestamp
    
        # Update contract
        await models.GovernanceFinancial.filter(
            network = ctx.datasource.network,
            address = financial_address
        ).update(
            last_updated_at             = timestamp,
            approval_percentage         = update_config.storage.config.approvalPercentage,
            fin_req_duration_in_days    = update_config.storage.config.financialRequestDurationInDays
        )

    except BaseException as e:
         await save_error_report(e)

