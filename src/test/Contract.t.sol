// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import {Test} from "forge-std/Test.sol";
import {Contract} from "../Contract.sol";
import {InteractsWithWorldID} from "./helpers/InteractsWithWorldID.sol";

contract ContractTest is Test, InteractsWithWorldID {
    Contract internal yourContract;

    function setUp() public {
        setUpWorldID();

        // update any constructor parameters you need here!
        yourContract = new Contract(worldID, "wid_test");

        vm.label(address(this), "Sender");
        vm.label(address(yourContract), "Contract");
    }

    function testCanCall() public {
        registerIdentity(); // this simulates a World ID "verified" identity

        (uint256 nullifierHash, uint256[8] memory proof) = getProof(
            address(this),
            "wid_test"
        );
        yourContract.verifyAndExecute(
            address(this),
            getRoot(),
            nullifierHash,
            proof
        );

        // extra checks here
    }

    function testCannotDoubleCall() public {
        registerIdentity();

        (uint256 nullifierHash, uint256[8] memory proof) = getProof(
            address(this),
            "wid_test"
        );

        yourContract.verifyAndExecute(
            address(this),
            getRoot(),
            nullifierHash,
            proof
        );

        uint256 root = getRoot();
        vm.expectRevert(Contract.InvalidNullifier.selector);
        yourContract.verifyAndExecute(
            address(this),
            root,
            nullifierHash,
            proof
        );

        // extra checks here
    }

    function testCannotCallIfNotMember() public {
        registerInvalidIdentity();

        uint256 root = getRoot();
        (uint256 nullifierHash, uint256[8] memory proof) = getProof(
            address(this),
            "wid_test"
        );

        vm.expectRevert(abi.encodeWithSignature("InvalidProof()"));
        yourContract.verifyAndExecute(
            address(this),
            root,
            nullifierHash,
            proof
        );

        // extra checks here
    }

    function testCannotCallWithInvalidSignal() public {
        registerIdentity();

        (uint256 nullifierHash, uint256[8] memory proof) = getProof(
            address(this),
            "wid_test"
        );

        uint256 root = getRoot();
        vm.expectRevert(abi.encodeWithSignature("InvalidProof()"));
        yourContract.verifyAndExecute(
            address(0x01),
            root,
            nullifierHash,
            proof
        );

        // extra checks here
    }

    function testCannotCallWithInvalidProof() public {
        registerIdentity();

        (uint256 nullifierHash, uint256[8] memory proof) = getProof(
            address(this),
            "wid_test"
        );

        // this changes the proof, invalidating it
        proof[0] ^= 42;

        uint256 root = getRoot();
        vm.expectRevert(abi.encodeWithSignature("InvalidProof()"));
        yourContract.verifyAndExecute(
            address(0x01),
            root,
            nullifierHash,
            proof
        );

        // extra checks here
    }
}
