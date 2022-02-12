import React, { useMemo } from 'react';
import {
    ConnectionProvider,
    WalletProvider,
    // useConnection
} from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
    // getLedgerWallet,
    getPhantomWallet,
    // getSlopeWallet,
    // getSolflareWallet,
    // getSolletExtensionWallet,
    // getSolletWallet,
    // getTorusWallet,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

import Home from './Home';
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';

// Default styles that can be overridden by your app
require('@solana/wallet-adapter-react-ui/styles.css');

const App = () => {
    // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
    const network = WalletAdapterNetwork.Devnet;

    // You can also provide a custom RPC endpoint
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking --
    // Only the wallets you configure here will be compiled into your application
    const wallets = useMemo(() => [
        getPhantomWallet(),
        // getSlopeWallet(),
        // getSolflareWallet(),
        // getTorusWallet({
        //     options: { clientId: 'Get a client ID @ https://developer.tor.us' }
        // }),
        // getLedgerWallet(),
        // getSolletWallet({ network }),
        // getSolletExtensionWallet({ network }),
    ], [network]);

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <Home />
            </WalletProvider>
        </ConnectionProvider>
    );
};

export default App;