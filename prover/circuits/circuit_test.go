package circuits

import (
	"testing"

	"github.com/brevis-network/brevis-sdk/sdk"
	"github.com/brevis-network/brevis-sdk/test"
	"github.com/ethereum/go-ethereum/common"
)

func TestCircuit(t *testing.T) {
	rpc := "RPC_URL"
	localDir := "$HOME/circuitOut/myBrevisApp"
	app, err := sdk.NewBrevisApp(1, rpc, localDir)
	check(err)

	txHash := common.HexToHash(
		"0x8a7fc50330533cd0adbf71e1cfb51b1b6bbe2170b4ce65c02678cf08c8b17737")

	app.AddReceipt(sdk.ReceiptData{
		TxHash: txHash,
		Fields: []sdk.LogFieldData{
			{
				IsTopic:    true,
				LogPos:     0,
				FieldIndex: 1,
			},
			{
				IsTopic:    false,
				LogPos:     0,
				FieldIndex: 0,
			},
		},
	})

	appCircuit := &AppCircuit{}
	appCircuitAssignment := &AppCircuit{}

	circuitInput, err := app.BuildCircuitInput(appCircuit)
	check(err)

	///////////////////////////////////////////////////////////////////////////////
	// Testing
	///////////////////////////////////////////////////////////////////////////////

	test.ProverSucceeded(t, appCircuit, appCircuitAssignment, circuitInput)
}

func check(err error) {
	if err != nil {
		panic(err)
	}
}
