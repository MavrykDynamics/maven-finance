from dateutil import parser
import mavryk.models as models
from mavryk.types.governance_satellite.storage import TokenItem as fa12, TokenItem1 as fa2, TokenItem2 as tez

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
    councilActionAddressParams      = councilActionRecordDiff['addressMap']
    councilActionStringParams       = councilActionRecordDiff['stringMap']
    councilActionNatParams          = councilActionRecordDiff['natMap']
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

    initiator, _ = await models.MavrykUser.get_or_create(
        address = councilActionInitiator
    )
    await initiator.save()

    councilActionRecord = await models.CouncilAction.get_or_none(
        id                              = actionID
    )
    if councilActionRecord == None:
        councilActionRecord = models.CouncilAction(
            id                              = actionID,
            council                         = council,
            initiator                       = initiator,
            start_datetime                  = councilActionStartDate,
            execution_datetime               = councilActionExecutedDate,
            expiration_datetime             = councilActionExpirationDate,
            action_type                     = councilActionType,
            status                          = recordStatus,
            executed                        = councilActionExecuted,
        )
        await councilActionRecord.save()

        # Parameters
        for key in councilActionAddressParams:
            value   = councilActionAddressParams[key]
            councilActionRecordParameter    = models.CouncilActionParameter(
                council_action          = councilActionRecord,
                name                    = key,
                value                   = value
            )
            await councilActionRecordParameter.save()

        for key in councilActionStringParams:
            value   = councilActionStringParams[key]
            councilActionRecordParameter    = models.CouncilActionParameter(
                council_action          = councilActionRecord,
                name                    = key,
                value                   = value
            )
            await councilActionRecordParameter.save()

        for key in councilActionNatParams:
            value   = councilActionNatParams[key]
            councilActionRecordParameter    = models.CouncilActionParameter(
                council_action          = councilActionRecord,
                name                    = key,
                value                   = value
            )
            await councilActionRecordParameter.save()

        # Signers
        for signer in councilActionSigners:
            user, _ = await models.MavrykUser.get_or_create(
                address = signer
            )
            await user.save()
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
    breakGlassActionAddressParams      = breakGlassActionRecordDiff['addressMap']
    breakGlassActionNatParams          = breakGlassActionRecordDiff['natMap']
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

    initiator, _ = await models.MavrykUser.get_or_create(
        address = breakGlassActionInitiator
    )
    await initiator.save()

    breakGlassActionRecord = await models.BreakGlassAction.get_or_none(
        id                              = actionID
    )
    if breakGlassActionRecord == None:
        breakGlassActionRecord = models.BreakGlassAction(
            id                              = actionID,
            break_glass                     = breakGlass,
            initiator                       = initiator,
            start_datetime                  = breakGlassActionStartDate,
            execution_datetime              = breakGlassActionExecutedDate,
            expiration_datetime             = breakGlassActionExpirationDate,
            action_type                     = breakGlassActionType,
            status                          = recordStatus,
            executed                        = breakGlassActionExecuted,
        )
        await breakGlassActionRecord.save()

        # Parameters
        for key in breakGlassActionAddressParams:
            value   = breakGlassActionAddressParams[key]
            breakGlassActionRecordParameter    = models.BreakGlassActionParameter(
                break_glass_action          = breakGlassActionRecord,
                name                        = key,
                value                       = value
            )
            await breakGlassActionRecordParameter.save()

        for key in breakGlassActionNatParams:
            value   = breakGlassActionNatParams[key]
            breakGlassActionRecordParameter    = models.BreakGlassActionParameter(
                break_glass_action          = breakGlassActionRecord,
                name                        = key,
                value                       = value
            )
            await breakGlassActionRecordParameter.save()

        # Signers
        for signer in breakGlassActionSigners:
            user, _ = await models.MavrykUser.get_or_create(
                address = signer
            )
            await user.save()
            breakGlassActionRecordSigner = models.BreakGlassActionSigner(
                signer                      = user,
                break_glass_action          = breakGlassActionRecord
            )
            await breakGlassActionRecordSigner.save()

