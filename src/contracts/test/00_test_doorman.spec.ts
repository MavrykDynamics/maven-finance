import { Utils, zeroAddress } from "./helpers/Utils";
import { Doorman } from "./helpers/doormanHelper";

import { rejects, ok, strictEqual } from "assert";

const chai = require("chai");
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);   
chai.should();

import { alice, bob } from "../scripts/sandbox/accounts";

import { doormanStorage } from "../storage/doormanStorage";

describe("Doorman tests", async () => {
  var utils: Utils;
  var doorman: Doorman;

  before("setup", async () => {
    utils = new Utils();

    await utils.init(alice.sk);
    
    console.log('test before');

    // console.log(doormanStorage);
    // console.log(utils.tezos);

    doorman = await Doorman.originate(
      utils.tezos,
      doormanStorage
    );

    console.log(doorman);

  });

  it("should set a new admin", async () => {
    await doorman.setAdmin(bob.pkh);
    // await doorman.updateStorage([bob.pkh]);
    // strictEqual(bakerRegistry.storage[bob.pkh], true);
    // console.log(doorman);
    console.log('first test');
  });

});