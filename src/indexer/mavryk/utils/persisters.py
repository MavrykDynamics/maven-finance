from dateutil import parser
from mavryk.utils.contracts import get_contract_token_metadata, get_token_standard
import mavryk.models as models

###
#
# PERSIST ACTIONS
#
###
async def persist_council_action(ctx, action):
    # Get operation values
    council_address                 = action.data.target_address
    council_action_ledger           = action.storage.councilActionsLedger
    council_action_counter          = int(action.storage.actionCounter)
    council_action_signers          = action.storage.councilActionsSigners

    # Update record
    council                         = await models.Council.get(
        network = ctx.datasource.network,
        address = council_address
    )
    council.action_counter          = council_action_counter
    await council.save()

    # Save council action
    for council_action_id in council_action_ledger:
        council_action_record           = council_action_ledger[council_action_id]
        council_action_type             = council_action_record.actionType
        council_action_initiator        = council_action_record.initiator
        council_action_start_date       = parser.parse(council_action_record.startDateTime)
        council_action_executed_date    = None 
        if council_action_record.executedDateTime:
            council_action_executed_date    = parser.parse(council_action_record.executedDateTime)
        council_action_expiration_date  = parser.parse(council_action_record.expirationDateTime)
        council_action_status           = council_action_record.status
        council_action_executed         = council_action_record.executed
        council_action_data             = council_action_record.dataMap

        # Create and update records
        record_status                   = models.ActionStatus.PENDING
        if council_action_status == 'FLUSHED':
            record_status    = models.ActionStatus.FLUSHED
        elif council_action_status == 'EXECUTED':
            record_status    = models.ActionStatus.EXECUTED
        elif council_action_status == 'EXPIRED':
            record_status    = models.ActionStatus.EXPIRED

        initiator                       = await models.mavryk_user_cache.get(network=ctx.datasource.network, address=council_action_initiator)

        action_exists                   = await models.CouncilAction.filter(
            council     = council,
            internal_id = int(council_action_id)
        ).exists()
        if not action_exists:
            council_size            = council.council_size
            council_action_record   = models.CouncilAction(
                internal_id                     = int(council_action_id),
                council                         = council,
                initiator                       = initiator,
                start_datetime                  = council_action_start_date,
                execution_datetime              = council_action_executed_date,
                expiration_datetime             = council_action_expiration_date,
                action_type                     = council_action_type,
                status                          = record_status,
                executed                        = council_action_executed,
                council_size_snapshot           = council_size
            )
            await council_action_record.save()

            # Parameters
            for key in council_action_data:
                value                           = council_action_data[key]
                council_action_record_parameter = models.CouncilActionParameter(
                    council_action          = council_action_record,
                    name                    = key,
                    value                   = value
                )
                await council_action_record_parameter.save()
        
            # Save actions signers
            for council_action_signer in council_action_signers:
                action_id       = council_action_signer.key.nat
                action_signer   = council_action_signer.key.address

                if action_id == council_action_id:
                    # Signers
                    user                            = await models.mavryk_user_cache.get(network=ctx.datasource.network, address=action_signer)
                    council_action_record_signer    = models.CouncilActionSigner(
                        signer                  = user,
                        council_action          = council_action_record
                    )
                    await council_action_record_signer.save()

