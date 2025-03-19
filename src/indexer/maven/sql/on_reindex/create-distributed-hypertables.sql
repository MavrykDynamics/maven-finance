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
            ALTER TABLE aggregator_oracle_observation DROP CONSTRAINT aggregator_oracle_observation_pkey;
            ALTER TABLE aggregator_oracle_observation ADD PRIMARY KEY (id, timestamp);
            SELECT create_distributed_hypertable('aggregator_oracle_observation', 'timestamp');
        ELSE
            RAISE NOTICE 'aggregator_oracle_observation is already a hypertable.';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM timescaledb_information.hypertables 
                       WHERE hypertable_name = 'aggregator_history_data') THEN
            RAISE NOTICE 'Creating distributed hypertable for aggregator_history_data...';
            ALTER TABLE aggregator_history_data DROP CONSTRAINT aggregator_history_data_pkey;
            ALTER TABLE aggregator_history_data ADD PRIMARY KEY (id, timestamp);
            SELECT create_distributed_hypertable('aggregator_history_data', 'timestamp');
        ELSE
            RAISE NOTICE 'aggregator_history_data is already a hypertable.';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM timescaledb_information.hypertables 
                       WHERE hypertable_name = 'dipdup_exception') THEN
            RAISE NOTICE 'Creating distributed hypertable for dipdup_exception...';
            ALTER TABLE dipdup_exception DROP CONSTRAINT dipdup_exception_pkey;
            ALTER TABLE dipdup_exception ADD PRIMARY KEY (id, timestamp);
            SELECT create_distributed_hypertable('dipdup_exception', 'timestamp', 'type');
        ELSE
            RAISE NOTICE 'dipdup_exception is already a hypertable.';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM timescaledb_information.hypertables 
                       WHERE hypertable_name = 'stake_history_data') THEN
            RAISE NOTICE 'Creating distributed hypertable for stake_history_data...';
            ALTER TABLE stake_history_data DROP CONSTRAINT stake_history_data_pkey;
            ALTER TABLE stake_history_data ADD PRIMARY KEY (id, timestamp);
            SELECT create_distributed_hypertable('stake_history_data', 'timestamp', 'type');
        ELSE
            RAISE NOTICE 'stake_history_data is already a hypertable.';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM timescaledb_information.hypertables 
                       WHERE hypertable_name = 'smvn_history_data') THEN
            RAISE NOTICE 'Creating distributed hypertable for smvn_history_data...';
            ALTER TABLE smvn_history_data DROP CONSTRAINT smvn_history_data_pkey;
            ALTER TABLE smvn_history_data ADD PRIMARY KEY (id, timestamp);
            SELECT create_distributed_hypertable('smvn_history_data', 'timestamp');
        ELSE
            RAISE NOTICE 'smvn_history_data is already a hypertable.';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM timescaledb_information.hypertables 
                       WHERE hypertable_name = 'emergency_governance_vote') THEN
            RAISE NOTICE 'Creating distributed hypertable for emergency_governance_vote...';
            ALTER TABLE emergency_governance_vote DROP CONSTRAINT emergency_governance_vote_pkey;
            ALTER TABLE emergency_governance_vote ADD PRIMARY KEY (id, timestamp);
            SELECT create_distributed_hypertable('emergency_governance_vote', 'timestamp');
        ELSE
            RAISE NOTICE 'emergency_governance_vote is already a hypertable.';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM timescaledb_information.hypertables 
                       WHERE hypertable_name = 'governance_financial_request_vote') THEN
            RAISE NOTICE 'Creating distributed hypertable for governance_financial_request_vote...';
            ALTER TABLE governance_financial_request_vote DROP CONSTRAINT governance_financial_request_vote_pkey;
            ALTER TABLE governance_financial_request_vote ADD PRIMARY KEY (id, timestamp);
            SELECT create_distributed_hypertable('governance_financial_request_vote', 'timestamp', 'governance_financial_request_id');
        ELSE
            RAISE NOTICE 'governance_financial_request_vote is already a hypertable.';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM timescaledb_information.hypertables 
                       WHERE hypertable_name = 'governance_satellite_action_vote') THEN
            RAISE NOTICE 'Creating distributed hypertable for governance_satellite_action_vote...';
            ALTER TABLE governance_satellite_action_vote DROP CONSTRAINT governance_satellite_action_vote_pkey;
            ALTER TABLE governance_satellite_action_vote ADD PRIMARY KEY (id, timestamp);
            SELECT create_distributed_hypertable('governance_satellite_action_vote', 'timestamp', 'governance_satellite_action_id');
        ELSE
            RAISE NOTICE 'governance_satellite_action_vote is already a hypertable.';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM timescaledb_information.hypertables 
                       WHERE hypertable_name = 'governance_proposal_vote') THEN
            RAISE NOTICE 'Creating distributed hypertable for governance_proposal_vote...';
            ALTER TABLE governance_proposal_vote DROP CONSTRAINT governance_proposal_vote_pkey;
            ALTER TABLE governance_proposal_vote ADD PRIMARY KEY (id, timestamp);
            SELECT create_distributed_hypertable('governance_proposal_vote', 'timestamp', 'round');
        ELSE
            RAISE NOTICE 'governance_proposal_vote is already a hypertable.';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM timescaledb_information.hypertables 
                       WHERE hypertable_name = 'lending_controller_history_data') THEN
            RAISE NOTICE 'Creating distributed hypertable for lending_controller_history_data...';
            ALTER TABLE lending_controller_history_data DROP CONSTRAINT lending_controller_history_data_pkey;
            ALTER TABLE lending_controller_history_data ADD PRIMARY KEY (id, timestamp);
            SELECT create_distributed_hypertable('lending_controller_history_data', 'timestamp', 'type');
        ELSE
            RAISE NOTICE 'lending_controller_history_data is already a hypertable.';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM timescaledb_information.hypertables 
                       WHERE hypertable_name = 'm_token_account_history_data') THEN
            RAISE NOTICE 'Creating distributed hypertable for m_token_account_history_data...';
            ALTER TABLE m_token_account_history_data DROP CONSTRAINT m_token_account_history_data_pkey;
            ALTER TABLE m_token_account_history_data ADD PRIMARY KEY (id, timestamp);
            SELECT create_distributed_hypertable('m_token_account_history_data', 'timestamp', 'type');
        ELSE
            RAISE NOTICE 'm_token_account_history_data is already a hypertable.';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM timescaledb_information.hypertables 
                       WHERE hypertable_name = 'mvn_transfer_history_data') THEN
            RAISE NOTICE 'Creating distributed hypertable for mvn_transfer_history_data...';
            ALTER TABLE mvn_transfer_history_data DROP CONSTRAINT mvn_transfer_history_data_pkey;
            ALTER TABLE mvn_transfer_history_data ADD PRIMARY KEY (id, timestamp);
            SELECT create_distributed_hypertable('mvn_transfer_history_data', 'timestamp');
        ELSE
            RAISE NOTICE 'mvn_transfer_history_data is already a hypertable.';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM timescaledb_information.hypertables 
                       WHERE hypertable_name = 'treasury_transfer_history_data') THEN
            RAISE NOTICE 'Creating distributed hypertable for treasury_transfer_history_data...';
            ALTER TABLE treasury_transfer_history_data DROP CONSTRAINT treasury_transfer_history_data_pkey;
            ALTER TABLE treasury_transfer_history_data ADD PRIMARY KEY (id, timestamp);
            SELECT create_distributed_hypertable('treasury_transfer_history_data', 'timestamp', 'token_address');
        ELSE
            RAISE NOTICE 'treasury_transfer_history_data is already a hypertable.';
        END IF;

    ELSE
        RAISE NOTICE 'create_distributed_hypertable does not exist, skipping.';
    END IF;
