from dateutil import parser
import mavryk.models as models

###
#
# PERSIST METADATA
#
###
async def persist_token_metadata(ctx, token_address, token_id='0'):
    network                     = ctx.datasource.network
    metadata_datasource_name    = 'metadata_' + network.lower()
    metadata_datasource         = ctx.get_metadata_datasource(metadata_datasource_name)
    token_metadata              = await metadata_datasource.get_token_metadata(token_address, token_id)
    if token_metadata:
        await ctx.update_token_metadata(
            network     = network,
            address     = token_address,
            token_id    = token_id,
            metadata    = token_metadata
        )
    else:
        # TODO: Remove in prod
        # Check for mainnet as well
        metadata_datasource_name    = 'metadata_mainnet'
        metadata_datasource         = ctx.get_metadata_datasource(metadata_datasource_name)
        token_metadata              = await metadata_datasource.get_token_metadata(token_address, token_id)
        if token_metadata:
            await ctx.update_token_metadata(
                network     = "mainnet",
                address     = token_address,
                token_id    = token_id,
                metadata    = token_metadata
            )

async def persist_contract_metadata(ctx, contract_address):
    network                     = ctx.datasource.network
    metadata_datasource_name    = 'metadata_' + network.lower()
    metadata_datasource         = ctx.get_metadata_datasource(metadata_datasource_name)
    contract_metadata           = await metadata_datasource.get_contract_metadata(contract_address)
    if contract_metadata:
        await ctx.update_contract_metadata(
            network     = network,
            address     = contract_address,
            metadata    = contract_metadata
        )

###
#
# PERSIST ACTIONS
#
###
async def persist_council_action(action):
    # Get operation values
    councilAddress                  = action.data.target_address
    councilActionRecordDiff         = action.data.diffs[-1]['content']['value']
    councilActionType               = councilActionRecordDiff['actionType']
    councilActionInitiator          = councilActionRecordDiff['initiator']
    councilActionStartDate          = parser.parse(councilActionRecordDiff['startDateTime'])
    councilActionExecutedDate       = parser.parse(councilActionRecordDiff['executedDateTime'])
    councilActionExpirationDate     = parser.parse(councilActionRecordDiff['expirationDateTime'])
    councilActionStatus             = councilActionRecordDiff['status']
    councilActionExecuted           = councilActionRecordDiff['executed']
    councilActionSigners            = councilActionRecordDiff['signers']
    councilActionData               = councilActionRecordDiff['dataMap']
    councilActionCounter            = int(action.storage.actionCounter)

    # Create and update records
    recordStatus    = models.ActionStatus.PENDING
    if councilActionStatus == 'FLUSHED':
        recordStatus    = models.ActionStatus.FLUSHED
    elif councilActionStatus == 'EXECUTED':
        recordStatus    = models.ActionStatus.EXECUTED
    elif councilActionStatus == 'EXPIRED':
        recordStatus    = models.ActionStatus.EXPIRED

    council = await models.Council.get(
        address = councilAddress
    )
    council.action_counter      = councilActionCounter
    actionID                    = councilActionCounter - 1
    await council.save()

    initiator   = await models.mavryk_user_cache.get(address=councilActionInitiator)

    councilActionRecord = await models.CouncilAction.get_or_none(
        internal_id = actionID
    )
    if councilActionRecord == None:
        council_size        = len(await models.CouncilCouncilMember.filter(council=council).all())
        councilActionRecord = models.CouncilAction(
            internal_id                     = actionID,
            council                         = council,
            initiator                       = initiator,
            start_datetime                  = councilActionStartDate,
            execution_datetime              = councilActionExecutedDate,
            expiration_datetime             = councilActionExpirationDate,
            action_type                     = councilActionType,
            status                          = recordStatus,
            executed                        = councilActionExecuted,
            council_size_snapshot           = council_size
        )
        await councilActionRecord.save()

        # Parameters
        for key in councilActionData:
            value                           = councilActionData[key]
            councilActionRecordParameter    = models.CouncilActionParameter(
                council_action          = councilActionRecord,
                name                    = key,
                value                   = value
            )
            await councilActionRecordParameter.save()

        # Signers
        for signer in councilActionSigners:
            user    = await models.mavryk_user_cache.get(address=signer)
            councilActionRecordSigner = models.CouncilActionSigner(
                signer                  = user,
                council_action          = councilActionRecord
            )
            await councilActionRecordSigner.save()

