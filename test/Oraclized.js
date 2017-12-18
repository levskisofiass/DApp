const LOCExchange = artifacts.require("./LOCExchange.sol");
const ExchangeOracle = artifacts.require("./ExchangeOracle.sol");
const MintableToken = artifacts.require("./tokens/MintableToken.sol");
const util = require('./util');
const expectThrow = util.expectThrow;

contract('Oraclized', function(accounts) {

    let LOCExchangeInstance;
    let ExchangeOracleInstance;

    const _owner = accounts[0];
    const _notOwner = accounts[1];
    const _oracle = accounts[2];
    const _newOracle = accounts[3];
    const _notOracle = accounts[4];

    const _initialRate = 10000;

    describe("constructor", () => {
        beforeEach(async function() {
            ExchangeOracleInstance = await ExchangeOracle.new(_initialRate, {
                from: _oracle
            });
            ERC20Instance = await MintableToken.new({
                from: _owner
            });
            LOCExchangeInstance = await LOCExchange.new(
                ExchangeOracleInstance.address, 
                ERC20Instance.address, {
                    from: _owner
                });
        })

        it("should have set the oracle of the contract", async function() {
            const LOCExchangeOracle = await LOCExchangeInstance.LOCOracle.call();
            assert.strictEqual(LOCExchangeOracle, ExchangeOracleInstance.address, "The contract oracle was not set correctly");
        });

    });

    describe("changing the oracle", () => {
        let newOracle;
        beforeEach(async function() {
            ExchangeOracleInstance = await ExchangeOracle.new(_initialRate, {
                from: _oracle
            });
            newOracle = await ExchangeOracle.new(_initialRate, {
                from: _newOracle
            });
            ERC20Instance = await MintableToken.new({
                from: _owner
            });
            LOCExchangeInstance = await LOCExchange.new(
                ExchangeOracleInstance.address, 
                ERC20Instance.address, {
                    from: _owner
            });
        })

        it("should have set the oracle of the contract", async function() {
            await LOCExchangeInstance.setOracle(newOracle.address, {
                from: _owner
            });
            const LOCExchangeOracle = await LOCExchangeInstance.LOCOracle.call();
            assert.strictEqual(LOCExchangeOracle, newOracle.address, "The contract oracle was not set correctly");
        });

        it("should throw if non-owner tries to change", async function() {
            await expectThrow(LOCExchangeInstance.setOracle(newOracle.address, {
                from: _notOwner
            }));
        });

        it("should throw if try to change the rate of paused contract", async function() {
            await LOCExchangeInstance.pause({
                from: _owner
            });

            await expectThrow(LOCExchangeInstance.setOracle(newOracle.address, {
                from: _owner
            }));
        });

        it("should throw if non-oracle is set", async function() {
            await expectThrow(LOCExchangeInstance.setOracle(_notOracle, {
                from: _owner
            }));
        });

        it("should emit event on change", async function() {
            const expectedEvent = 'LOGLOCOracleSet';
            let result = await LOCExchangeInstance.setOracle(newOracle.address, {
                from: _owner
            });
            assert.lengthOf(result.logs, 1, "There should be 1 event emitted from setOracle!");
            assert.strictEqual(result.logs[0].event, expectedEvent, `The event emitted was ${result.logs[0].event} instead of ${expectedEvent}`);
        });
    });

    describe("getting the exchange rate", () => {
        beforeEach(async function() {
            ExchangeOracleInstance = await ExchangeOracle.new(_initialRate, {
                from: _oracle
            });
            ERC20Instance = await MintableToken.new({
                from: _owner
            });
            LOCExchangeInstance = await LOCExchange.new(
                ExchangeOracleInstance.address, 
                ERC20Instance.address, {
                    from: _owner
            });
        })

        it("should have the same value in oracle and exchange", async function() {
            const exRate = await LOCExchangeInstance.rate.call();
            const rate = await ExchangeOracleInstance.rate.call();
            assert(exRate.eq(_initialRate), "The initial rate was not set correctly in the exchange");
            assert(exRate.eq(rate), "The initial rate was not set correctly in the oracle");
        });

        it("should throw if try to get the rate of paused contract", async function() {
            await LOCExchangeInstance.pause({
                from: _owner
            });
            await util.expectThrow(LOCExchangeInstance.rate.call());
        });
    })
});