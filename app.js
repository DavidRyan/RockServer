var express = require('express')
  , routes = require('./routes')

//var app = module.exports = express.createServer("10.0.0.148");
var app = module.exports = express.createServer("192.168.0.103");

var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var client = new Db('testing', new Server("127.0.0.1", 27017, {}))

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

app.post('/hand/', function(req, res){

    console.log("Connection");
    var loc = req.query["loca"];
    var move = req.query["move"];
    console.log(loc);
    console.log(move);
    var currentTime = new Date();
    var time = currentTime.getTime(); 
    var data = { position: loc, hand: move, time: time};
    var _id;

    client.open(function(err, p_client) {
        client.collection('test_insert', handle);
    });

    var handle = function (err, collection) {

        collection.insert( data , function(err, docs) { 
           // collection.remove({});
            _id = docs[0]._id;
        });
        collection.find({position:loc}).toArray(function(err, results) {
            for (var i in results) {
                if (currentTime.getTime() - results[i].time >= (10*1000)) {
                    console.log("deleting " + results[i]._id);
                    collection.remove({_id:results[i]._id});
                }
                if( (data._id == results[i]._id)) {
                    console.log("equal");
                }
                if( (data.time - results[i].time <= 1000) && (data._id.toString() != results[i]._id.toString()) ) {
                    res.send(game(data.hand,results[i].hand));
                }
            }

            var id = setTimeout(function(){
                collection.find({position:loc}).toArray(function(err, results) {
                    for (var i in results) {
                        if (currentTime.getTime() - results[i].time >= (10*1000)) {
                            console.log("deleting " + results[i]._id);
                            collection.remove({_id:results[i]._id});
                        }
                        if( (data._id == results[i]._id)) {
                            console.log("equal");
                        }
                        if( (data.time - results[i].time <= 1000) && (data._id.toString() != results[i]._id.toString()) ) {
                            res.send(game(data.hand,results[i].hand));
                        }
                    }
                    res.send("nogame");
                });
            }, 1000);
            
        });
    };
});

function game(hand, other) {
    console.log(hand + " " + other);
    if(hand == 'rock' && other == 'paper') {
        return "lose";
    } else if (hand == 'rock' && other == 'scissor') {
        return "win";
    } else if (hand == 'rock' && other == 'rock') {
        return "tie";
    } else if (hand == 'scissor'&& other == 'scissor') {
        return "tie";
    } else if (hand == 'scissor'&& other == 'rock') {
        return "lose";
    } else if (hand == 'scissor'&& other == 'paper') {
        return "win";
    } else if (hand == 'paper'&& other == 'paper') {
        return "tie";
    } else if (hand == 'paper'&& other == 'rock') {
        return "win";
    } else if (hand == 'paper'&& other == 'scissor') {
        return "lose";
    }

    return "error";
}

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
