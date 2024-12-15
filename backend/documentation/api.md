---
title: Comaint API
language_tabs:
  - shell: Shell
  - http: HTTP
  - javascript: JavaScript
  - javascript--nodejs: Node.JS
  - ruby: Ruby
  - python: Python
  - java: Java
  - go: Go
toc_footers: []
includes: []
search: true
highlight_theme: darkula
headingLevel: 2

---

<h1 id="comaint-api">Comaint API v0.1.0</h1>

> Scroll down for code samples, example requests and responses. Select a language for code samples from the tabs above or the mobile navigation menu.

Documentation de l’API Comaint

<h1 id="comaint-api-default">Default</h1>

## Affiche un message de bienvenue

> Code samples

```shell
# You can also use wget
curl -X GET /api/welcome \
  -H 'Accept: application/json'

```

```http
GET /api/welcome HTTP/1.1

Accept: application/json

```

```javascript
var headers = {
  'Accept':'application/json'

};

$.ajax({
  url: '/api/welcome',
  method: 'get',

  headers: headers,
  success: function(data) {
    console.log(JSON.stringify(data));
  }
})

```

```javascript--nodejs
const fetch = require('node-fetch');

const headers = {
  'Accept':'application/json'

};

fetch('/api/welcome',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Accept' => 'application/json'
}

result = RestClient.get '/api/welcome',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.get('/api/welcome', params={

}, headers = headers)

print r.json()

```

```java
URL obj = new URL("/api/welcome");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("GET");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Accept": []string{"application/json"},
        
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("GET", "/api/welcome", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`GET /api/welcome`

> Example responses

> 200 Response

```json
{
  "message": "Bienvenue"
}
```

<h3 id="affiche-un-message-de-bienvenue-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Une réponse JSON contenant le message.|Inline|

<h3 id="affiche-un-message-de-bienvenue-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» message|string|false|none|Le message de bienvenue|

<aside class="success">
This operation does not require authentication
</aside>

## Renvoie un message de bienvenue contenant le nom et le prénom envoyés

> Code samples

```shell
# You can also use wget
curl -X POST /api/welcome \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json'

```

```http
POST /api/welcome HTTP/1.1

Content-Type: application/json
Accept: application/json

```

```javascript
var headers = {
  'Content-Type':'application/json',
  'Accept':'application/json'

};

$.ajax({
  url: '/api/welcome',
  method: 'post',

  headers: headers,
  success: function(data) {
    console.log(JSON.stringify(data));
  }
})

```

```javascript--nodejs
const fetch = require('node-fetch');
const inputBody = '{
  "firstname": "Jean",
  "lastname": "Dupont"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json'

};

fetch('/api/welcome',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json'
}

result = RestClient.post '/api/welcome',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

r = requests.post('/api/welcome', params={

}, headers = headers)

print r.json()

```

```java
URL obj = new URL("/api/welcome");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
        
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "/api/welcome", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /api/welcome`

> Body parameter

```json
{
  "firstname": "Jean",
  "lastname": "Dupont"
}
```

<h3 id="renvoie-un-message-de-bienvenue-contenant-le-nom-et-le-prénom-envoyés-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|object|true|none|
|» firstname|body|string|false|Le prénom de l'utilisateur.|
|» lastname|body|string|false|Le nom de famille de l'utilisateur.|

> Example responses

> 200 Response

```json
{
  "message": "Bienvenue Jean Dupont"
}
```

<h3 id="renvoie-un-message-de-bienvenue-contenant-le-nom-et-le-prénom-envoyés-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Un message de bienvenue personnalisé au format JSON.|Inline|

<h3 id="renvoie-un-message-de-bienvenue-contenant-le-nom-et-le-prénom-envoyés-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» message|string|false|none|Message personnalisé de bienvenue.|

<aside class="success">
This operation does not require authentication
</aside>

## Affiche la version de l'API

> Code samples

```shell
# You can also use wget
curl -X GET /api/version \
  -H 'Accept: application/json'

