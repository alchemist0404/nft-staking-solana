# NFT Staking test with React App

## Needed requirement

### Check the phantom extension was installed.

### Copy idl file (nft_staking.json) to staking-ui/src/assets/ directory;


## Follow Step by Step

In the project directory, you can run:

### 1 => `yarn install`

Install all needed packages

### 2 => `Configration`

Initialize All configure data( Pool PublicKey, Liquidity Pool Mint PublicKey,\
Funder PublicKey, Vault PublicKey, MintRewards PublicKey ).

- All files are being created with random so if you want you can store file using "solana-keygen new -o file.json"

Copy All Pubkeys to staking-ui/src/config.js file.

- poolPublicKey = Pool PublicKey
- lpMintPublicKey = Liquidity Pool Mint PublicKey
- funderPublicKey = Funder PublicKey
- vaultPublicKey = Vault PublicKey
- mintRewardsPublicKey = MintRewards PublicKey

### 3 => `yarn start`


- You can stake NFTs if you hit the "Stake" button on the nft bottom.

- You can claim Rewards if you hit the "Claim Rewards" button on the top left.

- You can see currently pending claim reward amount if you hit the "Pending Rewards" button on the top.

- You can unstake NFTs if you clicks the "Unstake NFT" button on the top right.
