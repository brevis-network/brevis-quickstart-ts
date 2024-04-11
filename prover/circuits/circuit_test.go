package age

import (
	"context"
	"github.com/brevis-network/brevis-sdk/sdk"
	"github.com/brevis-network/brevis-sdk/test"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/ethclient"
	"testing"
)

func TestCircuit(t *testing.T) {
	app, err := sdk.NewBrevisApp()
	check(err)
	ec, err := ethclient.Dial("")
	check(err)

	txHash := common.HexToHash(
		"4a18c7762036fcd4016d9ba74b40a8c3614adf9b6f7c6439c4675f9e828211c8")
	tx, _, err := ec.TransactionByHash(context.Background(), txHash)
	check(err)
	receipt, err := ec.TransactionReceipt(context.Background(), txHash)
	check(err)
	from, err := types.Sender(types.NewLondonSigner(tx.ChainId()), tx)
	check(err)

	app.AddTransaction(sdk.TransactionData{
		Hash:                txHash,
		ChainId:             tx.ChainId(),
		BlockNum:            receipt.BlockNumber,
		Nonce:               tx.Nonce(),
		GasTipCapOrGasPrice: tx.GasTipCap(),
		GasFeeCap:           tx.GasFeeCap(),
		GasLimit:            tx.Gas(),
		From:                from,
		To:                  *tx.To(),
		Value:               tx.Value(),
	})

	guest := &AppCircuit{}
	guestAssignment := &AppCircuit{}

	circuitInput, err := app.BuildCircuitInput(guest)
	check(err)

	test.ProverSucceeded(t, guest, guestAssignment, circuitInput)
}

func check(err error) {
	if err != nil {
		panic(err)
	}
}
