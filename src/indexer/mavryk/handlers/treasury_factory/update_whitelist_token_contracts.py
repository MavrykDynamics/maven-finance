from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_linked_contract
from mavryk.types.treasury_factory.tezos_parameters.update_whitelist_token_contracts import UpdateWhitelistTokenContractsParameter
from mavryk.types.treasury_factory.tezos_storage import TreasuryFactoryStorage
from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
import mavryk.models as models

async def update_whitelist_token_contracts(
    ctx: HandlerContext,
    update_whitelist_token_contracts: TzktTransaction[UpdateWhitelistTokenContractsParameter, TreasuryFactoryStorage],
) -> None:

    try:    
        # Persist whitelist token contract
        await persist_linked_contract(ctx, models.TreasuryFactory, models.TreasuryFactoryWhitelistTokenContract, update_whitelist_token_contracts)

    except BaseException as e:
        await save_error_report(e)

