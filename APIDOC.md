# UW Classes API Documentation
The UW Classes API provides information about each of the classes
that I have taken at UW over the past 4 years.

## Get a list of all the classes I've taken at UW
**Request Format:** /classcodes

**Request Type:** GET

**Returned Data Format**: Plain Text

**Description:** Returns a list containing class codes for all the classes I've taken at UW


**Example Request:** /classcodes

**Example Response:**

```
cse-190
gen-st-199
cse-142
math-124
art-190
math-125
cse-143
eng-111
...

```

**Error Handling:**
- Possible 500 errors (all plain text):
  - If something else goes wrong on the server, returns an error with the message: `Something went wrong with the server. Please try again later.`

## Get a list of all the quarters I've spent taking classes at UW
**Request Format:** /quarters

**Request Type:** GET

**Returned Data Format**: Plain Text

**Description:** Returns a list containing short names and long names for quarters I've spent taking classes at UW


**Example Request:** /quarters

**Example Response:**

```
AU19:Autumn 2019
WI20:Winter 2020
SP20:Spring 2020
AU20:Autumn 2020
WI21:Winter 2021
SP21:Spring 2021
AU21:Autumn 2021
WI22:Winter 2022
...
```

**Error Handling:**
- Possible 500 errors (all plain text):
  - If something else goes wrong on the server, returns an error with the message: `Something went wrong with the server. Please try again later.`


## Lookup information about a particular class I took
**Request Format:** /classes/:classcode

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Given a valid classcode, returns a JSON object containing details about that particular class.

**Example Request:** /classes/cse-154

**Example Response:**
*Fill in example response in the {}*

```json
{
  "cse-154": {
    "course-name": "Web Programming",
    "credits": 5,
    "quarter": "SP23",
    "description": "Covers languages, tools, and techniques for developing interactive and dynamic web pages. Topics include page styling, design, and layout; client and server side scripting; web security; and interacting with data sources such as databases."
  }
}
```

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - If passed in an invalid class code, returns an error with the message: `Given class code "classCode" is not a valid class code or not a class I have taken! Valid codes are in the format "dpmt-number" (i.e. "cse-154").`
- Possible 500 errors (all plain text):
  - If something else goes wrong on the server, returns an error with the message: `Something went wrong with the server. Please try again later.`
