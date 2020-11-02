const db = require("./db");

const collection = {
    login: "login",
    school: "school",
    job: "jobopp",
    properties: "props",
    college: "collafe",
    tourism: "tour",
    competitions: "comp",
    prayer: "org"
}

var strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");

const path = require('path');
const express = require('express');
const body_parser = require('body-parser');
const log = express();
const blake = require('./blake2b/blake2b');
const blake2b = blake.blake2bHex;

log.use(body_parser.json());
log.use(express.json());
log.use(express.urlencoded());

log.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'website.html'));
});

log.get('/aboutus', (req, res) => {
    res.sendFile(path.join(__dirname, 'aboutus.html'));
});

log.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

log.post('/login', (req, res, next) => {
    const ip = req.body;
    console.log(ip.username, ip.password);
    db.getDB().collection(collection.login).find({ username: ip.username }).toArray().then((doc) => {
        console.log(doc);
        if (doc===[]) {
            res.send('Error 404:User Not Found');
        } else {
            console.log(doc[0])
            if (blake2b(ip.password) === doc[0]['password']) {
                if (doc[0]['type'] === 'Student') {
                    res.redirect('/user/student/' + ip.username);
                } else if (doc[0]['type'] === 'Adult') {
                    res.redirect('/user/adult/' + ip.username);
                } else if (doc[0].type === 'Elder') {
                    res.redirect('/user/elder/' + ip.username);
                }
            } else {
                res.send('error');
            }
        }
    }).catch((err) => {
        console.log(err);
    }).finally(() => {
        var a = 1;
    });
});


// To Login 
log.get('/user/:id/:userid', (req, res) => {
    const id = req.params.id;
    if (id === 'student') {
        res.sendFile(path.join(__dirname, 'student.html'));
    } else if (id === 'adult') {
        res.sendFile(path.join(__dirname, 'Adult.html'));
    } else if (id === 'elder') {
        res.sendFile(path.join(__dirname, 'Elder.html'));
    }
});



log.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'Signup.html'));
});


log.post('/signup', (req, res, next) => {
    const ip = req.body;
    console.log(ip);
    // ip.password=blake2b(ip.password);
    // ip.username=blake2b(ip.username);
    db.getDB().collection(collection.login).find({ username: ip.username }).toArray((err, doc) => {
        // if(doc[0]=={}){
        if (strongRegex.test(ip.password)) {
            ip.password = blake2b(ip.password);
            db.getDB().collection(collection.login).insertOne(ip, (err, result) => {
                if (err) {
                    const error = new Error("failed");
                    error.status = 400;
                    next(error);
                }
                else {
                    console.log('success');
                    //next();
                    //res.json({result:result, document:result.ops[0],msg:"success",error:null});
                    res.jsonp({ success: true });
                    next();
                }
            });
        } else {
            res.send('Regex error');
        }
        //} 
        // else {
        //     res.send('User already exists.');
        // }
    });

});

log.get('/update', (req, res) => {
    res.sendFile(path.join(__dirname, 'Update.html'));
});

log.post('/update', (req, res, next) => {
    const old_user = req.body.username;
    const new_user = req.body.username1;
    const new_pass = req.body.password1;

    db.getDB().collection(collection.login).find({ username: old_user }).toArray((err, doc) => {
        if (!doc) {
            res.send("Error 404: User not found!");
        } else {
            db.getDB().collection(collection.login).findOneAndUpdate({ _id: db.getPrimaryKey(doc[0]['_id']) }, { $set: { username: new_user, password: new_pass } }, (err, result) => {
                if (err) console.log(err);
                else {
                    res.send('Successfully updated');
                }
            });
        }
    });
});

log.delete('/delete/:id/:mid',(req,res)=>{
    const del_id=req.params.mid;
    db.getDB().collection(req.params.id).findOneAndDelete({_id:db.getPrimaryKey(del_id)},(err,result)=>{
        if(err)
            console.log(err);
        else
            res.json(result)
    });
});

log.get('/university', (req, res) => {
    res.sendFile(path.join(__dirname, 'university.html'));
});

log.get('/university/open', (req, res) => {
    db.getDB().collection(collection.college).find({}).toArray((err, doc) => {
        if (err)
            console.log(err);
        else {
            res.json(doc);
        }
    });
});

log.get('/school', (req, res) => {
    res.sendFile(path.join(__dirname, 'school.html'));
});

log.get('/school/open', (req, res) => {
    db.getDB().collection(collection.school).find({}).toArray((err, doc) => {
        if (err)
            console.log(err);
        else {
            res.json(doc);
        }
    });
});

log.get('/comp', (req, res) => {
    res.sendFile(path.join(__dirname, 'comp.html'));
});

log.get('/comp/open', (req, res) => {
    db.getDB().collection(collection.competitions).find({}).toArray((err, doc) => {
        if (err)
            console.log(err);
        else {
            res.json(doc);
        }
    });
});

log.get('/jobopp', (req, res) => {
    res.sendFile(path.join(__dirname, 'jobopp.html'));
});

log.get('/jobopp/open', (req, res) => {
    db.getDB().collection(collection.job).find({}).toArray((err, doc) => {
        if (err)
            console.log(err);
        else {
            res.json(doc);
        }
    });
});

log.get('/prayer', (req, res) => {
    res.sendFile(path.join(__dirname, 'prayers.html'));
});

log.get('/prayer/open', (req, res) => {
    db.getDB().collection(collection.prayer).find({}).toArray((err, doc) => {
        if (err)
            console.log(err);
        else {
            res.json(doc);
        }
    });
});

log.get('/props', (req, res) => {
    res.sendFile(path.join(__dirname, 'properties.html'));
});

log.get('/props/open', (req, res) => {
    db.getDB().collection(collection.properties).find({}).toArray((err, doc) => {
        if (err)
            console.log(err);
        else {
            res.json(doc);
        }
    });
});

log.get('/tours', (req, res) => {
    res.sendFile(path.join(__dirname, 'tours.html'));
});

log.get('/tours/open', (req, res) => {
    db.getDB().collection(collection.tourism).find({}).toArray((err, doc) => {
        if (err)
            console.log(err);
        else {
            res.json(doc);
        }
    });
});

db.connect((err) => {
    if (err) {
        console.log("can't connect");
        process.exit(1);
    } else {
        log.listen(4000, () => {
            console.log('listening on port xx3000');
            // var a=db.getDB().collection(collection).find({}).toArray();
            // console.log(a);
        });
    }
});