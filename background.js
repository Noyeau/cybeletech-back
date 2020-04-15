const https = require('https');
const environment = require('./environement');
const bdd = require('./bdd')


const valuesVoulus=[
    { label:"irradiance globale", code :"global_rad:W", unite:"W/m²"},
    { label:"point de rosée à 2m", code :"dew_point_2m:C", unite:"°C"},
    { label:"température à 2m", code :"t_2m:C", unite:"°C"},
    { label:"humidité relative à 2m", code :"relative_humidity_2m:p", unite:"%"},
]

exports.valuesType=valuesVoulus;

//dew_point_2m:C	dew point temperature at 2m height [C]
//global_rad: W	rayonnement global [W]

/**
 * Mise a jours des données de la bdd via l'API Meteomatics
 */
 exports.syncData = async () => {
    return new Promise((resolve, reject) => {
        let time = new Date().toISOString()+"P7D:P1D";
        let parameters = valuesVoulus.map((x)=>x.code).join(',');
        let location="france:100x100";
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

                bdd.meteoModel.find((err,result)=>{
                    if(err){
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