```

```http
GET /api/version HTTP/1.1

Accept: application/json

```

```javascript
var headers = {
  'Accept':'application/json'

};

$.ajax({
  url: '/api/version',
  method: 'get',

  headers: headers,
  success: function(data) {
    console.log(JSON.stringify(data));
  }
})

```

```javascript--nodejs
const fetch = require('node-fetch');

const headers = {
  'Accept':'application/json'

};

fetch('/api/version',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Accept' => 'application/json'
}

result = RestClient.get '/api/version',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.get('/api/version', params={

}, headers = headers)

print r.json()

```

```java
URL obj = new URL("/api/version");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("GET");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Accept": []string{"application/json"},
        
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("GET", "/api/version", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`GET /api/version`

> Example responses

> 200 Response

```json
{
  "message": "v1"
}
```

<h3 id="affiche-la-version-de-l'api-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Une réponse JSON contenant la version de l'API.|Inline|

<h3 id="affiche-la-version-de-l'api-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» version|string|false|none|La version de l'API|

<aside class="success">
This operation does not require authentication
</aside>

## Affiche la version du backend

> Code samples

```shell
# You can also use wget
curl -X GET /api/v1/backend-version \
  -H 'Accept: application/json'

```

```http
GET /api/v1/backend-version HTTP/1.1

Accept: application/json

```

```javascript
var headers = {
  'Accept':'application/json'

};

$.ajax({
  url: '/api/v1/backend-version',
  method: 'get',

  headers: headers,
  success: function(data) {
    console.log(JSON.stringify(data));
  }
})

```

```javascript--nodejs
const fetch = require('node-fetch');

const headers = {
  'Accept':'application/json'

};

fetch('/api/v1/backend-version',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Accept' => 'application/json'
}

result = RestClient.get '/api/v1/backend-version',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.get('/api/v1/backend-version', params={

}, headers = headers)

print r.json()

```

```java
URL obj = new URL("/api/v1/backend-version");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("GET");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Accept": []string{"application/json"},
        
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("GET", "/api/v1/backend-version", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`GET /api/v1/backend-version`

> Example responses

> 200 Response

```json
{
  "message": "0.0.1"
}
```

<h3 id="affiche-la-version-du-backend-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Une réponse JSON contenant la version du backend.|Inline|

<h3 id="affiche-la-version-du-backend-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» version|string|false|none|La version du backend|

<aside class="success">
This operation does not require authentication
</aside>

## Test l'accès à la base de données

> Code samples

```shell
# You can also use wget
curl -X POST /api/v1/check-database \
  -H 'Accept: application/json'

```

```http
POST /api/v1/check-database HTTP/1.1

Accept: application/json

```

```javascript
var headers = {
  'Accept':'application/json'

};

$.ajax({
  url: '/api/v1/check-database',
  method: 'post',

  headers: headers,
  success: function(data) {
    console.log(JSON.stringify(data));
  }
})

```

```javascript--nodejs
const fetch = require('node-fetch');

const headers = {
  'Accept':'application/json'

};

fetch('/api/v1/check-database',
{
  method: 'POST',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Accept' => 'application/json'
}

result = RestClient.post '/api/v1/check-database',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.post('/api/v1/check-database', params={

}, headers = headers)

print r.json()

```

```java
URL obj = new URL("/api/v1/check-database");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Accept": []string{"application/json"},
        
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "/api/v1/check-database", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /api/v1/check-database`

> Example responses

> 200 Response

```json
{
  "success": true,
  "message": "Success"
}
```

<h3 id="test-l'accès-à-la-base-de-données-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Une réponse JSON indiquant que la connexion a réussi.|Inline|

<h3 id="test-l'accès-à-la-base-de-données-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» success|boolean|false|none|Systématiquement à true|
|» message|string|false|none|Contient success|

<aside class="success">
This operation does not require authentication
</aside>

