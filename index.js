const axios = require('axios');
const express = require('express');
const { connectDatabase } = require('./connectMongo');
const sendMail = require('./testemail');
const utility = require('./utility')
const app = express()
require('dotenv').config()
const port = process.env.PORT || 3000;
app.use(express.json());

// For parsing application/x-www-form-urlencoded
app.use(express.urlencoded({
  extended: true
}));
app.use('/', express.static('public'))
app.get('/home', (req, res) => {
  res.status(200).send('Success')
})

// app.post("/", function(req, res) { console.log(JSON.stringify(req.body, 0, 2)); res.status(200).send(req.body);})

app.post("/", async function (req, res) {
  if (req.body.challenge) {
    console.log(JSON.stringify(req.body, 0, 2)); res.status(200).send(req.body);
    sendMail('Challenge working');
  }
  else {
    try {
      // Store Each Request in request collection
      // params: baseUrl, body, headers, raw headers, host and hostname
      // insert query only 
      if (!dbo) {
        //conect to db
        sendMail('Not connected to DB');
        return
      }
      var myobj = { baseUrl: req.baseUrl, body: req.body, headers: req.headers, rawHeaders: req.rawHeaders, host: req.host, hostname: req.hostname };
      dbo.collection("Requests").insertOne(myobj, function (err, res) {
        if (err) {
          sendMail(JSON.stringify(err));
          throw err;
        }
        console.log("1 request inserted");
      });
    }
    catch (ex) {
      sendMail(JSON.stringify(ex));
      console.log(ex)
    }

    try {
      // check if pulseId is found
      if (req.body.event && req.body.event.pulseId) {

        try {
          // store req.body.event data in transaction collection
          getExternalData(req.body.event)
          const res = await dbo.collection("transaction").insertOne(req.body.event);
          if (res) {
            console.log("1 transaction inserted");
          }
          else {
            console.log("Error transaction");
          }
        }
        catch (ex) {
          sendMail(JSON.stringify(ex));
          console.log(JSON.stringify(ex));
        }

      }
    } catch (ex) {
      console.log(ex);
      // raise an email notification
      sendMail(JSON.stringify(ex));
    }
    res.status(200).send("success");
  }

})


