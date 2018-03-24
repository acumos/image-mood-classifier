<!---
.. ===============LICENSE_START=======================================================
.. Acumos CC-BY-4.0
.. ===================================================================================
.. Copyright (C) 2017-2018 AT&T Intellectual Property & Tech Mahindra. All rights reserved.
.. ===================================================================================
.. This Acumos documentation file is distributed by AT&T and Tech Mahindra
.. under the Creative Commons Attribution 4.0 International License (the "License");
.. you may not use this file except in compliance with the License.
.. You may obtain a copy of the License at
..
.. http://creativecommons.org/licenses/by/4.0
..
.. This file is distributed on an "AS IS" BASIS,
.. WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
.. See the License for the specific language governing permissions and
.. limitations under the License.
.. ===============LICENSE_END=========================================================
-->

# Image Mood Classifier Release Notes
## 0.4
### 0.4.4
* Documentation and package update to use install instructions instead of installing
  this package directly into a user's environment.

### 0.4.3
* Refactor to remote the demo `bin` scripts and rewire for direct call of the
  script `classify_image.py` as the primary interaction mechanism.
* Refactor documentation into sections and tutorials.
* Create this release notes document for better version understanding.

### 0.4.2
* Minor refactor to avoid possibly reserved syntax name

### 0.4.1
* Refactor for compliant dataframe usage following primary client library
  examples for repeated columns (e.g. dataframes) instead of custom types
  that parsed rows individually.
* Refactor web, api, main model wrapper code for corresponding changes.

### 0.4.0
* Migration from previous library structure to new acumos client library
* Refactor to not need **this** library as a runtime/installed dependency

## 0.3
* Modify to understand batch-output mode from **image-classifier** model