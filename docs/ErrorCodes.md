# Error Codes

This document describes the error codes thrown by Ving's REST API. They map directly onto the [W3C's standard HTTP status codes](http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html). When functioning properly the web service will always return a 200 HTTP status code.

NOTE: While the error codes documented here are returned as HTTP status codes, they are also returned in the JSON response of the body.

## Client Errors

These are errors caused by the client providing invalid or outdated information.

### 440 Object Not Found
The object you requested doesn't exist. This refers to an object specified in the query string, not in the path. See also 404.

### 441 Missing Required Parameter
You're missing a required parameter.

### 442 Out Of Range
The value specified for a field was out of range. If it's a numeric field make sure you're above the minumum and below the maximum. If it's an enumerated field make sure you've specfified an valid option.

### 443 Not Available
The name or resource requested is already in use by someone else, or has already moved on to a new stage of it's life so the function you are trying to perform on it is no longer valid.

### 444 File Type Not Supported
You tried to upload a file that the system doesn't allow.

### 445 File Mismatch
You tried to assign a file to a field that doesn't match the field's criteria. For example you tried to assign a PDF to a field looking for images.

### 446 Payment Declined
For one reason or another the payment requested was declined. Usually due to typos, but could also do with credit card holds, insufficient funds, etc.

## Account Errors
These errors have to do with authentication and authorization.

### 450 Insufficient Privileges
You do not have the privileges necessary to complete that operation. Note: you will see this error if you have not included the session_id parameter in a request.

### 451 Session Expired
The session you are using has expired. Request a new one before continuing.

### 452 RPC Request Limit Exceeded
You have exceeded the maximum number of requests allowed per minute. This exception is telling you to slow down so you don't denial of service the server with your requests.

### 453 Prequisite Failed
A prerequisite of performing the requested action has not been met.

### 454 Password Incorrect
The password you specified does not match our records.

### 499 Offline Processing
This request was going to take too long so it was handed off to be processed in the background.

## Server Errors
These errors are systemic in nature. In general, these should never happen.

### 500 Undefined Error
An unhandled exception has occurred in the server. Under normal operating procedures this should never happen, as all exceptions should be trapped within the code and returned as a defined exception. Therefore this is an untrapped exception, and is in all cases a bug.

### 504 Could Not Connect
Could not connect to an external resource, such as a database or web service.