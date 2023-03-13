import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react'
import React, { useEffect, useState } from 'react'
import * as anchor from "@project-serum/anchor";
import { HelloAnchor, IDL } from "../types/hello_anchor";
import * as PerpetualsJson from "../idl/hello_anchor.json";
import { Program } from '@project-serum/anchor';
import NodeWallet from '@project-serum/anchor/dist/cjs/nodewallet';
import { decode } from '@project-serum/anchor/dist/cjs/utils/bytes/base64';
import { IdlCoder } from '../utils/IdlCoder';

const { SystemProgram, PublicKey } = anchor.web3;

export const PERPETUALS_PROGRAM_ID = new anchor.web3.PublicKey(
    '7wZ5gGfuFLcambH1bTpXiPycANgVv1rM2QVUAdrEhRaq'
);

export const getProgram = (provider: anchor.AnchorProvider) => {
    return new Program(
        IDL,
        PERPETUALS_PROGRAM_ID,
        provider
    );
}

export class DefaultWallet implements anchor.Wallet {
    constructor(readonly payer: anchor.web3.Keypair) { }

    static local(): NodeWallet | never {
        throw new Error("Local wallet not supported");
    }

    async signTransaction(tx: anchor.web3.Transaction): Promise<anchor.web3.Transaction> {
        return tx;
    }

    async signAllTransactions(txs: anchor.web3.Transaction[]): Promise<anchor.web3.Transaction[]> {
        return txs;
    }

    get publicKey(): anchor.web3.PublicKey {
        return this.payer.publicKey;
    }
}



const useAnchor = () => {
    const { publicKey, wallet } = useWallet()
    const { connection } = useConnection()
    const anchorWallet = useAnchorWallet()

    const defaultProvider = new anchor.AnchorProvider(connection, new DefaultWallet(anchor.web3.Keypair.generate()), {
        commitment: 'processed',
        skipPreflight: true
    });

    const defaultProgram = getProgram(defaultProvider);

    const [anchorData, setAnchorData] = useState<{
        provider: anchor.AnchorProvider;
        program: anchor.Program<HelloAnchor>
    }>({
        provider: defaultProvider,
        program: defaultProgram
    })

    useEffect(() => {
        if (anchorWallet && publicKey) {
            const provider = new anchor.AnchorProvider(connection, anchorWallet, {
                commitment: 'processed',
                skipPreflight: true
            })
            const program = getProgram(provider);
            setAnchorData({
                provider,
                program
            })
        }

    }, [anchorWallet, publicKey])

    return anchorData
}

const AnchorInteract = () => {
    const { publicKey, wallet } = useWallet()
    const { connection } = useConnection()
    const anchorWallet = useAnchorWallet()

    const { program, provider } = useAnchor();

    // program.account.myAccount.coder.accounts.decode()

    const [accountKey, setAccountKey] = useState<anchor.web3.PublicKey>(anchor.web3.PublicKey.default);
    useEffect(() => {
        (async () => {
            // if (anchorWallet && publicKey) {
            //     const provider = new anchor.AnchorProvider(connection, anchorWallet, {
            //         commitment: 'processed',
            //         skipPreflight: true
            //     })

            //     const program = getProgram(provider);

            //     const s = await program.methods.getData({}).view()
            // }

        })()
    }, [anchorWallet, publicKey])

    const init = async () => {
        if (anchorWallet && publicKey) {
            const provider = new anchor.AnchorProvider(connection, anchorWallet, {
                commitment: 'processed',
                skipPreflight: true
            })

            const myAccount = anchor.web3.Keypair.generate();

            const program = getProgram(provider);

            console.log('myAccount :: :>> ', myAccount.publicKey.toBase58());
            console.log('myAccount :: :>> ', myAccount.secretKey);

            const txId = await program.methods
                .initialize(new anchor.BN(100))
                .accounts({
                    myAccount: myAccount.publicKey,
                    user: provider.publicKey,
                    systemProgram: SystemProgram.programId,
                })
                .signers([
                    myAccount
                ])
                .rpc()

            console.log('txId :: ', txId)

            setAccountKey(myAccount.publicKey)
        }
    }

    const readData = async () => {
        if (anchorWallet && publicKey && !accountKey.equals(anchor.web3.PublicKey.default)) {
            const provider = new anchor.AnchorProvider(connection, anchorWallet, {
                commitment: 'processed',
                skipPreflight: true
            })

            const program = getProgram(provider);
            // const s = await program.views?.getData({});
            // console.log('        program.views :::  :>> ',         s);
            // console.log('myAccount :: :>> ', accountKey.toBase58());

            let latestBlockhash = await connection.getLatestBlockhash('confirmed');

            const transaction = await program.methods
                .getData({})
                .accounts({
                    myAccount: accountKey,
                })
                .transaction()

            console.log('latestBlockhash.blockhash ::: ', latestBlockhash.blockhash)

            const messageV0 = new anchor.web3.TransactionMessage({
                payerKey: publicKey,
                recentBlockhash: latestBlockhash.blockhash,
                instructions: transaction.instructions
            }).compileToV0Message();
            console.log("   ✅ - Compiled Transaction Message");

            const transaction2 = new anchor.web3.VersionedTransaction(messageV0)

            const data = await connection.simulateTransaction(transaction2, { sigVerify: false })

            console.log('IDL.instructions. :>> ', IDL.instructions[2]);

            const returnPrefix = `Program return: ${PERPETUALS_PROGRAM_ID} `;

            if (data.value.logs) {
                let returnLog = data.value.logs.find((l) =>
                    l.startsWith(returnPrefix)
                );
                if (!returnLog) {
                    throw new Error("View expected return log");
                }
                let returnData = decode(returnLog.slice(returnPrefix.length));
                let returnType = IDL.instructions[2].returns;

                if (!returnType) {
                    throw new Error("View expected return type");
                }
                const coder = IdlCoder.fieldLayout(
                    { type: returnType },
                    Array.from([...(IDL.accounts ?? []), ...(IDL.types ?? [])])
                );
                // return coder.decode(returnData);
                console.log('coder.decode(returnData); ::: ', coder.decode(returnData))
            }

            console.log('txId :: ', data)
        }
    }

    const printAllAccounts = async () => {
        if (anchorWallet && publicKey) {
            const provider = new anchor.AnchorProvider(connection, anchorWallet, {
                commitment: 'processed',
                skipPreflight: true
            })

            const program = getProgram(provider);

            console.log("first")

            const accounts = await program.account.myAccount.all()
            // console.log('accounts :>> ', accounts.map(t => t.account.data.toNumber()));

            // const txId = await program.methods
            //     .initialize(new anchor.BN(100))
            //     .accounts({
            //         myAccount: myAccount.publicKey,
            //         user: provider.publicKey,
            //         systemProgram: SystemProgram.programId,
            //     })
            //     .signers([
            //         myAccount
            //     ])
            //     .rpc()

            // console.log('txId :: ', txId)

            // setAccountKey(myAccount.publicKey)
        }
    }

    return (
        <div>
            <button onClick={init}>init</button>
            <button onClick={readData}>data</button>
            <button onClick={printAllAccounts}>getAllAccounts</button>
        </div>
    )
}

export default AnchorInteract