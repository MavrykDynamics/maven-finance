from mavryk.utils.error_reporting import save_error_report
from mavryk.utils.persisters import persist_contract_metadata, persist_token_metadata
from dipdup.context import HandlerContext
from dipdup.models import Origination
from dipdup.models import Transaction
from mavryk.types.farm_factory.parameter.create_farm_m_token import CreateFarmMTokenParameter
from mavryk.types.farm_factory.storage import FarmFactoryStorage
from mavryk.types.m_farm.storage import MFarmStorage
import mavryk.models as models
import json

async def on_farm_factory_create_farm_m_token(
    ctx: HandlerContext,
    create_farm_m_token: Transaction[CreateFarmMTokenParameter, FarmFactoryStorage],
    m_farm_origination: Origination[MFarmStorage],
) -> None:

    try:
        # Get operation info
        farm_address                    = m_farm_origination.data.originated_contract_address
        farm_factory_address            = create_farm_m_token.data.target_address
        admin                           = m_farm_origination.storage.admin
        governance_address              = m_farm_origination.storage.governanceAddress
        name                            = m_farm_origination.storage.name
        creation_timestamp              = m_farm_origination.data.timestamp
        force_rewards_from_transfer     = m_farm_origination.storage.config.forceRewardFromTransfer
        infinite                        = m_farm_origination.storage.config.infinite
        loan_token_name                 = m_farm_origination.storage.config.loanToken
        lp_token_address                = m_farm_origination.storage.config.lpToken.tokenAddress
        lp_token_id                     = int(m_farm_origination.storage.config.lpToken.tokenId)
        lp_token_balance                = int(m_farm_origination.storage.config.lpToken.tokenBalance)
        total_blocks                    = int(m_farm_origination.storage.config.plannedRewards.totalBlocks)
        current_reward_per_block        = int(m_farm_origination.storage.config.plannedRewards.currentRewardPerBlock)
        total_rewards                   = int(m_farm_origination.storage.config.plannedRewards.totalRewards)
        deposit_paused                  = m_farm_origination.storage.breakGlassConfig.depositIsPaused
        withdraw_paused                 = m_farm_origination.storage.breakGlassConfig.withdrawIsPaused
        claim_paused                    = m_farm_origination.storage.breakGlassConfig.claimIsPaused
        last_block_update               = int(m_farm_origination.storage.lastBlockUpdate)
        open                            = m_farm_origination.storage.open
        init                            = m_farm_origination.storage.init
        init_block                      = int(m_farm_origination.storage.initBlock)
        accumulated_rewards_per_share   = float(m_farm_origination.storage.accumulatedRewardsPerShare)
        unpaid_rewards                  = float(m_farm_origination.storage.claimedRewards.unpaid)
        paid_rewards                    = float(m_farm_origination.storage.claimedRewards.paid)
        contract_metadata               = json.loads(bytes.fromhex(create_farm_m_token.parameter.metadata).decode('utf-8'))
    
        # Check farm does not already exists
        farm_exists                     = await models.Farm.get_or_none(
            address     = farm_address
        )
    
        if not farm_exists:
            # Create a contract and index it
            await ctx.add_contract(
                name=farm_address + 'contract',
                address=farm_address,
                typename="m_farm"
            )
            await ctx.add_index(
                name=farm_address + 'index',
                template="m_farm_template",
                values=dict(
                    m_farm_contract=farm_address + 'contract'
                )
            )
    
            # Get Farm Contract Metadata and save the two Tokens involved in the LP Token
            token0_address              = ""
            token1_address              = ""
    
            if type(contract_metadata) is dict and contract_metadata and 'liquidityPairToken' in contract_metadata and 'token0' in contract_metadata['liquidityPairToken'] and 'tokenAddress' in contract_metadata['liquidityPairToken']['token0'] and len(contract_metadata['liquidityPairToken']['token0']['tokenAddress']) > 0:
                token0_address  = contract_metadata['liquidityPairToken']['token0']['tokenAddress'][0]
            if type(contract_metadata) is dict and contract_metadata and 'liquidityPairToken' in contract_metadata and 'token1' in contract_metadata['liquidityPairToken'] and 'tokenAddress' in contract_metadata['liquidityPairToken']['token1'] and len(contract_metadata['liquidityPairToken']['token1']['tokenAddress']) > 0:
                token1_address  = contract_metadata['liquidityPairToken']['token1']['tokenAddress'][0]
    
            await persist_token_metadata(
                ctx=ctx,
                token_address=token0_address
            )
    
            await persist_token_metadata(
                ctx=ctx,
                token_address=token1_address
            )
    
            # Persist contract metadata
            await persist_contract_metadata(
                ctx=ctx,
                contract_address=farm_address
            )
    
            # Persist LP Token Metadata
            await persist_token_metadata(
                ctx=ctx,
                token_address=lp_token_address,
                token_id=str(lp_token_id)
            )
    
            # Create record
            farm_factory    = await models.FarmFactory.get(
                address = farm_factory_address
            )
            governance      = await models.Governance.get(
                address = governance_address
            )
            farm, _         = await models.Farm.get_or_create(
                address     = farm_address
            )
            farm.governance                      = governance
            farm.admin                           = admin
            farm.name                            = name
            farm.creation_timestamp              = creation_timestamp 
            farm.factory                         = farm_factory
            farm.force_rewards_from_transfer     = force_rewards_from_transfer
            farm.infinite                        = infinite
            farm.lp_token_address                = lp_token_address
            farm.lp_token_balance                = lp_token_balance
            farm.loan_token_name                 = loan_token_name
            farm.token0_address                  = token0_address
            farm.token1_address                  = token1_address
            farm.total_blocks                    = total_blocks
            farm.current_reward_per_block        = current_reward_per_block
            farm.total_rewards                   = total_rewards
            farm.deposit_paused                  = deposit_paused
            farm.withdraw_paused                 = withdraw_paused
            farm.claim_paused                    = claim_paused
            farm.last_block_update               = last_block_update
            farm.open                            = open
            farm.init                            = init
            farm.init_block                      = init_block
            farm.accumulated_rewards_per_share   = accumulated_rewards_per_share
            farm.unpaid_rewards                  = unpaid_rewards
            farm.paid_rewards                    = paid_rewards
            farm.is_m_farm                       = True
            await farm.save()

    except BaseException as e:
         await save_error_report(e)

