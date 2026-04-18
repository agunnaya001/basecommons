// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {BaseCommons} from "../src/BaseCommons.sol";

contract DeployScript is Script {
    function run() public returns (BaseCommons) {
        address admin = vm.envOr("ADMIN_ADDRESS", msg.sender);
        uint256 deployerKey = vm.envUint("WALLET_PRIVATE_KEY");

        console.log("Deploying BaseCommons...");
        console.log("Admin address:", admin);
        console.log("Deployer balance:", address(vm.addr(deployerKey)).balance);

        vm.startBroadcast(deployerKey);
        BaseCommons bc = new BaseCommons(admin);
        vm.stopBroadcast();

        console.log("BaseCommons deployed at:", address(bc));
        console.log("Admin:", bc.admin());
        console.log("Cycle ID:", bc.cycleId());

        return bc;
    }
}
