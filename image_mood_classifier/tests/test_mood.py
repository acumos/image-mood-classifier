# -*- coding: utf-8 -*-
# ================================================================================
# ACUMOS
# ================================================================================
# Copyright © 2017 AT&T Intellectual Property & Tech Mahindra. All rights reserved.
# ================================================================================
# This Acumos software file is distributed by AT&T and Tech Mahindra
# under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# This file is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# ================================================================================

from os import path
import pytest


def test_dummy(monkeypatch):
    pathRoot = env_update(monkeypatch)

    # these aren't the droids you're looking for
    #   we use straight-up scikit/tensorflow, so defer to the unit testing of those modules...

    # TODO: possible place holder for other methods?
    pass


def env_update(monkeypatch):
    import sys

    pathRoot = path.dirname(path.dirname(path.dirname(path.abspath(__file__))))
    print("Adding '{:}' to sys path".format(pathRoot))
    if pathRoot not in sys.path:
        monkeypatch.syspath_prepend(pathRoot)
    return pathRoot
