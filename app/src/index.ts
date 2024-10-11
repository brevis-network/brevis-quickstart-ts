import { Brevis, ErrCode, ProofRequest, Prover, TransactionData } from 'brevis-sdk-typescript';
import { ethers } from 'ethers';

async function main() {
    const prover = new Prover('localhost:33247');
    const brevis = new Brevis('appsdkv2.brevis.network:9094');

    const proofReq = new ProofRequest();

    // Assume transaction hash will provided by command line
    const hash = process.argv[2]

    // Brevis Partner KEY IS NOT required to submit request to Brevis Gateway. 
    // It is used only for Brevis Partner Flow
    const brevis_partner_key = process.argv[3] ?? ""
    const callbackAddress = process.argv[4] ?? ""

    if (hash.length === 0) {
        console.error("empty transaction hash")
        return 
    }
    const provider = new ethers.providers.JsonRpcProvider("https://bsc-testnet.public.blastapi.io");

    console.log(`Get transaction info for ${hash}`)
    const transaction = await provider.getTransaction(hash)

    if (transaction.type != 0 && transaction.type != 2) {
        console.error("only type0 and type2 transactions are supported")
        return
    }

    if (transaction.nonce != 0) {
        console.error("only transaction with nonce 0 is supported by sample circuit")
        return 
    }

    const receipt = await provider.getTransactionReceipt(hash)
    var gas_tip_cap_or_gas_price =  ''
    var gas_fee_cap = ''
    if (transaction.type = 0) {
        gas_tip_cap_or_gas_price = transaction.gasPrice?._hex ?? ''
        gas_fee_cap = '0'
    } else {
        gas_tip_cap_or_gas_price = transaction.maxPriorityFeePerGas?._hex ?? ''
        gas_fee_cap = transaction.maxFeePerGas?._hex ?? ''
    }
    
    proofReq.addTransaction(
        new TransactionData({
            hash: hash,
            chain_id: transaction.chainId,
            block_num: receipt.blockNumber,
            nonce: transaction.nonce,
            gas_tip_cap_or_gas_price: gas_tip_cap_or_gas_price,
            gas_fee_cap: gas_fee_cap,
            gas_limit: transaction.gasLimit.toNumber(),
            from: transaction.from,
            to: transaction.to,
            value: transaction.value._hex,
        }),
    );

    console.log(`Send prove request for ${hash}`)

    const proofRes = await prover.prove(proofReq);
    // error handling
    if (proofRes.has_err) {
        const err = proofRes.err;
        switch (err.code) {
            case ErrCode.ERROR_INVALID_INPUT:
                console.error('invalid receipt/storage/transaction input:', err.msg);
                break;

            case ErrCode.ERROR_INVALID_CUSTOM_INPUT:
                console.error('invalid custom input:', err.msg);
                break;

            case ErrCode.ERROR_FAILED_TO_PROVE:
                console.error('failed to prove:', err.msg);
                break;
        }
        return;
    }
    console.log('proof', proofRes.proof);

    try {
        const brevisRes = await brevis.submit(proofReq, proofRes, 97, 97, 0, brevis_partner_key, callbackAddress);
        console.log('brevis res', brevisRes);

        await brevis.wait(brevisRes.queryKey, 97);
    } catch (err) {
        console.error(err);
    }
}

main();
