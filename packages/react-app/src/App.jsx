import { Button, Col, Menu, Row, Spin } from "antd";
import "antd/dist/antd.css";

import { useBalance, useContractLoader, useGasPrice, useOnBlock, useUserProviderAndSigner } from "eth-hooks";
import { useEventListener } from "eth-hooks/events/useEventListener";
import { useExchangeEthPrice } from "eth-hooks/dapps/dex";

import React, { useCallback, useEffect, useState, createContext, useMemo } from "react";
import { BrowserRouter, Link, Route, Switch, useLocation } from "react-router-dom";
import { useStaticJsonRPC } from "./hooks";
import { Web3ModalSetup } from "./helpers";
import "./App.css";
import {
  Account,
  Contract,
  Faucet,
  GasGauge,
  Header,
  Ramp,
  ThemeSwitch,
  FaucetHint,
  NetworkSwitch,
} from "./components";
import { Transactor } from "./helpers";
import StackGrid from "react-stack-grid";
import CustomNetworkDisplay from "./components/CustomKit/CustomNetworkDisplay";
import { NETWORKS, ALCHEMY_KEY } from "./constants";
import { useWindowWidth } from "@react-hook/window-size";

// contracts
import externalContracts from "./contracts/external_contracts";
import deployedContracts from "./contracts/hardhat_contracts.json";
import { softTextColor, swapGradient } from "./styles";
import CustomAccount from "./components/CustomKit/CustomAccount";
import CustomHeader from "./components/CustomKit/CustomHeader";
import assets from "./assets.js";
import Mine from "./components/Grabable/Mine";
import Grabs from "./components/Grabable/Grabs";
import Grabable from "./components/Grabable/Grabable";

const { ethers } = require("ethers");

const { BufferList } = require("bl");
// https://www.npmjs.com/package/ipfs-http-client
const ipfsAPI = require("ipfs-http-client");

const ipfs = ipfsAPI({ host: "ipfs.infura.io", port: "5001", protocol: "https" });

console.log("📦 Assets: ", assets);
const getFromIPFS = async hashToGet => {
  for await (const file of ipfs.get(hashToGet)) {
    console.log(file.path);
    if (!file.content) continue;
    const content = new BufferList();
    for await (const chunk of file.content) {
      content.append(chunk);
    }
    console.log(content);
    return content;
  }
};

/// 📡 What chain are your contracts deployed to?
const defaultTargetNetwork = NETWORKS.localhost; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)

// 😬 Sorry for all the console logging
const DEBUG = true;
const NETWORKCHECK = true;

const web3Modal = Web3ModalSetup();

// 🛰 providers
const providers = [
  "https://eth-mainnet.gateway.pokt.network/v1/lb/611156b4a585a20035148406",
  `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`,
  "https://rpc.scaffoldeth.io:48544",
];

export const AppContext = createContext({});
export const ThemeContext = createContext({
  theme: "",
  setTheme: () => {},
});
export const LayoutContext = createContext({});

