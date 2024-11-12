# Brevis Quickstart Typescript

This repo contains a simple end-to-end brevis application
that proves circle USDC token transfer and handles the attested account and volume in an app contract.

## Environment Requirements

- Go >= 1.20
- Node.js LTS

## [Prover](./prover)

The prover service is a standalone process that is run on a server, preferably as a systemd managed process so that it can be auto restarted if any crash happens. The prover service is designed to be used in conjunction with [brevis-network/brevis-sdk-typescript](https://github.com/brevis-network/brevis-sdk-typescript). 

### Start Prover (for testing)

```bash
cd prover
make start
```

### Start Prover with Systemd (in production on linux server)

You may want to have a process daemon to manage the prover services in production. The [Makefile](prover/Makefileefile) in the project root contains some convenience scripts. 

To build, init systemd, and start both prover processes, run the following command. Note it requires sudo privilege because we want to use systemd commands

```bash
cd prover
make deploy
```

# [App](./app)

The Node.js project in ./app is a simple program that does the following things:

1. call the Go prover with some transaction data to generate token transfer volume proof
2. call Brevis backend service and submit the token transfer volume proof
3. wait until the final proof is submitted on-chain and our contract is called

## How to Run

```bash
cd app
npm run start [TransactionHash]
```
Example for Normal Flow
```bash
npm run start 0x8a7fc50330533cd0adbf71e1cfb51b1b6bbe2170b4ce65c02678cf08c8b17737
```

Example for Brevis Partner Flow
```bash
npm run start 0x8a7fc50330533cd0adbf71e1cfb51b1b6bbe2170b4ce65c02678cf08c8b17737 TestVolume 0x9fc16c4918a4d69d885f2ea792048f13782a522d
```
>[!NOTE]
>Brevis partner key **IS NOT** required to submit request to Brevis Gateway

# [Contracts](./contracts)

The app contract [TokenTransferZkOnly.sol](./contracts/contracts/TokenTransferZkOnly.sol) is called
after you submit proof is submitted to Brevis when Brevis'
systems submit the final proof on-chain.
It does the following things when handling the callback:

1. checks the proof was associated with the correct vk hash
2. decodes the circuit output
3. emit a simple event

## Init

```bash
cd contracts
npm install
```

## Test

```bash
npm run test
```

## Deploy

Rename `.env.template` to `.env`. Fill in the required env vars.

```bash
npx hardhat deploy --network sepolia --tags TokenTransferZkOnly
```