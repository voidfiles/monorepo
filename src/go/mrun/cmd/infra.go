package cmd

import (
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

func init() {
	rootCmd.AddCommand(infraCmd)
	infraCmd.AddCommand(infraSetupCmd)
}

var infraCmd = &cobra.Command{
	Use:   "infra",
	Short: "manage infra stuff",
	Run: func(cmd *cobra.Command, args []string) {

	},
}

// which -s python3 || brew install python3
// which -s pipenv || brew install pipenv
// pipenv --python 3
// pipenv install
// pipenv run ansible --version
// pipenv run ansible-galaxy install -r requirements.yml --force
// curl -LO https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/darwin/amd64/kubectl

var infraSetupCmd = &cobra.Command{
	Use:   "setup",
	Short: "setup infra dependencies",
	Run: func(cmd *cobra.Command, args []string) {
		println(viper.GetString("os"))
		if viper.GetString("os") == "darwin" {
			DoUnlessOrPanic("brew install python3", "which -s python3")
			DoUnlessOrPanic("brew install pipenv", "which -s pipenv")
			Do("pipenv --python 3")
			Do("pipenv run ansible --version")
			Do("pipenv run ansible-galaxy install -r requirements.yml --force")
		}
	},
}