async def persist_break_glass_action(ctx, action):
    # Get operation values
    break_glass_address                 = action.data.target_address
    break_glass_action_ledger           = action.storage.actionsLedger
    break_glass_action_counter          = int(action.storage.actionCounter)
    break_glass_action_signers          = action.storage.actionsSigners

    # Update record
    break_glass                         = await models.BreakGlass.get(
        network         = ctx.datasource.network,
        address         = break_glass_address
    )
    break_glass.action_counter          = break_glass_action_counter
    await break_glass.save()

    # Save break glass action
    for break_glass_action_id in break_glass_action_ledger:
        break_glass_action_record           = break_glass_action_ledger[break_glass_action_id]
        break_glass_action_type             = break_glass_action_record.actionType
        break_glass_action_initiator        = break_glass_action_record.initiator
        break_glass_action_start_date       = parser.parse(break_glass_action_record.startDateTime)
        break_glass_action_executed_date    = break_glass_action_record.executedDateTime
        if break_glass_action_executed_date:
            break_glass_action_executed_date    = parser.parse(break_glass_action_record.executedDateTime)
        break_glass_action_expiration_date  = parser.parse(break_glass_action_record.expirationDateTime)
        break_glass_action_status           = break_glass_action_record.status
        break_glass_action_executed         = break_glass_action_record.executed
        break_glass_action_data             = break_glass_action_record.dataMap

        # Create and update records
        record_status       = models.ActionStatus.PENDING
        if break_glass_action_status == 'FLUSHED':
            record_status   = models.ActionStatus.FLUSHED
        elif break_glass_action_status == 'EXECUTED':
            record_status   = models.ActionStatus.EXECUTED
        elif break_glass_action_status == 'EXPIRED':
            record_status   = models.ActionStatus.EXPIRED

        initiator       = await models.mavryk_user_cache.get(network=ctx.datasource.network, address=break_glass_action_initiator)

        action_exists   = await models.BreakGlassAction.filter(
            break_glass = break_glass,
            internal_id = int(break_glass_action_id)
        ).exists()
        if not action_exists:
            council_size                = break_glass.council_size
            break_glass_action_record   = models.BreakGlassAction(
                internal_id                     = break_glass_action_id,
                break_glass                     = break_glass,
                initiator                       = initiator,
                start_datetime                  = break_glass_action_start_date,
                execution_datetime              = break_glass_action_executed_date,
                expiration_datetime             = break_glass_action_expiration_date,
                action_type                     = break_glass_action_type,
                status                          = record_status,
                executed                        = break_glass_action_executed,
                council_size_snapshot           = council_size
            )
            await break_glass_action_record.save()

            # Parameters
            for key in break_glass_action_data:
                value                               = break_glass_action_data[key]
                break_glass_action_record_parameter = models.BreakGlassActionParameter(
                    break_glass_action          = break_glass_action_record,
                    name                        = key,
                    value                       = value
                )
                await break_glass_action_record_parameter.save()

            # Save actions signers
            for break_glass_action_signer in break_glass_action_signers:
                action_id       = break_glass_action_signer.key.nat
                action_signer   = break_glass_action_signer.key.address
                
                if action_id == break_glass_action_id:
                    # Signers
                    user                                = await models.mavryk_user_cache.get(network=ctx.datasource.network, address=action_signer)
                    break_glass_action_record_signer    = models.BreakGlassActionSigner(
                        signer                      = user,
                        break_glass_action          = break_glass_action_record
                    )
                    await break_glass_action_record_signer.save()

async def persist_financial_request(ctx, action):
    # Get operation values
    financial_address       = action.data.target_address
    request_ledger          = action.storage.financialRequestLedger
    request_counter         = int(action.storage.financialRequestCounter)

    # Create record
    governanceFinancial     = await models.GovernanceFinancial.get(
        network         = ctx.datasource.network,
        address         = financial_address
    )
    governanceFinancial.fin_req_counter = request_counter
    await governanceFinancial.save()

    for requestID in request_ledger:
        request_exists                      = await models.GovernanceFinancialRequest.filter(
            governance_financial    = governanceFinancial,
            internal_id             = int(requestID)
        ).exists()
        if not request_exists:
            request_record_storage          = request_ledger[requestID]
            treasuryAddress                 = request_record_storage.treasuryAddress
            requesterAddress                = request_record_storage.requesterAddress
            request_type                    = request_record_storage.requestType
            status                          = request_record_storage.status
            statusType                      = models.GovernanceActionStatus.ACTIVE
            if not status:
                statusType  = models.GovernanceActionStatus.DROPPED
            executed                        = request_record_storage.executed
            token_contract_address          = request_record_storage.tokenContractAddress
            token_amount                    = float(request_record_storage.tokenAmount)
            token_id                        = int(request_record_storage.tokenId)
            key_hash                        = request_record_storage.keyHash
            request_purpose                 = request_record_storage.requestPurpose
            yay_vote_smvk_total             = float(request_record_storage.yayVoteStakedMvkTotal)
            nay_vote_smvk_total             = float(request_record_storage.nayVoteStakedMvkTotal)
            pass_vote_smvk_total            = float(request_record_storage.passVoteStakedMvkTotal)
            smvk_percentage_for_approval    = int(request_record_storage.stakedMvkPercentageForApproval)
            snapshot_smvk_total_supply      = float(request_record_storage.snapshotStakedMvkTotalSupply)
            smvk_required_for_approval      = float(request_record_storage.stakedMvkRequiredForApproval)
            execution_datetime              = None
            if request_record_storage.executedDateTime:
                execution_datetime  = parser.parse(request_record_storage.executedDateTime)
            expiration_datetime             = parser.parse(request_record_storage.expiryDateTime)
            requested_datetime              = parser.parse(request_record_storage.requestedDateTime)
            governance_cycle_id             = int(request_record_storage.governanceCycleId)

            # Check if treasury exists
            treasury                        = await models.Treasury.get_or_none(
                network         = ctx.datasource.network,
                address         = treasuryAddress
            )
            if not treasury:
                # Create a temp treasury
                governance  = await governanceFinancial.governance
                treasury    = models.Treasury(
                    address     = treasuryAddress,
                    network     = ctx.datasource.network,
                    governance  = governance
                )
                await treasury.save()

            # Persist Token Metadata
            token_contract_metadata = await get_contract_token_metadata(
                ctx=ctx,
                token_address=token_contract_address,
                token_id=str(token_id)
            )

            # Get the token standard
            standard        = await get_token_standard(
                ctx,
                token_contract_address
            )

            # Get the related token
            token, _         = await models.Token.get_or_create(
                network         = ctx.datasource.network,
                token_address   = token_contract_address,
                token_id        = token_id
            )
            if token_contract_metadata:
                token.metadata          = token_contract_metadata
            token.token_standard    = standard
            await token.save()

            requester               = await models.mavryk_user_cache.get(network=ctx.datasource.network, address=requesterAddress)
            requestRecord           = models.GovernanceFinancialRequest(
                internal_id                     = int(requestID),
                governance_financial            = governanceFinancial,
                treasury                        = treasury,
                requester                       = requester,
                request_type                    = request_type,
                status                          = statusType,
                key_hash                        = key_hash,
                executed                        = executed,
                token                           = token,
                token_amount                    = token_amount,
                request_purpose                 = request_purpose,
                yay_vote_smvk_total             = yay_vote_smvk_total,
                nay_vote_smvk_total             = nay_vote_smvk_total,
                pass_vote_smvk_total            = pass_vote_smvk_total,
                smvk_percentage_for_approval    = smvk_percentage_for_approval,
                snapshot_smvk_total_supply      = snapshot_smvk_total_supply,
                smvk_required_for_approval      = smvk_required_for_approval,
                execution_datetime              = execution_datetime,
                expiration_datetime             = expiration_datetime,
                requested_datetime              = requested_datetime,
                governance_cycle_id             = governance_cycle_id
            )
            await requestRecord.save()

