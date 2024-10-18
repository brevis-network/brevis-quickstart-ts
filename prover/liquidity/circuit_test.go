package liquidity

import (
	"math/big"
	"testing"

	"github.com/brevis-network/brevis-sdk/sdk"
	"github.com/brevis-network/brevis-sdk/test"
	"github.com/ethereum/go-ethereum/common"
	"github.com/stretchr/testify/assert"
)

func TestCircuit(t *testing.T) {
	app, err := sdk.NewBrevisApp()
	check(err)

	// According to https://explorer.sim.io/eth/20976472/0x390f3595bca2df7d23783dfd126427cceb997bf4/0x0000000000000000000000000000000000000000000000000000000000000016#raw,
	// 20949384 <= block number < 20962816, total liquidity is 0x00000000000000000000000000000000000000000007a6e40808f0a4cb774bb8
	// 20962816 <= block number < 20966862	total liquidity is 0x00000000000000000000000000000000000000000007a875eb11bcdb90679fd3
	// 20966862 <= block number <= 20976472	total liquidity is 0x00000000000000000000000000000000000000000007a8a9cf44558277dec09f

	startBlockNumber := 20961816
	for i := 0; i < 24; i++ {
		blk := int64(startBlockNumber + i*300)
		value := common.Hash{}
		if blk < 20962816 {
			value = common.HexToHash("0x00000000000000000000000000000000000000000007a6e40808f0a4cb774bb8")
		} else if blk < 20966862 {
			value = common.HexToHash("0x00000000000000000000000000000000000000000007a875eb11bcdb90679fd3")
		} else if blk <= 20976472 {
			value = common.HexToHash("0x00000000000000000000000000000000000000000007a8a9cf44558277dec09f")
		}

		app.AddStorage(sdk.StorageData{
			BlockNum: big.NewInt(blk),
			Address:  common.Address(poolAddress),
			Slot:     common.BytesToHash(slot),
			Value:    value,
		})
	}

	appCircuit := &AppCircuit{}
	appCircuitAssignment := &AppCircuit{}

	in, err := app.BuildCircuitInput(appCircuit)
	check(err)

	///////////////////////////////////////////////////////////////////////////////
	// Testing
	///////////////////////////////////////////////////////////////////////////////

	// Use the test package to check if the circuit can be solved using the given
	// assignment
	test.ProverSucceeded(t, appCircuit, appCircuitAssignment, in)

	assert.Equal(t, 1, 2)
}

func check(err error) {
	if err != nil {
		panic(err)
	}
}
