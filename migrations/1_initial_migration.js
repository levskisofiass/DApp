var Migrations = artifacts.require("./Lifecycle/Migrations.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
};
