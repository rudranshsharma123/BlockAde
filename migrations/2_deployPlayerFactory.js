const PlayerFactory = artifacts.require("PlayerFactory");

module.exports = function (deployer) {
	deployer.deploy(PlayerFactory);
};
