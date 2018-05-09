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

# Application server
As a means of testing the API and demonstrating functionality, two
additional components are included in this repository:
a simple [swagger-based webserver](../../testing) (documented here) and
a [demo web page](../../web_demo) (documented in the [next tutorial](lesson3.md).

**NOTE: These steps are now deprecated and a direct protobuf interface from
web page to the model (the next tutorial) is the preferred operational step.
*(added v0.4.1)* **

## Swagger API
Using a simple [flask-based connexion server](https://github.com/zalando/connexion),
an API scaffold has been built to host a serialized/dumped model.

To utilized [this example app](../../testing), an instance should first be built and downloaded
from Acumos (or dumped to disk) and then
launched locally.  Afterwards, the sample application found in
[web_demo](web_demo) (see [the next tutorial](lesson3.md))
uses a `localhost` service to classify
and visualize the results of image classification.

```
usage: app.py [-h] [--port PORT] [--modeldir MODELDIR]
              [--modeldir_image MODELDIR_IMAGE]

optional arguments:
  -h, --help            show this help message and exit
  --port PORT           port to launch the simple web server
  --modeldir MODELDIR   model directory to load dumped image-mood-classifier
  --modeldir_image MODELDIR_IMAGE
                        model directory for image classfier
```

Example usage may be running with a mood model that was dumped to the directory `model_small`
in the main repo source directory and an image classification model in the
directory `model` (under its repo source).

```
python app.py --modeldir ../model_small --modeldir_image ../../image-classification/model --port 8886
```


### Output formats
The optional HTTP parameter `rich_output` will generate a more decorated JSON output
 that is also understood by the included web application.

* standard output - from `DataFrame` version of the prediction
```
[
    {
        "score": 0.38471859385597784,
        "image": 0,
        "tag": "anger"
    },
    {
        "score": 0.34529406287726705,
        "image": 0,
        "tag": "amusement"
    },
    {
        "score": 0.21208616764499122,
        "image": 0,
        "tag": "awe"
    },
    {
        "score": 0.018154401154401156,
        "image": 0,
        "tag": "fear"
    },
    {
        "score": 0.015951680672268907,
        "image": 0,
        "tag": "excitement"
    },
    {
        "score": 0.008543771043771044,
        "image": 0,
        "tag": "disgust"
    },
    {
        "score": 0.00814814814814815,
        "image": 0,
        "tag": "sad"
    },
    {
        "score": 0.0071031746031746034,
        "image": 0,
        "tag": "contentment"
    }
]
```


* rich output - formatted form of the prediction
```
{
    "results": {
        "status": "Succeeded",
        "info": "Processed",
        "serverfilename": "/dev/null",
        "tages": [
            {
                "rank": 0,
                "tag": "anger",
                "score": 0.38471859385597784,
                "image": 0
            },
            {
                "rank": 1,
                "tag": "amusement",
                "score": 0.34529406287726705,
                "image": 0
            },
            {
                "rank": 2,
                "tag": "awe",
                "score": 0.21208616764499122,
                "image": 0
            },
            {
                "rank": 3,
                "tag": "fear",
                "score": 0.018154401154401156,
                "image": 0
            },
            {
                "rank": 4,
                "tag": "excitement",
                "score": 0.015951680672268907,
                "image": 0
            },
            {
                "rank": 5,
                "tag": "disgust",
                "score": 0.008543771043771044,
                "image": 0
            },
            {
                "rank": 6,
                "tag": "sad",
                "score": 0.00814814814814815,
                "image": 0
            },
            {
                "rank": 7,
                "tag": "contentment",
                "score": 0.0071031746031746034,
                "image": 0
            }
        ],
        "processingtime": 0.09553400000000023,
        "clientfile": "undefined"
    }
```

## Direct Evaluation

* For a graphical experience, view the swagger-generated UI at [http://localhost:8886/ui].
* Additionally, a simple command-line utility could be used to post an image
  and mime type to the main interface.

```
curl -F tag_scores=@example_awe_1.csv -F mime_type="text/csv" "http://localhost:8886/classify_tags"
curl -F tag_scores=@example_awe_1.json -F mime_type="application/json" "http://localhost:8886/classify_tags"
```

* If you have run the example application **with** an image classifier model, you can
  also submit images and the two models will chained together.
```
curl -F image_binary=@example.jpg -F mime_type="image/jpg" "http://localhost:8886/classify"
```

# Direct use of the model-runner

One simple testing mode is to simulate the output of an Acumos model runner.
This model runner can be locally duplicated by using the primary python library
`acumos-python-client`.  This execution usage is experimental, but the APIs should
be consistent for use.

```
python acumos-python-client/testing/wrap/runner.py  --port 8886 --modeldir model/
```

The above command uses the testing-based model runner to launch a singular model
that responds on a single port in native `protobuf` format.
