install:
	go build -o $(HOME)/go/bin/prover ./main.go

config:
	# create log files
	sudo mkdir -p /var/log/my-prover
	sudo touch /var/log/my-prover
	# copying over systemd config files
	sudo cp configs/*.service /etc/systemd/system
	sudo systemctl daemon-reload
	sudo systemctl enable my-prover

deploy: config install
	sudo systemctl restart my-prover

start:
	go run ./cmd/main.go