async def persist_break_glass_action(action):
    # Get operation values
    breakGlassAddress                  = action.data.target_address
    breakGlassActionRecordDiff         = action.data.diffs[-1]['content']['value']
    breakGlassActionType               = breakGlassActionRecordDiff['actionType']
    breakGlassActionInitiator          = breakGlassActionRecordDiff['initiator']
    breakGlassActionStartDate          = parser.parse(breakGlassActionRecordDiff['startDateTime'])
    breakGlassActionExecutedDate       = parser.parse(breakGlassActionRecordDiff['executedDateTime'])
    breakGlassActionExpirationDate     = parser.parse(breakGlassActionRecordDiff['expirationDateTime'])
    breakGlassActionStatus             = breakGlassActionRecordDiff['status']
    breakGlassActionExecuted           = breakGlassActionRecordDiff['executed']
    breakGlassActionSigners            = breakGlassActionRecordDiff['signers']
    breakGlassActionData               = breakGlassActionRecordDiff['dataMap']
    breakGlassActionCounter            = int(action.storage.actionCounter)

    # Create and update records
    recordStatus    = models.ActionStatus.PENDING
    if breakGlassActionStatus == 'FLUSHED':
        recordStatus    = models.ActionStatus.FLUSHED
    elif breakGlassActionStatus == 'EXECUTED':
        recordStatus    = models.ActionStatus.EXECUTED
    elif breakGlassActionStatus == 'EXPIRED':
        recordStatus    = models.ActionStatus.EXPIRED

    breakGlass = await models.BreakGlass.get(
        address = breakGlassAddress
    )
    breakGlass.action_counter   = breakGlassActionCounter
    actionID                    = breakGlassActionCounter - 1
    await breakGlass.save()

    initiator    = await models.mavryk_user_cache.get(address=breakGlassActionInitiator)

    breakGlassActionRecord = await models.BreakGlassAction.get_or_none(
        internal_id = actionID
    )
    if breakGlassActionRecord == None:
        council_size            = len(await models.BreakGlassCouncilMember.filter(break_glass=breakGlass).all())
        breakGlassActionRecord  = models.BreakGlassAction(
            internal_id                     = actionID,
            break_glass                     = breakGlass,
            initiator                       = initiator,
            start_datetime                  = breakGlassActionStartDate,
            execution_datetime              = breakGlassActionExecutedDate,
            expiration_datetime             = breakGlassActionExpirationDate,
            action_type                     = breakGlassActionType,
            status                          = recordStatus,
            executed                        = breakGlassActionExecuted,
            council_size_snapshot           = council_size
        )
        await breakGlassActionRecord.save()

        # Parameters
        for key in breakGlassActionData:
            value                               = breakGlassActionData[key]
            breakGlassActionRecordParameter     = models.BreakGlassActionParameter(
                break_glass_action          = breakGlassActionRecord,
                name                        = key,
                value                       = value
            )
            await breakGlassActionRecordParameter.save()

        # Signers
        for signer in breakGlassActionSigners:
            user    = await models.mavryk_user_cache.get(address=signer)

            breakGlassActionRecordSigner = models.BreakGlassActionSigner(
                signer                      = user,
                break_glass_action          = breakGlassActionRecord
            )
            await breakGlassActionRecordSigner.save()

