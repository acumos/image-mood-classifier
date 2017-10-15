# web_test
This directory provides a simple web server for demonstrating an
image-based mood classifier example.
This web demo will launch an application with a swagger page.

## Example usage

```
$ python app.py
usage: app.py [-h] [--port PORT] [--modeldir MODELDIR] [--rich_return]

optional arguments:
  -h, --help           show this help message and exit
  --port PORT          port to launch the simple web server
  --modeldir MODELDIR  model directory to load dumped artifact
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
        "class": "anger"
    },
    {
        "score": 0.34529406287726705,
        "image": 0,
        "class": "amusement"
    },
    {
        "score": 0.21208616764499122,
        "image": 0,
        "class": "awe"
    },
    {
        "score": 0.018154401154401156,
        "image": 0,
        "class": "fear"
    },
    {
        "score": 0.015951680672268907,
        "image": 0,
        "class": "excitement"
    },
    {
        "score": 0.008543771043771044,
        "image": 0,
        "class": "disgust"
    },
    {
        "score": 0.00814814814814815,
        "image": 0,
        "class": "sad"
    },
    {
        "score": 0.0071031746031746034,
        "image": 0,
        "class": "contentment"
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
        "classes": [
            {
                "rank": 0,
                "class": "anger",
                "score": 0.38471859385597784,
                "image": 0
            },
            {
                "rank": 1,
                "class": "amusement",
                "score": 0.34529406287726705,
                "image": 0
            },
            {
                "rank": 2,
                "class": "awe",
                "score": 0.21208616764499122,
                "image": 0
            },
            {
                "rank": 3,
                "class": "fear",
                "score": 0.018154401154401156,
                "image": 0
            },
            {
                "rank": 4,
                "class": "excitement",
                "score": 0.015951680672268907,
                "image": 0
            },
            {
                "rank": 5,
                "class": "disgust",
                "score": 0.008543771043771044,
                "image": 0
            },
            {
                "rank": 6,
                "class": "sad",
                "score": 0.00814814814814815,
                "image": 0
            },
            {
                "rank": 7,
                "class": "contentment",
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
curl -F class_predictions=@example_awe_1.csv -F mime_type="text/csv" "http://localhost:8886/transform"
curl -F class_predictions=@example_awe_1.json -F mime_type="application/json" "http://localhost:8886/transform"
```
