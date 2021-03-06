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

from rest_framework import serializers

from .models import (
    Volume, 
)

logger = logging.getLogger(__name__)


class VolumeSerializer(serializers.HyperlinkedModelSerializer):
    owner = serializers.Field()
    snapshot_name = serializers.Field(source='snapshot.snapshot_id')
    size_in_gb = serializers.Field(source='snapshot.size_in_gb')

    class Meta:
        model = Volume
        fields = (
            'id',
            'url',
            'owner',
            'volume_id',
            'attach_time',
            'stack',
            'hostname',
            'host',
            'snapshot',
            'snapshot_name',
            'size_in_gb',
            'device',
            'mount_point',
        )
