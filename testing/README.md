# web_test
This directory provides a simple web server for demonstrating an
image-based mood classifier example.
This web demo will launch an application with a swagger page.

## Example usage

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

## Image Classifier Evaluation

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
