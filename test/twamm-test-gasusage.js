const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TWAMM", function () {

    let tokenA;
    let tokenB;

    let twamm;

    let owner;
    let addr1;
    let addr2;
    let addrs;

    const blockInterval = 500;

    const initialLiquidityProvided = 100000000;
    const ERC20Supply = ethers.utils.parseUnits("100");

    beforeEach(async function () {

        await network.provider.send("evm_setAutomine", [true]);
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

        const ERC20Factory =  await ethers.getContractFactory("ERC20Mock");
        tokenA = await ERC20Factory.deploy("TokenA", "TokenA", ERC20Supply);
        tokenB = await ERC20Factory.deploy("TokenB", "TokenB", ERC20Supply);

        const TWAMMFactory = await ethers.getContractFactory("TWAMM")

        twamm = await TWAMMFactory.deploy(
              "TWAMM"
            , "TWAMM"
            , tokenA.address
            , tokenB.address
            , blockInterval);

        tokenA.approve(twamm.address, ERC20Supply);
        tokenB.approve(twamm.address, ERC20Supply);

        await twamm.provideInitialLiquidity(initialLiquidityProvided,initialLiquidityProvided);
    });

    describe("estimateGas", function () {
		it("Swaps", async function () {
			const amountIn = 1000000;
			await tokenA.transfer(addr1.address, amountIn);
			await tokenB.transfer(addr2.address, amountIn);

			//trigger long term order
			await tokenA.connect(addr1).approve(twamm.address, amountIn);
			await tokenB.connect(addr2).approve(twamm.address, amountIn);

			console.log("estimateGas swap 0 LTS + 1 eVTOE:"+(await twamm.estimateGas.swapFromAToB(1000000,1)));
			await mineBlocks(blockInterval);
			console.log("estimateGas swap 0 LTS + 2 eVTOE:"+(await twamm.estimateGas.swapFromAToB(1000000,1)));
			await mineBlocks(blockInterval);
			console.log("estimateGas swap 0 LTS + 3 eVTOE:"+(await twamm.estimateGas.swapFromAToB(1000000,1)));
			await twamm.connect(addr1).longTermSwapFromAToB(amountIn, 10);
			await mineBlocks(1);
			console.log("estimateGas swap 1 LTS + 1 eVTOE:"+(await twamm.estimateGas.swapFromAToB(1000000,1)));
			await mineBlocks(blockInterval);
			console.log("estimateGas swap 1 LTS + 2 eVTOE:"+(await twamm.estimateGas.swapFromAToB(1000000,1)));
			await mineBlocks(blockInterval);
			console.log("estimateGas swap 1 LTS + 3 eVTOE:"+(await twamm.estimateGas.swapFromAToB(1000000,1)));
			await twamm.connect(addr2).longTermSwapFromBToA(amountIn, 10);
			await mineBlocks(1);
			console.log("estimateGas swap 2 LTS + 1 eVTOE:"+(await twamm.estimateGas.swapFromAToB(1000000,1)));
			await mineBlocks(blockInterval);
			console.log("estimateGas swap 2 LTS + 2 eVTOE:"+(await twamm.estimateGas.swapFromAToB(1000000,1)));
			await mineBlocks(blockInterval);
			console.log("estimateGas swap 2 LTS + 3 eVTOE:"+(await twamm.estimateGas.swapFromAToB(1000000,1)));

		});
    });
});

async function mineBlocks(blockNumber) {
    for(let i = 0; i < blockNumber; i++) {
        await network.provider.send("evm_mine")
    }
}
