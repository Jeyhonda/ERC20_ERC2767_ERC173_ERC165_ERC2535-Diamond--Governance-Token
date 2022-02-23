import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const {
  getSelectors,
  FacetCutAction,
} = require("../scripts/libraries/diamond.js");
const { deployDiamond } = require("../scripts/deploy.ts");

const { assert } = require("chai");

describe("Token Price (Typescript/Diamond Standard/Hardhat) Test\n", async () => {
  let diamondAddress: string;
  let diamondCutFacet: Contract;
  let diamondLoupeFacet: Contract;
  let tokenPriceV1: Contract;
  let result: any;
  let receipt;
  let tx;
  const addresses = [];
  let owner: SignerWithAddress, addr1: SignerWithAddress;

  before(async () => {
    /// Deploy - DiamondCutFacet, Diamond, DiamondInit, DiamondLoupeFacet, TokenPriceV1
    diamondAddress = await deployDiamond();

    diamondCutFacet = await ethers.getContractAt(
      "DiamondCutFacet",
      diamondAddress
    );
    diamondLoupeFacet = await ethers.getContractAt(
      "DiamondLoupeFacet",
      diamondAddress
    );
    tokenPriceV1 = await ethers.getContractAt("TokenPriceV1", diamondAddress);
    [owner, addr1] = await ethers.getSigners();
  });

  describe("Token Price Version 1 test", async () => {
    describe("Pausable test", async () => {
      it("Owner can pause the contract", async () => {
        await expect(tokenPriceV1.connect(owner).pause())
          .to.emit(tokenPriceV1, "Paused")
          .withArgs(owner.address);
      });

      // it("Owner can unpause the paused contract", async () => {
      //   tokenPriceV1.pause();
      //   await expect(tokenPriceV1.unpause())
      //     .to.emit(tokenPriceV1, "Unpaused")
      //     .withArgs(owner.address);
      // });

      // it("Owner can't pause contract that not have been paused.", async () => {
      //   tokenPriceV1.pause();
      //   await expect(tokenPriceV1.pause()).to.be.revertedWith(
      //     "Pausable: paused"
      //   );
      // });

      // it("Owner can't unpause contract that have already been unpaused.", async () => {
      //   tokenPriceV1.pause();
      //   tokenPriceV1.unpause();
      //   await expect(tokenPriceV1.unpause()).to.be.revertedWith(
      //     "Pausable: not paused"
      //   );
      // });

      // it("Only owner can pause the contract", async () => {
      //   await expect(tokenPriceV1.connect(addr1).pause()).to.be.revertedWith(
      //     "LibDiamond: Must be contract owner"
      //   );
      // });

      // it("Only owner can unpause the contract", async () => {
      //   tokenPriceV1.pause();
      //   await expect(tokenPriceV1.connect(addr1).unpause()).to.be.revertedWith(
      //     "LibDiamond: Must be contract owner"
      //   );
      // });
    });

    // it("should have three facets -- call to facetAddresses function", async () => {
    //   for (const address of await diamondLoupeFacet.facetAddresses()) {
    //     addresses.push(address as never);
    //   }
    //   await expect(addresses.length).to.be.equal(3);
    // });

    // it("facets should have the right function selectors -- call to facetFunctionSelectors function", async () => {
    //   let selectors = getSelectors(diamondCutFacet);
    //   result = await diamondLoupeFacet.facetFunctionSelectors(addresses[0]);
    //   assert.sameMembers(result, selectors);
    //   selectors = getSelectors(diamondLoupeFacet);
    //   result = await diamondLoupeFacet.facetFunctionSelectors(addresses[1]);
    //   assert.sameMembers(result, selectors);
    // });

    it("should add test1 functions", async () => {
      const Test1Facet = await ethers.getContractFactory("Test1Facet");
      const test1Facet = await Test1Facet.deploy();
      await test1Facet.deployed();
      addresses.push(test1Facet.address as never);
      const selectors = getSelectors(test1Facet);
      tx = await diamondCutFacet.diamondCut(
        [
          {
            facetAddress: test1Facet.address,
            action: FacetCutAction.Add,
            functionSelectors: selectors,
          },
        ],
        ethers.constants.AddressZero,
        "0x",
        { gasLimit: 800000 }
      );
      receipt = await tx.wait();
      if (!receipt.status) {
        throw Error(`Diamond upgrade failed: ${tx.hash}`);
      }
      result = await diamondLoupeFacet.facetFunctionSelectors(
        test1Facet.address
      );
      assert.sameMembers(result, selectors);
    });

    it("should test function call", async () => {
      const test1Facet = await ethers.getContractAt(
        "Test1Facet",
        diamondAddress
      );
      await test1Facet.test1Func10();
    });

    // it("should replace supportsInterface function", async () => {
    //   const Test1Facet = await ethers.getContractFactory("Test1Facet");
    //   const selectors = getSelectors(Test1Facet).get([
    //     "supportsInterface(bytes4)",
    //   ]);
    //   const testFacetAddress = addresses[3];
    //   tx = await diamondCutFacet.diamondCut(
    //     [
    //       {
    //         facetAddress: testFacetAddress,
    //         action: FacetCutAction.Replace,
    //         functionSelectors: selectors,
    //       },
    //     ],
    //     ethers.constants.AddressZero,
    //     "0x",
    //     { gasLimit: 800000 }
    //   );
    //   receipt = await tx.wait();
    //   if (!receipt.status) {
    //     throw Error(`Diamond upgrade failed: ${tx.hash}`);
    //   }
    //   result = await diamondLoupeFacet.facetFunctionSelectors(testFacetAddress);
    //   assert.sameMembers(result, getSelectors(Test1Facet));
    // });

    it("should add test2 functions", async () => {
      const Test2Facet = await ethers.getContractFactory("Test2Facet");
      const test2Facet = await Test2Facet.deploy();
      await test2Facet.deployed();
      addresses.push(test2Facet.address as never);
      const selectors = getSelectors(test2Facet);
      tx = await diamondCutFacet.diamondCut(
        [
          {
            facetAddress: test2Facet.address,
            action: FacetCutAction.Add,
            functionSelectors: selectors,
          },
        ],
        ethers.constants.AddressZero,
        "0x",
        { gasLimit: 800000 }
      );
      receipt = await tx.wait();
      if (!receipt.status) {
        throw Error(`Diamond upgrade failed: ${tx.hash}`);
      }
      result = await diamondLoupeFacet.facetFunctionSelectors(
        test2Facet.address
      );
      assert.sameMembers(result, selectors);
    });

    it("should remove some test1 functions", async () => {
      const test1Facet = await ethers.getContractAt(
        "Test1Facet",
        diamondAddress
      );
      const functionsToKeep = [
        "test1Func2()",
        "test1Func11()",
        "test1Func12()",
      ];
      const selectors = getSelectors(test1Facet).remove(functionsToKeep);
      tx = await diamondCutFacet.diamondCut(
        [
          {
            facetAddress: ethers.constants.AddressZero,
            action: FacetCutAction.Remove,
            functionSelectors: selectors,
          },
        ],
        ethers.constants.AddressZero,
        "0x",
        { gasLimit: 800000 }
      );
      receipt = await tx.wait();
      if (!receipt.status) {
        throw Error(`Diamond upgrade failed: ${tx.hash}`);
      }
      result = await diamondLoupeFacet.facetFunctionSelectors(addresses[3]);
      assert.sameMembers(result, getSelectors(test1Facet).get(functionsToKeep));
    });
  });
});

