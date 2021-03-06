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

from rest_framework import (
    generics,
    permissions,
)

from core.permissions import AdminOrOwnerPermission
from .models import (
    Volume,
)
from .serializers import (
    VolumeSerializer,
)
from . import filters

logger = logging.getLogger(__name__)


class VolumeListAPIView(generics.ListAPIView):
    model = Volume
    serializer_class = VolumeSerializer
    filter_class = filters.VolumeFilter

    def get_queryset(self):
        return Volume.objects.filter(stack__owner=self.request.user)


class VolumeAdminListAPIView(generics.ListAPIView):
    model = Volume
    serializer_class = VolumeSerializer
    permission_classes = (permissions.IsAdminUser,)
    filter_class = filters.VolumeFilter

    def get_queryset(self):
        return self.model.objects.all()


class VolumeDetailAPIView(generics.RetrieveAPIView):
    model = Volume
    serializer_class = VolumeSerializer
    permission_classes = (AdminOrOwnerPermission,)

    # def get_object(self):
    #     return get_object_or_404(Volume,
    #                              pk=self.kwargs.get('pk'),
    #                              stack__owner=self.request.user)