async def persist_financial_request(ctx, action):
    # Get operation values
    financialAddress        = action.data.target_address
    requestLedger           = action.storage.financialRequestLedger
    requestCounter          = int(action.storage.financialRequestCounter)

    # Create record
    governanceFinancial     = await models.GovernanceFinancial.get(
        address = financialAddress
    )
    governanceFinancial.fin_req_counter = requestCounter
    await governanceFinancial.save()

    for requestID in requestLedger:
        requestRecord       = await models.GovernanceFinancialRequest.get_or_none(
            internal_id  = int(requestID)
        )
        if requestRecord == None:
            requestRecordStorage            = requestLedger[requestID]
            treasuryAddress                 = requestRecordStorage.treasuryAddress
            requesterAddress                = requestRecordStorage.requesterAddress
            request_type                    = requestRecordStorage.requestType
            status                          = requestRecordStorage.status
            statusType                      = models.GovernanceActionStatus.ACTIVE
            if not status:
                statusType  = models.GovernanceActionStatus.DROPPED
            executed                        = requestRecordStorage.executed
            token_contract_address          = requestRecordStorage.tokenContractAddress
            token_amount                    = float(requestRecordStorage.tokenAmount)
            token_name                      = requestRecordStorage.tokenName
            token_id                        = int(requestRecordStorage.tokenId)
            token_type                      = requestRecordStorage.tokenType
            key_hash                        = requestRecordStorage.keyHash
            request_purpose                 = requestRecordStorage.requestPurpose
            yay_vote_smvk_total             = float(requestRecordStorage.yayVoteStakedMvkTotal)
            nay_vote_smvk_total             = float(requestRecordStorage.nayVoteStakedMvkTotal)
            pass_vote_smvk_total            = float(requestRecordStorage.passVoteStakedMvkTotal)
            smvk_percentage_for_approval    = int(requestRecordStorage.stakedMvkPercentageForApproval)
            snapshot_smvk_total_supply      = float(requestRecordStorage.snapshotStakedMvkTotalSupply)
            smvk_required_for_approval      = float(requestRecordStorage.stakedMvkRequiredForApproval)
            expiration_datetime             = parser.parse(requestRecordStorage.expiryDateTime)
            requested_datetime              = parser.parse(requestRecordStorage.requestedDateTime)

            treasury, _     = await models.Treasury.get_or_create(
                address     = treasuryAddress
            )
            await treasury.save()

            # Persist Token Metadata
            await persist_token_metadata(
                ctx=ctx,
                token_address=token_contract_address,
                token_id=str(token_id)
            )

            requester               = await models.mavryk_user_cache.get(address=requesterAddress)
            requestRecord           = models.GovernanceFinancialRequest(
                internal_id                     = int(requestID),
                governance_financial            = governanceFinancial,
                treasury                        = treasury,
                requester                       = requester,
                request_type                    = request_type,
                status                          = statusType,
                key_hash                        = key_hash,
                executed                        = executed,
                token_address                   = token_contract_address,
                token_amount                    = token_amount,
                request_purpose                 = request_purpose,
                yay_vote_smvk_total             = yay_vote_smvk_total,
                nay_vote_smvk_total             = nay_vote_smvk_total,
                pass_vote_smvk_total            = pass_vote_smvk_total,
                smvk_percentage_for_approval    = smvk_percentage_for_approval,
                snapshot_smvk_total_supply      = snapshot_smvk_total_supply,
                smvk_required_for_approval      = smvk_required_for_approval,
                expiration_datetime             = expiration_datetime,
                requested_datetime              = requested_datetime
            )
            await requestRecord.save()

