const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require('@taquito/taquito')
const { InMemorySigner, importKey } = require('@taquito/signer');
import assert, { ok, rejects, strictEqual } from 'assert';
import { Utils, MVK } from './helpers/Utils';
import fs from 'fs';
import { confirmOperation } from '../scripts/confirmation';
import { BigNumber } from 'bignumber.js'
import { compileLambdaFunction } from '../scripts/proxyLambdaFunctionMaker/proxyLambdaFunctionPacker'
import * as doormanLambdas from '../build/lambdas/doormanLambdas.json';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);   
chai.should();

import env from '../env';
import { bob, alice, eve, mallory, oscar, trudy, baker } from '../scripts/sandbox/accounts';

import { MichelsonMap }             from '@taquito/taquito';
import { farmStorageType }          from './types/farmStorageType';
import { aggregatorStorageType }    from './types/aggregatorStorageType';

describe('Governance proxy lambdas tests', async () => {
    var utils: Utils;

    const signerFactory = async (pk) => {
        await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
        return utils.tezos;
    };

    before('setup', async () => {
        try {
            
            utils = new Utils();
            await utils.init(bob.sk);

            console.log('-- -- -- -- -- Governance Proxy Tests -- -- -- --')

            console.log('Bob address: '         + bob.pkh);
            console.log('Alice address: '       + alice.pkh);
            console.log('Eve address: '         + eve.pkh);
            console.log('Mallory address: '     + mallory.pkh);
            console.log('Oscar address: '       + oscar.pkh);
            console.log('-- -- -- -- -- -- -- -- --')

        } catch(e){
            console.dir(e, {depth:5})
        }
    });

    describe('%executeGovernanceAction', function() {

        describe('Misc', function() {

            // it('%updateWhitelistTokenContracts', async () => {
            //     try{
                    
            //         // KT1VBcmvmVinryFF4vghnQjhmb87LF2ZHABP
            //         await compileLambdaFunction(
            //             'ghostnet',
            //             "KT1RWSqVG2u1v9NAuQp2SkQAztqcTxKY6oaj",
                        
            //             'updateWhitelistTokenContracts',
            //             [
            //                 "KT1VBcmvmVinryFF4vghnQjhmb87LF2ZHABP",
            //                 "eurl",
            //                 "KT1UhjCszVyY5dkNUXFGAwdNcVgVe2ZeuPv5"
            //             ]
            //         );

            //         await compileLambdaFunction(
            //             'ghostnet',
            //             "KT1RWSqVG2u1v9NAuQp2SkQAztqcTxKY6oaj",
                        
            //             'updateWhitelistTokenContracts',
            //             [
            //                 "KT1VBcmvmVinryFF4vghnQjhmb87LF2ZHABP",
            //                 "tzbtc",
            //                 "KT1P8RdJ5MfHMK5phKJ5JsfNfask5v2b2NQS"
            //             ]
            //         );

            //         await compileLambdaFunction(
            //             'ghostnet',
            //             "KT1RWSqVG2u1v9NAuQp2SkQAztqcTxKY6oaj",
                        
            //             'updateWhitelistTokenContracts',
            //             [
            //                 "KT1VBcmvmVinryFF4vghnQjhmb87LF2ZHABP",
            //                 "usdt",
            //                 "KT1H9hKtcqcMHuCoaisu8Qy7wutoUPFELcLm"
            //             ]
            //         );

            //         await compileLambdaFunction(
            //             'ghostnet',
            //             "KT1RWSqVG2u1v9NAuQp2SkQAztqcTxKY6oaj",
                        
            //             'updateWhitelistTokenContracts',
            //             [
            //                 "KT1VBcmvmVinryFF4vghnQjhmb87LF2ZHABP",
            //                 "musdt",
            //                 "KT1L3sCp3BfL6yDq13XJPMkWgkJhwHMa58Dv"
            //             ]
            //         );

            //         await compileLambdaFunction(
            //             'ghostnet',
            //             "KT1RWSqVG2u1v9NAuQp2SkQAztqcTxKY6oaj",
                        
            //             'updateWhitelistTokenContracts',
            //             [
            //                 "KT1VBcmvmVinryFF4vghnQjhmb87LF2ZHABP",
            //                 "meurl",
            //                 "KT1VHDwV1QQwYY86y76ryynV5vNgnMZJZbCG"
            //             ]
            //         );

            //         await compileLambdaFunction(
            //             'ghostnet',
            //             "KT1RWSqVG2u1v9NAuQp2SkQAztqcTxKY6oaj",
                        
            //             'updateWhitelistTokenContracts',
            //             [
            //                 "KT1VBcmvmVinryFF4vghnQjhmb87LF2ZHABP",
            //                 "mvk",
            //                 "KT1LHCdywMqHbaNdC2tRYxDKZAVxBXb6ra7o"
            //             ]
            //         );

            //         await compileLambdaFunction(
            //             'ghostnet',
            //             "KT1RWSqVG2u1v9NAuQp2SkQAztqcTxKY6oaj",
                        
            //             'updateWhitelistTokenContracts',
            //             [
            //                 "KT1VBcmvmVinryFF4vghnQjhmb87LF2ZHABP",
            //                 "mxtz",
            //                 "KT1XYiqkAE2BtSeujKsiHBuRAAt3kmeuK4pP"
            //             ]
            //         );
                    
            //         // KT1TPquNxmjDpnXzun3B943jEkktwJxuNzJ1
            //         await compileLambdaFunction(
            //             'ghostnet',
            //             "KT1RWSqVG2u1v9NAuQp2SkQAztqcTxKY6oaj",
                        
            //             'updateWhitelistTokenContracts',
            //             [
            //                 "KT1TPquNxmjDpnXzun3B943jEkktwJxuNzJ1",
            //                 "eurl",
            //                 "KT1UhjCszVyY5dkNUXFGAwdNcVgVe2ZeuPv5"
            //             ]
            //         );

            //         await compileLambdaFunction(
            //             'ghostnet',
            //             "KT1RWSqVG2u1v9NAuQp2SkQAztqcTxKY6oaj",
                        
            //             'updateWhitelistTokenContracts',
            //             [
            //                 "KT1TPquNxmjDpnXzun3B943jEkktwJxuNzJ1",
            //                 "tzbtc",
            //                 "KT1P8RdJ5MfHMK5phKJ5JsfNfask5v2b2NQS"
            //             ]
            //         );

            //         await compileLambdaFunction(
            //             'ghostnet',
            //             "KT1RWSqVG2u1v9NAuQp2SkQAztqcTxKY6oaj",
                        
            //             'updateWhitelistTokenContracts',
            //             [
            //                 "KT1TPquNxmjDpnXzun3B943jEkktwJxuNzJ1",
            //                 "usdt",
            //                 "KT1H9hKtcqcMHuCoaisu8Qy7wutoUPFELcLm"
            //             ]
            //         );

            //         await compileLambdaFunction(
            //             'ghostnet',
            //             "KT1RWSqVG2u1v9NAuQp2SkQAztqcTxKY6oaj",
                        
            //             'updateWhitelistTokenContracts',
            //             [
            //                 "KT1TPquNxmjDpnXzun3B943jEkktwJxuNzJ1",
            //                 "musdt",
            //                 "KT1L3sCp3BfL6yDq13XJPMkWgkJhwHMa58Dv"
            //             ]
            //         );

            //         await compileLambdaFunction(
            //             'ghostnet',
            //             "KT1RWSqVG2u1v9NAuQp2SkQAztqcTxKY6oaj",
                        
            //             'updateWhitelistTokenContracts',
            //             [
            //                 "KT1TPquNxmjDpnXzun3B943jEkktwJxuNzJ1",
            //                 "meurl",
            //                 "KT1VHDwV1QQwYY86y76ryynV5vNgnMZJZbCG"
            //             ]
            //         );

            //         await compileLambdaFunction(
            //             'ghostnet',
            //             "KT1RWSqVG2u1v9NAuQp2SkQAztqcTxKY6oaj",
                        
            //             'updateWhitelistTokenContracts',
            //             [
            //                 "KT1TPquNxmjDpnXzun3B943jEkktwJxuNzJ1",
            //                 "mvk",
            //                 "KT1LHCdywMqHbaNdC2tRYxDKZAVxBXb6ra7o"
            //             ]
            //         );

            //         await compileLambdaFunction(
            //             'ghostnet',
            //             "KT1RWSqVG2u1v9NAuQp2SkQAztqcTxKY6oaj",
                        
            //             'updateWhitelistTokenContracts',
            //             [
            //                 "KT1TPquNxmjDpnXzun3B943jEkktwJxuNzJ1",
            //                 "mxtz",
            //                 "KT1XYiqkAE2BtSeujKsiHBuRAAt3kmeuK4pP"
            //             ]
            //         );
                    
            //         // KT1TidyRKhuXjwtRnnvUEbC5zobbpRsHWZrW
            //         await compileLambdaFunction(
            //             'ghostnet',
            //             "KT1RWSqVG2u1v9NAuQp2SkQAztqcTxKY6oaj",
                        
            //             'updateWhitelistTokenContracts',
            //             [
            //                 "KT1TidyRKhuXjwtRnnvUEbC5zobbpRsHWZrW",
            //                 "eurl",
            //                 "KT1UhjCszVyY5dkNUXFGAwdNcVgVe2ZeuPv5"
            //             ]
            //         );

            //         await compileLambdaFunction(
            //             'ghostnet',
            //             "KT1RWSqVG2u1v9NAuQp2SkQAztqcTxKY6oaj",
                        
            //             'updateWhitelistTokenContracts',
            //             [
            //                 "KT1TidyRKhuXjwtRnnvUEbC5zobbpRsHWZrW",
            //                 "tzbtc",
            //                 "KT1P8RdJ5MfHMK5phKJ5JsfNfask5v2b2NQS"
            //             ]
            //         );

            //         await compileLambdaFunction(
            //             'ghostnet',
            //             "KT1RWSqVG2u1v9NAuQp2SkQAztqcTxKY6oaj",
                        
            //             'updateWhitelistTokenContracts',
            //             [
            //                 "KT1TidyRKhuXjwtRnnvUEbC5zobbpRsHWZrW",
            //                 "usdt",
            //                 "KT1H9hKtcqcMHuCoaisu8Qy7wutoUPFELcLm"
            //             ]
            //         );

            //         await compileLambdaFunction(
            //             'ghostnet',
            //             "KT1RWSqVG2u1v9NAuQp2SkQAztqcTxKY6oaj",
                        
            //             'updateWhitelistTokenContracts',
            //             [
            //                 "KT1TidyRKhuXjwtRnnvUEbC5zobbpRsHWZrW",
            //                 "musdt",
            //                 "KT1L3sCp3BfL6yDq13XJPMkWgkJhwHMa58Dv"
            //             ]
            //         );

            //         await compileLambdaFunction(
            //             'ghostnet',
            //             "KT1RWSqVG2u1v9NAuQp2SkQAztqcTxKY6oaj",
                        
            //             'updateWhitelistTokenContracts',
            //             [
            //                 "KT1TidyRKhuXjwtRnnvUEbC5zobbpRsHWZrW",
            //                 "meurl",
            //                 "KT1VHDwV1QQwYY86y76ryynV5vNgnMZJZbCG"
            //             ]
            //         );

            //         await compileLambdaFunction(
            //             'ghostnet',
            //             "KT1RWSqVG2u1v9NAuQp2SkQAztqcTxKY6oaj",
                        
            //             'updateWhitelistTokenContracts',
            //             [
            //                 "KT1TidyRKhuXjwtRnnvUEbC5zobbpRsHWZrW",
            //                 "mvk",
            //                 "KT1LHCdywMqHbaNdC2tRYxDKZAVxBXb6ra7o"
            //             ]
            //         );

            //         await compileLambdaFunction(
            //             'ghostnet',
            //             "KT1RWSqVG2u1v9NAuQp2SkQAztqcTxKY6oaj",
                        
            //             'updateWhitelistTokenContracts',
            //             [
            //                 "KT1TidyRKhuXjwtRnnvUEbC5zobbpRsHWZrW",
            //                 "mxtz",
            //                 "KT1XYiqkAE2BtSeujKsiHBuRAAt3kmeuK4pP"
            //             ]
            //         );
                    
            //         // KT1RSowEbg2tpS6sHyUYN6q7dxLmqAT9rfXM
            //         await compileLambdaFunction(
            //             'ghostnet',
            //             "KT1RWSqVG2u1v9NAuQp2SkQAztqcTxKY6oaj",
                        
            //             'updateWhitelistTokenContracts',
            //             [
            //                 "KT1RSowEbg2tpS6sHyUYN6q7dxLmqAT9rfXM",
            //                 "eurl",
            //                 "KT1UhjCszVyY5dkNUXFGAwdNcVgVe2ZeuPv5"
            //             ]
            //         );

            //         await compileLambdaFunction(
            //             'ghostnet',
            //             "KT1RWSqVG2u1v9NAuQp2SkQAztqcTxKY6oaj",
                        
            //             'updateWhitelistTokenContracts',
            //             [
            //                 "KT1RSowEbg2tpS6sHyUYN6q7dxLmqAT9rfXM",
            //                 "tzbtc",
            //                 "KT1P8RdJ5MfHMK5phKJ5JsfNfask5v2b2NQS"
            //             ]
            //         );

            //         await compileLambdaFunction(
            //             'ghostnet',
            //             "KT1RWSqVG2u1v9NAuQp2SkQAztqcTxKY6oaj",
                        
            //             'updateWhitelistTokenContracts',
            //             [
            //                 "KT1RSowEbg2tpS6sHyUYN6q7dxLmqAT9rfXM",
            //                 "usdt",
            //                 "KT1H9hKtcqcMHuCoaisu8Qy7wutoUPFELcLm"
            //             ]
            //         );

            //         await compileLambdaFunction(
            //             'ghostnet',
            //             "KT1RWSqVG2u1v9NAuQp2SkQAztqcTxKY6oaj",
                        
            //             'updateWhitelistTokenContracts',
            //             [
            //                 "KT1RSowEbg2tpS6sHyUYN6q7dxLmqAT9rfXM",
            //                 "musdt",
            //                 "KT1L3sCp3BfL6yDq13XJPMkWgkJhwHMa58Dv"
            //             ]
            //         );

            //         await compileLambdaFunction(
            //             'ghostnet',
            //             "KT1RWSqVG2u1v9NAuQp2SkQAztqcTxKY6oaj",
                        
            //             'updateWhitelistTokenContracts',
            //             [
            //                 "KT1RSowEbg2tpS6sHyUYN6q7dxLmqAT9rfXM",
            //                 "meurl",
            //                 "KT1VHDwV1QQwYY86y76ryynV5vNgnMZJZbCG"
            //             ]
            //         );

            //         await compileLambdaFunction(
            //             'ghostnet',
            //             "KT1RWSqVG2u1v9NAuQp2SkQAztqcTxKY6oaj",
                        
            //             'updateWhitelistTokenContracts',
            //             [
            //                 "KT1RSowEbg2tpS6sHyUYN6q7dxLmqAT9rfXM",
            //                 "mvk",
            //                 "KT1LHCdywMqHbaNdC2tRYxDKZAVxBXb6ra7o"
            //             ]
            //         );

            //         await compileLambdaFunction(
            //             'ghostnet',
            //             "KT1RWSqVG2u1v9NAuQp2SkQAztqcTxKY6oaj",
                        
            //             'updateWhitelistTokenContracts',
            //             [
            //                 "KT1RSowEbg2tpS6sHyUYN6q7dxLmqAT9rfXM",
            //                 "mxtz",
            //                 "KT1XYiqkAE2BtSeujKsiHBuRAAt3kmeuK4pP"
            //             ]
            //         );
                    
            //         // KT19cXdm3wC58n5frXyhD2xRkp29nWHgc2Qw
            //         await compileLambdaFunction(
            //             'ghostnet',
            //             "KT1RWSqVG2u1v9NAuQp2SkQAztqcTxKY6oaj",
                        
            //             'updateWhitelistTokenContracts',
            //             [
            //                 "KT19cXdm3wC58n5frXyhD2xRkp29nWHgc2Qw",
            //                 "eurl",
            //                 "KT1UhjCszVyY5dkNUXFGAwdNcVgVe2ZeuPv5"
            //             ]
            //         );

            //         await compileLambdaFunction(
            //             'ghostnet',
            //             "KT1RWSqVG2u1v9NAuQp2SkQAztqcTxKY6oaj",
                        
            //             'updateWhitelistTokenContracts',
            //             [
            //                 "KT19cXdm3wC58n5frXyhD2xRkp29nWHgc2Qw",
            //                 "tzbtc",
            //                 "KT1P8RdJ5MfHMK5phKJ5JsfNfask5v2b2NQS"
            //             ]
            //         );

            //         await compileLambdaFunction(
            //             'ghostnet',
            //             "KT1RWSqVG2u1v9NAuQp2SkQAztqcTxKY6oaj",
                        
            //             'updateWhitelistTokenContracts',
            //             [
            //                 "KT19cXdm3wC58n5frXyhD2xRkp29nWHgc2Qw",
            //                 "usdt",
            //                 "KT1H9hKtcqcMHuCoaisu8Qy7wutoUPFELcLm"
            //             ]
            //         );

            //         await compileLambdaFunction(
            //             'ghostnet',
            //             "KT1RWSqVG2u1v9NAuQp2SkQAztqcTxKY6oaj",
                        
            //             'updateWhitelistTokenContracts',
            //             [
            //                 "KT19cXdm3wC58n5frXyhD2xRkp29nWHgc2Qw",
            //                 "musdt",
            //                 "KT1L3sCp3BfL6yDq13XJPMkWgkJhwHMa58Dv"
            //             ]
            //         );

            //         await compileLambdaFunction(
            //             'ghostnet',
            //             "KT1RWSqVG2u1v9NAuQp2SkQAztqcTxKY6oaj",
                        
            //             'updateWhitelistTokenContracts',
            //             [
            //                 "KT19cXdm3wC58n5frXyhD2xRkp29nWHgc2Qw",
            //                 "meurl",
            //                 "KT1VHDwV1QQwYY86y76ryynV5vNgnMZJZbCG"
            //             ]
            //         );

            //         await compileLambdaFunction(
            //             'ghostnet',
            //             "KT1RWSqVG2u1v9NAuQp2SkQAztqcTxKY6oaj",
                        
            //             'updateWhitelistTokenContracts',
            //             [
            //                 "KT19cXdm3wC58n5frXyhD2xRkp29nWHgc2Qw",
            //                 "mxtz",
            //                 "KT1XYiqkAE2BtSeujKsiHBuRAAt3kmeuK4pP"
            //             ]
            //         );
                    
            //         // Track treasury
            //         await compileLambdaFunction(
            //             'ghostnet',
            //             "KT1RWSqVG2u1v9NAuQp2SkQAztqcTxKY6oaj",
                        
            //             'trackProductContract',
            //             [
            //                 "KT1NgLnehkCcLzSZFV2bCh5PnWt34MHSfjsg",
            //                 "treasury",
            //                 "KT19cXdm3wC58n5frXyhD2xRkp29nWHgc2Qw"
            //             ]
            //         );

            //     } catch(e){
            //         console.dir(e, {depth: 5});
            //     }
            // });

            // it('%updateWhitelistTokenContracts', async () => {
            //     try{
                    
            //         await compileLambdaFunction(
            //             'ghostnet',
            //             "KT1RWSqVG2u1v9NAuQp2SkQAztqcTxKY6oaj",
                        
            //             'updateGeneralContracts',
            //             [
            //                 "KT1BErAZLnh6re3DHzGD9kUdQ3N8twyvZZen",
            //                 "aggregatorTreasury",
            //                 "KT1VBcmvmVinryFF4vghnQjhmb87LF2ZHABP"
            //             ]
            //         );
                    
            //         await compileLambdaFunction(
            //             'ghostnet',
            //             "KT1RWSqVG2u1v9NAuQp2SkQAztqcTxKY6oaj",
                        
            //             'updateGeneralContracts',
            //             [
            //                 "KT1BErAZLnh6re3DHzGD9kUdQ3N8twyvZZen",
            //                 "farmTreasury",
            //                 "KT1VBcmvmVinryFF4vghnQjhmb87LF2ZHABP"
            //             ]
            //         );
                    
            //         await compileLambdaFunction(
            //             'ghostnet',
            //             "KT1RWSqVG2u1v9NAuQp2SkQAztqcTxKY6oaj",
                        
            //             'updateGeneralContracts',
            //             [
            //                 "KT1BErAZLnh6re3DHzGD9kUdQ3N8twyvZZen",
            //                 "lendingTreasury",
            //                 "KT1VBcmvmVinryFF4vghnQjhmb87LF2ZHABP"
            //             ]
            //         );
                    
            //         await compileLambdaFunction(
            //             'ghostnet',
            //             "KT1RWSqVG2u1v9NAuQp2SkQAztqcTxKY6oaj",
                        
            //             'updateGeneralContracts',
            //             [
            //                 "KT1BErAZLnh6re3DHzGD9kUdQ3N8twyvZZen",
            //                 "paymentTreasury",
            //                 "KT1VBcmvmVinryFF4vghnQjhmb87LF2ZHABP"
            //             ]
            //         );
                    
            //         await compileLambdaFunction(
            //             'ghostnet',
            //             "KT1RWSqVG2u1v9NAuQp2SkQAztqcTxKY6oaj",
                        
            //             'updateGeneralContracts',
            //             [
            //                 "KT1BErAZLnh6re3DHzGD9kUdQ3N8twyvZZen",
            //                 "satellliteTreasury",
            //                 "KT1VBcmvmVinryFF4vghnQjhmb87LF2ZHABP"
            //             ]
            //         );
                    
            //         await compileLambdaFunction(
            //             'ghostnet',
            //             "KT1RWSqVG2u1v9NAuQp2SkQAztqcTxKY6oaj",
                        
            //             'updateGeneralContracts',
            //             [
            //                 "KT1BErAZLnh6re3DHzGD9kUdQ3N8twyvZZen",
            //                 "taxTreasury",
            //                 "KT1VBcmvmVinryFF4vghnQjhmb87LF2ZHABP"
            //             ]
            //         );

            //     } catch(e){
            //         console.dir(e, {depth: 5});
            //     }
            // });

            // it('%updateWhitelistContracts', async () => {
            //     try{
                    
            //         await compileLambdaFunction(
            //             'ghostnet',
            //             "KT1RWSqVG2u1v9NAuQp2SkQAztqcTxKY6oaj",
                        
            //             'updateWhitelistContracts',
            //             [
            //                 "KT1VBcmvmVinryFF4vghnQjhmb87LF2ZHABP",
            //                 "aggregatorFactory",
            //                 "KT1FVbDB7kmXvnnKHMwEBzUmJtpkFdTEkM7D"
            //             ]
            //         );
                    
            //         await compileLambdaFunction(
            //             'ghostnet',
            //             "KT1RWSqVG2u1v9NAuQp2SkQAztqcTxKY6oaj",
                        
            //             'updateWhitelistContracts',
            //             [
            //                 "KT1VBcmvmVinryFF4vghnQjhmb87LF2ZHABP",
            //                 "doorman",
            //                 "KT1WXZ5JR7F1XdP8EBJLxDNHSP42sSVV1R7z"
            //             ]
            //         );
                    
            //         await compileLambdaFunction(
            //             'ghostnet',
            //             "KT1RWSqVG2u1v9NAuQp2SkQAztqcTxKY6oaj",
                        
            //             'updateWhitelistContracts',
            //             [
            //                 "KT1VBcmvmVinryFF4vghnQjhmb87LF2ZHABP",
            //                 "delegation",
            //                 "KT18y7R9o77ZuqqGt4EgCaWqpybvEmnZ5Z9b"
            //             ]
            //         );
                    
            //         await compileLambdaFunction(
            //             'ghostnet',
            //             "KT1RWSqVG2u1v9NAuQp2SkQAztqcTxKY6oaj",
                        
            //             'updateWhitelistContracts',
            //             [
            //                 "KT1VBcmvmVinryFF4vghnQjhmb87LF2ZHABP",
            //                 "governanceFinancial",
            //                 "KT1Vz9ZHQRHy3fhsjYumVrvk2yu3h4SXW2sB"
            //             ]
            //         );
                    
            //         await compileLambdaFunction(
            //             'ghostnet',
            //             "KT1RWSqVG2u1v9NAuQp2SkQAztqcTxKY6oaj",
                        
            //             'updateWhitelistContracts',
            //             [
            //                 "KT1VBcmvmVinryFF4vghnQjhmb87LF2ZHABP",
            //                 "governance",
            //                 "KT1BErAZLnh6re3DHzGD9kUdQ3N8twyvZZen"
            //             ]
            //         );

            //     } catch(e){
            //         console.dir(e, {depth: 5});
            //     }
            // });

            it('%updateConfig', async () => {
                try{
                    
                    await compileLambdaFunction(
                        'ghostnet',
                        "KT1RWSqVG2u1v9NAuQp2SkQAztqcTxKY6oaj",
                        
                        'updateConfig',
                        [
                            "KT1DWPNzrYCj6bM9WZQig3gq1XuT4i5CahmU",
                            "vaultFactory",
                            "ConfigVaultNameMaxLength",
                            20
                        ]
                    );

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        });
    });
});