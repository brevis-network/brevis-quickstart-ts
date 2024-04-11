import { Brevis, ErrCode, ProofRequest, Prover, TransactionData } from 'brevis-sdk-typescript';

async function main() {
    const prover = new Prover('localhost:33247');
    const brevis = new Brevis('appsdk.brevis.network:11080');

    const proofReq = new ProofRequest();
    proofReq.addTransaction(
        new TransactionData({
            hash: '0x6dc75e61220cc775aafa17796c20e49ac08030020fce710e3e546aa4e003454c',
            chain_id: 1,
            block_num: 19073244,
            nonce: 0,
            gas_tip_cap_or_gas_price: '90000000000',
            gas_fee_cap: '90000000000',
            gas_limit: 21000,
            from: '0x6c2843bA78Feb261798be1AAC579d1A4aE2C64b4',
            to: '0x2F19E5C3C66C44E6405D4c200fE064ECe9bC253a',
            value: '22329290000000000',
        }),
    );

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
        const brevisRes = await brevis.submit(proofReq, proofRes, 1, 11155111);
        console.log('brevis res', brevisRes);

        await brevis.wait(brevisRes.id, 11155111);
    } catch (err) {
        console.error(err);
    }
}

main();