describe("Token Price Test", async () => {
  let tokenPrice: Contract;
  let owner: SignerWithAddress, addr1: SignerWithAddress;

  beforeEach(async () => {
    // get signers
    [owner, addr1] = await ethers.getSigners();
    const TokenPrice = await ethers.getContractFactory("TokenPrice");
    tokenPrice = await TokenPrice.deploy();
    await tokenPrice.deployed();
  });

  describe("Handle token price test", async () => {
    const price1 = BigNumber.from("1000000000000000000");
    const price2 = BigNumber.from("2000000000000000000");
    const price3 = BigNumber.from("1500000000000000000");

    it("Set token price", async () => {
      // set token price on 2022-01-01
      await expect(tokenPrice.setPrice(price1, 2022, 1, 1)).to.emit(
        tokenPrice,
        "SetTokenPrice"
      );
    });

    it("Get token price", async () => {
      await tokenPrice.setPrice(price1, 2022, 1, 1); // set token price on 2022-01-01
      await expect(await tokenPrice.getPrice(2022, 1, 1)).to.equal(price1);
    });

    it("Calculate average token price", async () => {
      await tokenPrice.setPrice(price1, 2022, 1, 1); // 2022-01-01    -   token price 1 ether
      await tokenPrice.setPrice(price2, 2022, 2, 15); // 2022-02-15   -   token price 2 ether
      await tokenPrice.setPrice(price3, 2022, 3, 1); // 2022-03-01    -   token price 1.5 ether

      // get average token price from Jan 2022 to Feb 2022
      await expect(
        await tokenPrice.getAvgTokenPrice(2022, 1, 2022, 2)
      ).to.equal(price1.add(price2).div(2));
    });

    it("The date parameter of setTokenPrice function should be after 1970-01-01", async () => {
      // set token price on 1960-01-01
      await expect(tokenPrice.setPrice(price1, 1960, 1, 1)).to.be.revertedWith(
        "The date should be after 1970-01-01"
      );
    });

    it("Can't get token price on unset day", async () => {
      await expect(tokenPrice.getPrice(2021, 1, 1)).to.be.revertedWith(
        "Token price on this day hasn't been set"
      );
    });

    it("Get average price transaction will be reverted if End date earlier than Start date", async () => {
      await tokenPrice.setPrice(price1, 2022, 1, 1); // 2022-01-01    -   token price 1 ether
      await tokenPrice.setPrice(price2, 2022, 2, 15); // 2022-02-15   -   token price 2 ether

      await expect(
        tokenPrice.getAvgTokenPrice(2022, 1, 2021, 12)
      ).to.be.revertedWith("Start date must be earlier than End date");
    });

    it("Get avaerage price transaction will be reverted if there is any token price in range", async () => {
      await expect(
        tokenPrice.getAvgTokenPrice(2022, 1, 2022, 2)
      ).to.be.revertedWith("No token prices in range");
    });
  });
});
