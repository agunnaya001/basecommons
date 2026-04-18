export function formatWeiToEth(weiStr: string | undefined | null): string {
  if (!weiStr) return "0";
  try {
    const wei = BigInt(weiStr);
    const eth = Number(wei) / 1e18;
    return eth.toLocaleString(undefined, { maximumFractionDigits: 4 });
  } catch (e) {
    return "0";
  }
}

export function parseEthToWei(ethStr: string): string {
  if (!ethStr) return "0";
  try {
    const eth = Number(ethStr);
    if (isNaN(eth)) return "0";
    const wei = BigInt(Math.floor(eth * 1e18));
    return wei.toString();
  } catch (e) {
    return "0";
  }
}

export function truncateAddress(address: string | undefined | null): string {
  if (!address) return "";
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// QF Match formula: matching = pool × (√totalDonations + √newDonation)² / sum of all (√totalDonations)²
// This is a simplified client-side estimation
export function estimateMatchIncrease(
  currentProjectDonationsWei: string,
  newDonationWei: string,
  matchingPoolWei: string,
  totalPlatformDonationsWei: string
): string {
  try {
    const currentProjEth = Number(currentProjectDonationsWei) / 1e18;
    const newDonEth = Number(newDonationWei) / 1e18;
    const poolEth = Number(matchingPoolWei) / 1e18;
    const totalEth = Number(totalPlatformDonationsWei) / 1e18;
    
    if (totalEth === 0) return "0";
    
    // Rough estimation matching share calculation
    // Assume project currently has X share, new donation increases its share
    const currentSqrt = Math.sqrt(currentProjEth);
    const newSqrt = Math.sqrt(currentProjEth + newDonEth);
    
    // Assume sum of all sqrts is roughly proportional to total platform donations sqrt
    // This is a gross simplification for the UI demo since we don't have all individual project sqrts
    // In a real app we'd fetch the exact sum of sqrts from the contract or indexer
    const mockSumOfSqrts = Math.sqrt(totalEth) * 2; // Arbitrary multiplier to simulate many projects
    
    const currentMatch = poolEth * (currentSqrt / mockSumOfSqrts);
    const newMatch = poolEth * (newSqrt / mockSumOfSqrts);
    
    const increaseEth = Math.max(0, newMatch - currentMatch);
    
    return parseEthToWei(increaseEth.toString());
  } catch (e) {
    return "0";
  }
}