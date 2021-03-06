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
..      http://creativecommons.org/licenses/by/4.0
..
.. This file is distributed on an "AS IS" BASIS,
.. WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
.. See the License for the specific language governing permissions and
.. limitations under the License.
.. ===============LICENSE_END=========================================================

.. _deployment_image-mood:

===============================================================
Deployment: Wrapping and Executing Image Mood Classifier Models
===============================================================

To utilize this classifier model, it trains a meta classifier on top of
produced image classification tags to approximate the mood of the image.
Continue to the :ref:`demonstration_image-mood`  to see how to utilize
these models with a simple demo API server.

Model Deployment
----------------

Following similar use pattens described by the main client library,
there are two primary modes to export and deploy the generated
classifier: by dumping it to disk or by pushing it to an onboarding
server. Please consult the :ref:`image_mood_usage` for more specific arguments
but the examples below demonstrate basic capabilities.

Example for training the classifier on the provided dataset. Note, the
features have already been processed by the *image-classification
(v0.3)* model and stored in that native format in
`features_testImages_artphoto.csv.bz2 <https://github.com/acumos/image-mood-classifier/blob/master/data/features_testImages_artphoto.csv.bz2>`__.

::

    python image_mood_classifier/classify_image.py -l data/labels_testImages_artphoto.txt  -i data/features_testImages_artphoto.csv.bz2 -d model_large

Add the ``--feature_nomask`` or ``-f`` flag to speed up training and
avoid sample simulation. **(Recommended)**

::

    python image_mood_classifier/classify_image.py -f -l data/labels_testImages_artphoto.txt  -i data/features_testImages_artphoto.csv.bz2 -d model

Example for training a model and pushing that model that returns all
scores.

::

    export ACUMOS_USERNAME="user"; \
    export ACUMOS_PASSWORD="password";
    or
    export ACUMOS_TOKEN="a_very_long_token";

    export ACUMOS_PUSH="https://acumos-challenge.org/onboarding-app/v2/models"; \
    export ACUMOS_AUTH="https://acumos-challenge.org/onboarding-app/v2/auth"; \
    python image_mood_classifier/classify_image.py -f -l data/labels_testImages_artphoto.txt  -i data/features_testImages_artphoto.csv.bz2

In-place Evaluation
-------------------

In-place evaluation **will utilize** a serialized version of the model
and load it into memory for use in-place. This mode is handy for quick
evaluation of images or image sets for use in other classifiers.

Example for evaluating a set of features from the
**image-classification** model.

::

    python image_mood_classifier/classify_image.py -i data/example_awe_1.csv -d model -p data/example_mood.csv

Example for printing top contributors (in training data) from
**image-classification** to mood label.

::

    python image_mood_classifier/classify_image.py -f -l data/labels_testImages_artphoto.txt  -i data/features_testImages_artphoto.csv.bz2 -s 5


.. _deployment_image-mood-model_runner:

Model Runner: Using the Client Library
======================================

Getting even closer to what it looks like in a deployed model, you can
also use the model runner code to run mood classification locally. 
*(added v0.5.0)*

*Please note 
that this model is a **cascade classifier** that requiures initial classification
of an image into class tags on which this model is trained.  For that reason,
you must be running an upstream image classifier that first accepts image data
and then passes the classifications to this model.* 

1. Determine the ports to run your mood classification and other
   source models, like the original image classification model. In the example
   below, mood classification runs on port ``8887`` and image
   classification runs on port ``8886``.

2. If not already running, launch the classification model 
   **but make sure to configure port forwarding**.  For help with 
   deployment of the image classification (as one potential source model)
   please see :ref:`deployment_image-classification-model_runner`.
   For the runner to properly forward requests,
   provide a simple JSON file example called ``runtime.json`` in the
   working directory that you run the model runner. 
   If you modify the ports to run the models, please change them accordingly. 

::

    # This line creates a configuration file for the modelrunner.
    $ cat '{"downstream": ["http://127.0.0.1:8887/classify"]}' > runtime.json
    
    # This line launches the model runner, assuming you have the client library one directory up
    python ../acumos-python-client/testing/wrap/runner.py --port 8886 --modeldir model/image_classifier

3. Dump and launch the image mood classification model. Again,
   if you modify the ports to run the models, please change them
   accordingly. Aside from the model and port, the main difference
   between the model runner line above is that the model runner is instructed to
   *ignore* the port forward configuration file (``runtime.json``) so that it
   doesn't attempt to forward the request to itself.

::

    python ../acumos-python-client/testing/wrap/runner.py --port 8887 --modeldir model/image_mood_classifier  --no_downstream

Performance Analysis
--------------------

A training analysis of results demonstrates that this problem is not
trivial. Contrary to the results in the original publication, F1 scores
for methods in this model are not that high.

After version 0.3, training also generates additional samples form
feature masking (e.g. missing or zero-based features). This adds some
robustness for image-classifier results that have only partial
information and generally adds importance to the stronger class features
as well. Some classifiers (for example, deep neural nets (DNN)) can
benefit from the additional samples, even if they are similar to the
original.

::

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

Image Classes Most Related to Mood
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Using a quick summary analysis, these are the top 5 image classes
associated with mood in the provided training data. Users can explore
data this way and find image that contain these classes/objects to
assert strength for a specific mood. An interesting data observation is
the overlap of the class ``seashore``, ``coast``, ``seacoast``, ``sea-coast`` for
``excitement``, ``awe``, and ``contentment``.

-  Label: 'amusement', top 5 classes...

   -  ping-pong ball 3.370771
   -  seashore, coast, seacoast, sea-coast 3.029028
   -  bubble 3.007231
   -  balloon 2.578175
   -  jean, blue jean, denim 2.178420

-  Label: 'anger', top 5 classes...

   -  lipstick, lip rouge 3.039408
   -  mask 2.279731
   -  volcano 2.021753
   -  wig 1.857592
   -  hair spray 1.239879

-  Label: 'awe', top 5 classes...

   -  seashore, coast, seacoast, sea-coast 7.125516
   -  lakeside, lakeshore 4.629456
   -  cliff, drop, drop-off 2.226622
   -  wig 1.824174
   -  promontory, headland, head, foreland 1.719891

-  Label: 'contentment', top 5 classes...

   -  lakeside, lakeshore 13.223093
   -  seashore, coast, seacoast, sea-coast 5.862702
   -  promontory, headland, head, foreland 3.135785
   -  breakwater, groin, groyne, mole, bulwark, seawall, jetty 2.120798
   -  dock, dockage, docking facility 1.984274

-  Label: 'disgust', top 5 classes...

   -  lipstick, lip rouge 4.465127
   -  mask 2.138739
   -  syringe 1.250971
   -  tick 1.146299
   -  chiton, coat-of-mail shell, sea cradle, polyplacophore 1.090373

-  Label: 'excitement', top 5 classes...

   -  seashore, coast, seacoast, sea-coast 4.996619
   -  daisy 3.273973
   -  balloon 2.951615
   -  parachute, chute 2.012220
   -  rapeseed 1.879177

-  Label: 'fear', top 5 classes...

   -  mask 4.021418
   -  Band Aid 3.958322
   -  bathtub, bathing tub, bath, tub 3.057594
   -  lipstick, lip rouge 2.948846
   -  gasmask, respirator, gas helmet 2.775581

-  Label: 'sad', top 5 classes...

   -  lakeside, lakeshore 6.440269
   -  swing 4.254950
   -  daisy 3.841010
   -  mask 3.803346
   -  park bench 3.333210
