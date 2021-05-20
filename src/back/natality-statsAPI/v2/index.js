//________________Natality-stats-API_____________________

//required modules
var path = require('path');
var Datastore = require("nedb");
var initialdata = require(path.join(__dirname, 'initialData.js'));

//required variables
var BASE_API_PATH = "/api/v2";
var datafile = path.join(__dirname, 'natality-stats.db');
var db = new Datastore({ filename: datafile, autoload: true});


//implementation
module.exports.register = (app) => {

    //GET /api/v1/natality-stats/loadInitialData 
    //Crea 2 o más recursos.
    app.get(BASE_API_PATH + "/natality-stats/loadInitialData", (req, res) => {
        
        db.find({ $or: [{ country: "denmark" }, { country: "switzerland" }] }, { _id: 0 }, function (err, data) {
            if (err) {
                console.error("ERROR accesing DB in GET");
                res.sendStatus(500);
            } else {
                if (data.length == 0) {
                    db.insert(initialdata);
                    console.log(`Loaded initial data: <${JSON.stringify(initialdata, null, 2)}>`);
                    res.sendStatus(201);
                } else {
                    console.error(`initial data already exists`);
                    res.sendStatus(409);
                }
            }
        });

    });

    //GET /api/v1/natality-stats 
    //Devuelve una lista con todos los recursos (un array de objetos en JSON)
    app.get(BASE_API_PATH + "/natality-stats", (req, res) => {
        var query = req.query;

        var limit = parseInt(query.limit);
        var offset = parseInt(query.offset)

        var cookedQuery = [];


        //Parseo de paremetros de la busqueda
        for (d in query) {
            var queryObject = {};
            if (d == 'country') {
                queryObject[d] = query[d];
            } else if (d == 'date') {
                queryObject[d] = parseInt(query[d]);
            } else if (d == 'born') {
                queryObject[d] = parseInt(query[d]);
            } else if (d == 'men-born') {
                queryObject[d] = parseInt(query[d]);
            } else if (d == 'women-born') {
                queryObject[d] = parseInt(query[d]);
            } else if (d == 'natality-rate') {
                queryObject[d] = parseFloat(query[d]);
            } else if (d == 'fertility-rate') {
                queryObject[d] = parseFloat(query[d]);
            }else{
                queryObject[d]=null;
            }
            if (d != 'limit' && d != 'offset') {
                cookedQuery.push(queryObject);
            }


        }

        //Comprobamos si se ha utilizado limit o offset
        if (!isNaN(limit) || !isNaN(offset)) {

            //Comprobamos si ha habido una busqueda
            if (Object.keys(query).length === 0) {

                //Si la busqueda no tiene nada se devuelven todos los elementos
                db.find({}, { _id: 0 }, (err, data) => {
                    if (err) {
                        console.error("ERROR accesing DB in GET");
                        res.sendStatus(500);
                    } else {
                        if (data.length == 0) {
                            console.error("No data found");
                            res.sendStatus(404);
                        } else {
                            console.log(`requested natality stats dataset`);
                            res.status(200).send(JSON.stringify(data, null, 2));
                        }
                    }
                });

            } else {
                //Sino Se pasan los paremetros de la busqueda
                db.find({ $and: cookedQuery }, { _id: 0 }).skip(offset).limit(limit).exec((err, data) => {
                    if (err) {
                        console.error("ERROR accesing DB in GET");
                        res.sendStatus(500);
                    } else if (data.length == 0) {
                        console.error("No data found");
                        res.sendStatus(404);
                    } else {
                        console.log(`requested natality stats dataset`);
                        res.status(200).send(JSON.stringify(data, null, 2));
                    }
                });
            }

        } else {
            //Sino se utilizan limit u offset
            if (Object.keys(query).length === 0) {
                //Si la busqueda no tiene nada se devuelven todos los elementos
                db.find({}, { _id: 0 }, function (err, data) {
                    if (err) {
                        console.error("ERROR accesing DB in GET");
                        res.sendStatus(500);
                    } else {
                        if (data.length == 0) {
                            console.error("No data found");
                            res.sendStatus(404);
                        } else {
                            console.log(`requested natality stats dataset`);
                            res.status(200).send(JSON.stringify(data, null, 2));
                        }
                    }
                });

            } else {
                //Sino Se pasan los paremetros de la busqueda
                db.find({ $and: cookedQuery }, { _id: 0 }, function (err, data) {
                    if (err) {
                        console.error("ERROR accesing DB in GET");
                        res.sendStatus(500);
                    } else if (data.length == 0) {
                        console.error("No data found");
                        res.sendStatus(404);
                    } else {
                        console.log(`requested natality stats dataset`);
                        res.status(200).send(JSON.stringify(data, null, 2));
                    }
                });
            }
        }

    });

    //POST /api/v1/natality-stats 
    //crea un nuevo recurso.
    app.post(BASE_API_PATH + "/natality-stats", (req, res) => {
        var newNatalityStat = req.body;

        var newCountry = req.body.country;
        var newDate = parseInt(req.body.date);


        db.find({ $and: [{ country: newCountry }, { date: newDate }] }, { _id: 0 }, function (err, data) {
            if (err) {
                console.error("ERROR accesing DB in POST");
                res.sendStatus(500);
            } else {
                if (data.length == 0) {
                    //Comprobamos los parametros del recurso a insertar
                    if (!newNatalityStat.country
                        || !newNatalityStat.date
                        || !newNatalityStat.born
                        || !newNatalityStat['men-born']
                        || !newNatalityStat['women-born']
                        || !newNatalityStat['natality-rate']
                        || !newNatalityStat['fertility-rate']
                        || Object.keys(newNatalityStat).length != 7) {

                        console.log("Numero de parametros incorrectos");
                        res.sendStatus(400);
                    } else {
                        //Insertamos el recurso
                        console.log(`new natality stat to be added: <${JSON.stringify(newNatalityStat, null, 2)}>`);
                        db.insert(newNatalityStat);
                        res.sendStatus(201);
                    }
                } else {
                    //El recurso a crear ya existe
                    console.log("Conflict detected");
                    res.sendStatus(409);
                }
            }
        });
    });


    //GET /api/v1/natality-stats/country/date 
    app.get(BASE_API_PATH + "/natality-stats/:country/:date", (req, res) => {
        var countrySelected = req.params.country;
        var dateSelected = parseInt(req.params.date);

        db.find({ $and: [{ country: countrySelected }, { date: dateSelected }] }, { _id: 0 }, function (err, data) {
            if (err) {
                console.error("ERROR accesing DB in GET");
                res.sendStatus(500);
            } else {
                if (data.length == 0) {
                    console.error("No data found");
                    res.sendStatus(404);
                } else {
                    console.log(`GET stat by country: <${countrySelected}> and date: <${dateSelected}>`);
                    res.status(200).send(JSON.stringify(data[0], null, 2));
                }
            }
        });
    });

    //PUT a un recurso  (actualizar recurso)
    app.put(BASE_API_PATH + "/natality-stats/:country/:date", (req, res) => {
        var countrySelected = req.params.country;
        var dateSelected = parseInt(req.params.date);
        var newNatalityStat = req.body;

        //Comprobamos los parametros del recurso a insertar
        if (!newNatalityStat.country
            || !newNatalityStat.date
            || !newNatalityStat.born
            || !newNatalityStat['men-born']
            || !newNatalityStat['women-born']
            || !newNatalityStat['natality-rate']
            || !newNatalityStat['fertility-rate']
            || newNatalityStat.country != countrySelected
            || newNatalityStat.date != dateSelected
            || Object.keys(newNatalityStat).length != 7) {

            console.log("Actualizacion de campos no valida")
            res.sendStatus(400);
        } else {
            db.update({ $and: [{ country: countrySelected }, { date: dateSelected }] }, { $set: newNatalityStat }, {}, function (err, numReplaced) {
                if (err) {
                    console.error("ERROR accesing DB in PUT");
                    res.sendStatus(500);
                } else {
                    if (numReplaced == 0) {
                        console.error("No data found");
                        res.sendStatus(404);
                    } else {
                        console.log("Campos actualizados")
                        res.sendStatus(200);
                    }
                }
            });
        }
    });

    //POST a un recurso (ERROR)
    app.post(BASE_API_PATH + "/natality-stats/:country/:date", (req, res) => {
        console.log("Post a un recurso no se puede");
        return res.sendStatus(405);

    });
    //PUT a la lista de recursos (ERROR)
    app.put(BASE_API_PATH + "/natality-stats", (req, res) => {
        console.log("Put a una lista de recursos no se puede");
        return res.sendStatus(405);

    });

    //DELETE /api/v1/natality-stats/country/date 
    app.delete(BASE_API_PATH + "/natality-stats/:country/:date", (req, res) => {
        var countrySelected = req.params.country;
        var dateSelected = parseInt(req.params.date);

        db.remove({ $and: [{ country: countrySelected }, { date: dateSelected }] }, { multi: true }, function (err, dataDeleted) {
            if (err) {
                console.error("ERROR accesing DB in DELETE");
                res.sendStatus(500);
            } else {
                if (dataDeleted == 0) {
                    console.error("No data found");
                    res.sendStatus(404);
                } else {
                    console.log(`stat with country: <${countrySelected}> and date: <${dateSelected}> deleted`);
                    res.sendStatus(200);
                }
            }
        });
    });

    //DELETE a la lista de recursos.
    app.delete(BASE_API_PATH + "/natality-stats", (req, res) => {
        db.remove({}, { multi: true }, function (err, numRemoved) {
            if (err) {
                console.error("ERROR deleting DB contacts in DELETE");
                res.sendStatus(500);
            } else {
                if (numRemoved == 0) {
                    console.error("ERROR natality-stats not found");
                    res.sendStatus(404);
                } else {
                    res.sendStatus(200);
                }
            }
        });

    })
}
//________________API-End_____________________