const App = props => {
  const windowWidth = useWindowWidth();

  // specify all the chains your app is available on. Eg: ['localhost', 'mainnet', ...otherNetworks ]
  // reference './constants.js' for other networks
  const networkOptions = ["localhost", "mainnet", "rinkeby"];

  const [injectedProvider, setInjectedProvider] = useState();
  const [address, setAddress] = useState();
  const selectedNetworkOption = networkOptions.includes(defaultTargetNetwork.name)
    ? defaultTargetNetwork.name
    : networkOptions[0];
  const [selectedNetwork, setSelectedNetwork] = useState(selectedNetworkOption);
  const location = useLocation();

  /// 📡 What chain are your contracts deployed to?
  const targetNetwork = NETWORKS[selectedNetwork]; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)

  // 🔭 block explorer URL
  const blockExplorer = targetNetwork.blockExplorer;

  // load all your providers
  const localProvider = useStaticJsonRPC([
    process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : targetNetwork.rpcUrl,
  ]);
  const mainnetProvider = useStaticJsonRPC(providers);

  if (DEBUG) console.log(`Using ${selectedNetwork} network`);

  // 🛰 providers
  if (DEBUG) console.log("📡 Connecting to Mainnet Ethereum");

  const logoutOfWeb3Modal = async () => {
    await web3Modal.clearCachedProvider();
    if (injectedProvider && injectedProvider.provider && typeof injectedProvider.provider.disconnect == "function") {
      await injectedProvider.provider.disconnect();
    }
    setTimeout(() => {
      window.location.reload();
    }, 1);
  };

  /* 💵 This hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangeEthPrice(targetNetwork, mainnetProvider);

  /* 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = useGasPrice(targetNetwork, "fast");
  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userProviderAndSigner = useUserProviderAndSigner(injectedProvider, localProvider);
  const userSigner = userProviderAndSigner.signer;

  useEffect(() => {
    async function getAddress() {
      if (userSigner) {
        const newAddress = await userSigner.getAddress();
        setAddress(newAddress);
      }
    }
    getAddress();
  }, [userSigner]);

  // You can warn the user if you would like them to be on a specific network
  const localChainId = localProvider && localProvider._network && localProvider._network.chainId;
  const selectedChainId =
    userSigner && userSigner.provider && userSigner.provider._network && userSigner.provider._network.chainId;

  // For more hooks, check out 🔗eth-hooks at: https://www.npmjs.com/package/eth-hooks

  // The transactor wraps transactions and provides notificiations
  const tx = Transactor(userSigner, gasPrice);

  // Faucet Tx can be used to send funds from the faucet
  const faucetTx = Transactor(localProvider, gasPrice);

  let yourLocalBalance;
  try {
    // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
    yourLocalBalance = useBalance(localProvider, address);
  } catch (e) {
    // just in order to keep the react app from crashing
    console.log(e);
  }

  // Just plug in different 🛰 providers to get your balance on different chains:
  const yourMainnetBalance = useBalance(mainnetProvider, address);

  const contractConfig = { deployedContracts: deployedContracts || {}, externalContracts: externalContracts || {} };

  // Load in your local 📝 contract and read a value from it:
  const readContracts = useContractLoader(localProvider, contractConfig);

  // If you want to make 🔐 write transactions to your contracts, use the userSigner:
  const writeContracts = useContractLoader(userSigner, contractConfig, localChainId);

  // EXTERNAL CONTRACT EXAMPLE:
  //
  // If you want to bring in the mainnet DAI contract it would look like:
  // const mainnetContracts = useContractLoader(mainnetProvider, contractConfig);

  // If you want to call a function on a new block
  useOnBlock(mainnetProvider, () => {
    console.log(`⛓ A new mainnet block is here: ${mainnetProvider._lastBlockNumber}`);
  });

  // Then read your DAI balance like:
  // const myMainnetDAIBalance = useContractReader(mainnetContracts, "DAI", "balanceOf", [
  //   "0x34aA3F359A9D614239015126635CE7732c18fDF3",
  // ]);

  // LOAD DATA FROM ALL
  const [fetchingMD, setFetchingMD] = useState(false);
  const [metadata, setMetadata] = useState();
  useEffect(() => {
    const getEm = async () => {
      try {
        let mdAll = Object.keys(assets).map(k => ({ ipfsHash: k, uriHash: ethers.utils.id(k) }));

        const getEmProms = mdAll.map(g => getFromIPFS(g.ipfsHash));

        const jsonManifestBuffers = await Promise.all(getEmProms);

        mdAll = mdAll.map((md, idx) => {
          const jsonManifest = JSON.parse(jsonManifestBuffers[idx].toString());
          return { ...md, ...jsonManifest };
        });

        setMetadata(mdAll);
      } catch (e) {
        console.error(e);
      } finally {
        setFetchingMD(false);
      }
    };
    if (!metadata && !fetchingMD && assets) {
      setFetchingMD(true);
      getEm();
    }
  }, [assets]);

  const [fetchingNfts, setFetchingNfts] = useState();
  const [grabables, setGrabables] = useState([]);

  const getCurrentGrabables = () => grabables;

  const updateGrabables = async () => {
    setFetchingNfts(true);
    try {
      const getGrabable = async md => {
        const isMintable = await readContracts.Grabable.mintable(md.uriHash);
        if (isMintable) return { ...md, isMintable: true };

        const tokenDetails = await readContracts.Grabable.getTokenDataByUriHash(md.uriHash);
        const tokenId = tokenDetails[0];
        const tokenURI = tokenDetails[1];
        const owner = tokenDetails[2];
        const grabPrice = tokenDetails[3];
        const premium = tokenDetails[4];
        return { ...md, tokenId, tokenURI, owner, grabPrice, premium };
      };
      // metadata.forEach(md => {
      //   getGrabable(md).then(grb => {
      //     const currentGrbs = getCurrentGrabables();
      //     const currentIdx = currentGrbs.indexOf(grb => grb.ipfsHash === md.ipfsHash);
      //     debugger;
      //     const copy = [...currentGrbs];
      //     if (currentIdx > -1) {
      //       copy.splice(currentIdx, 1, grb);
      //     } else {
      //       copy.push(grb);
      //     }
      //     setGrabables(copy);
      //   });
      // });
      const grbProms = metadata.map(md => getGrabable(md));
      const grbs = await Promise.all(grbProms);
      setGrabables(grbs);
    } catch (e) {
      console.log(e);
    } finally {
      setFetchingNfts(false);
    }
  };

  // INITIAL FETCH
  useEffect(() => {
    const shouldFetch =
      grabables && grabables.length === 0 && !fetchingNfts && metadata && readContracts && readContracts.Grabable;
    if (!shouldFetch) return;
    updateGrabables();
  }, [grabables, readContracts, metadata]);

  // 📟 Listen for broadcast events
  const transferEvents = useEventListener(readContracts, "Grabable", "Transfer", localProvider, 1);
  // console.log("📟 Transfer events:", transferEvents);

  // SUBSEQUENT FETCHES
  useEffect(() => {
    if (!grabables || !grabables.length) return;
    updateGrabables();
  }, [transferEvents]);

  //
  // 🧫 DEBUG 👨🏻‍🔬
  //
  useEffect(() => {
    if (
      DEBUG &&
      mainnetProvider &&
      address &&
      selectedChainId &&
      yourLocalBalance &&
      yourMainnetBalance &&
      readContracts &&
      writeContracts
      // mainnetContracts
    ) {
      console.log("_____________________________________ 🏗 scaffold-eth _____________________________________");
      // console.log("🌎 mainnetProvider", mainnetProvider);
      // console.log("🏠 localChainId", localChainId);
      // console.log("👩‍💼 selected address:", address);
      // console.log("🕵🏻‍♂️ selectedChainId:", selectedChainId);
      // console.log("💵 yourLocalBalance", yourLocalBalance ? ethers.utils.formatEther(yourLocalBalance) : "...");
      // console.log("💵 yourMainnetBalance", yourMainnetBalance ? ethers.utils.formatEther(yourMainnetBalance) : "...");
      // console.log("📝 readContracts", readContracts);
      // // console.log("🌍 DAI contract on mainnet:", mainnetContracts);
      // // console.log("💵 yourMainnetDAIBalance", myMainnetDAIBalance);
      // console.log("🔐 writeContracts", writeContracts);
    }
  }, [
    mainnetProvider,
    address,
    selectedChainId,
    yourLocalBalance,
    yourMainnetBalance,
    readContracts,
    writeContracts,
    // mainnetContracts,
  ]);

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new ethers.providers.Web3Provider(provider));

    provider.on("chainChanged", chainId => {
      console.log(`chain changed to ${chainId}! updating providers`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    provider.on("accountsChanged", () => {
      console.log(`account changed!`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    // Subscribe to session disconnection
    provider.on("disconnect", (code, reason) => {
      console.log(code, reason);
      logoutOfWeb3Modal();
    });
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  // const [route, setRoute] = useState();
  // useEffect(() => {
  //   setRoute(window.location.pathname);
  // }, [setRoute]);

  const faucetAvailable = localProvider && localProvider.connection && targetNetwork.name.indexOf("local") !== -1;

  const readyAll = readContracts && readContracts.Grabable && address && localProvider && yourLocalBalance;

  const appContext = {
    contractConfig,
    readContracts,
    writeContracts,
    userSigner,
    localProvider,
    userAddress: address,
    tx,
    userEthBalance: yourLocalBalance,
    price,
    gasPrice,
    localChainId,
    blockExplorer,
  };

  const layoutContext = {
    windowWidth,
  };

  const [theme, setTheme] = useState(window.localStorage.getItem("theme"));
  const themeContext = useMemo(() => ({ theme, setTheme }), [theme]);
  return (
    <LayoutContext.Provider value={layoutContext}>
      <ThemeContext.Provider value={themeContext}>
        <AppContext.Provider value={appContext}>
          <div className="App">
            {/* ✏️ Edit the header and change the title to your project name */}

            <div
              style={{
                width: "fit-content",
                borderRight: "1px solid #efefef",
                borderBottom: "1px solid #efefef",
                background: swapGradient,
              }}
            >
              <Link to="/">
                <CustomHeader />
              </Link>
            </div>

            <Link to="/contracts">
              <Button
                type="default"
                style={{
                  position: "absolute",
                  bottom: "2.5rem",
                  right: "0rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0.8,
                  boxShadow: "0 3px 5px 1px #eaeaea",
                  zIndex: 10,
                }}
              >
                <div style={{ fontSize: "1rem", color: softTextColor }}>
                  <span style={{ marginRight: "0.75rem", fontSize: "0.875rem" }}>🛠</span>Debug
                </div>
              </Button>
            </Link>

            <Menu style={{ textAlign: "center" }} selectedKeys={[location.pathname]} mode="horizontal">
              <Menu.Item key="/">
                <Link to="/">Collection</Link>
              </Menu.Item>
              <Menu.Item key="/mygrabables">
                <Link to="/mygrabables">Mine</Link>
              </Menu.Item>
              <Menu.Item key="/transfers">
                <Link to="/">Transfers</Link>
              </Menu.Item>
            </Menu>

            <div className="AppScroller">
              <Switch>
                <Route exact path="/">
                  <div style={{ margin: "auto", textAlign: "center", padding: "3rem 0 2rem", fontSize: "1.5rem" }}>
                    Collection X
                  </div>
                  {(!grabables || grabables.length === 0) && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                        gap: "1rem",
                        paddingTop: "20vh",
                      }}
                    >
                      <Spin size="large" />
                      <div style={{ color: softTextColor, fontSize: "1.25rem" }}>Loading...</div>
                    </div>
                  )}
                  {grabables && grabables.length > 0 && (
                    <div style={{ maxWidth: 964, margin: "auto", marginTop: "2rem", paddingBottom: "16rem" }}>
                      <StackGrid columnWidth={260} gutterWidth={32} gutterHeight={32}>
                        {grabables ? grabables.map(g => <Grabable grabable={g} key={g.ipfsHash} />) : []}
                      </StackGrid>
                    </div>
                  )}
                </Route>

                <Route path="/mygrabables">
                  <div style={{ width: "40rem", margin: "auto", marginTop: "4rem", paddingBottom: "2rem" }}>
                    <Mine grabables={grabables} />
                  </div>
                </Route>

                <Route path="/transfers">
                  <div style={{ width: "38rem", margin: "auto", marginTop: "2rem", paddingBottom: "2rem" }}>
                    <Grabs transferEvents={transferEvents} />
                  </div>
                </Route>

                <Route path="/contracts">
                  <Contract
                    name="Grabable"
                    signer={userSigner}
                    provider={localProvider}
                    address={address}
                    blockExplorer={blockExplorer}
                    contractConfig={contractConfig}
                  />
                </Route>
              </Switch>
            </div>

            <ThemeSwitch />

            {/* 👨‍💼 Your account is in the top right with a wallet at connect options */}
            <div
              style={{
                position: "fixed",
                textAlign: "right",
                right: 0,
                top: 0,
                padding: "0.5rem 1rem",

                height: 55,
              }}
              className="hud hudTop"
            >
              <div style={{ display: "flex", flex: 1, gap: "1rem", alignItems: "center" }}>
                <div>
                  <NetworkSwitch
                    networkOptions={networkOptions}
                    selectedNetwork={selectedNetwork}
                    setSelectedNetwork={setSelectedNetwork}
                  />
                </div>
                <CustomAccount
                  address={address}
                  localProvider={localProvider}
                  userSigner={userSigner}
                  mainnetProvider={mainnetProvider}
                  price={price}
                  web3Modal={web3Modal}
                  loadWeb3Modal={loadWeb3Modal}
                  logoutOfWeb3Modal={logoutOfWeb3Modal}
                  blockExplorer={blockExplorer}
                  connectedNetworkDisplay={
                    injectedProvider && (
                      <CustomNetworkDisplay
                        NETWORKCHECK={NETWORKCHECK}
                        localChainId={localChainId}
                        selectedChainId={selectedChainId}
                        targetNetwork={targetNetwork}
                        logoutOfWeb3Modal={logoutOfWeb3Modal}
                      />
                    )
                  }
                />
              </div>
              <div style={{ position: "absolute", right: "6.4rem" }}>
                {userSigner && (
                  <FaucetHint localProvider={localProvider} targetNetwork={targetNetwork} address={address} />
                )}
              </div>
            </div>

            {/* 🗺 Extra UI like gas price, eth price, faucet, and support: */}
            <div
              style={{ position: "fixed", textAlign: "left", left: 0, bottom: 20, padding: 10 }}
              className="hud hudBottom"
            >
              <Row align="middle" gutter={[4, 4]}>
                <Col span={8}>
                  <Ramp price={price} address={address} networks={NETWORKS} />
                </Col>

                <Col span={8} style={{ textAlign: "center", opacity: 0.8 }}>
                  <GasGauge gasPrice={gasPrice} />
                </Col>
                <Col span={8} style={{ textAlign: "center", opacity: 1 }}>
                  <Button
                    onClick={() => {
                      window.open("https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA");
                    }}
                    size="large"
                    shape="round"
                  >
                    <span style={{ marginRight: 8 }} role="img" aria-label="support">
                      💬
                    </span>
                    Support
                  </Button>
                </Col>
              </Row>

              <Row align="middle" gutter={[4, 4]}>
                <Col span={24}>
                  {
                    /*  if the local provider has a signer, let's show the faucet:  */
                    faucetAvailable ? (
                      <Faucet localProvider={localProvider} price={price} ensProvider={mainnetProvider} />
                    ) : (
                      ""
                    )
                  }
                </Col>
              </Row>
            </div>
          </div>
        </AppContext.Provider>
      </ThemeContext.Provider>
    </LayoutContext.Provider>
  );
};

export default App;
