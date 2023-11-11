package cmd

import (
	"fmt"

	"github.com/bitfield/script"
)

func Do(do string) error {
	s := script.Exec(do)
	s.Wait()
	if s.Error() != nil {
		return fmt.Errorf("failed to run do cmd: %s", do)
	}

	return nil
}

func DoUnless(do, unless string) error {
	p := script.Exec(unless)
	p.Wait()
	if err := p.Error(); err != nil {
		return fmt.Errorf("failed to run unless cmd: %s", unless)
	}
	if p.ExitStatus() > 0 {
		return Do(do)
	}

	return nil
}

func DoUnlessOrPanic(do, unless string) error {
	if err := DoUnless(do, unless); err != nil {
		panic(err)
	}

	return nil
}