async def persist_governance_satellite_action(ctx, action):
    # Get operation values
    governance_satellite_address        = action.data.target_address
    action_ledger                       = action.storage.governanceSatelliteActionLedger
    action_counter                      = int(action.storage.governanceSatelliteCounter)

    # Create record
    governance_satellite     = await models.GovernanceSatellite.get(
        network = ctx.datasource.network,
        address = governance_satellite_address
    )
    governance_satellite.fin_req_counter = action_counter
    await governance_satellite.save()

    for action_id in action_ledger:
        action_exists                       = await models.GovernanceSatelliteAction.filter(
            governance_satellite    = governance_satellite,
            internal_id             = int(action_id)
        ).exists()
        if not action_exists:
            action_record_storage           = action_ledger[action_id]
            initiator_address               = action_record_storage.initiator
            action_purpose                  = action_record_storage.governancePurpose
            action_type                     = action_record_storage.governanceType
            status                          = action_record_storage.status
            statusType                      = models.GovernanceActionStatus.ACTIVE
            if not status:
                statusType  = models.GovernanceActionStatus.DROPPED
            executed                        = action_record_storage.executed
            yay_vote_smvk_total             = float(action_record_storage.yayVoteStakedMvkTotal)
            nay_vote_smvk_total             = float(action_record_storage.nayVoteStakedMvkTotal)
            pass_vote_smvk_total            = float(action_record_storage.passVoteStakedMvkTotal)
            snapshot_smvk_total_supply      = float(action_record_storage.snapshotStakedMvkTotalSupply)
            smvk_pct_for_approval           = int(action_record_storage.stakedMvkPercentageForApproval)
            smvk_required_for_approval      = float(action_record_storage.stakedMvkRequiredForApproval)
            execution_datetime              = None
            if action_record_storage.executedDateTime:
                execution_datetime  = parser.parse(action_record_storage.executedDateTime)
            expiration_datetime             = parser.parse(action_record_storage.expiryDateTime)
            start_datetime                  = parser.parse(action_record_storage.startDateTime)
            governance_cycle_id             = int(action_record_storage.governanceCycleId)
            data                            = action_record_storage.dataMap

            initiator                       = await models.mavryk_user_cache.get(network=ctx.datasource.network, address=initiator_address)
            action_record                   = models.GovernanceSatelliteAction(
                internal_id                     = int(action_id),
                governance_satellite            = governance_satellite,
                initiator                       = initiator,
                governance_type                 = action_type,
                status                          = statusType,
                executed                        = executed,
                governance_purpose              = action_purpose,
                yay_vote_smvk_total             = yay_vote_smvk_total,
                nay_vote_smvk_total             = nay_vote_smvk_total,
                pass_vote_smvk_total            = pass_vote_smvk_total,
                snapshot_smvk_total_supply      = snapshot_smvk_total_supply,
                smvk_percentage_for_approval    = smvk_pct_for_approval,
                smvk_required_for_approval      = smvk_required_for_approval,
                execution_datetime              = execution_datetime,
                expiration_datetime             = expiration_datetime,
                start_datetime                  = start_datetime,
                governance_cycle_id             = governance_cycle_id
            )
            await action_record.save()

            # Parameters
            for key in data:
                value                                           = data[key]
                governance_satellite_action_record_parameter    = models.GovernanceSatelliteActionParameter(
                    governance_satellite_action     = action_record,
                    name                            = key,
                    value                           = value
                )
                await governance_satellite_action_record_parameter.save()
                
            

