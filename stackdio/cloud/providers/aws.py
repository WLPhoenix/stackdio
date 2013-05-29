"""
Amazon Web Services provider for stackd.io
"""

import os
import logging

from cloud.providers.base import BaseCloudProvider

logger = logging.getLogger(__name__)


##
# Required parameters that must be defined
##

class AWSCloudProvider(BaseCloudProvider):
    SHORT_NAME = 'aws'
    LONG_NAME  = 'Amazon Web Services' 

    # The AWS access key id
    ACCESS_KEY = 'access_key_id'

    # The AWS secret access key
    SECRET_KEY = 'secret_access_key'

    # The AWS keypair name
    KEYPAIR = 'keypair'

    # The AWS security groups
    SECURITY_GROUPS = 'security_groups'

    # The path to the private key for SSH
    PRIVATE_KEY_FILE = 'private_key_file'

    @classmethod
    def get_required_fields(self):
        return [
            self.ACCESS_KEY, 
            self.SECRET_KEY, 
            self.KEYPAIR,
            self.SECURITY_GROUPS
        ]

    def get_provider_data(self, data, files):
        # write the private key to the proper location
        private_key_path = os.path.join(self.provider_storage, 'id_rsa')
        with open(private_key_path, 'w') as f:
            f.write(files[self.PRIVATE_KEY_FILE].read())

        security_groups = filter(None, data[self.SECURITY_GROUPS].split(','))
        yaml_data = {
            'provider': self.SHORT_NAME,
            'id': data[self.ACCESS_KEY],
            'key': data[self.SECRET_KEY], 
            'keyname': data[self.KEYPAIR],
            'securitygroup': security_groups,
            'private_key': private_key_path,
        }

        return yaml_data

    @classmethod
    def validate_provider_data(self, data, files):
        result, errors = super(AWSCloudProvider, self) \
            .validate_provider_data(data, files)

        # check for required files
        if not files or self.PRIVATE_KEY_FILE not in files:
            result = False
            errors[self.PRIVATE_KEY_FILE].append(self.REQUIRED_MESSAGE)
        
        return result, errors
