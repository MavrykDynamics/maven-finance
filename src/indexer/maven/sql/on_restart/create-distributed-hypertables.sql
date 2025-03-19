DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc
               WHERE proname = 'create_distributed_hypertable') THEN
        -- Safe to call create_distributed_hypertable
        RAISE NOTICE 'create_distributed_hypertable exists, can be called.';
        -- Call the function (example)
        SELECT create_distributed_hypertable('aggregator_oracle_observation', 'timestamp');
        SELECT create_distributed_hypertable('aggregator_history_data', 'timestamp');
        SELECT create_distributed_hypertable('dipdup_exception', 'timestamp', 'type');
        SELECT create_distributed_hypertable('stake_history_data', 'timestamp', 'type');
        SELECT create_distributed_hypertable('smvn_history_data', 'timestamp');
        SELECT create_distributed_hypertable('emergency_governance_vote', 'timestamp');
        SELECT create_distributed_hypertable('governance_financial_request_vote', 'timestamp', 'governance_financial_request_id');
        SELECT create_distributed_hypertable('governance_satellite_action_vote', 'timestamp', 'governance_satellite_action_id');
        SELECT create_distributed_hypertable('governance_proposal_vote', 'timestamp', 'round');
        SELECT create_distributed_hypertable('lending_controller_history_data', 'timestamp', 'type');
        SELECT create_distributed_hypertable('m_token_account_history_data', 'timestamp', 'type');
        SELECT create_distributed_hypertable('mvn_faucet_requester', 'timestamp', 'request_type');
        SELECT create_distributed_hypertable('mvn_transfer_history_data', 'timestamp');
        SELECT create_distributed_hypertable('treasury_transfer_history_data', 'timestamp', 'token_address');
    ELSE
        RAISE NOTICE 'create_distributed_hypertable does not exist, skipping.';
    END IF;
END $$;