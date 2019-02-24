# Examples

## Basic examples

Basic examples assume that you are running the proxy from the command line. You can use the following, which will 
default some values:

```bash
mim-json-proxy 
```

To see all the options you can use the `--help` argument:

```bash
mim-json-proxy --help 
```

For the basic examples to work you need to check out the repository and navigate into the examples/basic directory and 
run the following command:

```bash
mim-json-proxy -d . -n {FILE_NAME} 
```

with the name being one of the files present in that directory. Below is the description of the configs.

### Mock entire response using inline declaration (FILE_NAME: fb-me-config.json)

Mocking entire response of Facebook /me API call inline. You can navigate to [http://localhost:3005/fb/me](http://localhost:3005/fb/me) in your browser to see the results.

```json
{
  "url": "/me", <-- url matching login invocation,
  "method": "GET", <-- HTTP method that is we want to mock,
  "sendRQ": false, <-- this will prevent proxy from sending any request, proxy will just return a response back 
  "enabled": true, <-- any rule can be enabled/disabled via this simple boolean switch
  "rules": [
    {
      "condition": "true", <-- "true" means condition always applies when url is matched, *notice that true is a string this is no mistake*
      "actions": [ <--- you can have multiple actions here, below we are replacing entire responseBody with stringified json response.
        "responseBody = {'name': 'Test', 'id': '123456789', 'birthday': '01/02/2000', 'email': 'test@example.com'}"
      ]
    }
  ]
}
```

### Mock entire response using using response stored inside separate file (FILE_NAME: gapis-book-config.json)

Mocking entire response of Google APIs /books/v1/volumes API call by using response stored inside separate file. You can 
navigate to [http://localhost:3005/gapis/books/v1/volumes?q=9781610596213](http://localhost:3005/gapis/books/v1/volumes?q=9781610596213) in your browser 
to see the results. `loadFromFile` function can also be used to mock part of the response. 

```json
{
  "enabled": true,
  "url": "/books/v1/volumes",
  "method": "GET",
  "sendRQ": false,
  "rules": [
    {
      "condition": "isResponse",
      "actions": [ 
        "responseBody = loadFromFile('data/books-volumes.json')" <-- we're replacing response body by using content of the books-volumes.json file found under data folder.
      ]
    }
  ]
}
```

### Modifying part of the response (FILE_NAME: gapis-book-config2.json)

Modifying part of the response of Google APIs /books/v1/volumes API call. You can navigate to 
[http://localhost:3005/gapis/books/v1/volumes?q=9781610596213](http://localhost:3005/gapis/books/v1/volumes?q=9781610596213) 
in your browser to see the results.

```json
{
  "enabled": true,
  "url": "/books/v1/volumes",
  "method": "GET",
  "sendRQ": false,
  "rules": [
    {
      "condition": "isResponse",
      "actions": [ 
        "responseBody.items[0].volumeInfo.title = 'Test book'", <-- here we are saying modify object items[0].volumeInfo.title found in the response
        "responseBody.items[0].volumeInfo.industryIdentifiers[0].type = 'ISBN_XX'",
        "delete responseBody.items[0].volumeInfo.imageLinks" <-- you can delete stuff too from the response
      ]
    }
  ]
}
```

### Conditional rule activation

You could imagine situation you'd like to have different kind of behavior based on the request or response. Having some kind
of search api, you could handle the response based on the request (or response itself).

```json
{
  "url": "/search",
  "sendRQ": false,
  ...
  "rules": [
    {
      "condition": "requestBody.searchFor === 'Books'",  <-- this rule will only be called when in the request there is a searchFor parameter set to Books
      "actions": [
        "responseBody = loadFromFile('data/booksData.json')"
      ]
    },
    {
      "condition": "requestBody.searchFor === 'Games'", <-- this rule will only be called when in the request there is a searchFor parameter set to Games
      "actions": [
        "responseBody = loadFromFile('data/gamesData.json')"
      ]
    }
  ]
}
```

`condition` can be also based on the `responseBody`.

### Simulate service delay (FILE_NAME: gapis-book-config3.json)

Adding delay of 5 second to the Google APIs /books/v1/volumes API call. You can navigate to 
[http://localhost:3005/gapis/books/v1/volumes?q=9781610596213](http://localhost:3005/gapis/books/v1/volumes?q=9781610596213) 
in your browser to see the results.

```json
{
  "url": "/books/v1/volumes", 
  "method": "GET", 
  "delay": 5000, <-- this will add 5 second delay before response is returned 
  "sendRQ": true, <-- we want to call the service to send the request
  "rules": [] <-- rules are optional, if only delay needs to be added they can be omitted
}
```

### Simulate error response (FILE_NAME: gapis-book-config4.json)

Sending error code to the Google APIs /books/v1/volumes API call. You can navigate to 
[http://localhost:3005/gapis/books/v1/volumes?q=9781610596213](http://localhost:3005/gapis/books/v1/volumes?q=9781610596213) 
in your browser to see the results.

```json
{
  "url": "/books/v1/volumes", 
  "method": "GET",  
  "sendRQ": true,
  "rules": [
    {
      "condition": "isResponse",
      "actions": [ 
        "responseBody = {'status': 'error'}",
        "responseStatusCode = 500" <-- this is important, as we want to return HTTP status 500 indicating error
      ]
    }
  ]
}
```
