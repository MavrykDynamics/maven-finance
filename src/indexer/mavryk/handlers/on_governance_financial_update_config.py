from mavryk.utils.error_reporting import save_error_report

from mavryk.types.governance_financial.storage import GovernanceFinancialStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.governance_financial.parameter.update_config import UpdateConfigParameter, UpdateConfigActionItem as configFinancialReqApprovalPct, UpdateConfigActionItem1 as configFinancialReqDurationDays
import mavryk.models as models

async def on_governance_financial_update_config(
    ctx: HandlerContext,
    update_config: Transaction[UpdateConfigParameter, GovernanceFinancialStorage],
) -> None:

    try:
        # Get operation values
        financial_address       = update_config.data.target_address
        updated_value           = int(update_config.parameter.updateConfigNewValue)
        update_config_action    = type(update_config.parameter.updateConfigAction)
        timestamp               = update_config.data.timestamp
    
        # Update contract
        governance_financial = await models.GovernanceFinancial.get(
            address = financial_address
        )
        governance_financial.last_updated_at    = timestamp
        if update_config_action == configFinancialReqApprovalPct:
            governance_financial.fin_req_approval_percentage    = updated_value
        elif update_config_action == configFinancialReqDurationDays:
            governance_financial.fin_req_duration_in_days       = updated_value
        
        await governance_financial.save()

    except BaseException:
         await save_error_report()

