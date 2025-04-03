// Updated version using the 'pages' directory structure for Vercel compatibility
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Web3 from "web3";
import { useSearchParams } from "next/navigation";

const CONTRACT_ADDRESS = "0xe0711cc6FbF29F01581EB00149532E767EcAd741";
const ABI = [
  {
    inputs: [],
    name: "stake",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "stakes",
    outputs: [
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "uint256", name: "timestamp", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  }
];

export default function Home() {
  const [amount, setAmount] = useState("");
  const [wallet, setWallet] = useState(null);
  const [stakeData, setStakeData] = useState({ amount: 0, timestamp: 0 });
  const searchParams = useSearchParams();

  const web3 = typeof window !== "undefined" && new Web3(window.ethereum);

  const connectWallet = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setWallet(accounts[0]);
      toast.success("Wallet connected");
    } else {
      toast.error("MetaMask not detected");
    }
  };

  const fetchStake = async () => {
    if (!wallet) return;
    const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);
    const stake = await contract.methods.stakes(wallet).call();
    setStakeData({
      amount: web3.utils.fromWei(stake.amount, "ether"),
      timestamp: stake.timestamp
    });
  };

  useEffect(() => {
    if (wallet) fetchStake();
  }, [wallet]);

  const stakeBNB = async () => {
    if (!wallet) return toast.error("Connect your wallet first");
    const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);
    const ref = searchParams.get("ref");
    try {
      await contract.methods.stake().send({
        from: wallet,
        value: web3.utils.toWei(amount, "ether")
      });
      toast.success("Staked successfully");
      fetchStake();
    } catch (err) {
      toast.error("Staking failed");
      console.error(err);
    }
  };

  const withdrawBNB = async () => {
    if (!wallet) return toast.error("Connect your wallet first");
    const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);
    try {
      await contract.methods.withdraw().send({ from: wallet });
      toast.success("Withdraw successful");
      fetchStake();
    } catch (err) {
      toast.error("Withdraw failed");
      console.error(err);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">QARI Staking Dashboard</h1>
      <Card className="mb-4">
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <Label>Amount to Stake (BNB)</Label>
            <Input
              placeholder="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
            />
          </div>
          <Button onClick={stakeBNB}>Stake Now</Button>
          <Button onClick={withdrawBNB} variant="outline">Withdraw</Button>
          <Button variant="secondary" onClick={connectWallet}>
            {wallet ? wallet.slice(0, 6) + "..." + wallet.slice(-4) : "Connect Wallet"}
          </Button>
          <div className="text-sm pt-2">
            <p><strong>Your Stake:</strong> {stakeData.amount} BNB</p>
            <p><strong>Staked Since:</strong> {stakeData.timestamp !== "0" ? new Date(stakeData.timestamp * 1000).toLocaleString() : "-"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
