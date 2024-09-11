from maven.utils.error_reporting import save_error_report

from maven.types.governance_financial.tezos_storage import GovernanceFinancialStorage
from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
from maven.types.governance_financial.tezos_parameters.update_config import UpdateConfigParameter
import maven.models as models

async def update_config(
    ctx: HandlerContext,
    update_config: TzktTransaction[UpdateConfigParameter, GovernanceFinancialStorage],
) -> None:

    try:
        # Get operation values
        financial_address       = update_config.data.target_address
        timestamp               = update_config.data.timestamp
    
        # Update contract
        await models.GovernanceFinancial.filter(
            network = ctx.datasource.name.replace('mvkt_',''),
            address = financial_address
        ).update(
            last_updated_at             = timestamp,
            approval_percentage         = update_config.storage.config.approvalPercentage,
            fin_req_duration_in_days    = update_config.storage.config.financialRequestDurationInDays
        )

    except BaseException as e:
        await save_error_report(e)