async def persist_financial_request(action):
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
            id  = int(requestID)
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

            token_standard  = models.TokenType.OTHER
            if token_type == "FA2":
                token_standard  = models.TokenType.FA2
            elif token_type == "FA12":
                token_standard  = models.TokenType.FA12
            elif token_type == "XTZ":
                token_standard  = models.TokenType.XTZ

            token, _        = await models.Token.get_or_create(
                address     = token_contract_address,
                token_id    = token_id,
                type        = token_standard
            )
            token.name      = token_name
            await token.save()

            requester, _            = await models.MavrykUser.get_or_create(
                address = requesterAddress
            )
            requestRecord           = models.GovernanceFinancialRequest(
                id                              = int(requestID),
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
                expiration_datetime             = expiration_datetime,
                requested_datetime              = requested_datetime
            )
            await requestRecord.save()

async def persist_governance_satellite_action(action):
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
            id  = int(action_id)
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
            address_map                     = action_record_storage.addressMap
            string_map                      = action_record_storage.stringMap
            nat_map                         = action_record_storage.natMap
            transfer_list                   = action_record_storage.transferList

            initiator, _                    = await models.MavrykUser.get_or_create(
                address = initiator_address
            )
            action_record                   = models.GovernanceSatelliteAction(
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
            for key in address_map:
                value   = address_map[key]
                governance_satellite_action_record_parameter = models.GovernanceSatelliteActionParameter(
                    governance_satellite_action     = action_record,
                    name                            = key,
                    value                           = value
                )
                await governance_satellite_action_record_parameter.save()

            for key in string_map:
                value   = string_map[key]
                governance_satellite_action_record_parameter = models.GovernanceSatelliteActionParameter(
                    governance_satellite_action     = action_record,
                    name                            = key,
                    value                           = value
                )
                await governance_satellite_action_record_parameter.save()

            for key in nat_map:
                value   = nat_map[key]
                governance_satellite_action_record_parameter = models.GovernanceSatelliteActionParameter(
                    governance_satellite_action     = action_record,
                    name                            = key,
                    value                           = value
                )
                await governance_satellite_action_record_parameter.save()

            for value in transfer_list:
                token_id                = 0
                token_type              = models.TokenType.OTHER
                token_contract_address  = ""
                amount                  = float(value.amount)
                to_                     = value.to_

                receiver, _             = await models.MavrykUser.get_or_create(
                    address = to_
                )
                await receiver.save()

                if type(value.token) == fa12:
                    token_type              = models.TokenType.FA12
                    token_contract_address  = value.token.fa12
                elif type(value.token) == fa2:
                    token_type              = models.TokenType.FA2
                    token_id                = int(value.token.fa2.tokenId)
                    token_contract_address  = value.token.fa2.tokenContractAddress
                elif type(value.token) == tez:
                    token_type  = models.TokenType.XTZ

                token, _        = await models.Token.get_or_create(
                    address     = token_contract_address,
                    token_id    = token_id,
                    type        = token_type
                )
                await token.save()
                    
                governance_satellite_action_record_transfer = models.GovernanceSatelliteActionTransfer(
                    governance_satellite_action     = action_record,
                    token                           = token,
                    to_                             = receiver,
                    amount                          = amount
                )
                await governance_satellite_action_record_transfer.save()
                
            

###
#
# PERSIST CONTRACTS
#
###
async def persist_linked_contract(contract_class, linked_contract_class, update_linked_contracts):
    # Get operation info
    target_address          = update_linked_contracts.data.target_address
    contract                = await contract_class.get(
        address         = target_address
    )

    contract_address        = ""
    contract_name           = ""
    contract_in_storage     = False
    if hasattr(update_linked_contracts.parameter, "generalContractAddress"):
        contract_address        = update_linked_contracts.parameter.generalContractAddress
        contract_name           = update_linked_contracts.parameter.generalContractName
        contract_in_storage     = contract_name in update_linked_contracts.storage.generalContracts
    elif hasattr(update_linked_contracts.parameter, "whitelistContractAddress"):
        contract_address        = update_linked_contracts.parameter.whitelistContractAddress
        contract_name           = update_linked_contracts.parameter.whitelistContractName
        contract_in_storage     = contract_name in update_linked_contracts.storage.whitelistContracts
    elif hasattr(update_linked_contracts.parameter, "whitelistTokenContractAddress"):
        contract_address        = update_linked_contracts.parameter.whitelistTokenContractAddress
        contract_name           = update_linked_contracts.parameter.whitelistTokenContractName
        contract_in_storage     = contract_name in update_linked_contracts.storage.whitelistTokenContracts
   
    # Update general contracts record
    linked_contract, _ = await linked_contract_class.get_or_create(
        contract        = contract,
        contract_name   = contract_name
    )
    linked_contract.contract_address   = contract_address

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
