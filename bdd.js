
// await mongoose.connect('mongodb://localhost/Cybeletech', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
//   });





var mongoose = require('mongoose');

// // make a connection
// mongoose.connect('mongodb://localhost/cybeletech',{ useNewUrlParser: true,useUnifiedTopology: true });

// // get reference to database
// var db = mongoose.connection;

// db.on('error', console.error.bind(console, 'connection error:'));
// // exports.
// db.once('open', function () {
//     console.log("Connection Successful!");

//     // define Schema
//     var MeteoSchema = mongoose.Schema({
//         parameter: String,
//         coordinates: Array
//     });

//     // compile schema to model
//     var Meteo = mongoose.model('Meteo', MeteoSchema, 'newTest');

//     Meteo.find()
//     // a document instance
//     let tmp =
//     {
//         "parameter": "t_2m:C",
//         "coordinates": [
//             {
//                 "lat": 42.15,
//                 "lon": -5.18,
//                 "dates": [
//                     {
//                         "date": "2020-04-15T00:00:00Z",
//                         "value": 11.7
//                     },
//                     {
//                         "date": "2020-04-16T00:00:00Z",
//                         "value": 9.0
//                     }
//                 ]
//             }
//         ]
//     }
//     var meteo1 = new Meteo(tmp);

//     // save model to database
//     meteo1.save(function (err, meteo) {
//         if (err) return console.error(err);
//         console.log(meteo + " saved to meteostore collection.");
//     });

// });




var uri = "mongodb://localhost/cybeletech";

mongoose.connect(uri, { useUnifiedTopology: true, useNewUrlParser: true });

const connection = mongoose.connection;

connection.once("open", function () {
    console.log("MongoDB database connection established successfully");
});
const Schema = mongoose.Schema;

let meteo = new Schema({
    lat: Number,
    lon: Number,
    dates: Array
})
let meteoModel = mongoose.model("meteo", meteo, "meteos");

let setting = new Schema({
    type: String,
    value: String,
})
let settingModel = mongoose.model("setting", setting, "settings");


exports.settingModel = settingModel
exports.meteoModel = meteoModel

// let tmp = {
//     "parameter": "t_2m:C",
//     "coordinates": [
//         {
//             "lat": 42.15,
//             "lon": -5.18,
//             "dates": [
//                 {
//                     "date": "2021-04-10T00:00:00Z",
//                     "value": 11.7
//                 },
//                 {
//                     "date": "2020-04-16T00:00:00Z",
//                     "value": 9.0
//                 }
//             ]
//         }
//     ]
// }



// meteoModel.insertMany([tmp], (err, result) => {
//     console.log('err', err)
//     console.log('result', result)

// })

exports.getSetting = async (type = "lastUpdate") => {
    return new Promise((resolve, reject) => {
        settingModel.findOne({ type: type }, (err, res) => {
            if (err) {
                reject(err)
                return
            }
            resolve(res.value)
            console.log('res', res)
        })
    })
}


/**
 * Enregistrement d'un setting en bdd
 */
exports.updateSetting = (data) => {
    return new Promise((resolve, reject) => {
        settingModel.replaceOne({ type: data.type }, data, { upsert: true }, (err, res) => {
            if (err) {
                reject(err)
                return
            }
            resolve(res)
            console.log('update- settings.' + data.type, (res.ok == 1))
        })
    })
}



/**
 * Récupération d'une coordonnée en bdd. la date peut etre precisé
 */
exports.getData = (coordinates = null, dateMin = null, dateMax = null) => {
    return new Promise((resolve, reject) => {
        if (coordinates) {
            meteoModel.findOne({ lat: coordinates.lat, lon: coordinates.lon }, (err, res) => {
                if (err) {
                    reject(err)
                    return
                }
                if (!dateMin) {
                    resolve(res)
                    return
                }

                if (dateMin && !dateMax) {
                    res.dates = res.dates.filter(x => new Date(x.date).toDateString() == new Date(dateMin).toDateString())
                    resolve(res)
                    return

                }
                else if (dateMin && dateMax) {
                    res.dates = res.dates.filter(x => new Date(x.date).getTime() >= new Date(dateMin).getTime() && new Date(x.date).getTime() <= new Date(dateMax).getTime())
                    resolve(res)
                    return

                } else {
                    resolve(res)
                }
            })
        } else {
            meteoModel.find((err, res) => {
                if (err) {
                    reject(err)
                    return
                }
                if (!dateMin) {
                    resolve(res)
                    return
                }

                if (dateMin && !dateMax) {
                    res = res.map(el => {
                        el.dates = el.dates.filter(x => new Date(x.date).toDateString() == new Date(dateMin).toDateString())
                        return el
                    })
                    resolve(res)
                }
                else if (dateMin && dateMax) {
                    res = res.map(el => {
                        el.dates = el.dates.filter(x => new Date(x.date).getTime() >= new Date(dateMin).getTime() && new Date(x.date).getTime() <= new Date(dateMax).getTime())
                        return el
                    })
                    resolve(res)
                } else {
                    resolve(res)
                }
            })
        }

    })
}




/**
 * Enregistrement d'une donnée géographique en bdd en remplaceant l'ancienne si elle existe
 */
exports.updateData = (data) => {
    return new Promise((resolve, reject) => {
        meteoModel.replaceOne({ lat: data.lat, lon: data.lon }, data, { upsert: true }, (err, res) => {
            if (err) {
                reject(err)
                return
            }
            resolve(res)
        })
    })
}

