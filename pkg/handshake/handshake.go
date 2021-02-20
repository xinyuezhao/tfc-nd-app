package handshake

import (
	"log"
	"os"
)

const (
	fileName = "/tmp/handshake.txt"
)

// Set sets the handshake
func Set() {
	_, err := os.Stat(fileName)
	if os.IsNotExist(err) {
		file, err := os.Create(fileName)
		if err != nil {
			log.Fatal(err)
		}
		defer file.Close()
	} else {
		panic("handshake file already set")
	}
}

// Get gets the handshake
func Get() bool {
	_, err := os.Stat(fileName)
	return err == nil
}

// Clear clears the handshake
func Clear() {
	fileName := "/tmp/handshake.txt"
	_, err := os.Stat(fileName)
	if err == nil {
		os.Remove(fileName)
	}
}
