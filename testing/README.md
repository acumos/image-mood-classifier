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
        "predictions": 0.38471859385597784,
        "idx": 0,
        "moods": "anger"
    },
    {
        "predictions": 0.34529406287726705,
        "idx": 0,
        "moods": "amusement"
    },
    {
        "predictions": 0.21208616764499122,
        "idx": 0,
        "moods": "awe"
    },
    {
        "predictions": 0.018154401154401156,
        "idx": 0,
        "moods": "fear"
    },
    {
        "predictions": 0.015951680672268907,
        "idx": 0,
        "moods": "excitement"
    },
    {
        "predictions": 0.008543771043771044,
        "idx": 0,
        "moods": "disgust"
    },
    {
        "predictions": 0.00814814814814815,
        "idx": 0,
        "moods": "sad"
    },
    {
        "predictions": 0.0071031746031746034,
        "idx": 0,
        "moods": "contentment"
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
        "moods": [
            {
                "rank": 0,
                "moods": "anger",
                "score": 0.38471859385597784,
                "idx": 0
            },
            {
                "rank": 1,
                "moods": "amusement",
                "score": 0.34529406287726705,
                "idx": 0
            },
            {
                "rank": 2,
                "moods": "awe",
                "score": 0.21208616764499122,
                "idx": 0
            },
            {
                "rank": 3,
                "moods": "fear",
                "score": 0.018154401154401156,
                "idx": 0
            },
            {
                "rank": 4,
                "moods": "excitement",
                "score": 0.015951680672268907,
                "idx": 0
            },
            {
                "rank": 5,
                "moods": "disgust",
                "score": 0.008543771043771044,
                "idx": 0
            },
            {
                "rank": 6,
                "moods": "sad",
                "score": 0.00814814814814815,
                "idx": 0
            },
            {
                "rank": 7,
                "moods": "contentment",
                "score": 0.0071031746031746034,
                "idx": 0
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
