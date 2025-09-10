from maven.utils.error_reporting import save_error_report

from maven.utils.persisters import persist_linked_contract
from maven.types.emergency_governance.tezos_storage import EmergencyGovernanceStorage
from dipdup.models.tezos import TezosTransaction
from maven.types.emergency_governance.tezos_parameters.update_whitelist_contracts import UpdateWhitelistContractsParameter
from dipdup.context import HandlerContext
from maven import models as models

async def update_whitelist_contracts(
    ctx: HandlerContext,
    update_whitelist_contracts: TezosTransaction[UpdateWhitelistContractsParameter, EmergencyGovernanceStorage],
) -> None:

    try:
        # Persist whitelist contract
        await persist_linked_contract(ctx, models.EmergencyGovernance, models.EmergencyGovernanceWhitelistContract, update_whitelist_contracts)

    except BaseException as e:
        await save_error_report(e)

