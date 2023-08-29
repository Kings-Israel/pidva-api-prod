# Peleza Third party api

## Api Documentation

1.Login
```http
POST /api/login
```
Request
```javascript
 {
 	"username":"username" ,
 	"password":"password",
 	"client_id":"client_id"
 }
```
Response
```javascript
{
    "status": "success",
    "token": "token"
}
```

2.Single Request .
   Use this api to make a single data verification request .
   the header must contain token..the token received in the login
```http
PUT /api/single
```
Request
```javascript
{
	"client_reference":"YOUR_UNIQUE_REF",
	"callback":"YOUR_CALLBACK_ENDPOINT e.g https://test/api/testCallback",
	"terms_and_condition":true,
	"validation_data":{
			"client_number": "client_number",
			"dataset_citizenship": "dataset_citizenship",
			"dataset_name": "dataset_name",
			"module_code": "module_code",
			"package_id": "package_id ,should be a number",
			"registration_number": "registration_number",
			"req_plan": "req_plan"
	}
}
```
Response
```javascript
{
    "status": "success",
    "reference": "2cbf1c30-d40f-40db-a921-6fda445fdec7"
}
```   

2.Batch Request .
   Use this api to make a a batch data verification request .
   the header must contain token..the token received in the login
```http
PUT /api/batch
```
Request
```javascript
{

	"client_reference":"abcd123",
	"callback":"http://127.0.0.1:3000/api/testCallback",
	"terms_and_condition":true,
	"validation_data":[{
		    "client_number": "test_api_req111_batch2",
			"dataset_citizenship": "Kenya",
			"dataset_name": "bg_api_company11_batch2",
			"module_code": "CO",
			"package_id": 31,
			"registration_number": "REG-API_1234111_batch2",
			"req_plan": "CO"
	},
	{
		    "client_number": "test_api_req111_batch1",
			"dataset_citizenship": "Kenya",
			"dataset_name": "bg_api_company11_batch1",
			"module_code": "CO",
			"package_id": 31,
			"registration_number": "REG-API_1234111_batch1",
			"req_plan": "CO"
	}]
	

}
```
Response
```javascript
{
    "status": "success",
    "reference": "2cbf1c30-d40f-40db-a921-6fda445fdec7"
}
```   



