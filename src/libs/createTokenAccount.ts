import { AccountLayout, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { SignerWalletAdapterProps } from '@solana/wallet-adapter-base'
import { Connection, PublicKey, Commitment, Transaction, SystemProgram, Keypair } from '@solana/web3.js'
import { createTokenAccountInstruction } from './createTokenAccountInstruction'
import { getAccountInfo } from './getAccountInfo'
// import { getTokenAddress } from './getTokenAddress'

export async function createTokenAccount(
    connection: Connection,
    payer: PublicKey,
    mint: PublicKey,
    owner: PublicKey,
    signTransaction: SignerWalletAdapterProps['signTransaction'],
    commitment?: Commitment,
    programId = TOKEN_PROGRAM_ID
) {
    // This is the optimal logic, considering TX fee, client-side computation, RPC roundtrips and guaranteed idempotent.
    // Sadly we can't do this atomically.
    let account
    const newAccount = Keypair.generate();
    try {
        const balanceNeeded = await Token.getMinBalanceRentForExemptAccount(connection);
        const transaction = new Transaction();
        transaction.add(SystemProgram.createAccount({
            fromPubkey: payer,
            newAccountPubkey: newAccount.publicKey,
            lamports: balanceNeeded,
            space: AccountLayout.span,
            programId: programId
        }));
        transaction.add(
            createTokenAccountInstruction(
                newAccount.publicKey,
                owner,
                mint,
                programId
            )
        )

        const blockHash = await connection.getRecentBlockhash()
        transaction.feePayer = await payer
        transaction.recentBlockhash = await blockHash.blockhash
        transaction.partialSign(newAccount)
        const signed = await signTransaction(transaction)

        const signature = await connection.sendRawTransaction(signed.serialize())

        await connection.confirmTransaction(signature)
    } catch (error: unknown) {
        console.log(error)
        // Ignore all errors; for now there is no API-compatible way to selectively ignore the expected
        // instruction error if the associated account exists already.
    }

    // Now this should always succeed
    account = await getAccountInfo(connection, newAccount.publicKey, commitment, programId)

    if (!account.mint.equals(mint.toBuffer())) throw Error('TokenInvalidMintError')
    if (!account.owner.equals(owner.toBuffer())) throw new Error('TokenInvalidOwnerError')

    return account
}