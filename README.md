# image-mood-classification
A model example for image classification (for emotional impact).  This model
relies on a first pass with image classification features and then learns
a secondary classification layer.

## Image Mood Classification
Adapting a task of image mood classification, this model learns a set of
labels on top of the *image-classifier* output features (some 1000 classification tags).
The training data comes from the "art photos" from this [academic work](https://dl.acm.org/citation.cfm?id=1873965)
also posted on the authors' [publication website](http://www.imageemotion.org/):

    Jana Machajdik and Allan Hanbury. 2010. *Affective image classification using features inspired by psychology and art theory*. In Proceedings of the 18th ACM international conference on Multimedia (MM '10). ACM, New York, NY, USA, 83-92. DOI: https://doi.org/10.1145/1873951.1873965

Specifically, the example images for this dataset are [available here](http://www.imageemotion.org/testImages_artphoto.zip).
A handful of these images is also available in the [samples](data/samples) directory.
*Note: These sample images are copyright of their original authors and are provided
only for testing and demonstration purposes, and are not authorized for sale or redistribution
outside of this context.*.

Following original experimental definitions, the model is evaluated by
separating the data into a training and test set using K-fold Cross Validation (K = 5).
Original performance metrics comparing methods on this data are shown
below, as found in the [original publication](https://dl.acm.org/citation.cfm?id=1873965).


### Usage
This package contains runable scripts for command-line evaluation,
packaging of a model (both dump and posting), and simple web-test
uses.   All functionality is encapsulated in the `classify_image.py`
script and has the following arguments.

```
usage: run_image-mood-classifier_reference.py [-h] [-l LABELS]
                                              [-p PREDICT_PATH] [-i INPUT]
                                              [-C CUDA_ENV] [-m MODEL_TYPE]
                                              [-f] [-a PUSH_ADDRESS]
                                              [-d DUMP_MODEL]

optional arguments:
  -h, --help            show this help message and exit
  -l LABELS, --labels LABELS
                        Path to label one-column file with one row for each
                        input
  -p PREDICT_PATH, --predict_path PREDICT_PATH
                        Save predictions from model (model must be provided
                        via 'dump_model')
  -i INPUT, --input INPUT
                        Absolute path to input training data file. (for now
                        must be a header-less CSV)
  -C CUDA_ENV, --cuda_env CUDA_ENV
                        Anything special to inject into CUDA_VISIBLE_DEVICES
                        environment string
  -m MODEL_TYPE, --model_type MODEL_TYPE
                        specify the underlying classifier type (rf
                        (randomforest), svc (SVM))
  -f, --feature_nomask  do not create masked samples on input
  -a PUSH_ADDRESS, --push_address PUSH_ADDRESS
                        server address to push the model (e.g.
                        http://localhost:8887/v2/models)
  -d DUMP_MODEL, --dump_model DUMP_MODEL
                        dump model to a pickle directory for local running
```


### Examples
Example for training the classifier on the provided dataset. Note, the
features have already been processed by the *image-classification (v0.3)*
model and stored in that native format in [features_testImages_artphoto.csv.bz2](data/features_testImages_artphoto.csv.bz2).
```
./bin/run_local.sh -l data/labels_testImages_artphoto.txt  -i data/features_testImages_artphoto.csv.bz2 -d model
```

Add the no-mask flag to speed up training and avoid sample simulation.
```
./bin/run_local.sh -f -l data/labels_testImages_artphoto.txt  -i data/features_testImages_artphoto.csv.bz2 -d model
```

Example for evaluating a set of features from the *image-classification*
model.
```
./bin/run_local.sh -i data/example_awe_1.csv -d model -p data/example_mood.csv
```

Sample images examples can be found in the [web_demo/images](web_demo/images) directory.


### Performance Analysis
A training analysis of results demonstrates that this problem is not trivial.
Contrary to the results in the original publication, F1 scores for
methods in this model are not that high.

After version 0.3, training also generates additional samples form
feature masking (e.g. missing or zero-based features).  This adds some
robustness for image-classifier results that have only partial information
and generally adds importance to the stronger class features as well.
Some classifiers (for example, deep neural nets (DNN)) can benefit from
the additional samples, even if they are similar to the original.

```
(Random Forest - 300 estimators); the default
             precision    recall  f1-score   support

  amusement       0.29      0.27      0.28        22
      anger       0.25      0.10      0.14        10
        awe       0.37      0.37      0.37        19
contentment       0.50      0.45      0.48        11
    disgust       0.21      0.27      0.24        11
 excitement       0.38      0.31      0.34        26
       fear       0.38      0.55      0.44        22
        sad       0.29      0.29      0.29        41

avg / total       0.33      0.33      0.33       162

(Support Vector Multiclass - linear kernel)
             precision    recall  f1-score   support

  amusement       0.22      0.23      0.22        22
      anger       0.07      0.10      0.08        10
        awe       0.22      0.21      0.22        19
contentment       0.21      0.27      0.24        11
    disgust       0.12      0.18      0.14        11
 excitement       0.48      0.42      0.45        26
       fear       0.44      0.50      0.47        22
        sad       0.30      0.20      0.24        41

avg / total       0.29      0.28      0.28       162


```

# Example Interface
An instance should first be built and downloaded from Cognita and then
launched locally.  Afterwards, the sample application found in 
[web_demo](web_demo) uses a `localhost` service to classify
and visualize the results of image classification.

### Example Images
For the purpose of testing the classifier a few sample images are provided.
While these images are [approved for commercial use](https://creativecommons.org/licenses/by-nd/2.0/),
the original author retains all rights.

* [happy 1](data/example_happy_1.jpg) - [flickr source](https://flic.kr/p/73ZzcE)
* [awe 1](data/example_awe_1.jpg) - [flickr source](https://flic.kr/p/RLzkvA)
* [excitement 1](data/example_excitement_1.jpg) - [flickr source](https://flic.kr/p/fN8y4d)
