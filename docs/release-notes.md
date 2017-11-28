# Release Notes
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