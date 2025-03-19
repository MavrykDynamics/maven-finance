DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc
               WHERE proname = 'create_distributed_hypertable') THEN
        -- Safe to call create_distributed_hypertable
        RAISE NOTICE 'create_distributed_hypertable exists, can be called.';

        -- Check and create distributed hypertables if not already created
        IF NOT EXISTS (SELECT 1 FROM timescaledb_information.hypertables 
                       WHERE hypertable_name = 'aggregator_oracle_observation') THEN
            RAISE NOTICE 'Creating distributed hypertable for aggregator_oracle_observation...';
            SELECT create_distributed_hypertable('aggregator_oracle_observation', 'timestamp', migrate_data => true);
        ELSE
            RAISE NOTICE 'aggregator_oracle_observation is already a hypertable.';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM timescaledb_information.hypertables 
                       WHERE hypertable_name = 'aggregator_history_data') THEN
            RAISE NOTICE 'Creating distributed hypertable for aggregator_history_data...';
            SELECT create_distributed_hypertable('aggregator_history_data', 'timestamp', migrate_data => true);
        ELSE
            RAISE NOTICE 'aggregator_history_data is already a hypertable.';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM timescaledb_information.hypertables 
                       WHERE hypertable_name = 'dipdup_exception') THEN
            RAISE NOTICE 'Creating distributed hypertable for dipdup_exception...';
            SELECT create_distributed_hypertable('dipdup_exception', 'timestamp', 'type', migrate_data => true);
        ELSE
            RAISE NOTICE 'dipdup_exception is already a hypertable.';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM timescaledb_information.hypertables 
                       WHERE hypertable_name = 'stake_history_data') THEN
            RAISE NOTICE 'Creating distributed hypertable for stake_history_data...';
            SELECT create_distributed_hypertable('stake_history_data', 'timestamp', 'type', migrate_data => true);
        ELSE
            RAISE NOTICE 'stake_history_data is already a hypertable.';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM timescaledb_information.hypertables 
                       WHERE hypertable_name = 'smvn_history_data') THEN
            RAISE NOTICE 'Creating distributed hypertable for smvn_history_data...';
            SELECT create_distributed_hypertable('smvn_history_data', 'timestamp', migrate_data => true);
        ELSE
            RAISE NOTICE 'smvn_history_data is already a hypertable.';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM timescaledb_information.hypertables 
                       WHERE hypertable_name = 'emergency_governance_vote') THEN
            RAISE NOTICE 'Creating distributed hypertable for emergency_governance_vote...';
            SELECT create_distributed_hypertable('emergency_governance_vote', 'timestamp', migrate_data => true);
        ELSE
            RAISE NOTICE 'emergency_governance_vote is already a hypertable.';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM timescaledb_information.hypertables 
                       WHERE hypertable_name = 'governance_financial_request_vote') THEN
            RAISE NOTICE 'Creating distributed hypertable for governance_financial_request_vote...';
            SELECT create_distributed_hypertable('governance_financial_request_vote', 'timestamp', 'governance_financial_request_id', migrate_data => true);
        ELSE
            RAISE NOTICE 'governance_financial_request_vote is already a hypertable.';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM timescaledb_information.hypertables 
                       WHERE hypertable_name = 'governance_satellite_action_vote') THEN
            RAISE NOTICE 'Creating distributed hypertable for governance_satellite_action_vote...';
            SELECT create_distributed_hypertable('governance_satellite_action_vote', 'timestamp', 'governance_satellite_action_id', migrate_data => true);
        ELSE
            RAISE NOTICE 'governance_satellite_action_vote is already a hypertable.';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM timescaledb_information.hypertables 
                       WHERE hypertable_name = 'governance_proposal_vote') THEN
            RAISE NOTICE 'Creating distributed hypertable for governance_proposal_vote...';
            SELECT create_distributed_hypertable('governance_proposal_vote', 'timestamp', 'round', migrate_data => true);
        ELSE
            RAISE NOTICE 'governance_proposal_vote is already a hypertable.';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM timescaledb_information.hypertables 
                       WHERE hypertable_name = 'lending_controller_history_data') THEN
            RAISE NOTICE 'Creating distributed hypertable for lending_controller_history_data...';
            SELECT create_distributed_hypertable('lending_controller_history_data', 'timestamp', 'type', migrate_data => true);
        ELSE
            RAISE NOTICE 'lending_controller_history_data is already a hypertable.';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM timescaledb_information.hypertables 
                       WHERE hypertable_name = 'm_token_account_history_data') THEN
            RAISE NOTICE 'Creating distributed hypertable for m_token_account_history_data...';
            SELECT create_distributed_hypertable('m_token_account_history_data', 'timestamp', 'type', migrate_data => true);
        ELSE
            RAISE NOTICE 'm_token_account_history_data is already a hypertable.';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM timescaledb_information.hypertables 
                       WHERE hypertable_name = 'mvn_faucet_requester') THEN
            RAISE NOTICE 'Creating distributed hypertable for mvn_faucet_requester...';
            SELECT create_distributed_hypertable('mvn_faucet_requester', 'timestamp', 'request_type', migrate_data => true);
        ELSE
            RAISE NOTICE 'mvn_faucet_requester is already a hypertable.';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM timescaledb_information.hypertables 
                       WHERE hypertable_name = 'mvn_transfer_history_data') THEN
            RAISE NOTICE 'Creating distributed hypertable for mvn_transfer_history_data...';
            SELECT create_distributed_hypertable('mvn_transfer_history_data', 'timestamp', migrate_data => true);
        ELSE
            RAISE NOTICE 'mvn_transfer_history_data is already a hypertable.';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM timescaledb_information.hypertables 
                       WHERE hypertable_name = 'treasury_transfer_history_data') THEN
            RAISE NOTICE 'Creating distributed hypertable for treasury_transfer_history_data...';
            SELECT create_distributed_hypertable('treasury_transfer_history_data', 'timestamp', 'token_address', migrate_data => true);
        ELSE
            RAISE NOTICE 'treasury_transfer_history_data is already a hypertable.';
        END IF;

    ELSE
        RAISE NOTICE 'create_distributed_hypertable does not exist, skipping.';
    END IF;
END $$;
