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
logger = logging.getLogger(__name__)


class SuperuserFieldsMixin(object):
    '''
    Filters out the serialized fields found in `superuser_fields` if
    the authenticated user is *not* a superuser. For example, with
    the following Meta definition, the 'foo' field would be removed
    from serialization if the user is not a superuser.

    class Meta:
        fields = ('foo', 'bar', baz')
        superuser_fields = ('foo',)

    '''
    def get_fields(self, *args, **kwargs):
        # Get the current set of fields as defined in the Meta class
        fields = super(SuperuserFieldsMixin, self).get_fields(*args, **kwargs)

        # If user is a superuser, let all fields go through
        if 'request' in self.context and self.context['request'].user.is_superuser:
            return fields

        # If superuser_fields has not been defined, keep the original
        if not hasattr(self, 'Meta') or not hasattr(self.Meta,
                                                    'superuser_fields'):
            return fields

        # Remove superuser fields from outgoing serializable fields
        superuser_fields = set(self.Meta.superuser_fields)
        regular_fields = set(fields.keys())
        for field_name in superuser_fields & regular_fields:
            fields.pop(field_name)

        return fields
