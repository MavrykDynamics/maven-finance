
from mavryk.utils.persisters import persist_contract_metadata
from mavryk.types.treasury_factory.storage import TreasuryFactoryStorage
from dipdup.context import HandlerContext
from mavryk.types.treasury_factory.parameter.create_treasury import CreateTreasuryParameter
from mavryk.types.treasury.storage import TreasuryStorage
from dipdup.models import Origination
from dipdup.models import Transaction
import mavryk.models as models

async def on_treasury_factory_create_treasury(
    ctx: HandlerContext,
    create_treasury: Transaction[CreateTreasuryParameter, TreasuryFactoryStorage],
    treasury_origination: Origination[TreasuryStorage],
) -> None:

    # Get operation info
    treasury_address                = treasury_origination.data.originated_contract_address
    baker_address                   = create_treasury.parameter.baker
    level                           = create_treasury.data.level
    treasury_factory_address        = create_treasury.data.target_address
    admin                           = treasury_origination.storage.admin
    governance_address              = treasury_origination.storage.governanceAddress
    name                            = treasury_origination.storage.name
    creation_timestamp              = treasury_origination.data.timestamp
    transfer_paused                 = treasury_origination.storage.breakGlassConfig.transferIsPaused
    mint_mvk_and_transfer_paused    = treasury_origination.storage.breakGlassConfig.mintMvkAndTransferIsPaused
    stake_mvk_paused                = treasury_origination.storage.breakGlassConfig.stakeMvkIsPaused
    unstake_mvk_paused              = treasury_origination.storage.breakGlassConfig.unstakeMvkIsPaused

    # Check treasury does not already exists
    treasury_exists                     = await models.Treasury.get_or_none(
        address     = treasury_address
    )

    if not treasury_exists:
        # Create a contract and index it
        await ctx.add_contract(
            name=treasury_address + 'contract',
            address=treasury_address,
            typename="treasury"
        )
        await ctx.add_index(
            name=treasury_address + 'index',
            template="treasury_template",
            values=dict(
                treasury_contract=treasury_address + 'contract'
            )
        )
        await ctx.add_index(
            name=treasury_address + 'token_transfer_sender_index',
            template="treasury_token_transfer_sender_template",
            values=dict(
                treasury_contract   = treasury_address + 'contract',
                first_level         = level
            )
        )
        await ctx.add_index(
            name=treasury_address + 'token_transfer_receiver_index',
            template="treasury_token_transfer_receiver_template",
            values=dict(
                treasury_contract   = treasury_address + 'contract',
                first_level         = level
            )
        )

        # Persist contract metadata
        await persist_contract_metadata(
            ctx=ctx,
            contract_address=treasury_address
        )

        # Create record
        treasury_factory    = await models.TreasuryFactory.get(
            address = treasury_factory_address
        )
        governance          = await models.Governance.get(
            address = governance_address
        )
        treasury, _         = await models.Treasury.get_or_create(
            address                         = treasury_address
        )
        treasury.governance                      = governance
        treasury.admin                           = admin
        treasury.name                            = name
        treasury.creation_timestamp              = creation_timestamp
        treasury.factory                         = treasury_factory
        treasury.transfer_paused                 = transfer_paused
        treasury.mint_mvk_and_transfer_paused    = mint_mvk_and_transfer_paused
        treasury.stake_mvk_paused                = stake_mvk_paused
        treasury.unstake_mvk_paused              = unstake_mvk_paused

        # Create a baker or not
        if baker_address:
            baker       = await models.mavryk_user_cache.get(address=baker_address)
            treasury.baker = baker

        await treasury.save()
