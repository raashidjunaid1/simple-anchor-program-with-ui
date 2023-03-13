require('dotenv').config()

import * as anchor from "@coral-xyz/anchor";
import { getPythProgramKeyForCluster, PriceStatus, PythConnection, PythHttpClient } from "@pythnetwork/client";
import { HelloAnchor, IDL } from '../target/types/hello_anchor'
import NodeCache from "node-cache";
import { BN } from "bn.js";

const priceCache = new NodeCache();
const limitOrdersCache = new NodeCache();

anchor.setProvider(anchor.AnchorProvider.local('http://localhost:8899'));
const provider = anchor.getProvider();
const connection = new anchor.web3.Connection('https://xenonso-main-9d21.mainnet.rpcpool.com/39ec25eb-ef7f-4a3f-b4c9-1fa01dd5ec49', {
    commitment: 'processed'
})

interface PriceCacheInterface {
    oldPrice: number,
    newPrice: number
}

enum PriceKeys {
    SOL = 'SOL'
}

enum LimitOrdersCacheKeys {
    ORDERS = 'ORDERS'
}

const { SystemProgram, PublicKey } = anchor.web3;

const pythConnection = new PythConnection(new anchor.web3.Connection(anchor.web3.clusterApiUrl('devnet')), getPythProgramKeyForCluster('devnet'))

const setInitialPrices = async () => {
    const pythClient = new PythHttpClient(connection, getPythProgramKeyForCluster('devnet'));
    const data = await pythClient.getData();
    for (let symbol of data.symbols) {
        const price = data.productPrice.get(symbol)!;
        // Sample output:
        // Crypto.SRM/USD: $8.68725 ±$0.0131 Status: Trading
        if (symbol.includes('Crypto.SOL')) {
            console.log(`${symbol}: $${price.price} \xB1$${price.confidence} Status: ${PriceStatus[price.status]}`)
            const oldPrice = priceCache.get(PriceKeys.SOL)
            priceCache.set(PriceKeys.SOL, {
                oldPrice: oldPrice ?? price.price,
                newPrice: price.price
            })
        }
    }
}

setInitialPrices()


// const tokenList = ['Sol','Btc', 'Eth']
const tokenList = ['Sol']

// pythConnection.onPriceChange((product, price) => {
//     if (tokenList.map(t => `Crypto.${t}`.toLowerCase()).includes(product.symbol.split('/')[0].toLowerCase())) {
//     console.log('product :>> ', product.symbol, " :: ", price.price);

//         const cachedPrice: PriceCacheInterface = priceCache.get(PriceKeys.SOL);
//         // check if theres actually a price change
//         if (cachedPrice && cachedPrice.newPrice !== price.price) {
//             priceCache.set(PriceKeys.SOL, {
//                 oldPrice: cachedPrice.newPrice ?? price.price,
//                 newPrice: price.price
//             })
//         }
//     }
// })

// Start listening for price change events.
pythConnection.start().catch(error => console.error(error));

const createLimitOrdersAroundPrice = (price: number) => {

    const upperRange = price * (100.1 / 100);
    const lowerRange = price * (99.1 / 100);
    for (const i of Array.from(Array(1).keys())) {
        const price = (Math.random() * (upperRange - lowerRange) + lowerRange).toFixed(4);
        // init(new anchor.BN(Number(price) * 10 ** 9))
    }
}

priceCache.on("set", function (key, value: PriceCacheInterface) {
    // probs switch here, with all the assets or something, or set the key value to be the key for everything?
    // createLimitOrdersAroundPrice(value.newPrice)

    // query > orders between 10 ~ 10.5
    // read from cache and execute transactions
    // triggerExecuteOrders(value)
});

const programId = new anchor.web3.PublicKey("7wZ5gGfuFLcambH1bTpXiPycANgVv1rM2QVUAdrEhRaq");
const program = new anchor.Program(IDL, programId);

const init = async (price: anchor.BN) => {
    const myAccount = anchor.web3.Keypair.generate();

    const txId = await program.methods
        .initialize(price)
        .accounts({
            myAccount: myAccount.publicKey,
            user: provider.publicKey,
            systemProgram: SystemProgram.programId,
        })
        .signers([myAccount])
        .rpc();

    console.log('create limit order :: txId :>> ', txId);
}

const triggerExecuteOrders = (price: PriceCacheInterface) => { 
    const orders = limitOrdersCache.get(LimitOrdersCacheKeys.ORDERS);

    // if limitPrice = 100 and new price > old price 

    const min = Math.min(price.oldPrice, price.newPrice);
    const max = Math.max(price.oldPrice, price.newPrice);

    console.log('prices :>> ', min, " : ", max);

    const filteredOrders: [] = (orders as any).filter(f => (f.account.price.toNumber()/(10**9)) >= min && (f.account.price.toNumber()/(10**9)) <= max)
    console.log('filteredOrders :>> ', filteredOrders.length);
    console.log('filteredOrders :>> ', filteredOrders.map((t: any) => t.account.price.toNumber()/(10**9)));

    filteredOrders.forEach((f: any) => executeOrder(f.publicKey))
}

// limit buy price is 100.5

// limit sell price at 101

// slot 0 - $102
// slot 1 - $100
// slot 2 - $103

const executeOrder = async (limitOrderPK: anchor.web3.PublicKey) => {
    const txId = await program.methods
        .update(true)
        .accounts({
            myAccount: limitOrderPK,
        })
        .rpc();

    console.log('execute order :: txId :>> ', txId);
}

// cache -> every x secs pull all accounts and clear cache, store new accounts

const updateCacheWithOrders = async () => {
    // Generate the program client from IDL.
    const limitOrders = await program.account.myAccount.all([
        {
            memcmp: {
                offset: 8,
                bytes: Buffer.from("1").toString(),
            },
        },
    ])
    const price: PriceCacheInterface = priceCache.get(PriceKeys.SOL);

    if(!price) return;

    const min = Math.min(price.oldPrice, price.newPrice);
    const max = Math.max(price.oldPrice, price.newPrice);

    console.log('prices :>> ', min, " : ", max);

    const foundLimitOrders = limitOrders.filter(f => f.account.price.toNumber()/(10**9) >= min && f.account.price.toNumber()/(10**9) <= max)

    console.log('foundLimitOrders :>> ', foundLimitOrders.map(t => t.account.price.toNumber()/(10**9)));
    console.log(limitOrders.length)
    limitOrdersCache.set(LimitOrdersCacheKeys.ORDERS, limitOrders)
}

const getAllExecutedOrderrs = async () => {
    const limitOrders = await program.account.myAccount.all([
        {
            memcmp: {
                offset: 8,
                bytes: Buffer.from("1").toString(),
            },
        },
    ])

    limitOrdersCache.set(LimitOrdersCacheKeys.ORDERS, limitOrders)
}

getAllExecutedOrderrs()

setInterval(() => {
    updateCacheWithOrders()
}, 5000)


// setInterval(() => {
//     const length = limitOrdersCache.get<[]>(LimitOrdersCacheKeys.ORDERS).length
//     console.log("orders length : ", length)
// }, 10000)

