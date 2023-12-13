// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract BullToken is ERC20Capped, ERC20Burnable {
    address payable public owner;

    constructor(uint256 cap) ERC20("BullToken", "BULL") ERC20Capped(cap * (10 ** decimals())) {
        owner = payable(msg.sender);
        _mint(owner, 10000000000000 * (10 ** decimals()));
    }

    function _update(address from, address to, uint256 value) internal virtual override(ERC20Capped, ERC20) {
        super._update(from, to, value);

        if (from == address(0)) {
            uint256 maxSupply = cap();
            uint256 supply = totalSupply();
            if (supply > maxSupply) {
                revert ERC20ExceededCap(supply, maxSupply);
            }
        }
    }

    // exchange rate: 1B BULL per 0.1 ETH
    uint256 public constant tokensPerEth = 10000000000;

    function buyTokens(address recipient) public payable {
        require(msg.value > 0, "You need to send some ETH");
        uint256 tokensToSend = (msg.value * tokensPerEth) / (10 ** decimals());

        //check if the contract has enough tokens to send
        uint256 contractBalance = balanceOf(address(this));

        require(contractBalance >= tokensToSend, "Not enough tokens in the contract");

        _transferFromContract(recipient, tokensToSend);
    }

    function _transferFromContract(address recipient, uint256 amount) internal {
        require(balanceOf(address(this)) >= amount, "ERC20: insufficient contract balance");
        _transfer(address(this), recipient, amount);
    }

    // receive function calls buyTokens with the original address caller
    receive() external payable {
        buyTokens(msg.sender);
    }
}
