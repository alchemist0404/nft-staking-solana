import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { PublicKey, TransactionInstruction, SYSVAR_RENT_PUBKEY } from '@solana/web3.js'
var BufferLayout = require('buffer-layout');
// import BufferLayout from '@solana/buffer-layout'

export function createTokenAccountInstruction(
    token: PublicKey,
    owner: PublicKey,
    mint: PublicKey,
    programId = TOKEN_PROGRAM_ID
): TransactionInstruction {
    const keys = [{
        pubkey: token,
        isSigner: false,
        isWritable: true
    }, {
        pubkey: mint,
        isSigner: false,
        isWritable: false
    }, {
        pubkey: owner,
        isSigner: false,
        isWritable: false
    }, {
        pubkey: SYSVAR_RENT_PUBKEY,
        isSigner: false,
        isWritable: false
    }];

    const dataLayout = BufferLayout.struct([BufferLayout.u8('instruction')]);
    const data = Buffer.alloc(dataLayout.span);
    dataLayout.encode({
        instruction: 1 // InitializeAccount instruction

    }, data);
    return new TransactionInstruction({
        keys,
        programId,
        data
    });
}
