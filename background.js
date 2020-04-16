const https = require('https');
const environment = require('./environement');
const bdd = require('./bdd')

/**
 * Liste des paramètres demandé à l'API Meteomatics
 */
const valuesVoulus = [
    { label: "Irradiance globale", code: "global_rad:W", unite: "W/m²" },
    { label: "Point de rosée à 2m", code: "dew_point_2m:C", unite: "°C" },
    { label: "Température à 2m", code: "t_2m:C", unite: "°C" },
    { label: "Humidité relative à 2m", code: "relative_humidity_2m:p", unite: "%" },
]


/**
 * Mise a jours des données de la bdd via l'API Meteomatics
 */
async function syncData (){
    return new Promise((resolve, reject) => {
        let now = new Date()
        now.setUTCHours(12)
        now.setUTCMinutes(0)
        now.setUTCSeconds(0)
        now.setUTCMilliseconds(0)
        let time = now.toISOString() + "P7D:P1D";
        console.log(time)
        let parameters = valuesVoulus.map((x) => x.code).join(',');
        let location = "france:100x100";
        let url = `https://${environment.apiMeteomatics.user}:${environment.apiMeteomatics.pwd}@api.meteomatics.com/${time}/${parameters}/${location}/json`;

        https.get(url, (resp) => {
            let data = '';

            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on('end', async () => {
                //On met les données en forme
                let dataJson = JSON.parse(data)
                let rep = calculData(dataJson)

                // /On enregistre la dernière date de MAJ
                await bdd.updateSetting({ type: "lastUpdate", value: dataJson.dateGenerated })

                //On enregistre les nouvelles données 1 a 1
                rep.map(async el => {
                    await bdd.updateData(el)
                })

                bdd.meteoModel.find((err, result) => {
                    if (err) {
                        reject(err)
                        return
                    }
                    resolve(result)
                })

            });

        }).on("error", (err) => {
            console.log("Error: " + err.message);
        });
    })

}


/**
 * Remise en forme des données recu pour faciliter une recherche par zone en bdd
 * @param {*} data 
 */
function calculData(data) {
    if (data.data && data.data.length) {
        let rep = []
        data.data.map(elem => {
            let tmpType = elem.parameter

            elem.coordinates.map(coord => {
                let tmpCoord = rep.find(x => x.lat == coord.lat && x.lon == coord.lon)
                if (!tmpCoord) {
                    tmpCoord = {
                        "lat": coord.lat,
                        "lon": coord.lon,
                        "dates": []
                    }
                    rep.push(tmpCoord)
                }

                coord.dates.map((date, i) => {
                    let tmpDate = tmpCoord.dates.find(x => x.date == date.date)
                    if (!tmpDate) {
                        tmpDate = {
                            "date": date.date,
                            "values": []
                        }
                        tmpCoord.dates.push(tmpDate)
                    }

                    let tmpValue = tmpDate.values.find(x => x.type == tmpType)
                    if (!tmpValue) {
                        tmpValue = {
                            "type": tmpType,
                            "value": date.value
                        }
                        tmpDate.values.push(tmpValue)
                    } else {
                        tmpValue.value = date.value
                    }

                })
            })
        })
        return rep
    }
    return []
}



/**
 *  lancement de l'update de la BDD périodique
 *  Verifie toutes les 10 minutes si la dernière MAJ date de moins de "nbrHeures"
 */
function periodeSync() {
    let nbrHeures = 3
    nbrHeures = nbrHeures * 1000 * 60 * 60

    setInterval(async () => {
        console.log("verify time")

        let lastUpdate = new Date(await bdd.getSetting('lastUpdate'))
        console.log("-> lastUpdate" , lastUpdate)
        
        console.log("-> nbrHeures " , nbrHeures)
        console.log("-> lastUpdate.getTime()" , lastUpdate.getTime())
        console.log("-> new Date().getTime()" , new Date().getTime())
        console.log("-> calcul" , (lastUpdate.getTime() + nbrHeures) +' >= '+new Date().getTime())
        console.log("-> rep" , (lastUpdate.getTime() + nbrHeures <= new Date().getTime()))


        if(lastUpdate.getTime() + nbrHeures <= new Date().getTime()){
            syncData();
        }
    }, 1000 *60 *10)
}



exports.valuesType = valuesVoulus;
exports.syncData = syncData;
exports.periodeSync = periodeSync;
