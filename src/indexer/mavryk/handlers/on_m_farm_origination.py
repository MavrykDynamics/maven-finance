from dipdup.context import HandlerContext
from dipdup.models import Origination
from ..utils.persisters import persist_token_metadata
from mavryk.utils.persisters import persist_contract_metadata
from mavryk.types.m_farm.storage import MFarmStorage
import mavryk.models as models
import json

async def on_m_farm_origination(
    ctx: HandlerContext,
    m_farm_origination: Origination[MFarmStorage],
) -> None:

    # Get operation info
    farm_address                    = m_farm_origination.data.originated_contract_address
    admin                           = m_farm_origination.storage.admin
    governance_address              = m_farm_origination.storage.governanceAddress
    creation_timestamp              = m_farm_origination.data.timestamp
    name                            = m_farm_origination.storage.name
    lp_token_address                = m_farm_origination.storage.config.lpToken.tokenAddress
    lp_token_balance                = int(m_farm_origination.storage.config.lpToken.tokenBalance)
    lp_token_id                     = int(m_farm_origination.storage.config.lpToken.tokenId)
    open                            = m_farm_origination.storage.open
    init                            = m_farm_origination.storage.init
    init_block                      = int(m_farm_origination.storage.initBlock)
    last_block_update               = int(m_farm_origination.storage.lastBlockUpdate)
    accumulated_rewards_per_share   = float(m_farm_origination.storage.accumulatedRewardsPerShare)
    total_blocks                    = int(m_farm_origination.storage.config.plannedRewards.totalBlocks)
    current_reward_per_block        = float(m_farm_origination.storage.config.plannedRewards.currentRewardPerBlock)
    total_rewards                   = float(m_farm_origination.storage.config.plannedRewards.totalRewards)
    unpaid_rewards                  = float(m_farm_origination.storage.claimedRewards.unpaid)
    paid_rewards                    = float(m_farm_origination.storage.claimedRewards.paid)
    infinite                        = m_farm_origination.storage.config.infinite
    loan_token_name                 = m_farm_origination.storage.config.loanToken
    deposit_paused                  = m_farm_origination.storage.breakGlassConfig.depositIsPaused
    withdraw_paused                 = m_farm_origination.storage.breakGlassConfig.withdrawIsPaused
    claim_paused                    = m_farm_origination.storage.breakGlassConfig.claimIsPaused
    force_rewards_from_transfer     = m_farm_origination.storage.config.forceRewardFromTransfer
    contract_metadata               = ""
    if 'data' in m_farm_origination.storage.metadata:
        contract_metadata   = json.loads(bytes.fromhex(m_farm_origination.storage.metadata['data']).decode('utf-8'))

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

    # Save farm
    governance, _      = await models.Governance.get_or_create(
        address = governance_address
    )
    await governance.save()

    # Check farm does not already exists
    farm_exists                     = await models.Farm.get_or_none(
        address     = farm_address
    )

    if not farm_exists:
        farm, _         = await models.Farm.get_or_create(
            address     = farm_address,
            admin       = admin,
            governance  = governance
        )
        farm.creation_timestamp              = creation_timestamp
        farm.last_updated_at                 = creation_timestamp
        farm.name                            = name 
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
        await farm.save()