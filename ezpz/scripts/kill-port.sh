#!/bin/bash

red='\033[0;31m'
green='\033[0;32m'
yellow='\033[0;33m'
cyan='\033[0;36m'
clear='\033[0m'

ports=("3000")

for i in "${ports[@]}"; do
  if [ "$(lsof -ti:"$i")" == "" ]; then
    echo -e "${green}port ${cyan}${i}${green} not used${clear}"
  else
    echo -e "${yellow}closing port ${cyan}${i}${clear}"

    kill -9 "$(lsof -ti:"${i}")" || echo -e "${red}failed to close port ${cyan}${i}${clear}"

    if [ "$(lsof -ti:"$i")" == "" ]; then
      echo -e "${green}port ${cyan}${i}${green} closed successfully${clear}"
    else
      echo -e "${red}failed to close port ${cyan}${i}${clear}"
    fi

  fi
done