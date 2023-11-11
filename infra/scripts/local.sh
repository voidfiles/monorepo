#!/bin/bash
export LOCAL_IP=`multipass list --format=json | jq -j -rc '.list[] | select( .name | contains("local")) | .ipv4[0]' | tr -d '\n'`

multipass list | grep local || multipass launch -vvvv -n local --memory 4G --disk 10G --cloud-init cloud-config.yaml focal
ansible_playbook_flags=""

if [ "${VERBOSE}" ]; then
    ansible_playbook_flags="${ansible_playbook_flags} -vvv"
fi

if [ "${ASK_FOR_PASS}" ]; then
    ansible_playbook_flags="${ansible_playbook_flags} -K"
fi

if [ "${TAGS}" ]; then
    ansible_playbook_flags="${ansible_playbook_flags} --tags ${TAGS}"
fi

echo "Creating bear ${LOCAL_IP} ${ansible_playbook_flags}"
pipenv run ansible-playbook ${ansible_playbook_flags} -i inventory/local.sh playbooks/k3s.yml

curl -LO https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/darwin/amd64/kubectl