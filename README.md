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


### Examples
Example for training the classifier on the provided dataset. Note, the
features have already been processed by the *image-classification (v0.3)*
model and stored in that native format in [features_testImages_artphoto.csv.bz2](data/features_testImages_artphoto.csv.bz2).
```
python classify_image.py -l data/labels_testImages_artphoto.txt  -i data/features_testImages_artphoto.csv.bz2 -d model
```

Example for evaluating a set of features from the *image-classification*
model.
```
python classify_image.py  -i data/example_awe_1.csv -d model -p data/example_mood.csv
```

### Performance Analysis
A training analysis of results demonstrates that this problem is not trivial.
Contrary to the results in the original publication, F1 scores for
methods in this model are not that high.
```
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

(Random Forest - 300 estimators)
             precision    recall  f1-score   support

  amusement       0.29      0.27      0.28        22
      anger       0.00      0.00      0.00        10
        awe       0.44      0.37      0.40        19
contentment       0.50      0.36      0.42        11
    disgust       0.38      0.27      0.32        11
 excitement       0.50      0.35      0.41        26
       fear       0.38      0.68      0.49        22
        sad       0.35      0.41      0.38        41

avg / total       0.37      0.38      0.36       162

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

* ![happy 1](data/example_happy_1.jpg) - [flickr source](https://flic.kr/p/73ZzcE)
* ![awe 1](data/example_awe_1.jpg) - [flickr source](https://flic.kr/p/RLzkvA)
* ![excitement 1](data/example_excitement_1.jpg) - [flickr source](https://flic.kr/p/fN8y4d)
