// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LoanNFT is ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    struct Loan {
        uint16 amount;
        uint16 outstandingBalance;
        uint256 startDate; // Timestamp for the start date of the loan
        uint256 endDate;   // Timestamp for the repayment date of the loan
    }

    mapping(uint256 => Loan) public loans;
    mapping(address => uint256) public outstandingBorrowerLoans;
    uint16 public maxLoanAmount = 10000;

    constructor() ERC721("LoanNFT", "LNFT") {}

    function borrowerHasLoan(address borrower) public view returns (bool) {
        return outstandingBorrowerLoans[borrower] != 0;
    }

    function setMaxLoanAmount(uint16 amount) public onlyOwner {
        require(amount > 0, "Amount should be greater than 0");
        maxLoanAmount = amount;
    }

    function mintLoan(address borrowerAddress, uint16 amount) public onlyOwner returns (uint256) {
        require(amount > 0, "Amount should be greater than 0");
        require(amount <= maxLoanAmount, "Loan amount exceeds max loan amount.");
        require(!borrowerHasLoan(borrowerAddress), "Borrower already has an outstanding loan!");
        _tokenIdCounter.increment();

        uint256 newTokenId = _tokenIdCounter.current();
        _safeMint(borrowerAddress, newTokenId);

        loans[newTokenId] = Loan({
            amount: amount,
            outstandingBalance: amount,
            startDate: block.timestamp,
            endDate: 0
        });

        outstandingBorrowerLoans[borrowerAddress] = newTokenId;

        return newTokenId;
    }

    function repay(uint256 tokenId, uint16 amount) internal {
        Loan storage loan = loans[tokenId];
        require(loan.outstandingBalance > 0, "Loan is already paid off.");

        if (loan.outstandingBalance < amount) {
            amount = loan.outstandingBalance;
        }

        loan.outstandingBalance -= amount;

        if (loan.outstandingBalance == 0) {
            loan.endDate = block.timestamp;
            outstandingBorrowerLoans[ownerOf(tokenId)] = 0;
            emit LoanRepaid(tokenId, loan.amount);
        }
    }

    function repayByBorrower(address borrower, uint16 amount) public onlyOwner {
        require(borrowerHasLoan(borrower), "Borrower does not have an outstanding loan!");
        repay(outstandingBorrowerLoans[borrower], amount);
    }

    function getLoanDetails(uint256 tokenId) public view returns (Loan memory) {
        return loans[tokenId];
    }

    function transferFrom(address, address, uint256) public override(ERC721, IERC721) {
        revert("This NFT is non-transferrable");
    }

    function safeTransferFrom(address, address, uint256) public override(ERC721, IERC721) {
        revert("This NFT is non-transferrable");
    }

    function approve(address, uint256) public override(ERC721, IERC721) {
        revert("This NFT is non-transferrable");
    }

    function setApprovalForAll(address, bool) public override(ERC721, IERC721) {
        revert("This NFT is non-transferrable");
    }

    event LoanMinted(address indexed to, uint256 tokenId, uint16 amount);
    event LoanRepaid(uint256 tokenId, uint16 repaidAmount);

}
