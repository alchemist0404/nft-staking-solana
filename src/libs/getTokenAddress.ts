import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'

export async function getTokenAddress(
    mint: PublicKey,
    owner: PublicKey,
    programId = TOKEN_PROGRAM_ID
): Promise<PublicKey> {
    const [address] = await PublicKey.findProgramAddress(
        [owner.toBuffer(), programId.toBuffer(), mint.toBuffer()],
        programId
    )

    return address
}