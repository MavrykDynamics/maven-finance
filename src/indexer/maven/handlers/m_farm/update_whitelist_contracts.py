from maven.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from dipdup.models.tezos import TezosTransaction
from maven.utils.persisters import persist_linked_contract
from maven.types.m_farm.tezos_parameters.update_whitelist_contracts import UpdateWhitelistContractsParameter
from maven.types.m_farm.tezos_storage import MFarmStorage
from maven import models as models

async def update_whitelist_contracts(
    ctx: HandlerContext,
    update_whitelist_contracts: TezosTransaction[UpdateWhitelistContractsParameter, MFarmStorage],
) -> None:

    try:
        # Persist whitelist contract
        await persist_linked_contract(ctx, models.Farm, models.FarmWhitelistContract, update_whitelist_contracts)

    except BaseException as e:
        await save_error_report(e)

