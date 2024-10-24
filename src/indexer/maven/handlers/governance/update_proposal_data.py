from maven.utils.error_reporting import save_error_report

from maven.utils.contracts import get_token_standard, get_contract_token_metadata
from maven.types.governance.tezos_storage import GovernanceStorage, Token as fa12, Token1 as fa2, Token2 as mav
from dipdup.models.tezos import TezosTransaction
from dipdup.context import HandlerContext
from maven.types.governance.tezos_parameters.update_proposal_data import UpdateProposalDataParameter
import maven.models as models

async def update_proposal_data(
    ctx: HandlerContext,
    update_proposal_data: TezosTransaction[UpdateProposalDataParameter, GovernanceStorage],
) -> None:

    try:
        # Get operation info
        governance_address      = update_proposal_data.data.target_address
        proposal_id             = int(update_proposal_data.parameter.proposalId)
        storage_proposal        = update_proposal_data.storage.proposalLedger[update_proposal_data.parameter.proposalId]
        proposal_data_storage   = storage_proposal.proposalData
        payment_data_storage    = storage_proposal.paymentData
        
        # Update or create record
        governance      = await models.Governance.get(network='atlasnet', address= governance_address)
        proposal        = await models.GovernanceProposal.get(
            internal_id         = proposal_id,
            governance          = governance
        )
    
        # Update proposal data
        for proposal_data_index in proposal_data_storage:
            
            # Get or create proposal data
            proposal_single_data    = proposal_data_storage[proposal_data_index]
            proposal_data, _        = await models.GovernanceProposalData.get_or_create(
                governance_proposal = proposal,
                internal_id         = int(proposal_data_index)
            )
            await proposal_data.save()
    
            # Update proposal data
            if proposal_single_data:
                proposal_data.title              = proposal_single_data.title
                proposal_data.encoded_code       = proposal_single_data.encodedCode
                proposal_data.code_description   = proposal_single_data.codeDescription
            else:
                proposal_data.title              = None
                proposal_data.encoded_code       = None
                proposal_data.code_description   = None
            await proposal_data.save()

        # Update payment data
        for payment_data_index in payment_data_storage:

            # Get or create payment data
            payment_single_data     = payment_data_storage[payment_data_index]
            payment_data, _         = await models.GovernanceProposalPayment.get_or_create(
                governance_proposal = proposal,
                internal_id         = int(payment_data_index)
            )
            await payment_data.save()

            # Update payment data
            if payment_single_data:
    
                # Fill parameters depending on the token type
                token               = payment_single_data.transaction.token
                token_address       = ""
                token_id            = 0
                if type(token) == fa12:
                    token_address   = token.fa12
                elif type(token) == fa2:
                    token_address   = token.fa2.tokenContractAddress
                    token_id        = int(token.fa2.tokenId)
                elif type(token) == mav:
                    token_address   = "mv2ZZZZZZZZZZZZZZZZZZZZZZZZZZZDXMF2d"
        
                # Persist loan Token Metadata
                if token_address != "mv2ZZZZZZZZZZZZZZZZZZZZZZZZZZZDXMF2d":
                    token_contract_metadata = await get_contract_token_metadata(
                        ctx=ctx,
                        token_address=token_address,
                        token_id=str(token_id)
                    )
                else:
                    token_contract_metadata = {
                        "name": "Mavryk",
                        "symbol": "MVRK",
                        "decimals": "6",
                        "icon": "ipfs://QmbHaFX2gyFEzdwp54vqtf7McL74BvT7r4pw6UVyfEdKhu",
                        "thumbnailUri": "ipfs://QmbHaFX2gyFEzdwp54vqtf7McL74BvT7r4pw6UVyfEdKhu",
                    }

                # Get the token standard
                standard = await get_token_standard(
                    ctx,
                    token_address
                )

                # Get the related token
                token, _            = await models.Token.get_or_create(
                    token_address       = token_address,
                    token_id            = token_id,
                    network             = 'atlasnet'
                )
                token.metadata          = token_contract_metadata
                token.token_standard    = standard
                await token.save()

                # Get receiver
                receiver_address                = payment_single_data.transaction.to_
                receiver                        = await models.maven_user_cache.get(network='atlasnet', address=receiver_address)

                # Save the payment record
                payment_data.title              = payment_single_data.title
                payment_data.token              = token
                payment_data.to_                = receiver
                payment_data.token_amount       = float(payment_single_data.transaction.amount)
            else:
                payment_data.title              = None
                payment_data.token              = None
                payment_data.to_                = None
                payment_data.token_amount       = None
            await payment_data.save()

    except BaseException as e:
        await save_error_report(e)

