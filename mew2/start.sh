#!/bin/bash
#
## TODO: refactor to be less verbose

OS=$(uname -s)
AUTOMATION="OFF"

echo $OS
clear

# mac
if [ $OS = "Darwin" ]; then
    echo "-------------------------------------------------------------------------------------------"

    echo "Starting Mac installation, please don't cancel unless you REALLY know what you're doing..."

  if $(! type -P brew &>/dev/null) ; then
    echo "Installing brew.........."
    ruby -e "$(curl -fsSL https://raw.github.com/mxcl/homebrew/go)"
    brew doctor
  else
    brew update
    echo "`brew -v` installed"
  fi
    echo "-------------------------------------------------------------------------------------------1/10"

  if $(! type -P git &>/dev/null) ; then
    echo "Installing git.........."
    brew install git
    brew link git
  else
    brew upgrade git
  fi

    echo "-------------------------------------------------------------------------------------------2/10"
  if $(! type -P node &>/dev/null) ; then
    printf "\nInstalling Node.js and n (Node version manager https://github.com/visionmedia/n)...\n"
    brew install node
    npm install -g n
    n stable
    printf "\nRemoving Brew's Node and only using Node version manager n.\n"
    brew uninstall node
  else
    printf "\nInstalling or updating n (Node version manager https://github.com/visionmedia/n) then stable version of Node.js...\n"
    npm install -g n
    n stable
    printf "\nRemoving Brew's Node and only using Node version manager n."
    brew uninstall node
    echo "node.js `node -v` installed"
  fi
    echo "-------------------------------------------------------------------------------------------3/10"

  if $( type -P rvm &>/dev/null) ; then
    printf "\nRemoving RVM since we're using rbenv and they aren't compatible..."
    sudo rvm implode
    sudo rm -rf ~/.rvm
  fi

    echo "-------------------------------------------------------------------------------------------4/10"
  if $(! type -P rbenv &>/dev/null) ; then
    printf "\nInstalling rbenv (https://github.com/sstephenson/rbenv)..."
    brew install rbenv
    echo 'if which rbenv > /dev/null; then eval "$(rbenv init -)"; fi' >> ~/.bash_profile
    brew install ruby-build
    source ~/.bash_profile
    printf "\nDownloading and installing Ruby 2.0 and JRuby. May take a bit..."
    rbenv install 2.0.0-p247
    rbenv global 2.0.0-p247
    rbenv install jruby-1.7.4
    rbenv rehash
    gem install compass
    printf "\nFinished installing Rubies and restarted your shell. Please run start.sh again to finish.\n"
    exec $SHELL -l
  else
    echo "We're using Ruby 2.0 with the Compass gem, QA uses JRuby. Here's what you have installed..."
    rbenv versions
    compass -v
  fi

    echo "-------------------------------------------------------------------------------------------5/10"

  if [ $AUTOMATION = "ON" ]; then
    if [ ! -d "SiteAutomation" ]; then
      printf "\nCloning QA's repo to allow us to run automation locally..."
      git clone git@mdc2vr3142:automation/SiteAutomation.git SiteAutomation --recurse-submodules
      cd SiteAutomation
      rbenv local jruby-1.7.4
      gem install bundler
      bundle install
      cd ..
    else
      printf "\nUpdate SiteAutomation"
      cd SiteAutomation
      rbenv local jruby-1.7.4
      gem install bundler
      git pull
      git submodule init
      git submodule update
      bundle install
      cd ..
    fi
  fi

    echo "-------------------------------------------------------------------------------------------6/10"

  printf "\nWith our installs we should not have to use sudo with npm or bower. If it is necessary we need to work out why.\n\n"

  if $(! type -P grunt &>/dev/null) ; then
    echo "Installing grunt.........."
    npm install -g grunt-cli
    if [[ ! "$PATH" =~ "/usr/local/share/npm/bin" ]]; then
      echo "export PATH=$PATH:/usr/local/share/npm/bin" >> ~/.bash_profile
      source ~/.bash_profile
    fi
  else
    npm update -g grunt-cli
    echo "`grunt -version` installed"
  fi

    echo "-------------------------------------------------------------------------------------------7/10"

  if $(! type -P bower &>/dev/null) ; then
    echo "Installing bower.........."
    npm install -g bower
    if [[ ! "$PATH" =~ "/usr/local/share/npm/bin" ]]; then
      echo "export PATH=$PATH:/usr/local/share/npm/bin/" >> ~/.bash_profile
      source ~/.bash_profile
    fi
  else
    npm update -g bower
    echo "bower `bower -version` installed"
    bower cache clean
  fi

    echo "-------------------------------------------------------------------------------------------8/10"

  if $(! git config --global --get url."https://".insteadOf &>/dev/null) ; then
    echo "Updating ~/.gitconfig to use https protocol so bower can penetrate firewall"
    git config --global url."https://".insteadOf git://
  else
    echo "Firewall-friendly git protocol already set in ~/.gitconfig"
  fi

    echo "-------------------------------------------------------------------------------------------9/10"


  if [ -d "client/common/libs" ]; then
    echo "Libs target directory already exists"
  else
    echo "Creating libs target directory"
    mkdir -p client/common/libs
  fi
    echo "-------------------------------------------------------------------------------------------10/10"

  cd server/common;

  npm install;

  cd ../..;

  npm install;
  bower install;

  printf "\nSUGGESTION: Restart your Shell\n"
#   exec $SHELL -l
fi
    echo "-------------------------------------------------------------------------------------------DONE"

