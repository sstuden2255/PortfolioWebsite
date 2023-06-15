/**
 * Author: Simon Studen
 *
 * This is the Node.js file that contains endpoints for accessing information
 * about classes that I have attended at UW.
 */

"use strict";

const fs = require('fs').promises;
const express = require('express');
const app = express();

// returns a list of class codes in plaintext format for classes I have taken at UW
app.get('/classcodes', async function(req, res) {
  res.type('text');
  try {
    let data = await fs.readFile("classes-list.txt", "utf8");
    res.send(data);
  } catch (err) {
    res.status(500).send("Something went wrong with the server. Please try again later.");
  }
});

// returns a list of quarters for which I have attend classes at UW in plaintext format.
app.get('/quarters', async function(req, res) {
  res.type('text');
  try {
    let data = await fs.readFile("quarters.txt", "utf8");
    res.send(data);
  } catch (err) {
    res.status(500).send("Something went wrong with the server. Please try again later.");
  }
});

// returns a class JSON object mapped to a particular passed in classcode
app.get('/classes/:classcode', async function(req, res) {
  let classCode = req.params.classcode;
  try {
    let data = await fs.readFile("classes.json", "utf8");
    data = JSON.parse(data);
    let classInfo = data[classCode];
    if (classInfo) {
      res.json(classInfo);
    } else {
      res.type('text');
      res.status(400).send(`Given class code "${classCode}" is not a valid class code
      or not a class I have taken! Valid codes are in the format "dpmt-number" (i.e. "cse-154").`);
    }
  } catch (err) {
    console.log(err)
    res.type('text');
    res.status(500).send("Something went wrong with the server. Please try again later.");
  }
});

// tells the code to serve static files in a directory called 'public'
app.use(express.static('public'));

const PORT = process.env.PORT || 8000;
app.listen(PORT);