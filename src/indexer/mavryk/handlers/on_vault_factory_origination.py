
from mavryk.types.vault_factory.storage import VaultFactoryStorage
from dipdup.models import Origination
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_vault_factory_origination(
    ctx: HandlerContext,
    vault_factory_origination: Origination[VaultFactoryStorage],
) -> None:
    
    # Get operation info
    vault_factory_address   = vault_factory_origination.data.originated_contract_address
    governance_address      = vault_factory_origination.storage.governanceAddress
    admin                   = vault_factory_origination.storage.admin
    timestamp               = vault_factory_origination.data.timestamp
    vault_name_max_length   = int(vault_factory_origination.storage.config.vaultNameMaxLength)
    create_vault_paused     = vault_factory_origination.storage.breakGlassConfig.createVaultIsPaused


    # Create record
    governance, _           = await models.Governance.get_or_create(
        address = governance_address
    )
    await governance.save()
    vault_factory           = models.VaultFactory(
        address                 = vault_factory_address,
        admin                   = admin,
        governance              = governance,
        vault_name_max_length   = vault_name_max_length,
        last_updated_at         = timestamp,
        create_vault_paused     = create_vault_paused
    )
    await vault_factory.save()
