pragma solidity ^0.6.6;

import './Ownable.sol';

contract CrowdsaleRegister is Ownable {

    address public handler;
    mapping (address => bool) verified;

    event ApprovedInvestor(address indexed investor);
    event RemovedInvestor(address indexed investor);
    event HandlerChanged(address handler);

    /*
     * Constructor setting up the handler address
     */
    constructor(address _handler) public {
        handler = _handler;
        emit HandlerChanged(_handler);
    }

    /*
     * Approve function to whitelist an investor
     * @dev can only by called by HANDLER address
     * @param _investor address sets the beneficiary for later use
    */
    function approve(address _investor) public{
        require(msg.sender == handler);
        require(!isContract(_investor));
        verified[_investor] = true;
        emit ApprovedInvestor(_investor);
    }

    /*
     * Remove function remove a whitelisted investor
     * @dev can only by called by HANDLER address
     * @param _investor address sets the beneficiary for later use
    */
    function remove(address _investor) public{
        require(msg.sender == handler);
        verified[_investor] = false;
        emit RemovedInvestor(_investor);
    }

    /*
     * Constant call to find out if an investor is registered
     * @param _investor address to be checked
     * @return bool is true is _investor was approved
     */
    function approved(address _investor) view public returns (bool) {
        return verified[_investor];
    }

    /*
     * Check if address is a contract to prevent contracts from participating the direct sale.
     * @param address addr to be checked
     * @return boolean of it is or isn't an contract address
     * @credits Manuel Aráoz
     */
    function isContract(address addr) public view returns (bool) {
        uint size;
        assembly { size := extcodesize(addr) }
        return size > 0;
    }

    /*
     * Function to change the whitelists handler
     * @dev can only by called by OWNER address
     * @param address _newHanlder is the address which will be able to approve addresses in the whitelist
     */
    function changeHandler(address _newHandler) public onlyOwner {
        handler = _newHandler;
        emit HandlerChanged(_newHandler);
    }

}