async def persist_governance_satellite_action(ctx, action):
    # Get operation values
    governance_satellite_address        = action.data.target_address
    action_ledger                       = action.storage.governanceSatelliteActionLedger
    action_counter                      = int(action.storage.governanceSatelliteCounter)

    # Create record
    governance_satellite     = await models.GovernanceSatellite.get(
        address = governance_satellite_address
    )
    governance_satellite.fin_req_counter = action_counter
    await governance_satellite.save()

    for action_id in action_ledger:
        action_record       = await models.GovernanceSatelliteAction.get_or_none(
            internal_id  = int(action_id)
        )
        if action_record == None:
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
            expiration_datetime             = parser.parse(action_record_storage.expiryDateTime)
            start_datetime                  = parser.parse(action_record_storage.startDateTime)
            data                            = action_record_storage.dataMap

            initiator                       = await models.mavryk_user_cache.get(address=initiator_address)
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
                expiration_datetime             = expiration_datetime,
                start_datetime                  = start_datetime
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
async def persist_linked_contract(contract_class, linked_contract_class, update_linked_contracts, ctx=None):
    # Get operation info
    target_address          = update_linked_contracts.data.target_address
    contract                = await contract_class.get(
        address         = target_address
    )

    contract_address        = ""
    contract_name           = ""
    tzip                    = ""
    contract_in_storage     = False
    entrypoint_name         = update_linked_contracts.data.entrypoint
    if entrypoint_name == "updateGeneralContracts":
        contract_address        = update_linked_contracts.parameter.generalContractAddress
        contract_name           = update_linked_contracts.parameter.generalContractName
        contract_in_storage     = contract_name in update_linked_contracts.storage.generalContracts
    elif entrypoint_name == "updateWhitelistContracts":
        contract_address        = update_linked_contracts.parameter.whitelistContractAddress
        contract_name           = update_linked_contracts.parameter.whitelistContractName
        contract_in_storage     = contract_name in update_linked_contracts.storage.whitelistContracts
    elif entrypoint_name == "updateWhitelistTokenContracts":
        contract_address        = update_linked_contracts.parameter.tokenContractAddress
        contract_name           = update_linked_contracts.parameter.tokenContractName
        contract_in_storage     = contract_name in update_linked_contracts.storage.whitelistTokenContracts
        if ctx:
            await persist_token_metadata(
                ctx=ctx,
                token_address=contract_address,
            )

        # Save whitelist token contract token standard
        if contract_address[0:3] == 'KT1' and len(contract_address) == 36:
            contract_summary    = await ctx.datasource.get_contract_summary(
                address = contract_address,
            )
            if contract_summary:
                if 'tzips' in contract_summary:
                    tzips   = contract_summary['tzips']
                    if 'fa2' in tzips:
                        tzip    = 'fa2'
                    else:
                        if 'fa12' in tzips:
                            tzip    = 'fa12'
   
    # Update general contracts record
    linked_contract, _ = await linked_contract_class.get_or_create(
        contract        = contract,
        contract_name   = contract_name
    )
    linked_contract.contract_address        = contract_address
    linked_contract.token_contract_standard = tzip

    if contract_in_storage:
        await linked_contract.save()
    else:
        await linked_contract.delete()

###
#
# PERSIST ADMIN/GOVERNANCE
#
###
async def persist_admin(set_admin,contract):
    # Get operation info
    admin_address   = set_admin.parameter.__root__
    contract.admin  = admin_address
    await contract.save()

async def persist_governance(set_governance,contract):
    # Get operation info
    governance_address      = set_governance.parameter.__root__
    governance, _           = await models.Governance.get_or_create(address = governance_address)
    await governance.save()
    contract.governance     = governance
    await contract.save()

###
#
# PERSIST LAMBDAS
#
###
async def persist_lambda(contract_class, lambda_contract_class, set_lambda):
    
    # Get operation values
    contract_address        = set_lambda.data.target_address
    timestamp               = set_lambda.data.timestamp
    lambda_bytes            = set_lambda.parameter.func_bytes
    lambda_name             = set_lambda.parameter.name

    # Save / Update record
    contract                = await contract_class.get(
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

async def persist_proxy_lambda(contract_class, proxy_lambda_contract_class, set_proxy_lambda):
    
    # Get operation values
    contract_address        = set_proxy_lambda.data.target_address
    timestamp               = set_proxy_lambda.data.timestamp
    lambda_bytes            = set_proxy_lambda.parameter.func_bytes
    lambda_name             = set_proxy_lambda.parameter.id

    # Save / Update record
    contract                = await contract_class.get(
        address     = contract_address
    )
    contract.last_updated_at            = timestamp
    await contract.save()
    contract_lambda, _      = await proxy_lambda_contract_class.get_or_create(
        contract        = contract,
        lambda_name     = lambda_name
    )
    contract_lambda.last_updated_at     = timestamp
    contract_lambda.lambda_bytes        = lambda_bytes
    await contract_lambda.save()
