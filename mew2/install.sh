#!/bin/bash

# assumes new Mac system with Mavericks (10.9) using Bash shell for MCOM

has() {
  type "$1" > /dev/null 2>&1
  return $?
}

if ! has "gcc"; then # check for command line tools
  xcode-select --install
fi

# install Homebrew
ruby -e "$(curl -fsSL https://raw.github.com/Homebrew/homebrew/go/install)"

brew install node # nvm requires shell restart

npm install -g grunt-cli bower jshint jscs

sudo gem install compass # using system ruby

cp .sample_mcom_env .env

echo "Done! Build the app by running command \"grunt\""
