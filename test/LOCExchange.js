const ExchangeOracle = artifacts.require("./ExchangeOracle.sol");
const LOCExchange = artifacts.require("./LOCExchange.sol");
const MintableToken = artifacts.require("./Tokens/MintableToken.sol");
const util = require('./util');
const expectThrow = util.expectThrow;

contract('LOCExchange', function(accounts) {

    let ExchangeOracleInstance;
    let LOCExchangeIntance;
    let ERC20Instance;

    const _owner = accounts[0];
    const _notOwner = accounts[1];

    const _initialRate = 5000;
    const _weiAmount = 1000000000000000000;
    const _weiAmountWithdraw = 500000000000000000;
    const _locWeiAmount = 2000000000000000000;
    const _locWeiAmountRounding = 2000000000000000333;
    const _locWeiAmountWithdraw = 1000000000000000000;
    const _notOwnerLOCAmount = _weiAmount * _initialRate;
    const _ethForExchangeContract = 1;

    describe("creating contract", () => {
        it("should be able to deploy Lockchain Exchange Contract", async function() {
            LOCExchangeIntance = undefined;
            ERC20Instance = await MintableToken.new({
                from: _owner
            });
            ExchangeOracleInstance = await ExchangeOracle.new(_initialRate, {
                from: _owner
            });
            LOCExchangeIntance = await LOCExchange.new(ExchangeOracleInstance.address, ERC20Instance.address, {
                from: _owner
            });
            await ERC20Instance.mint(_notOwner, _notOwnerLOCAmount, {
                from: _owner
            });
            assert.isDefined(LOCExchangeIntance, "Could not deploy Lockchain Exchange contract");
        })
    })

    describe("constructor", () => {
        beforeEach(async function() {
            ERC20Instance = await MintableToken.new({
                from: _owner
            });
            ExchangeOracleInstance = await ExchangeOracle.new(_initialRate, {
                from: _owner
            });
            LOCExchangeIntance = await LOCExchange.new(ExchangeOracleInstance.address, ERC20Instance.address, {
                from: _owner
            });

            await ERC20Instance.mint(_notOwner, _notOwnerLOCAmount, {
                from: _owner
            });
        });

        it("should have set the owner of the contract", async function() {
            const LOCExchangeOwner = await LOCExchangeIntance.owner.call();
            assert.strictEqual(LOCExchangeOwner, _owner, "The contract owner was not set correctly");
        });

        it("should have set the initial rate correctly", async function() {
            const rate = await LOCExchangeIntance.rate.call();
            assert(rate.eq(_initialRate), "The initial rate was not set correctly");
        });

        it("should have set the token contract", async function() {
            const LOCExchangeERC20Address = await LOCExchangeIntance.LOCTokenContract.call();
            assert.strictEqual(LOCExchangeERC20Address, ERC20Instance.address, "The token contract was not set correctly");
        });
    });

    describe("contract fallback function", () => {
        beforeEach(async function() {
            ERC20Instance = await MintableToken.new({
                from: _owner
            });
            ExchangeOracleInstance = await ExchangeOracle.new(_initialRate, {
                from: _owner,
            });
            LOCExchangeIntance = await LOCExchange.new(ExchangeOracleInstance.address, ERC20Instance.address, {
                from: _owner
            });

            await ERC20Instance.mint(_notOwner, _notOwnerLOCAmount, {
                from: _owner
            });
        });

        it("should send eth to contract", async function() {
            const contractBalance = await web3.eth.getBalance(LOCExchangeIntance.address);
            const txnHash = await web3.eth.sendTransaction({
                from: _owner, 
                to: LOCExchangeIntance.address, 
                value: web3.toWei(_ethForExchangeContract, "ether")
            });
            await util.getTransactionReceiptMined(txnHash);
            const contractBalanceAfter = await web3.eth.getBalance(LOCExchangeIntance.address);
            const neededBalance = contractBalance.plus(web3.toWei(_ethForExchangeContract, "ether"));
            
            assert(contractBalanceAfter.eq(neededBalance), "The contract ETH balance is not correct!");
        });
    });

    describe("exchange", () => {
        beforeEach(async function() {
            ERC20Instance = await MintableToken.new({
                from: _owner
            });
            ExchangeOracleInstance = await ExchangeOracle.new(_initialRate, {
                from: _owner,
            });
            LOCExchangeIntance = await LOCExchange.new(ExchangeOracleInstance.address, ERC20Instance.address, {
                from: _owner
            });

            const txnHash = await web3.eth.sendTransaction({
                from: _owner, 
                to: LOCExchangeIntance.address, 
                value: web3.toWei(_ethForExchangeContract, "ether")
            });
            await util.getTransactionReceiptMined(txnHash);

            await ERC20Instance.mint(_notOwner, _notOwnerLOCAmount, {
                from: _owner
            });
        });

        it("should return corresponding amount in LocWei", async function() {
            const rate = await LOCExchangeIntance.rate();

            const locWeiAmount = await LOCExchangeIntance.weiToLocWei(_weiAmount, {
                from: _owner
            });

            const minWeiAmount = await LOCExchangeIntance.minWeiAmount();
            const convertedWeiAmount = _weiAmount / minWeiAmount;
            const expectedLocAmount = convertedWeiAmount * rate;

            assert(locWeiAmount.eq(expectedLocAmount), "The locWei amount is not correct!");
        });

        it("should return corresponding amount in Wei", async function() {
            const rate = await LOCExchangeIntance.rate();
            const minWeiAmount = await LOCExchangeIntance.minWeiAmount();

            const weiAmount = await LOCExchangeIntance.locWeiToWei(_locWeiAmount, {
                from: _owner
            });

            let expectedWeiAmount = _locWeiAmount / rate;
            if (_locWeiAmount % rate) {
                expectedWeiAmount++;
            }

            expectedWeiAmount *= minWeiAmount;

            assert(weiAmount.eq(expectedWeiAmount), "The Wei amount is not correct!");
        });

        it("should return corresponding amount in Wei with rounding", async function() {
            const rate = await LOCExchangeIntance.rate();
            const minWeiAmount = await LOCExchangeIntance.minWeiAmount();
            const weiAmount = await LOCExchangeIntance.locWeiToWei(_locWeiAmountRounding, {
                from: _owner
            });

            let expectedWeiAmount = _locWeiAmountRounding / rate;
            expectedWeiAmount = Math.round(expectedWeiAmount);
            if (_locWeiAmountRounding % rate) {
                expectedWeiAmount++;
            }

            expectedWeiAmount *= minWeiAmount;
            assert(weiAmount.eq(expectedWeiAmount), "The Wei rounded amount is not correct!");
        });

        it("should transfer ETH to caller address", async function() {
            const locWeiAmount = await LOCExchangeIntance.weiToLocWei(_weiAmount, {
                from: _notOwner
            });
            await ERC20Instance.approve(LOCExchangeIntance.address, locWeiAmount, {
                from: _notOwner
            });

            const ethBalanceBefore = await web3.eth.getBalance(_notOwner);
            const ethSent = await LOCExchangeIntance.exchangeLocWeiToEthWei(locWeiAmount, {
                from: _notOwner
            });

            let ethBalanceAfter = await web3.eth.getBalance(_notOwner);
            assert(ethBalanceAfter.gt(ethBalanceBefore), "Final account balance is not more than initial!");
        });

        it("should transfer LOC", async function() {
            const locWeiAmount = await LOCExchangeIntance.weiToLocWei(_weiAmount, {
                from: _notOwner
            });
            await ERC20Instance.approve(LOCExchangeIntance.address, locWeiAmount, {
                from: _notOwner
            });
            const locBalanceBeforeTransaction = await ERC20Instance.balanceOf(_notOwner);
            const ethSent = await LOCExchangeIntance.exchangeLocWeiToEthWei(locWeiAmount, {
                from: _notOwner
            });
            const locBalanceAfterTransaction = await ERC20Instance.balanceOf(_notOwner);

            assert(locBalanceBeforeTransaction.eq(locBalanceAfterTransaction.plus(locWeiAmount)),
                "Final account balance is not correct!"
            );
        });

        it("should emit event on exchange", async function() {
            const expectedEvent = 'LogLocExchanged';

            const locWeiAmount = await LOCExchangeIntance.weiToLocWei(_weiAmount, {
                from: _notOwner
            });
            await ERC20Instance.approve(LOCExchangeIntance.address, locWeiAmount, {
                from: _notOwner
            });
            const ethSent = await LOCExchangeIntance.exchangeLocWeiToEthWei(locWeiAmount, {
                from: _notOwner
            });

            assert.lengthOf(ethSent.logs, 1, "There should be 1 event emitted from exchangeLocWeiToEthWei!");
            assert.strictEqual(ethSent.logs[0].event, expectedEvent, `The event emitted was ${ethSent.logs[0].event} instead of ${expectedEvent}`);
        });

        it("should throw if trying to exchange amount lower then rate", async function() {
            const rate = await LOCExchangeIntance.rate();

            const locWeiAmount = await LOCExchangeIntance.weiToLocWei(rate - 100, {
                from: _notOwner
            });
            await ERC20Instance.approve(LOCExchangeIntance.address, locWeiAmount, {
                from: _notOwner
            });
            await expectThrow(LOCExchangeIntance.exchangeLocWeiToEthWei(rate - 100, {
                from: _notOwner
            }));
        });

        it("should get correct LOC balance for contract", async function() {
            await ERC20Instance.mint(LOCExchangeIntance.address, _locWeiAmount, {
                from: _owner
            });
            const contractLocBalance = await LOCExchangeIntance.getLocBalance.call();
            assert(contractLocBalance.eq(_locWeiAmount), "The contract LOC balance amount is not correct!");
        });

        it("should withdraw eth from contract to owner", async function() {
            const ownerBalance = await web3.eth.getBalance(_owner);
            await LOCExchangeIntance.withdrawETH(_weiAmountWithdraw);
            const ownerBalanceAfter = await web3.eth.getBalance(_owner);

            assert(ownerBalanceAfter.gt(ownerBalance), "Final account balance is not more than initial!");
        });

        it("should throw if requested ETH withdraw is more than balance", async function() {
            await expectThrow(LOCExchangeIntance.withdrawETH(_weiAmount + 100));
        });

        it("should emit event on ETH withdraw", async function() {
            const expectedEvent = 'LogETHWithdrawal';
            const result = await LOCExchangeIntance.withdrawETH(_weiAmountWithdraw);

            assert.lengthOf(result.logs, 1, "There should be 1 event emitted from withdrawETH!");
            assert.strictEqual(result.logs[0].event, expectedEvent, `The event emitted was ${result.logs[0].event} instead of ${expectedEvent}`);
        });

        it("should send LOC from contract to owner", async function() {
            await ERC20Instance.mint(LOCExchangeIntance.address, _locWeiAmountWithdraw, {
                from: _owner
            });

            const ownerBalance = await ERC20Instance.balanceOf(_owner);
            await LOCExchangeIntance.withdrawLOC(_locWeiAmountWithdraw);
            const ownerBalanceAfter = await ERC20Instance.balanceOf(_owner);

            assert(ownerBalanceAfter.eq(ownerBalance.plus(_locWeiAmountWithdraw)), "Final account balance is not correct!");
        });

        it("should throw if requested LOC withdraw is more than balance", async function() {
            await expectThrow(LOCExchangeIntance.withdrawLOC(_notOwnerLOCAmount + 100), {
                from: _notOwner
            });
        });

        it("should emit event on LOC withdraw", async function() {
            const expectedEvent = 'LogLocWithdrawal';
            await ERC20Instance.mint(LOCExchangeIntance.address, _locWeiAmountWithdraw, {
                from: _owner
            });

            const result = await LOCExchangeIntance.withdrawLOC(_locWeiAmountWithdraw);

            assert.lengthOf(result.logs, 1, "There should be 1 event emitted from withdrawLOC!");
            assert.strictEqual(result.logs[0].event, expectedEvent, `The event emitted was ${result.logs[0].event} instead of ${expectedEvent}`);
        });
    });

    describe("working with paused contract", () => {
        beforeEach(async function() {
            ERC20Instance = await MintableToken.new({
                from: _owner
            });
            ExchangeOracleInstance = await ExchangeOracle.new(_initialRate, {
                from: _owner,
            });
            LOCExchangeIntance = await LOCExchange.new(ExchangeOracleInstance.address, ERC20Instance.address, {
                from: _owner
            });
            await LOCExchangeIntance.pause({
                from: _owner
            });
        })

        it("should throw if try to get the LocWei amount of wei when contract is paused", async function() {
            await expectThrow(LOCExchangeIntance.weiToLocWei(_weiAmount, {
                from: _owner
            }));
        });

        it("should throw if try to get the Wei amount of LocWei when contract is paused", async function() {
            await expectThrow(LOCExchangeIntance.locWeiToWei(_locWeiAmount, {
                from: _owner
            }));
        });

        it("should throw if try to exchange LocWei to Wei when contract is paused", async function() {
            await expectThrow(LOCExchangeIntance.exchangeLocWeiToEthWei(_locWeiAmount, {
                from: _notOwner
            }));
        });

        it("should throw if try to get contract's LOCBalance when contract is paused", async function() {
            await expectThrow(LOCExchangeIntance.getLocBalance.call());
        });

        it("should throw if try to withdraw ETH when contract is paused", async function() {
            await expectThrow(LOCExchangeIntance.withdrawETH(_weiAmountWithdraw));
        });

        it("should throw if try to withdraw LOC when contract is paused", async function() {
            await expectThrow(LOCExchangeIntance.withdrawLOC(_locWeiAmountWithdraw));
        });
    });
});