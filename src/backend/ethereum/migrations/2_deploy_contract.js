const LoanNFT = artifacts.require("LoanNFT");

module.exports = function(deployer) {
  deployer.deploy(LoanNFT);
};
