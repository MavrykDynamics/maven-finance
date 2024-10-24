from maven.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from maven.utils.persisters import persist_financial_request
from maven.types.governance_financial.tezos_storage import GovernanceFinancialStorage
from dipdup.models.tezos import TezosTransaction
from maven.types.governance_financial.tezos_parameters.set_contract_baker import SetContractBakerParameter

async def set_contract_baker(
    ctx: HandlerContext,
    set_contract_baker: TezosTransaction[SetContractBakerParameter, GovernanceFinancialStorage],
) -> None:

    try:    
        # Persist request
        await persist_financial_request(ctx, set_contract_baker)
    except BaseException as e:
        await save_error_report(e)

