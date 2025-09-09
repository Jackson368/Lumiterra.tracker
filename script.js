async function fetchData() {
  const walletAddress = document.getElementById("walletAddress")?.value;
  const resultsElement = document.getElementById("results");

  // Check if DOM elements exist
  if (!walletAddress || !resultsElement) {
    console.error("DOM Error: walletAddress or results element not found.");
    if (resultsElement) {
      resultsElement.innerText = "Error: Page elements not found. Check HTML structure.";
    }
    return;
  }

  const apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImZhZTI5NDk3LWRlNTQtNDQ1YS04Y2Y0LTEwNGQ4OThkNThiOCIsIm9yZ0lkIjoiNDY5OTIzIiwidXNlcklkIjoiNDgzNDIyIiwidHlwZUlkIjoiMTE2N2JlOWMtY2QyOC00OTRiLWI0OGItMGFjOTU1M2MzYTRjIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NTczOTE3MTQsImV4cCI6NDkxMzE1MTcxNH0.S6vA8sJTzcf18BMTumOEa7ylcWLUp-VlawPCM79K87E"; // Replace with your Moralis API key
  // Normalize wallet address for Ronin (replace 0x with ronin:)
  const normalizedAddress = walletAddress.startsWith("0x")
    ? "ronin:" + walletAddress.slice(2)
    : walletAddress;
  const roninUrl = `https://deep-index.moralis.io/api/v2.2/wallets/${normalizedAddress}/history?chain=ronin`;
  const arbitrumUrl = `https://deep-index.moralis.io/api/v2.2/wallets/${walletAddress}/history?chain=arbitrum`;

  // Validate wallet address format
  if (!walletAddress.match(/^(ronin:|0x)[a-fA-F0-9]{40}$/)) {
    resultsElement.innerText = "Invalid wallet address. Use Ronin (ronin:...) or Arbitrum (0x...) format.";
    return;
  }

  resultsElement.innerText = "Loading...";

  try {
    const headers = {
      accept: "application/json",
      "X-API-Key": apiKey,
    };

    // Fetch Ronin transactions
    const roninResponse = await fetch(roninUrl, { headers });
    if (!roninResponse.ok) {
      throw new Error(`Ronin API error: ${roninResponse.status} ${roninResponse.statusText}`);
    }
    const roninData = await roninResponse.json();

    // Fetch Arbitrum transactions
    const arbitrumResponse = await fetch(arbitrumUrl, { headers });
    if (!arbitrumResponse.ok) {
      throw new Error(`Arbitrum API error: ${arbitrumResponse.status} ${arbitrumResponse.statusText}`);
    }
    const arbitrumData = await arbitrumResponse.json();

    // Initialize counters
    let fragmentCount = 0;
    let nftCount = 0;
    let stakeCount = 0;
    let tokenCount = 0;

    // Contract addresses
    const lumiFragmentContract = "0xcc451977a4be9adee892f7e610fe3e3b3927b5a1"; // Ronin, Lumi Fragment NFT
    const mavisMarketplaceContract = "0x3b3adf1422f84254b7fbb0e7ca62bd0865133fe"; // Ronin, Mavis Marketplace
    const stakingContract = "0xC401bd4bcdeD143EE4381756633500Ae3817414E"; // Arbitrum or Ronin
    const luaContract = "0xc3aBC47863524ced8DAf3ef98d74dd881E131C38"; // Arbitrum, LUA
    const ronContract = "RON_TOKEN_ADDRESS"; // Placeholder, find via Roninscan

    // Process Ronin transactions
    if (roninData.result && Array.isArray(roninData.result)) {
      roninData.result.forEach(tx => {
        const toAddress = tx.to_address ? tx.to_address.toLowerCase().replace("ronin:", "0x") : "";
        if (toAddress === lumiFragmentContract.toLowerCase()) fragmentCount++;
        if (toAddress === mavisMarketplaceContract.toLowerCase()) nftCount++;
        if (toAddress === stakingContract.toLowerCase()) stakeCount++;
        if (toAddress === ronContract.toLowerCase()) tokenCount++;
      });
    } else {
      console.warn("No Ronin transactions or unexpected data:", roninData);
    }

    // Process Arbitrum transactions
    if (arbitrumData.result && Array.isArray(arbitrumData.result)) {
      arbitrumData.result.forEach(tx => {
        const toAddress = tx.to_address ? tx.to_address.toLowerCase() : "";
        if (toAddress === luaContract.toLowerCase()) tokenCount++;
        if (toAddress === stakingContract.toLowerCase()) stakeCount++;
      });
    } else {
      console.warn("No Arbitrum transactions or unexpected data:", arbitrumData);
    }

    // Update the webpage
    document.getElementById("fragmentCount").innerText = fragmentCount;
    document.getElementById("nftCount").innerText = nftCount;
    document.getElementById("stakeCount").innerText = stakeCount;
    document.getElementById("tokenCount").innerText = tokenCount;
  } catch (error) {
    resultsElement.innerText = `Error fetching data: ${error.message}`;
    console.error("API Error:", error);
  }
}