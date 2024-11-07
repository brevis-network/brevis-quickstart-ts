package age

import (
	"github.com/brevis-network/brevis-sdk/sdk"
)

type AppCircuit struct{}

func (c *AppCircuit) Allocate() (maxReceipts, maxStorage, maxTransactions int) {
	// Our app is only ever going to use one storage data at a time so
	// we can simply limit the max number of data for storage to 1 and
	// 0 for all others
	return 32, 0, 0
}

func (c *AppCircuit) Define(api *sdk.CircuitAPI, in sdk.DataInput) error {
	receipts := sdk.NewDataStream(api, in.Receipts)

	receipts0 := sdk.GetUnderlying(receipts, 0)
	// This is our main check logic
	api.Uint248.AssertIsEqual(sdk.Uint248(receipts0.BlockNum), sdk.ConstUint248(21104692))

	api.OutputUint(64, api.ToUint248(receipts0.Fields[0].Value))

	return nil
}