END $$;

-- -- Check and create distributed hypertables if not already created
-- ALTER TABLE aggregator_history_data DROP CONSTRAINT aggregator_history_data_pkey;
-- ALTER TABLE aggregator_history_data ADD PRIMARY KEY (id, timestamp);
-- SELECT create_hypertable('aggregator_history_data', 'timestamp');
-- ALTER TABLE dipdup_exception DROP CONSTRAINT dipdup_exception_pkey;
-- ALTER TABLE dipdup_exception ADD PRIMARY KEY (id, timestamp);
-- SELECT create_hypertable('dipdup_exception', 'timestamp');
-- ALTER TABLE stake_history_data DROP CONSTRAINT stake_history_data_pkey;
-- ALTER TABLE stake_history_data ADD PRIMARY KEY (id, timestamp);
-- ALTER TABLE smvn_history_data DROP CONSTRAINT smvn_history_data_pkey;
-- ALTER TABLE smvn_history_data ADD PRIMARY KEY (id, timestamp);
-- SELECT create_hypertable('smvn_history_data', 'timestamp');
-- ALTER TABLE lending_controller_history_data DROP CONSTRAINT lending_controller_history_data_pkey;
-- ALTER TABLE lending_controller_history_data ADD PRIMARY KEY (id, timestamp);
-- SELECT create_hypertable('lending_controller_history_data', 'timestamp');
-- ALTER TABLE m_token_account_history_data DROP CONSTRAINT m_token_account_history_data_pkey;
-- ALTER TABLE m_token_account_history_data ADD PRIMARY KEY (id, timestamp);
-- SELECT create_hypertable('m_token_account_history_data', 'timestamp');
-- ALTER TABLE mvn_transfer_history_data DROP CONSTRAINT mvn_transfer_history_data_pkey;
-- ALTER TABLE mvn_transfer_history_data ADD PRIMARY KEY (id, timestamp);
-- SELECT create_hypertable('mvn_transfer_history_data', 'timestamp');
-- ALTER TABLE treasury_transfer_history_data DROP CONSTRAINT treasury_transfer_history_data_pkey;
-- ALTER TABLE treasury_transfer_history_data ADD PRIMARY KEY (id, timestamp);
-- SELECT create_hypertable('treasury_transfer_history_data', 'timestamp');
