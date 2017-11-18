# Image Mood Classification
Adapting a task of image mood classification, this model learns a set of
labels on top of the *image-classifier* output features (some 1000 classification tags).


## Background
The experimental motivation and training data comes from
the "art photos" from this [academic work](https://dl.acm.org/citation.cfm?id=1873965)
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


## Usage
This package contains runable scripts for command-line evaluation,
packaging of a model (both dump and posting), and simple web-test
uses.   All functionality is encapsulated in the `classify_image.py`
script and has the following arguments.

```
usage: classify_image.py [-h] [-l LABELS] [-p PREDICT_PATH] [-i INPUT]
                         [-C CUDA_ENV] [-m {svm,rf}] [-f] [-n]
                         [-a PUSH_ADDRESS] [-A AUTH_ADDRESS] [-d DUMP_MODEL]
                         [-s SUMMARY]

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
  -m {svm,rf}, --model_type {svm,rf}
                        specify the underlying classifier type (rf
                        (randomforest), svc (SVM))
  -f, --feature_nomask  create masked samples on input
  -n, --add_softnoise   do not add soft noise to classification inputs
  -a PUSH_ADDRESS, --push_address PUSH_ADDRESS
                        server address to push the model (e.g.
                        http://localhost:8887/upload)
  -A AUTH_ADDRESS, --auth_address AUTH_ADDRESS
                        server address for login and push of the model (e.g.
                        http://localhost:8887/auth)
  -d DUMP_MODEL, --dump_model DUMP_MODEL
                        dump model to a pickle directory for local running
  -s SUMMARY, --summary SUMMARY
                        summarize top N image classes are strong for which
                        label class (only in training)
```


Sample images examples can be found in the [web_demo/images](web_demo/images) directory.

### Example Images
For the purpose of testing the classifier a few sample images are provided.
While these images are [approved for commercial use](https://creativecommons.org/licenses/by-nd/2.0/),
the original author retains all rights.

* [happy 1](data/example_happy_1.jpg) - [flickr source](https://flic.kr/p/73ZzcE)
* [awe 1](data/example_awe_1.jpg) - [flickr source](https://flic.kr/p/RLzkvA)
* [excitement 1](data/example_excitement_1.jpg) - [flickr source](https://flic.kr/p/fN8y4d)
* [excitement 2](data/example_excitement_2.jpg) - [flickr source](https://flic.kr/p/eo4YkD)
* [sad 1](data/example_sad_1.jpg) - [flickr source](https://flic.kr/p/8Kmqib)


# Example Usages
Please consult the [tutorials](tutorials) dirctory for usage examples.

# Release Notes
The [release notes](release-notes.md) catalog additions and modifications
over various version changes.
