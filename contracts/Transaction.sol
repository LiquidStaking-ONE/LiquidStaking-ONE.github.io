//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Transaction {
    uint256 private count = 0;
    uint256 moneyStored = 0;

    function addMoney() public payable {
        moneyStored += msg.value;
    }

    function getMoneyStored() public view returns (uint256) {
        return moneyStored;
    }
}
