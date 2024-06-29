#!/bin/bash

export LOCAL_IP=`multipass list --format=json | jq -cr '.list[] | select( .name | contains("local")) | .ipv4[0]'`

if [ "$1" == "--list" ] ; then
cat<<EOF
{
  "beast": {
	"hosts": [
	  "${LOCAL_IP}"
	],
    "vars": {
      "development": "true",
      "domain_name": "localdev.tailnet.rumproarious.com"
    }
  }
} 
EOF
elif [ "$1" == "--host" ]; then
  echo '{"_meta": {"hostvars": {"development": "true", "domain_name": "localdev.tailnet.rumproarious.com"}}}'
else
  echo "{ }"
fi