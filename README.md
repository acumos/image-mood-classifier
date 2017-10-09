# image-emotion-classification
A model example for image classification (for emotional impact).  This model
relies on a first pass with image classification features and then learns
a secondary classification layer.

## Image Emotion Classification 

http://www.imageemotion.org/

We separate the data into a training and test set using K-fold Cross Validation (K = 5).

### Usage
This package contains runable scripts for command-line evaluation,
packaging of a model (both dump and posting), and simple web-test
uses.   All functionality is encapsulsted in the `classify_image.py`
script and has the following arguments.

### Examples
Example for evaluation of a test image with top 5 results.
```
/bin/run_local.sh -m model.h5 -i data/model-t.jpg -f keras -l data/keras_class_names.txt -n 5
```


### Usage
*This use case is currently omitted and the image classification
utility is provided by a keras-build tensorflow model. However, the
lessons for creating a hybrid keras model are applicable to the tensorflow
patterns.*

# Example Interface
An instance should first be built and downloaded from Cognita and then
launched locally.  Afterwards, the sample application found in 
[web_demo](web_demo) uses a `localhost` service to classify
and visualize the results of image classification.
