from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.contracts import get_contract_metadata
from mavryk.types.vault_factory.tezos_storage import VaultFactoryStorage
from dipdup.models.tezos_tzkt import TzktOrigination
from dipdup.context import HandlerContext
import mavryk.models as models

async def origination(
    ctx: HandlerContext,
    vault_factory_origination: TzktOrigination[VaultFactoryStorage],
) -> None:

    try:
        # Get operation info
        vault_factory_address   = vault_factory_origination.data.originated_contract_address
        admin                   = vault_factory_origination.storage.admin
        timestamp               = vault_factory_origination.data.timestamp
        vault_name_max_length   = int(vault_factory_origination.storage.config.vaultNameMaxLength)
        create_vault_paused     = vault_factory_origination.storage.breakGlassConfig.createVaultIsPaused
    
        # Get contract metadata
        contract_metadata = await get_contract_metadata(
            ctx=ctx,
            contract_address=vault_factory_address
        )
    
        # Get governance record
        governance                  = await models.Governance.get(network = ctx.datasource.name.replace('tzkt_',''))
        vault_factory           = models.VaultFactory(
            address                 = vault_factory_address,
            network                 = ctx.datasource.name.replace('tzkt_',''),
            metadata                = contract_metadata,
            admin                   = admin,
            governance              = governance,
            vault_name_max_length   = vault_name_max_length,
            last_updated_at         = timestamp,
            create_vault_paused     = create_vault_paused
        )
        await vault_factory.save()

    except BaseException as e:
        await save_error_report(e)

