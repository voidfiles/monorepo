package cmd

import (
	"github.com/spf13/cobra"
)

func init() {
	rootCmd.AddCommand(setupCmd)
}

var setupCmd = &cobra.Command{
	Use:   "setup",
	Short: "Do setup things",
	Run: func(cmd *cobra.Command, args []string) {
		// Install homebrew
		if info["os"] == "Darwin" {
			DoUnlessOrPanic(
				`/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)`,
				"which -s brew",
			)
		}
	},
}
