import React, { useEffect, useState } from "react";
import myEpicNft from './utils/MyEpicNFTv3.json';
import './styles/App.css';
import { ethers } from "ethers";
import twitterLogo from './assets/twitter-logo.svg';

const TWITTER_HANDLE = 'senjoenyawd';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = '';
const TOTAL_MINT_COUNT = 50;
const CONTRACT_ADDRESS = "0x259AA691E1F636b256322e37cc5178a13A3128Cf";
const OPENSEA_URL = 'https://testnets.opensea.io/collection/squarenft-ogdxahommo'

const App = () => {
  const [numMinted, setNumMinted] = useState(0)
  const [currentAccount, setCurrentAccount] = useState("");

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account)
      // Setup listener! This is for the case where a user comes to our site
      // and connected their wallet for the first time.
      setupEventListener()
    } else {
      console.log("No authorized account found")
    }
  }

  /*
  * Confirm we are connected to Rinkeby
  */
  const confirmNetwork = async () => {
      let chainId = await ethereum.request({ method: 'eth_chainId' });
      console.log("Connected to chain " + chainId);

      // String, hex code of the chainId of the Rinkebey test network
      // https://docs.metamask.io/guide/ethereum-provider.html#chain-ids
      // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-695.md
      const rinkebyChainId = "0x4";
      if (chainId !== rinkebyChainId) {
        alert("You are not connected to the Rinkeby Test Network!");
        return true
      }

      return false

  }

  /*
  * Get num of mints left
  */
  const availableMints = async () => {
    //try {
      const { ethereum } = window;
      let _bigNumMinted, _numMinted;

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);

        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, provider);

        _bigNumMinted = await connectedContract.numMinted()
        _numMinted = _bigNumMinted.toNumber()
        console.log("_bigNumMinted", _bigNumMinted)
        console.log("_numMinted", _numMinted)
        setNumMinted(_numMinted)


      } else {
        console.log("Ethereum object doesn't exist!. Cannot check for available Mints");
      }
    // } catch (error) {
    //   console.log(error)
    // }
  }

  /*
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      /*
      * Fancy method to request access to account.
      */
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      /*
      * Boom! This should print out public address once we authorize Metamask.
      */
      console.log("Connected", accounts[0]);

      setCurrentAccount(accounts[0]);
      // Setup listener! This is for the case where a user comes to our site
      // and connected their wallet for the first time.
      setupEventListener()
    } catch (error) {
      console.log(error)
    }
  }
  // Setup our listener.
  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {

        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        });

        console.log("Setup event listener!")

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const askContractToMintNft = async () => {

    try {
      let noopt
      const { ethereum } = window;

      if (ethereum) {

        noopt = await confirmNetwork()
        if (noopt){
          return
        }

        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        console.log("Going to pop wallet now to pay gas...")
        let nftTxn = await connectedContract.makeAnEpicNFT();

        console.log("Mining...please wait.")
        await nftTxn.wait();

        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);

        availableMints()
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  useEffect(() => {
    checkIfWalletIsConnected();
    availableMints()
  }, [])

  /*
  * Added a conditional render! We don't want to show Connect to Wallet if we're already conencted :).
  */
  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {currentAccount === ""
            ? renderNotConnectedContainer()
            : (
              /** Add askContractToMintNft Action for the onClick event **/
              <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
                Mint NFT
              </button>
            )
          }

         <p>
            <button className="opensea-button" onClick={()=>location.href=OPENSEA_URL}> ???? View Collection on OpenSea</button>
         </p>
         <p className="sub-text">
            {numMinted}/150 Minted!
         </p>
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE} with @_buildspace`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;