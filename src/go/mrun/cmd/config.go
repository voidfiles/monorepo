package cmd

import (
	"errors"
	"fmt"
	"os"
	"path"

	"github.com/bitfield/script"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

func init() {
	cobra.OnInitialize(initConfig)
}

func findConfigToml(s string) (string, error) {
	for {
		if s == "/" {
			return "", fmt.Errorf("failed to find a config.toml %s", s)
		}

		config := path.Join(s, "config.toml")
		if _, err := os.Stat(config); errors.Is(err, os.ErrNotExist) {
			s = path.Dir(s)
			continue
		}

		return config, nil

	}
}

func ParseValue(w string) (string, error) {
	p := script.Exec(w)
	p.Wait()
	if err := p.Error(); err != nil {
		return "", err
	}

	if out, err := p.String(); err != nil {
		return out, nil
	}

	return "", fmt.Errorf("failed to find")
}

var info = map[string]string{}
var fetch = map[string]string{
	"os":   "uname",
	"arch": "arch",
	"cwd":  "pwd",
}

func initConfig() {
	viper.SetDefault("os", "darwin")
	for key, value := range fetch {
		if v, err := ParseValue(value); err != nil {
			panic(err)
		} else {
			viper.SetDefault(key, v)
		}
	}
	if cfgFile != "" {
		// Use config file from the flag.
		viper.SetConfigFile(cfgFile)
	} else {
		// Find home directory.
		path, err := os.Getwd()
		cobra.CheckErr(err)
		if config, err := findConfigToml(path); err != nil {
			panic(err)
		} else {
			viper.SetConfigFile(config)
		}
	}

	viper.AutomaticEnv()
	viper.ReadInConfig()
	fmt.Printf("%v", viper.AllSettings())
	if err := viper.ReadInConfig(); err == nil {
		fmt.Println("Using config file:", viper.ConfigFileUsed())
	} else {
		panic(err)
	}
}
