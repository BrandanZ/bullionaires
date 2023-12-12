// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";

contract BrandanToken is ERC20Capped {
    address payable public owner;

    constructor(uint256 cap) ERC20("Bullionaires", "BULL") ERC20Capped(cap * (10 ** decimals())) {
        owner = msg.sender;
        _mint(owner, 10000000000000 * (10 ** decimals()));
    }
}
