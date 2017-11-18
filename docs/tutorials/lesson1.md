# Wrapping Models for Deployment
To utilize this classifier model, it trains a meta classifier on top of
produced image classification tags to approximate the mood of the image.
Continue to the [next tutorial](lesson2.md)
to see how to utilize these models with a simple demo API server.


## Model Deployment
Following similar use pattens described by the main client library, there are
two primary modes to export and deploy the generated classifier: by dumping
it to disk or by pushing it to an onboarding server.  Please consult the
[reference manual](../image-classification.md#usage) for more specific arguments
but the examples below demonstrate basic capabilities.

Example for training the classifier on the provided dataset. Note, the
features have already been processed by the *image-classification (v0.3)*
model and stored in that native format in [features_testImages_artphoto.csv.bz2](data/features_testImages_artphoto.csv.bz2).
```
python image_mood_classifier/classify_image.py -l data/labels_testImages_artphoto.txt  -i data/features_testImages_artphoto.csv.bz2 -d model_large
```

Add the `no-mask` flag to speed up training and avoid sample simulation. **(Recommended)**
```
python image_mood_classifier/classify_image.py -f -l data/labels_testImages_artphoto.txt  -i data/features_testImages_artphoto.csv.bz2 -d model_small
```

## In-place Evaluation
In-place evaluation **will utilize** a serialized version of the model and load
it into memory for use in-place.  This mode is handy for quick
evaluation of images or image sets for use in other classifiers.

Example for evaluating a set of features from the **image-classification**
model.
```
python image_mood_classifier/classify_image.py -i data/example_awe_1.csv -d model_small -p data/example_mood.csv
```

Example for printing top contributors (in training data) from **image-classification** to mood label.
```
python image_mood_classifier/classify_image.py -f -l data/labels_testImages_artphoto.txt  -i data/features_testImages_artphoto.csv.bz2 -s 5
```


## Performance Analysis
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

### Image Classes Most Related to Mood
Using a quick summary analysis, these are the top 5 image classes associated with
mood in the provided training data.  Users can explore data this way and find image
that contain these classes/objects to assert strength for a specific mood.  An
interesting data observation is the overlap of the class `seashore, coast, seacoast, sea-coast` for
`excitement`, `awe`, and `contentment`.

* Label: 'amusement', top 5 classes...
   * ping-pong ball                          3.370771
   * seashore, coast, seacoast, sea-coast    3.029028
   * bubble                                  3.007231
   * balloon                                 2.578175
   * jean, blue jean, denim                  2.178420
* Label: 'anger', top 5 classes...
   * lipstick, lip rouge    3.039408
   * mask                   2.279731
   * volcano                2.021753
   * wig                    1.857592
   * hair spray             1.239879
* Label: 'awe', top 5 classes...
   * seashore, coast, seacoast, sea-coast    7.125516
   * lakeside, lakeshore                     4.629456
   * cliff, drop, drop-off                   2.226622
   * wig                                     1.824174
   * promontory, headland, head, foreland    1.719891
* Label: 'contentment', top 5 classes...
   * lakeside, lakeshore                                         13.223093
   * seashore, coast, seacoast, sea-coast                         5.862702
   * promontory, headland, head, foreland                         3.135785
   * breakwater, groin, groyne, mole, bulwark, seawall, jetty     2.120798
   * dock, dockage, docking facility                              1.984274
* Label: 'disgust', top 5 classes...
   * lipstick, lip rouge                                       4.465127
   * mask                                                      2.138739
   * syringe                                                   1.250971
   * tick                                                      1.146299
   * chiton, coat-of-mail shell, sea cradle, polyplacophore    1.090373
* Label: 'excitement', top 5 classes...
   * seashore, coast, seacoast, sea-coast    4.996619
   * daisy                                   3.273973
   * balloon                                 2.951615
   * parachute, chute                        2.012220
   * rapeseed                                1.879177
* Label: 'fear', top 5 classes...
   * mask                               4.021418
   * Band Aid                           3.958322
   * bathtub, bathing tub, bath, tub    3.057594
   * lipstick, lip rouge                2.948846
   * gasmask, respirator, gas helmet    2.775581
* Label: 'sad', top 5 classes...
   * lakeside, lakeshore    6.440269
   * swing                  4.254950
   * daisy                  3.841010
   * mask                   3.803346
   * park bench             3.333210

