require("dotenv").config();
const { ethers } = require("ethers");

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const usdcAddress = process.env.USDC_CONTRACT;
const daiAddress = process.env.DAI_CONTRACT;
const ammalgamPairAddress = process.env.AMMALGAM_PAIR;

const erc20ABI = [
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function balanceOf(address owner) public view returns (uint256)",
  "function transfer(address recipient, uint256 amount) public returns (bool)"
];

const ammalgamPairABI = [
  "function deposit(address to) external"
];

async function main() {
  try {
    console.log('a');
    const usdc = new ethers.Contract(usdcAddress, erc20ABI, wallet);
    const dai = new ethers.Contract(daiAddress, erc20ABI, wallet);
    const ammalgamPair = new ethers.Contract(ammalgamPairAddress, ammalgamPairABI, wallet);


    const depositAmount = ethers.utils.parseUnits("100", 6);
    console.log('b');


    const usdcBalance = await usdc.balanceOf(wallet.address);
    console.log(usdcBalance);
    const daiBalance = await dai.balanceOf(wallet.address);
    
    if (usdcBalance.lt(depositAmount) || daiBalance.lt(depositAmount)) {
      console.error("Not enough USDC or DAI to deposit.");
      return;
    }

    console.log("Approving USDC & DAI for deposit...");

    const approveUSDC = await usdc.approve(ammalgamPairAddress, depositAmount);
    await approveUSDC.wait();
    const approveDAI = await dai.approve(ammalgamPairAddress, depositAmount);
    await approveDAI.wait();

    console.log("USDC & DAI approved. Depositing...");

    const tx = await ammalgamPair.deposit(wallet.address);
    await tx.wait();

    console.log("Deposit successful!");

  } catch (error) {
    console.error("Error in deposit process:", error);
  }
}




main();