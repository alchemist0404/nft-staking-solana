import {
    useEffect,
    useState
} from 'react';
import * as anchor from "@project-serum/anchor";
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
    PublicKey,
    SystemProgram,
    SYSVAR_CLOCK_PUBKEY
} from '@solana/web3.js';

import * as borsh from 'borsh';

import {
    Container,
    Row,
} from 'reactstrap';
import axios from 'axios';
import {
    getParsedNftAccountsByOwner,
    // isValidSolanaAddress,
} from "@nfteyez/sol-rayz";

import { TOKEN_PROGRAM_ID, Token } from "@solana/spl-token";
// import { getOrCreateAssociatedTokenAccount } from './libs/getOrCreateAssociatedTokenAccount'
import { createTokenAccount } from './libs/createTokenAccount'

import { METADATA_SCHEMA, Metadata } from "./types.ts";
import idl from './assets/nft_staking.json'

import {
    WalletModalProvider,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import {
    poolPublicKey,
    mintRewardsPublicKey,
    // lpMintPublicKey,
    funderPublicKey
} from "./config";
import MyNFTs from './components/MyNFTs';
import InStake from './components/InStake';
import Rewards from './components/Rewards';

const opts = {
    preflightCommitment: "processed"
}

const programID = new PublicKey("AttW35qLqFGmzDrPqVZxFW74LMVgF8rjFpEYFJ6HoQvn");

const Home = () => {

    const [nftData, setNftData] = useState([]);
    const [stakedNftData, setStakedNftData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [
        rewardInterval,
        // setRewardInterval
    ] = useState(null);
    const [provider, setProvider] = useState(null);
    const [program, setProgram] = useState(null);
    const [pendingRewards, setPendingRewards] = useState(0);
    const [stakeUser, setStakeUser] = useState(null);
    const [totalStaked, setTotalStaked] = useState(0);
    const [dailyRewards, setDailyRewards] = useState(0);

    const [activeTab, setActiveTab] = useState(0);

    const { connection } = useConnection();
    const { publicKey, signTransaction } = useWallet();
    const wallet = useWallet();

    async function getProvider() {
        const provider = new anchor.Provider(
            connection, wallet, opts.preflightCommitment,
        );
        return provider;
    }

    const getAllNftData = async (walletPubKey) => {
        try {
            const nfts = await getParsedNftAccountsByOwner({
                publicAddress: walletPubKey,
                connection: connection,
                serialization: true,
            });

            return nfts;
        } catch (error) {
            console.error(error);
        }
    };

    const getStakedNFTs = async () => {
        // const [
        //     _poolSigner,
        //     _nonce,
        // ] = await PublicKey.findProgramAddress(
        //     [poolPublicKey.toBuffer()],
        //     program.programId
        // );
        // let poolSigner = _poolSigner;
        // const nfts = await getParsedNftAccountsByOwner({
        //     publicAddress: poolSigner,
        //     connection: connection,
        //     serialization: true,
        // });

        try {
            var stakedNfts = [];

            const [
                _userPubkey,
            ] = await PublicKey.findProgramAddress(
                [provider.wallet.publicKey.toBuffer(), poolPublicKey.toBuffer(), (new TextEncoder().encode('user'))],
                program.programId
            );

            const userObject = await program.account.user.fetch(_userPubkey);

            for (let i = 0; i < userObject.nftMints.length; i++) {
                var mDataKey = await getMetadata(userObject.nftMints[i]);

                const metadataObj = await provider.connection.getAccountInfo(
                    mDataKey,
                );
                const metadataDecoded = decodeMetadata(
                    Buffer.from(metadataObj.data),
                );

                metadataDecoded['staked'] = true;
                metadataDecoded['mint'] = userObject.nftMints[i].toBase58();

                stakedNfts.push(metadataDecoded);
            }

            return stakedNfts;
        } catch (err) {
            console.error(err)
            return []
        }

    }

    const getPendingRewardsFunc = async () => {

        var accountFalg = false;
        try {
            const [
                _userPubkey
            ] = await PublicKey.findProgramAddress(
                [provider.wallet.publicKey.toBuffer(), poolPublicKey.toBuffer(), (new TextEncoder().encode('user'))],
                program.programId
            );
            const userObject = await program.account.user.fetch(_userPubkey);
            setStakeUser(userObject);

            if (userObject.nftMints.length > 0) {
                accountFalg = true;
            }
        } catch (err) { }
        if (accountFalg === true) {
            if (rewardInterval) {
                clearInterval(rewardInterval);
            }
            // let rewardIntervalhandle = setInterval(async () => {
            var rewardsVal = await getUserPendingRewardsFunction();
            var val = rewardsVal();
            setPendingRewards((val / anchor.web3.LAMPORTS_PER_SOL).toFixed(1));
            // }, 5000);
            // setRewardInterval(rewardIntervalhandle);
        } else {
            console.log("There is no staked NFTs");
        }
    }

    const setNftTokenData = async (walletPubKey) => {
        try {
            var nftsubData = [];
            nftsubData = await getAllNftData(walletPubKey);
            var data = Object.keys(nftsubData).map((key) => nftsubData[key]);
            let arr = [];
            let stake_arr = [];

            var stakedNFTs = await getStakedNFTs();
            for (let i = 0; i < stakedNFTs.length; i++) {
                let val = {};
                try {
                    val = await axios.get(stakedNFTs[i].data.uri);
                } catch (err) {
                    val = {
                        data: {
                            name: "",
                            count: 0,
                            image: "",
                        }
                    }
                }
                if (stakedNFTs[i].staked !== true) stakedNFTs[i].staked = false;
                val.mint = stakedNFTs[i].mint;
                val.staked = stakedNFTs[i].staked;
                val.creator = stakedNFTs[i].data.creators[0].address;
                val.creators = stakedNFTs[i].data.creators;
                stake_arr.push(val);
            }
            setStakedNftData(stake_arr)

            let n = data.length;
            for (let i = 0; i < n; i++) {
                let val = {};
                try {
                    val = await axios.get(data[i].data.uri);
                } catch (err) {
                    val = {
                        data: {
                            name: "",
                            count: 0,
                            image: "",
                        }
                    }
                }
                if (data[i].staked !== true) data[i].staked = false;
                val.mint = data[i].mint;
                val.staked = data[i].staked;
                val.creator = data[i].data.creators[0].address;
                val.creators = data[i].data.creators;
                arr.push(val);
            }

            setNftData(arr)
        } catch (error) {
            console.error(error);
        }
    };

    const initialize = async () => {

        var cProvider = await getProvider();
        setProvider(cProvider)
        var cProgram = new anchor.Program(idl, programID, cProvider);
        setProgram(cProgram);

    }

    const stakeNFT = async (metaNFT, durDate) => {
        const [
            _vaultPubkey,
            // _vaultNonce,
        ] = await PublicKey.findProgramAddress(
            [funderPublicKey.toBuffer(), poolPublicKey.toBuffer()],
            programID
        );
        let vaultPublicKey = _vaultPubkey;

        const vaultObject = await program.account.vault.fetch(vaultPublicKey);
        vaultObject.candyMachines.map(cm => console.log(cm.toBase58()))
        const nftCreator = vaultObject.candyMachines.find((cm) => cm.toBase58() === metaNFT.creator);

        if (!nftCreator) {
            alert("No match candy machine. Pool has not candymachine id. " + metaNFT.creator);
            return;
        }

        // const poolObject = await program.account.pool.fetch(poolPublicKey);

        var mintPubKey = new PublicKey(metaNFT.mint);

        const [
            userPubkey,
            userNonce
        ] = await PublicKey.findProgramAddress(
            [provider.wallet.publicKey.toBuffer(), poolPublicKey.toBuffer(), (new TextEncoder().encode('user'))],
            program.programId
        );

        let instructions = [];
        var accountFalg = false;
        try {
            const userObject = await program.account.user.fetch(userPubkey);
            if (userObject && userObject.nftMints) {
                accountFalg = true;
            }
        } catch (err) {
            console.log(err)
        }

        if (accountFalg === false) {
            console.log("Create User Staking Account");
            instructions.push(await program.instruction.createUser(userNonce, {
                accounts: {
                    pool: poolPublicKey,
                    user: userPubkey,
                    owner: provider.wallet.publicKey,
                    systemProgram: SystemProgram.programId,
                },
            }));
        }
        console.log("Stake NFT");
        const nftMint = new Token(provider.connection, mintPubKey, TOKEN_PROGRAM_ID, provider.wallet.payer);
        let nftAccount = await nftMint.getOrCreateAssociatedAccountInfo(
            provider.wallet.publicKey,
        );

        let metadata = await getMetadata(nftMint.publicKey);

        const [
            _poolSigner,
            // _nonce,
        ] = await PublicKey.findProgramAddress(
            [poolPublicKey.toBuffer()],
            program.programId
        );
        let poolSigner = _poolSigner;

        const nftAccounts = await provider.connection.getTokenAccountsByOwner(poolSigner, { mint: nftMint.publicKey });
        let toTokenAccount;
        if (nftAccounts.value.length === 0) {
            try {

                let toTokenAccountObject = await createTokenAccount(
                    provider.connection,
                    wallet.publicKey,
                    nftMint.publicKey,
                    poolSigner,
                    signTransaction
                );

                toTokenAccount = toTokenAccountObject.address;
            } catch (error) {
                if (error.message === 'TokenAccountNotFoundError' || error.message === 'TokenInvalidAccountOwnerError') {
                    alert("Need to create stake account.");
                    return;
                }
            }
        }
        else {
            toTokenAccount = nftAccounts.value[0].pubkey;
        }

        try {
            instructions.push(await program.instruction.stake(new anchor.BN(durDate),
                {
                    accounts: {
                        // Stake instance.
                        pool: poolPublicKey,
                        vault: vaultPublicKey,
                        stakeToAccount: toTokenAccount,
                        // User.
                        user: userPubkey,
                        owner: provider.wallet.publicKey,
                        stakeFromAccount: nftAccount.address,
                        // Program signers.
                        poolSigner,
                        tokenProgram: TOKEN_PROGRAM_ID,
                        metadataInfo: metadata
                    },
                }
            ))
            const transaction = new anchor.web3.Transaction().add(...instructions);
            const blockHash = await provider.connection.getRecentBlockhash()
            transaction.feePayer = await provider.wallet.publicKey
            transaction.recentBlockhash = await blockHash.blockhash
            const signed = await signTransaction(transaction)

            const signature = await provider.connection.sendRawTransaction(signed.serialize())

            await provider.connection.confirmTransaction(signature)
            console.log("Success!");
            getPendingRewardsFunc();
            setLoading(true);
            await setNftTokenData(provider.wallet.publicKey);
            setLoading(false);
        } catch (err) {
            console.log('err', err);
            alert("Something went wrong! Please try again.");
        }
    }

    const claimRewards = async () => {

        var accountFalg = false;
        const [
            _userPubkey
        ] = await PublicKey.findProgramAddress(
            [provider.wallet.publicKey.toBuffer(), poolPublicKey.toBuffer(), (new TextEncoder().encode('user'))],
            program.programId
        );

        try {
            const userObject = await program.account.user.fetch(_userPubkey);

            if (userObject.nftMints.length > 0) {
                accountFalg = true;
            }
        } catch (err) { }

        const [
            _vaultPubkey,
            // _vaultNonce,
        ] = await PublicKey.findProgramAddress(
            [funderPublicKey.toBuffer(), poolPublicKey.toBuffer()],
            programID
        );
        let vaultPublicKey = _vaultPubkey;

        if (accountFalg === true) {
            var claimeAmount = await claimRewardsCore(vaultPublicKey, _userPubkey);
            console.log(claimeAmount);
        } else {
            console.log("There is no staked NFTs");
        }
    }

    const claimRewardsCore = async (vault, userPubkey) => {

        let poolObject = await program.account.pool.fetch(poolPublicKey);
        var mintRewardsObject = new Token(provider.connection, mintRewardsPublicKey, TOKEN_PROGRAM_ID, provider.wallet.payer);
        var mintRewardsInfo = await mintRewardsObject.getOrCreateAssociatedAccountInfo(provider.wallet.publicKey);

        console.log(mintRewardsObject.publicKey.toBase58())

        const [
            _poolSigner,
            // _nonce,
        ] = await anchor.web3.PublicKey.findProgramAddress(
            [poolPublicKey.toBuffer()],
            program.programId
        );
        let poolSigner = _poolSigner;

        try {
            await program.rpc.claim({
                accounts: {
                    // Stake instance.
                    pool: poolPublicKey,
                    vault,
                    rewardVault: poolObject.rewardVault,
                    // User.
                    user: userPubkey,
                    owner: provider.wallet.publicKey,
                    rewardAccount: mintRewardsInfo.address,
                    // Program signers.
                    poolSigner,
                    // Misc.
                    clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
                    tokenProgram: TOKEN_PROGRAM_ID,
                },
            });

            let amt = await this.provider.connection.getTokenAccountBalance(mintRewardsInfo.address);

            return amt.value.uiAmount;
        } catch (err) {
            return 0;
        }
    }

    const unStakeNFT = async (mintObj) => {
        var mintPubKey = new PublicKey(mintObj.mint);
        const nftMint = new Token(provider.connection, mintPubKey, TOKEN_PROGRAM_ID, provider.wallet.payer);

        let metadata = await getMetadata(nftMint.publicKey);

        const [
            _vaultPubkey,
            // _vaultNonce,
        ] = await PublicKey.findProgramAddress(
            [funderPublicKey.toBuffer(), poolPublicKey.toBuffer()],
            programID
        );
        let vaultPublicKey = _vaultPubkey;

        const [
            _poolSigner,
            // _nonce,
        ] = await PublicKey.findProgramAddress(
            [poolPublicKey.toBuffer()],
            program.programId
        );
        let poolSigner = _poolSigner;

        let nftAccounts = await connection.getTokenAccountsByOwner(poolSigner, {
            mint: mintPubKey
        })

        let nftAccount = nftAccounts.value[0].pubkey;

        let toTokenAccount = await nftMint.getOrCreateAssociatedAccountInfo(
            provider.wallet.publicKey
        )

        const [
            _userPubkey,
        ] = await PublicKey.findProgramAddress(
            [provider.wallet.publicKey.toBuffer(), poolPublicKey.toBuffer(), (new TextEncoder().encode('user'))],
            program.programId
        );

        try {
            await program.rpc.unstake(
                {
                    accounts: {
                        // Stake instance.
                        pool: poolPublicKey,
                        vault: vaultPublicKey,
                        stakeToAccount: nftAccount,
                        // User.
                        user: _userPubkey,
                        owner: provider.wallet.publicKey,
                        stakeFromAccount: toTokenAccount.address,
                        // Program signers.
                        poolSigner,
                        // Misc.
                        clock: SYSVAR_CLOCK_PUBKEY,
                        tokenProgram: TOKEN_PROGRAM_ID,
                        metadataInfo: metadata
                    },
                });

            console.log("Success!");
            getPendingRewardsFunc();
            setLoading(true);
            await setNftTokenData(provider.wallet.publicKey);
        } catch (e) {
            console.log('e', e);
            alert("Something when wrong. Try again");
        }
        setLoading(false);

    }

    const getPendingRewardsFunction = async (rewardsPoolAnchorProgram, rewardsPoolPubkey, vaultPubkey) => {
        let poolObject = await rewardsPoolAnchorProgram.account.pool.fetch(rewardsPoolPubkey);
        // console.log('poolObject', poolObject);
        const [
            _userPubkey,
            // _userNonce,
        ] = await anchor.web3.PublicKey.findProgramAddress(
            [rewardsPoolAnchorProgram.provider.wallet.publicKey.toBuffer(), rewardsPoolPubkey.toBuffer(), (new TextEncoder().encode('user'))],
            rewardsPoolAnchorProgram.programId
        );
        let userObject = await rewardsPoolAnchorProgram.account.user.fetch(_userPubkey);
        let balanceStaked = userObject.balanceStaked.toNumber();

        //a function that gives a user's total unclaimed rewards since last update
        let currentPending = () => {
            var now = parseInt((new Date()).getTime() / 1000)
            var a = 0;
            var dd = 0;
            for (var i = 0; i < balanceStaked; i++) {
                let diffDays = now - userObject.stakedTimes[i].toNumber();
                const d = poolObject.rewardPerToken.toNumber() / userObject.types[i];
                a += d * parseInt(diffDays / (24 * 60 * 60));
                dd += d;
            }

            setDailyRewards((dd / anchor.web3.LAMPORTS_PER_SOL).toFixed(1));
            return userObject.rewardTokenPending.toNumber() + a;

        }

        return currentPending;
    }

    const getUserPendingRewardsFunction = async () => {

        const [
            _vaultPubkey,
            // _vaultNonce,
        ] = await PublicKey.findProgramAddress(
            [funderPublicKey.toBuffer(), poolPublicKey.toBuffer()],
            programID
        );
        let vaultPublicKey = _vaultPubkey;

        return await getPendingRewardsFunction(program, poolPublicKey, vaultPublicKey);
    }

    const getMetadata = async (mint) => {
        const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
            'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
        );
        return (
            await anchor.web3.PublicKey.findProgramAddress(
                [
                    Buffer.from('metadata'),
                    TOKEN_METADATA_PROGRAM_ID.toBuffer(),
                    mint.toBuffer(),
                ],
                TOKEN_METADATA_PROGRAM_ID,
            )
        )[0];
    };

    const decodeMetadata = (buffer) => {
        return borsh.deserializeUnchecked(METADATA_SCHEMA, Metadata, buffer);
    }

    useEffect(() => {
        if (publicKey) {
            initialize()
        }
    }, [publicKey])

    useEffect(() => {
        async function setDtata() {
            if (program) {
                if (program.programId) {
                    await setNftTokenData(provider.wallet.publicKey);
                    setLoading(false);
                    getPendingRewardsFunc();

                    const poolObject = await program.account.pool.fetch(poolPublicKey);
                    setTotalStaked(poolObject.balanceStaked.toNumber());
                }
            }
        }
        setDtata();
    }, [program])

    return (
        <div className="main">
            <Row style={{ margin: 0 }}>
                <div className="App-header">
                    <h1 className="glitch" data-text="NFT STAKING">NFT STAKING</h1>
                    {
                        wallet.publicKey ? <h4 className='digital red-text mv-25'>NFTS STAKED</h4> : null
                    }
                    <WalletModalProvider>
                        <WalletMultiButton className='btn-wallet-connect' />
                    </WalletModalProvider>
                </div>
            </Row>
            {
                wallet.publicKey ? <>
                    <div className='tab-container'>
                        <div className='tabs'>
                            <div className={`tab red-text ${activeTab === 0 && "active"}`} onClick={() => setActiveTab(0)}>YOUR NFTS</div>
                            <div className={`tab red-text ${activeTab === 1 && "active"}`} onClick={() => setActiveTab(1)}>STAKED NFTS</div>
                            <div className={`tab red-text ${activeTab === 2 && "active"}`} onClick={() => setActiveTab(2)}>YOUR REWARDS</div>
                        </div>
                    </div>
                    <Container>
                        {
                            activeTab === 0 ? <MyNFTs data={nftData} loading={loading} stakeNFT={stakeNFT} />
                                : activeTab === 1 ? <InStake data={stakedNftData} loading={loading} unStakeNFT={unStakeNFT} />
                                    : activeTab === 2 ? <Rewards totalStaked={totalStaked} stakeUser={stakeUser} dailyRewards={dailyRewards} pendingRewards={pendingRewards} claimRewards={claimRewards} /> : null
                        }
                    </Container>
                </> : null
            }
        </div>
    );
};

export default Home;