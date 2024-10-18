import { Brevis, ErrCode, ProofRequest, Prover, StorageData, TransactionData } from 'brevis-sdk-typescript';
import { ethers } from 'ethers';

async function main() {
   TestLiquidity()
}

async function TestLiquidity() {
    const prover = new Prover('localhost:33247');
    const brevis = new Brevis('appsdkv2.brevis.network:9094');

    const proofReq = new ProofRequest();
    
    const startBlockNumber = 20961816
	for (let i = 0; i < 24; i++) {
		const blk = startBlockNumber + i*300
		var value = ""
		if (blk < 20962816) {
			value = "0x00000000000000000000000000000000000000000007a6e40808f0a4cb774bb8"
		} else if (blk < 20966862) {
			value = "0x00000000000000000000000000000000000000000007a875eb11bcdb90679fd3"
		} else if (blk <= 20976472) {
			value = "0x00000000000000000000000000000000000000000007a8a9cf44558277dec09f"
		}

		proofReq.addStorage(new StorageData({
			block_num: blk,
			address:  "0x390f3595bCa2Df7d23783dFd126427CCeb997BF4",
			slot:     "0x0000000000000000000000000000000000000000000000000000000000000016",
			value:    value,
		}), i)
	}

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
        const brevisRes = await brevis.submit(proofReq, proofRes, 1, 11155111, 0, "", "");
        console.log('brevis res', brevisRes);

        await brevis.wait(brevisRes.queryKey, 11155111);
    } catch (err) {
        console.error(err);
    }
}

main();