# ubuntu
if [ $OS = "Linux" ]; then

  echo "Starting ubuntu installation..."

  set -o errexit

  # If we're running the setup script for the first time,
  # we need to run sudo apt-get clean update
  if [ ! -f ~/.mew20_setup_run_first_time.txt ]; then
    echo ">>> APT Cleaning and updating..."
    sudo apt-get -qq clean 1>/dev/null
    sudo apt-get -qq update 1>/dev/null
    echo "do not remove me, otherwise every vagrant up will run 'apt-get clean update' unnecessarily and take longer!!" > ~/.mew20_setup_run_first_time.txt
  fi


  # Installs ruby
  if $(! type -P ruby &>/dev/null || !(ruby --version | grep '1.9.') &>/dev/null) ; then
    echo ">>> Installing ruby..."
    sudo apt-get -y -qq install ruby1.9.3 1>/dev/null
  fi
  echo "> `ruby --version` installed"

  # Installs the ruby gems sass, compass (for sass -> css) and bundler (to have sass updated)
  if $(! type -P compass &>/dev/null || ! type -P sass &>/dev/null ) ; then
    echo ">>> Installing bundle, sass, compass (ruby gems)..."
    sudo gem install sass -v 3.2.10 -q --no-ri --no-rdoc 1>/dev/null
    sudo gem install compass -v 0.12.2 -q --no-ri --no-rdoc 1>/dev/null
  fi
  echo "> `gem list bundler | grep 'bundler'` installed"
  echo "> `gem list sass | grep 'sass'` installed"
  echo "> `gem list compass | grep 'compass'` installed"



  # Installs git
  if $(! type -P git &>/dev/null) ; then
    echo ">>> Installing git..."
    sudo apt-get -y -qq install git 1>/dev/null
  fi
  echo "> `git --version` installed"

  if $(! git config --global --get url."https://".insteadOf &>/dev/null) ; then
    echo "> Configuring git to prefer the http protocol over git for cloning"
    git config --global url."https://".insteadOf git:// 1>/dev/null
  fi


  # Installs nodejs
  if $(! type -P node &>/dev/null) ; then
    echo ">>> Installing nodejs dependencies..."
    sudo apt-get -y -qq install python-software-properties python g++ make software-properties-common 1>/dev/null
    sudo add-apt-repository -y ppa:chris-lea/node.js 1>/dev/null
    sudo apt-get -y -qq update 1>/dev/null

    echo '>>> Installing nodejs...'
    sudo apt-get -y -qq install nodejs 1>/dev/null
  fi
  echo "> node.js `node -v` installed"


  # Installs phantomjs
  if $(! type -P phantomjs &>/dev/null) ; then
    echo ">>> Installing phantomjs 1.9.0 (32bit)..."
    cd ~
    wget -q https://phantomjs.googlecode.com/files/phantomjs-1.9.0-linux-i686.tar.bz2 1>/dev/null
    sudo mv ~/phantomjs-1.9.0-linux-i686.tar.bz2 /usr/local/share
    cd /usr/local/share
    sudo tar -xvf phantomjs-1.9.0-linux-i686.tar.bz2 1>/dev/null
    sudo ln -s /usr/local/share/phantomjs-1.9.0-linux-i686 /usr/local/share/phantomjs
    sudo ln -s /usr/local/share/phantomjs/bin/phantomjs /usr/local/bin/phantomjs
    cd ~
  fi
  echo "> phantomjs `phantomjs -v` installed"


  # Installs JDK 7
  if $(! type -P javac &>/dev/null) ; then
    echo ">>> Installing JDK 7..."
    sudo apt-get -y -qq install openjdk-7-jdk 1>/dev/null
  fi
  echo "> `javac -version` installed"

  # Installs grunt
  if $(! type -P grunt &>/dev/null) ; then
    echo ">>> Installing grunt (cli)..."
    sudo npm install -g --silent grunt-cli 1>/dev/null
  fi
  echo "> `grunt -version` installed"

  # Installs bower
  if $(! type -P bower &>/dev/null) ; then
    echo ">>> Installing bower..."
    sudo npm install -g --silent bower 1>/dev/null
  fi
  echo "> bower `bower -version` installed"

  # Installs jshint
  if $(! type -P jshint &>/dev/null) ; then
    echo ">>> Installing jshint..."
    sudo npm install -g --silent jshint 1>/dev/null
  fi
  echo "> `jshint -version` installed"

  # Installs jshint
  if $(! type -P jscs &>/dev/null) ; then
    echo ">>> Installing jscs..."
    sudo npm install -g --silent jscs 1>/dev/null
  fi
  echo "> jscs `jscs -version` installed"


  # Installs foreman
  if $(! type -P foreman &>/dev/null) ; then
    echo ">>> Installing foreman..."
    sudo gem install foreman -q --no-ri --no-rdoc 1>/dev/null
  fi
  echo "> foreman `foreman -v` installed"

  # Installs the project dependencies for the first time
  echo ">>> Installing project dependencies (npm install)..."
  if [ ! -z "$1" ] ; then
    cd "$1"
  fi

  # commented out, as the node_modules folder is versioned
  # cd ../..
  # npm install --no-bin-links --silent 1>/dev/null

  echo "You are good to go."
  echo ""
  echo "Now, you can:"
  echo "  1. '$> vagrant ssh' to get inside the VM"
  echo "  2. 'cd /vagrant' to get inside the project folder"
  echo "  3. 'foreman start dev' to run the project."
  echo ""
  echo "After you see that the 'watch task' is watching, you can run to your browser"
  echo "on your guest OS (Windows for BCOM) and open localhost:8081 to see it working."
  echo ""
fi

