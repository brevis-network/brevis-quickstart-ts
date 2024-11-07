package age

import (
	"testing"

	"github.com/brevis-network/brevis-sdk/sdk"
	"github.com/brevis-network/brevis-sdk/test"
	"github.com/ethereum/go-ethereum/common"
)

func TestCircuit(t *testing.T) {
	app, err := sdk.NewBrevisApp(1, "https://eth.llamarpc.com", "$HOME/circuit-sample")
	check(err)

	txHash := common.HexToHash(
		"0xd45d48f608a3418a64ca4ecde4acc6e05bfe59335a2c509e11cda9c3d8b39d74")

	app.AddReceipt(sdk.ReceiptData{
		TxHash: txHash,
		Fields: []sdk.LogFieldData{
			{
				LogPos:     0,
				FieldIndex: 0,
				IsTopic:    false,
			},
		},
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