function getExternalData(eventData) {
  const itemId = eventData.pulseId;
  console.log('Item Id>>>>>', itemId);
  var data = JSON.stringify({
    "query": `query  {items(ids: ${itemId}) {column_values {value text title}}}`
  });

  var config = {
    method: 'post',
    url: 'https://api.monday.com/v2',
    headers: {
      'Authorization': process.env.MONDAY_API_KEY,
      'Content-Type': 'application/json',
    },
    data: data
  };

  axios(config)
    .then(function (response) {

      try {
        if (response.data.data.items && Array.isArray(response.data.data.items) && response.data.data.items.length) {
          // console.log(JSON.stringify(response.data));
          console.log(JSON.stringify(response.data.data.items[0].column_values[0].title));
          let tempPatientData = response.data.data.items[0]["column_values"];

          let AcContactFormattedData = {
            contact: {
              email: "",
              firstName: "",
              lastName: "",
              phone: "",
              fieldValues: []
            }
          }

          try {
            const isFoundPatiendName = utility.getMondayFieldFromArr(tempPatientData, 'Patient name');
            if (isFoundPatiendName.title && isFoundPatiendName.text && isFoundPatiendName.text.trim().length) {
              const _patientFullNameArr = isFoundPatiendName.text.split(/\s+/);
              AcContactFormattedData.contact.firstName = _patientFullNameArr[0];
              for (let k = 1; k < _patientFullNameArr.length; k++) {
                AcContactFormattedData.contact.lastName = AcContactFormattedData.contact.lastName + _patientFullNameArr[k] + " ";
              }
            }
          } catch (ex) {
            console.log(ex);
          }

          try {
            const isDataFound = utility.getMondayFieldFromArr(tempPatientData, 'Phone');
            AcContactFormattedData.contact.phone = isDataFound.text;
          } catch (ex) {
            console.log(ex)
          }

          try {
            const isDataFound = utility.getMondayFieldFromArr(tempPatientData, 'Email');
            AcContactFormattedData.contact.email = isDataFound.text;
          } catch (ex) {
            console.log(ex)
          }

          try {
            const isDataFound = utility.getMondayFieldFromArr(tempPatientData, 'Caregiver Name')
            if (isDataFound && isDataFound.text) {
              AcContactFormattedData.contact.fieldValues.push({
                field: "19",
                value: isDataFound.text
              })
            }
          } catch (ex) {
            console.log(ex)
          }

          try {
            const isDataFound = utility.getMondayFieldFromArr(tempPatientData, 'Submitter')
            if (isDataFound && isDataFound.text) {
              AcContactFormattedData.contact.fieldValues.push({
                field: "18",
                value: isDataFound.text
              })
            }
          } catch (ex) {
            console.log(ex)
          }

          try {
            const isDataFound = utility.getMondayFieldFromArr(tempPatientData, 'CI Submission')
            if (isDataFound && isDataFound.text) {
              AcContactFormattedData.contact.fieldValues.push({
                field: "2",
                value: isDataFound.text
              })
            }
          } catch (ex) {
            console.log(ex)
          }

          try {
            const isDataFound = utility.getMondayFieldFromArr(tempPatientData, 'GSA Submission')
            if (isDataFound && isDataFound.text) {
              AcContactFormattedData.contact.fieldValues.push({
                field: "3",
                value: isDataFound.text
              })
            }
          } catch (ex) {
            console.log(ex)
          }

          try {
            const isDataFound = utility.getMondayFieldFromArr(tempPatientData, 'AI Submission')
            if (isDataFound && isDataFound.text) {
              AcContactFormattedData.contact.fieldValues.push({
                field: "4",
                value: isDataFound.text
              })
            }
          } catch (ex) {
            console.log(ex)
          }

          try {
            const isDataFound = utility.getMondayFieldFromArr(tempPatientData, 'WAS')
            if (isDataFound && isDataFound.text) {
              AcContactFormattedData.contact.fieldValues.push({
                field: "1",
                value: isDataFound.text
              })
            }
          } catch (ex) {
            console.log(ex)
          }

          try {
            const isDataFound = utility.getMondayFieldFromArr(tempPatientData, 'Updated WAS')
            if (isDataFound && isDataFound.text) {
              AcContactFormattedData.contact.fieldValues.push({
                field: "5",
                value: isDataFound.text
              })
            }
          } catch (ex) {
            console.log(ex)
          }

          try {
            const isDataFound = utility.getMondayFieldFromArr(tempPatientData, 'Latest WAS Progress')
            if (isDataFound && isDataFound.text) {
              AcContactFormattedData.contact.fieldValues.push({
                field: "6",
                value: isDataFound.text
              })
            }
          } catch (ex) {
            console.log(ex)
          }

          try {
            const isDataFound = utility.getMondayFieldFromArr(tempPatientData, 'Physician Status')
            if (isDataFound && isDataFound.text) {
              AcContactFormattedData.contact.fieldValues.push({
                field: "8",
                value: isDataFound.text
              })
            }
          } catch (ex) {
            console.log(ex)
          }

          try {
            const isDataFound = utility.getMondayFieldFromArr(tempPatientData, 'AC Status')
            if (isDataFound && isDataFound.text) {
              AcContactFormattedData.contact.fieldValues.push({
                field: "33",
                value: isDataFound.text
              })
            }
          } catch (ex) {
            console.log(ex)
          }

          try {
            const isDataFound = utility.getMondayFieldFromArr(tempPatientData, 'Latest GC')
            if (isDataFound && isDataFound.text) {
              AcContactFormattedData.contact.fieldValues.push({
                field: "31",
                value: isDataFound.text
              })
            }
          } catch (ex) {
            console.log(ex)
          }

          try {
            const isDataFound = utility.getMondayFieldFromArr(tempPatientData, 'GC Time')
            if (isDataFound && isDataFound.text) {
              AcContactFormattedData.contact.fieldValues.push({
                field: "32",
                value: isDataFound.text
              })
            }
          } catch (ex) {
            console.log(ex)
          }

          try {
            const isDataFound = utility.getMondayFieldFromArr(tempPatientData, 'Pre-test Scheduling link')
            if (isDataFound && isDataFound.text) {
              AcContactFormattedData.contact.fieldValues.push({
                field: "23",
                value: isDataFound.text
              })
            }
          } catch (ex) {
            console.log(ex)
          }

          try {
            const isDataFound = utility.getMondayFieldFromArr(tempPatientData, 'Pre-test Scheduling link')
            if (isDataFound && isDataFound.text) {
              AcContactFormattedData.contact.fieldValues.push({
                field: "25",
                value: isDataFound.text
              })
            }
          } catch (ex) {
            console.log(ex)
          }

          try {
            const isDataFound = utility.getMondayFieldFromArr(tempPatientData, 'Language')
            if (isDataFound && isDataFound.text) {
              AcContactFormattedData.contact.fieldValues.push({
                field: "29",
                value: isDataFound.text
              })
            }
          } catch (ex) {
            console.log(ex)
          }

          try {
            const isDataFound = utility.getMondayFieldFromArr(tempPatientData, 'GSA Link')
            if (isDataFound && isDataFound.text) {
              AcContactFormattedData.contact.fieldValues.push({
                field: "20",
                value: isDataFound.text
              })
            }
          } catch (ex) {
            console.log(ex)
          }

          try {
            const isDataFound = utility.getMondayFieldFromArr(tempPatientData, 'AI Link')
            if (isDataFound && isDataFound.text) {
              console.log('AI Link>>>>', isDataFound);
              AcContactFormattedData.contact.fieldValues.push({
                field: "22",
                value: isDataFound.text
              })
            }
          } catch (ex) {
            console.log(ex)
          }

          try {
            const isDataFound = utility.getMondayFieldFromArr(tempPatientData, 'Medical Release Form')
            if (isDataFound && isDataFound.text) {
              console.log('Medical Release>>>>', isDataFound);
              AcContactFormattedData.contact.fieldValues.push({
                field: "24",
                value: isDataFound.text
              })
            }
          } catch (ex) {
            console.log(ex)
          }

          try {
            const isDataFound = utility.getMondayFieldFromArr(tempPatientData, 'Referral')
            if (isDataFound && isDataFound.text) {
              console.log('Referral>>>>', isDataFound);
              AcContactFormattedData.contact.fieldValues.push({
                field: "34",
                value: isDataFound.text
              })
            }
          } catch (ex) {
            console.log(ex)
          }

          try {
            const isDataFound = utility.getMondayFieldFromArr(tempPatientData, 'Linked HCP/HCO')
            if (isDataFound && isDataFound.text) {
              console.log('Linked HCP/HCO>>>>', isDataFound);
              AcContactFormattedData.contact.fieldValues.push({
                field: "41",
                value: isDataFound.text
              })
            }
          } catch (ex) {
            console.log(ex)
          }

          try {
            const isDataFound = utility.getMondayFieldFromArr(tempPatientData, 'DOB')
            if (isDataFound && isDataFound.text) {
              console.log('DOB>>>>', isDataFound);
              AcContactFormattedData.contact.fieldValues.push({
                field: "42",
                value: isDataFound.text
              })
            }
          } catch (ex) {
            console.log(ex)
          }

          try {
            const isDataFound = utility.getMondayFieldFromArr(tempPatientData, 'Physician NPI')
            if (isDataFound && isDataFound.text) {
              console.log('Physician NPI>>>>', isDataFound);
              AcContactFormattedData.contact.fieldValues.push({
                field: "37",
                value: isDataFound.text
              })
            }
          } catch (ex) {
            console.log(ex)
          }

          try {
            const isDataFound = utility.getMondayFieldFromArr(tempPatientData, 'Physician Location')
            if (isDataFound && isDataFound.text) {
              console.log('Physician Location>>>>', isDataFound);
              AcContactFormattedData.contact.fieldValues.push({
                field: "38",
                value: isDataFound.text
              })
            }
          } catch (ex) {
            console.log(ex)
          }

          try {
            const isDataFound = utility.getMondayFieldFromArr(tempPatientData, 'GSA Link')
            if (isDataFound && isDataFound.text) {
              console.log('GSA Link>>>>', isDataFound);
              AcContactFormattedData.contact.fieldValues.push({
                field: "43",
                value: isDataFound.text
              })
            }
          } catch (ex) {
            console.log(ex)
          }

          try {
            const isDataFound = utility.getMondayFieldFromArr(tempPatientData, 'Unique ID for AC')
            if (isDataFound && isDataFound.text) {
              console.log('Unique ID for AC>>>>', isDataFound);
              AcContactFormattedData.contact.fieldValues.push({
                field: "40",
                value: isDataFound.text
              })
            }
          } catch (ex) {
            console.log(ex)
          }
          syncData(AcContactFormattedData);
        } else {
          // in transaction table for the triggeruuid add isError: true, errorMsg: No data found
        }
      } catch (ex) {
        // insert in error table
        const res = dbo.collection("Errors").insertOne(ex);
        if (res) {
          console.log("1 error inserted");
        }
        else {
          sendMail(JSON.stringify(ex));
          console.log(ex);
        }
      }
    })
    .catch(function (error) {
      // insert in error table
      const res = dbo.collection("Errors").insertOne(ex);
      if (res) {
        console.log("1 error inserted");
      }
      else {
        sendMail(JSON.stringify(ex));
        console.log(ex);
      }
    });
}

function syncData(data) {
  var config = {
    method: 'post',
    url: process.env.ACTIVE_CAMPAIGN_API_URL,
    headers: {
      'Api-Token': process.env.ACTIVE_CAMPAIGN_API_TOKEN,
      'Content-Type': 'application/json',
    },
    data: data
  };

  axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);
    });
}

app.get("/", function (req, res) {
  console.log(req.body);
  console.log(JSON.stringify(req.body, 0, 2));
  res.status(200).send(req.body);
})

app.listen(port, (err) => {
  if (err) console.error(err);
  connectDatabase()
  console.log(`Server listnening on ${port}`);
})