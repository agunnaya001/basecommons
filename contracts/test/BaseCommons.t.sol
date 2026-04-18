// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {BaseCommons} from "../src/BaseCommons.sol";

contract BaseCommonsTest is Test {
    BaseCommons public bc;
    address public admin = address(0xA11CE);
    address public alice = address(0xA1);
    address public bob   = address(0xB0B);
    address public carol = address(0xCA401);

    function setUp() public {
        bc = new BaseCommons(admin);
        vm.deal(alice, 10 ether);
        vm.deal(bob,   10 ether);
        vm.deal(carol, 10 ether);
        vm.deal(admin, 10 ether);
    }

    // ── Registration ───────────────────────────────────────
    function test_RegisterProject() public {
        vm.prank(alice);
        uint256 id = bc.registerProject("Garden", "Community garden", "ipfs://abc");
        assertEq(id, 1);
        (uint256 pid,,,,address payable recipient,, uint256 total,) = bc.projects(1);
        assertEq(pid, 1);
        assertEq(recipient, alice);
        assertEq(total, 0);
    }

    function test_RegisterMultipleProjects() public {
        vm.prank(alice); bc.registerProject("P1", "D1", "");
        vm.prank(bob);   bc.registerProject("P2", "D2", "");
        assertEq(bc.projectCount(), 2);
    }

    function test_RevertEmptyName() public {
        vm.prank(alice);
        vm.expectRevert(BaseCommons.EmptyName.selector);
        bc.registerProject("", "desc", "");
    }

    // ── Donations ──────────────────────────────────────────
    function test_Donate() public {
        vm.prank(alice); bc.registerProject("P1", "D1", "");
        uint256 aliceBalBefore = alice.balance;
        vm.prank(bob); bc.donate{value: 0.01 ether}(1);
        // recipient (alice) should have received the donation
        assertGt(alice.balance, aliceBalBefore);
        (, , , , , , uint256 total, uint256 donors) = bc.projects(1);
        assertEq(total, 0.01 ether);
        assertEq(donors, 1);
    }

    function test_UniqueDonarCount() public {
        vm.prank(alice); bc.registerProject("P1", "D1", "");
        vm.prank(bob); bc.donate{value: 0.01 ether}(1);
        vm.prank(bob); bc.donate{value: 0.01 ether}(1); // 2nd donation same donor
        (, , , , , , , uint256 donors) = bc.projects(1);
        assertEq(donors, 1); // still 1 unique donor
    }

    function test_RevertZeroDonation() public {
        vm.prank(alice); bc.registerProject("P1", "D1", "");
        vm.prank(bob);
        vm.expectRevert(BaseCommons.ZeroDonation.selector);
        bc.donate{value: 0}(1);
    }

    function test_RevertInvalidProject() public {
        vm.prank(bob);
        vm.expectRevert(BaseCommons.InvalidProject.selector);
        bc.donate{value: 0.01 ether}(999);
    }

    // ── Matching Pool ──────────────────────────────────────
    function test_FundMatchingPool() public {
        vm.prank(alice); bc.fundMatchingPool{value: 1 ether}();
        assertEq(bc.matchingPool(), 1 ether);
    }

    function test_FallbackFundsPool() public {
        (bool ok,) = address(bc).call{value: 0.5 ether}("");
        assertTrue(ok);
        assertEq(bc.matchingPool(), 0.5 ether);
    }

    // ── Distribution ───────────────────────────────────────
    function test_DistributeMatching_QFMath() public {
        // alice registers project 1, bob registers project 2
        vm.prank(alice); bc.registerProject("P1", "D1", "");
        vm.prank(bob);   bc.registerProject("P2", "D2", "");

        // 9 small donors to P1 (0.09 ETH total) vs 1 whale to P2 (0.5 ETH total)
        // In QF: P1 should win — breadth of donors > depth
        // QF scores: P1 = (9 * sqrt(0.01))^2 = 0.81  vs  P2 = sqrt(0.5)^2 = 0.5
        for (uint256 i = 1; i <= 9; i++) {
            address donor = address(uint160(0x1000 + i));
            vm.deal(donor, 1 ether);
            vm.prank(donor);
            bc.donate{value: 0.01 ether}(1);
        }
        address whale = address(0x2000);
        vm.deal(whale, 2 ether);
        vm.prank(whale); bc.donate{value: 0.5 ether}(2);

        // Fund matching pool
        vm.prank(admin); bc.fundMatchingPool{value: 1 ether}();

        uint256 aliceBalBefore = alice.balance;
        uint256 bobBalBefore   = bob.balance;

        vm.prank(admin); bc.distributeMatching();

        // P1 (9 × 0.01 ETH) should beat P2 (1 × 0.5 ETH) — QF in action
        uint256 aliceGain = alice.balance - aliceBalBefore;
        uint256 bobGain   = bob.balance   - bobBalBefore;

        console.log("P1 match (9 donors x 0.01 ETH each, 0.09 ETH total):", aliceGain);
        console.log("P2 match (1 whale, 0.5 ETH total):", bobGain);
        assertGt(aliceGain, bobGain, "QF: 9 small donors beat 1 whale");
    }

    function test_RevertDistribute_OnlyAdmin() public {
        vm.prank(alice); bc.registerProject("P1", "D1", "");
        vm.prank(alice); bc.fundMatchingPool{value: 1 ether}();
        vm.prank(bob);
        vm.expectRevert(BaseCommons.NotAdmin.selector);
        bc.distributeMatching();
    }

    function test_RevertDistribute_EmptyPool() public {
        vm.prank(admin);
        vm.expectRevert(BaseCommons.EmptyPool.selector);
        bc.distributeMatching();
    }

    // ── Cycle reset ────────────────────────────────────────
    function test_CycleResets() public {
        vm.prank(alice); bc.registerProject("P1", "D1", "");
        vm.prank(bob); bc.donate{value: 0.01 ether}(1);
        vm.prank(admin); bc.fundMatchingPool{value: 1 ether}();
        assertEq(bc.cycleId(), 1);
        vm.prank(admin); bc.distributeMatching();
        assertEq(bc.cycleId(), 2);
        // Donor amounts should be reset
        assertEq(bc.donorAmounts(1, bob), 0);
    }

    // ── Estimate ───────────────────────────────────────────
    function test_EstimateMatching() public {
        vm.prank(alice); bc.registerProject("P1", "D1", "");
        vm.prank(bob);   bc.donate{value: 0.01 ether}(1);
        vm.prank(admin); bc.fundMatchingPool{value: 1 ether}();

        (uint256[] memory ids, uint256[] memory amounts) = bc.estimateMatching();
        assertEq(ids[0], 1);
        assertGt(amounts[0], 0);
    }

    // ── Admin deactivate ───────────────────────────────────
    function test_DeactivateProject() public {
        vm.prank(alice); bc.registerProject("P1", "D1", "");
        vm.prank(admin); bc.deactivateProject(1);
        (, , , , , bool active, ,) = bc.projects(1);
        assertFalse(active);

        // Can't donate to inactive
        vm.prank(bob);
        vm.expectRevert(BaseCommons.ProjectInactive.selector);
        bc.donate{value: 0.01 ether}(1);
    }
}
