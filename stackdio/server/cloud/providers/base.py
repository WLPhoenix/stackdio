# -*- coding: utf-8 -*-

# Copyright 2014,  Digital Reasoning
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#


import logging
import os
import shutil
import socket

from django.conf import settings

logger = logging.getLogger(__name__)


class TimeoutException(Exception):
    pass


class MaxFailuresException(Exception):
    pass


class BaseCloudProvider(object):

    REQUIRED_MESSAGE = 'This field is required.'

    # SHORT_NAME - required
    # Must correspond to a salt-cloud provider type (e.g, 'aws' or
    # 'rackspace')
    SHORT_NAME = None

    # LONG_NAME - required
    # The human readable version of the SHORT_NAME (e.g, 'Amazon
    # Web Services' or 'Rackspace')
    LONG_NAME = None

    # Actions that may be executed. Implement these
    # actions below
    ACTION_STOP = 'stop'
    ACTION_START = 'start'
    ACTION_TERMINATE = 'terminate'
    ACTION_LAUNCH = 'launch'
    ACTION_PROVISION = 'provision'
    ACTION_ORCHESTRATE = 'orchestrate'
    ACTION_CUSTOM = 'custom'

    def __init__(self, obj=None, *args, **kwargs):

        # The `obj` attribute is the Django ORM object for this cloud
        # provider instance. See models.py for more information.
        self.obj = obj

        # `provider_storage` is the location where provider implementations
        # should be writing their files to. If implementations are written
        # elsewhere, there's no guarantee that it will work later, be backed
        # up, etc.
        self.provider_storage = os.path.join(settings.FILE_STORAGE_DIRECTORY,
                                             'cloud',
                                             obj.slug) if self.obj else None

        # make sure the storage directory is available
        if self.provider_storage and \
           not os.path.isdir(self.provider_storage):
            os.makedirs(self.provider_storage)

    def destroy(self):
        '''
        Cleans up the provider storage. Overrides should call
        this method to make sure files and directories are
        properly removed.
        '''
        if not self.provider_storage:
            return

        if os.path.isdir(self.provider_storage):
            logger.info('Deleting provider storage: {0}'.format(
                self.provider_storage
            ))
            shutil.rmtree(self.provider_storage)
            self.provider_storage = None

    @classmethod
    def get_provider_choice(self):
        '''
        Should return a two-element tuple of the short and long name of the
        provider type. This should be what the choices attribute on a
        model field is expected (e.g., ('db_value', 'Label') )
        '''

        if not hasattr(self, 'SHORT_NAME') or not self.SHORT_NAME:
            raise AttributeError('SHORT_NAME must exist and be a string.')

        if not hasattr(self, 'LONG_NAME') or not self.LONG_NAME:
            raise AttributeError('LONG_NAME must exist and be a string.')

        return (self.SHORT_NAME, self.LONG_NAME)

    @classmethod
    def get_required_fields(self):
        '''
        Return the fields required in the data dictionary for
        `get_provider_data` and `validate_provider_data`
        '''
        raise NotImplementedError()

    @classmethod
    def get_provider_data(self, data, files=None):
        '''
        Takes a dict of values provided by the user (most likely from the
        request data) and returns a new dict of info that's specific to
        the provider type you're implementing. The returned dict will be
        used in the yaml config written for salt cloud.

        `files` is a list of files that might have been uploaded to the
        API that is available at this time. Each provider implementation
        must make sure that any files are written to disk and referenced
        properly in the result dict for salt cloud.

        See Salt Cloud documentation for more info on what needs to be in
        this return dict for each provider.
        '''
        raise NotImplementedError()

    @classmethod
    def validate_provider_data(self, data, files=None):
        '''
        Checks that the keys defined in `get_required_fields` are in the
        given `data` dict. This merely checks that they are there and the
        values aren't empty. Override for any additional validation
        required.
        '''
        errors = {}
        for key in self.get_required_fields():
            if not data.get(key):
                errors.setdefault(key, []).append(
                    '{0} is a required field.'.format(key)
                )

        return errors

    @classmethod
    def validate_image_id(self, image_id):
        '''
        Given an image_id, check that it exists and you have
        permissions to use it. It should a tuple:
            (boolean, string)
        where True means the image_id is available, and False
        means it does not. The string is the underlying error
        string if provided.
        '''
        raise NotImplementedError()

    @classmethod
    def register_dns(self, hosts):
        '''
        Given a list of 'stacks.Host' objects, this method's
        implementation should handle the registration of DNS
        for the given cloud provider (e.g., Route53 on AWS)
        '''
        raise NotImplementedError()

    @classmethod
    def unregister_dns(self, hosts):
        '''
        Given a list of 'stacks.Host' objects, this method's
        implementation should handle the de-registration of DNS
        for the given cloud provider (e.g., Route53 on AWS)
        '''
        raise NotImplementedError()

    @classmethod
    def get_current_instance_data(cls):
        '''
        Get the instance data for the current instance (usually the stackdio
        instance & salt master
        '''

        # Since there's not a good way to get the provider type of the current
        # instance, just try them all until one works
        for subclass in BaseCloudProvider.__subclasses__():
            try:
                return subclass.get_current_instance_data()
            except Exception:
                continue

        # Nothing worked, so just do the last resort method
        return socket.getfqdn()
