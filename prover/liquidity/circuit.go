package liquidity

import (
	"github.com/ethereum/go-ethereum/common/hexutil"

	"github.com/brevis-network/brevis-sdk/sdk"
)

var slot = hexutil.MustDecode("0x0000000000000000000000000000000000000000000000000000000000000016")
var poolAddress = hexutil.MustDecode("0x390f3595bCa2Df7d23783dFd126427CCeb997BF4")

type AppCircuit struct{}

var _ sdk.AppCircuit = &AppCircuit{}

func (c *AppCircuit) Allocate() (maxReceipts, maxSlots, maxTransactions int) {
	// Here we have allocated 2 circuit slots for proving storage slots, but in this
	// example we will show that we can only use one of those slots. We will also
	// show that you can "fixate" a piece of data at a specific index.
	return 0, 24, 0
}

func (c *AppCircuit) Define(api *sdk.CircuitAPI, in sdk.DataInput) error {
	storageSlots := sdk.NewDataStream(api, in.StorageSlots)

	totalLiquidity := sdk.ConstUint248(0)

	// Retrieve 24 slot, make sure they all come from correct contract and uses correct storage slot
	first24Slots := make([]sdk.StorageSlot, 24)
	for i := 0; i < 24; i++ {
		storageSlots := sdk.GetUnderlying(storageSlots, i)
		first24Slots[i] = storageSlots
		api.Uint248.AssertIsEqual(storageSlots.Contract, sdk.ConstUint248(poolAddress))
		api.Bytes32.AssertIsEqual(storageSlots.Slot, sdk.ConstBytes32(slot))
		totalLiquidity = api.Uint248.Add(api.ToUint248(storageSlots.Value), totalLiquidity)
	}

	// It takes 12s to generate one block in ethereum. There will be 300 blocks in an hour.
	for i := 0; i < 23; i++ {
		api.Uint248.AssertIsEqual(api.Uint248.Add(first24Slots[i].BlockNum, sdk.ConstUint248(300)), first24Slots[i+1].BlockNum)

	}

	timeWeightedLiquidity, _ := api.Uint248.Div(totalLiquidity, sdk.ConstUint248(24))

	api.OutputAddress(first24Slots[0].Contract)
	api.OutputUint(64, first24Slots[0].BlockNum)
	api.OutputUint(64, first24Slots[23].BlockNum)
	api.OutputUint(248, timeWeightedLiquidity)

	return nil
}
