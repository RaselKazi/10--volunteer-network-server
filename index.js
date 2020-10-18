const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const fileUpload = require('express-fileupload');
const ObjectId = require('mongodb').ObjectID;
const fs = require('fs');
require('dotenv').config();

//mongo DB info
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7pro1.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

//path 
const path = require('path');
const directoryPath = path.join(__dirname, "/Volunteer/");

//use App
const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(fileUpload());
app.use(express.static(__dirname + '/Volunteer/'));

//default directory
app.get('/', (req, res) => {
    res.send("HI I AM SREVER")
})

//database area
client.connect(err => {
    //admin data base
    const EventData = client.db(`${process.env.DB_NAME}`).collection(`${process.env.EVENT_COLLECTION}`);
    //public data base
    const AdminData = client.db(`${process.env.DB_NAME}`).collection(`${process.env.ADMIN_COLLECTION}`);

    //event data
    app.get('/Event', (req, res) => {
        EventData.find({})
            .toArray((err, docs) => {
                res.send(docs);
            })
    })

     // create event  
     app.post('/addEvent', (req, res) => {
        const upFile = req.files.images;
        try {
            fs.readdir(directoryPath, (err, filed) => {
                const FoundImg = filed.find(img => img == upFile.name);
                if (FoundImg) {
                    return res.json({ exists: true })
                }
                if (FoundImg == undefined) {
                    upFile.mv("Volunteer/" + upFile.name, err => {
                        if (err) {
                            return res.json({ "status": " Your Images Not Uploaded" });
                        } else {
                            eventObjact = {
                                Title: req.body.Title,
                                description: req.body.description,
                                Date: req.body.Date,
                                images: upFile.name
                            }
                            EventData.insertOne(eventObjact)
                                .then(() => {
                                    res.json({ exists: false })
                                })
                        }
                    })
                }
            });
        } catch (err) {
            res.json({ err: err })
        }
    });

     
    //Register Volunteer Data Post
    app.post('/register-volunteer', (req, res) => {
        const registerData = req.body.formData;
        AdminData.insertOne(registerData)
            .then(() => {
                res.json({ success: true })
            })
    })

    //user data
    app.get('/event-registration/', (req, res) => {
        AdminData.find({ email: req.query.email })
            .toArray((err, docs) => {
                res.send(docs);
            })
    })

    //Registration data
    app.get('/all-volunteer/', (req, res) => {
        AdminData.find({})
            .toArray((err, docs) => {
                res.send(docs);
            })
    })

    //delete data
    app.delete('/delete-Item/:id', (req, res) => {
        AdminData.deleteOne({ _id: ObjectId(req.params.id) })
            .then(() => {
                res.send({ success: true })
            })
    })

    
});

app.listen(process.env.PORT || 5000);
