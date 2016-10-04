# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


import copy
import json
import os


DEFAULT_FRONTEND_CONFIG = {
    'backend-api': {
        'url': 'http://127.0.0.1:8383'
    },
    'login_conf': {
       'login_type': 'persona',  # persona OR ldap

       'ldap_uri': 'ldaps://ldap.server/',
       'ldap_base': 'ou=test,dc=test_dc',

       'ldap_check_authorized_groups': True,
       'ldap_base_group': 'ou=group,dc=test_group',
       'ldap_filter_group': '(object=Object)(test=Test)',
       'ldap_authorized_groups': ['groupTest1', 'groupTest2']
    },
    'default_groups': ['Test']  # Groups affected to new user

}


def _load_config(name):
    """
    Load the named configuration file from either the system in
    /etc/minion or if that does not exist from ~/.minion. Returns None
    if neither exists. Throws an exception if the file could not be
    opened, read or parsed.
    """
    if os.path.exists("/etc/minion/%s" % name):
        with open("/etc/minion/%s" % name) as fp:
            return json.load(fp)
    if os.path.exists(os.path.expanduser("~/.minion/%s" % name)):
        with open(os.path.expanduser("~/.minion/%s" % name)) as fp:
            return json.load(fp)

def frontend_config():
    """
    Load the frontend config from the two known locations. If it does
    not exist then return a copy of the default config.
    """
    return _load_config("frontend.json") or copy.deepcopy(DEFAULT_FRONTEND_CONFIG)
