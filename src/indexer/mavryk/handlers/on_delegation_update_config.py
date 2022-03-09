
from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.delegation.parameter.update_config import UpdateConfigParameter, UpdateConfigActionItem as configDelegationRatio, UpdateConfigActionItem1 as configMaxSatellites, UpdateConfigActionItem2 as configMinimumStakedMvkBalance
from mavryk.types.delegation.storage import DelegationStorage
import mavryk.models as models

async def on_delegation_update_config(
    ctx: HandlerContext,
    update_config: Transaction[UpdateConfigParameter, DelegationStorage],
) -> None:
    # Get operation values
    delegationAddress       = update_config.data.target_address
    updatedValue            = int(update_config.parameter.updateConfigNewValue)
    updateConfigAction      = type(update_config.parameter.updateConfigAction)

    # Update contract
    delegation = await models.Delegation.get(
        address = delegationAddress
    )
    if updateConfigAction == configDelegationRatio:
        delegation.delegation_ratio     = updatedValue
    elif updateConfigAction == configMaxSatellites:
        delegation.max_satellites       = updatedValue
    elif updateConfigAction == configMinimumStakedMvkBalance:
        delegation.minimum_smvk_balance = updatedValue
    
    await delegation.save()