###
#
# PERSIST CONTRACTS
#
###
async def persist_linked_contract(ctx, contract_class, linked_contract_class, update_linked_contracts):
    # Get operation info
    target_address          = update_linked_contracts.data.target_address
    contract                = await contract_class.get(
        network         = ctx.datasource.network,
        address         = target_address
    )

    contract_address        = ""
    contract_name           = ""
    update                  = hasattr(update_linked_contracts.parameter.updateType, "update")
    entrypoint_name         = update_linked_contracts.data.entrypoint
    #TODO: review and optimize this section
    if entrypoint_name == "updateGeneralContracts":
        contract_address        = update_linked_contracts.parameter.generalContractAddress
        contract_name           = update_linked_contracts.parameter.generalContractName

        # Delete the record
        await linked_contract_class.filter(contract = contract, contract_name = contract_name).delete()

        if update:
            # Update general contracts record
            linked_contract, _  = await linked_contract_class.get_or_create(
                contract        = contract,
                contract_name   = contract_name,
            )
            linked_contract.contract_address    = contract_address
            await linked_contract.save()

    elif entrypoint_name == "updateWhitelistContracts":
        contract_address        = update_linked_contracts.parameter.whitelistContractAddress

        # Delete the record
        await linked_contract_class.filter(contract = contract, contract_address = contract_address).delete()

        if update:
            # Update general contracts record
            linked_contract, _  = await linked_contract_class.get_or_create(
                contract        = contract,
            )
            linked_contract.contract_address    = contract_address
            await linked_contract.save()

    elif entrypoint_name == "updateWhitelistTokenContracts":
        contract_address        = update_linked_contracts.parameter.tokenContractAddress
        if ctx:
            token_contract_metadata = await get_contract_token_metadata(
                ctx=ctx,
                token_address=contract_address,
            )

        # Delete the record
        await linked_contract_class.filter(contract = contract, contract_address = contract_address).delete()

        # Get the token standard
        standard = await get_token_standard(
            ctx,
            contract_address
        )

        # Get the related token
        token, _                = await models.Token.get_or_create(
            network         = ctx.datasource.network,
            token_address   = contract_address
        )
        if token_contract_metadata:
            token.metadata          = token_contract_metadata
        token.token_standard    = standard
        await token.save()

        if update:
            # Update general contracts record
            linked_contract, _  = await linked_contract_class.get_or_create(
                contract        = contract,
                token           = token
            )
            linked_contract.contract_address    = contract_address
            await linked_contract.save()

###
#
# PERSIST ADMIN/GOVERNANCE
#
###
async def persist_admin(ctx, contract_class, set_admin):
    
    # Get operation info
    contract_address        = set_admin.data.target_address
    admin_address           = set_admin.parameter.__root__

    # Update record
    await contract_class.filter(
        network     = ctx.datasource.network, 
        address     = contract_address
    ).update(
        admin       = admin_address
    )

async def persist_governance(ctx, contract_class, set_governance):
    
    # Get operation info
    contract_address            = set_governance.data.target_address

    # Update record
    # Get governance record
    governance                  = await models.Governance.get(network = ctx.datasource.network)
    await contract_class.filter(
        network     = ctx.datasource.network, 
        address     = contract_address
    ).update(
        governance  = governance
    )

###
#
# PERSIST LAMBDAS
#
###
async def persist_lambda(ctx, contract_class, lambda_contract_class, set_lambda):
    
    # Get operation values
    contract_address        = set_lambda.data.target_address
    timestamp               = set_lambda.data.timestamp
    lambda_bytes            = set_lambda.parameter.func_bytes
    lambda_name             = set_lambda.parameter.name

    # Save / Update record
    contract                = await contract_class.get(
        network     = ctx.datasource.network,
        address     = contract_address
    )
    contract.last_updated_at            = timestamp
    await contract.save()
    contract_lambda, _      = await lambda_contract_class.get_or_create(
        contract        = contract,
        lambda_name     = lambda_name,
    )
    contract_lambda.last_updated_at     = timestamp
    contract_lambda.lambda_bytes        = lambda_bytes
    await contract_lambda.save()
