package main

import (
	"fmt"

	"github.com/go-logr/zapr"
	"github.com/pkg/errors"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"golang.cisco.com/argo/pkg/core"
)

// NOTE: We have to implement custom encoder for handling custom log levels.
type CustomLevel int8

const (
	Debug4Level CustomLevel = iota - 4
	Debug3Level
	Debug2Level
)

const (
	DEBUG4 = "debug4"
	DEBUG3 = "debug3"
	DEBUG2 = "debug2"
)

func (l CustomLevel) String() string {
	switch l {
	case Debug4Level:
		return DEBUG4

	case Debug3Level:
		return DEBUG3

	case Debug2Level:
		return DEBUG2

	default:
		return zapcore.Level(l).String()
	}
}

//nolint:unparam
func (l CustomLevel) MarshalText() ([]byte, error) {
	return []byte(l.String()), nil
}

func (l *CustomLevel) UnmarshalText(text []byte) error {
	if l == nil {
		return errors.Errorf("level cannot be nil")
	}

	switch string(text) {
	case DEBUG4:
		*l = Debug4Level
	case DEBUG3:
		*l = Debug3Level
	case DEBUG2:
		*l = Debug2Level
	default:
		var zl zapcore.Level

		err := zl.UnmarshalText(text)
		if err == nil {
			*l = CustomLevel(zl)
		}

		if zl > zapcore.ErrorLevel {
			return errors.Errorf("unsupported log level: %s", string(text))
		}

		return err
	}
	return nil
}

func CustomLevelEncoder(l zapcore.Level, enc zapcore.PrimitiveArrayEncoder) {
	enc.AppendString(CustomLevel(l).String())
}

func NewLogger() core.Logger {
	config := zap.Config{
		Encoding:         "json",
		Level:            zap.NewAtomicLevelAt(zapcore.DebugLevel),
		OutputPaths:      []string{"stderr"},
		ErrorOutputPaths: []string{"stderr"},
		EncoderConfig: zapcore.EncoderConfig{
			TimeKey:    "time",
			EncodeTime: zapcore.ISO8601TimeEncoder,

			NameKey:    "name",
			EncodeName: zapcore.FullNameEncoder,

			LevelKey:    "level",
			EncodeLevel: CustomLevelEncoder,

			MessageKey: "message",

			CallerKey:    "caller",
			EncodeCaller: zapcore.ShortCallerEncoder,
		},
	}

	zapLog, err := config.Build()
	if err != nil {
		panic(fmt.Sprintf("who watches the watchmen (%v)?", err))
	}

	return zapr.NewLogger(zapLog).WithName("logr")
}
