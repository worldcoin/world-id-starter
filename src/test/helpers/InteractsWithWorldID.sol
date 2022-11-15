// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import {Vm} from "forge-std/Vm.sol";
import {IWorldID} from "../../interfaces/IWorldID.sol";
import {Semaphore} from "worldcoin/world-id/Semaphore.sol";
import {TypeConverter} from "./TypeConverter.sol";

contract InteractsWithWorldID {
    using TypeConverter for address;

    Vm public wldVM =
        Vm(address(bytes20(uint160(uint256(keccak256("hevm cheat code"))))));
    Semaphore internal semaphore;
    IWorldID internal worldID;

    function setUpWorldID() public {
        semaphore = new Semaphore();
        semaphore.createGroup(1, 20, 0);

        worldID = IWorldID(address(semaphore));

        wldVM.label(address(worldID), "WorldID");
    }

    function registerIdentity() public {
        semaphore.addMember(1, _genIdentityCommitment());
    }

    function registerInvalidIdentity() public {
        semaphore.addMember(1, 1);
    }

    function getRoot() public view returns (uint256) {
        return semaphore.getRoot(1);
    }

    function _genIdentityCommitment() internal returns (uint256) {
        string[] memory ffiArgs = new string[](2);
        ffiArgs[0] = "node";
        ffiArgs[1] = "src/test/scripts/generate-commitment.js";

        bytes memory returnData = wldVM.ffi(ffiArgs);
        return abi.decode(returnData, (uint256));
    }

    function getProof(address signal, string memory actionId)
        internal
        returns (uint256, uint256[8] memory proof)
    {
        // increase the lenght of the array if you have multiple parameters as signal
        string[] memory ffiArgs = new string[](5);
        ffiArgs[0] = "node";
        ffiArgs[1] = "--no-warnings";
        ffiArgs[2] = "src/test/scripts/generate-proof.js";

        // duplicate (and update) this line for each parameter on your signal
        // make sure to update the array index for everything after too!
        ffiArgs[3] = address(signal).toString();

        // update your external nullifier here
        ffiArgs[4] = actionId;

        bytes memory returnData = wldVM.ffi(ffiArgs);

        return abi.decode(returnData, (uint256, uint256[8]));
    }
}
