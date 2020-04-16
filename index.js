var restify = require('restify');
const bdd = require('./bdd')
const background = require('./background')

// require('./resqest')
// require('./bdd')

function respond(req, res, next) {
  res.send('hello ' + req.params.name);
  next();
}


/**
 * Mise a jours des données de la bdd via l'API Meteomatics
 */
async function updateData(req, res, next) {
  let rep = await background.syncData()
  console.log(rep[0])
  res.send(rep);
  next();
}

/**
 * Récupération d'une info en bdd
 */
async function getData(req, res, next) {
  if (!req.params.lat || !req.params.lon) {
    res.send({ err: "lat et lon obligatoire" })
  }
  let rep = await bdd.getData({ lat: +req.params.lat, lon: +req.params.lon }, req.params.dateMin || null, req.params.dateMax || null)
  res.send(rep);
}

/**
 * Récupération d'une info en bdd
 */
async function getAllData(req, res, next) {
  let rep = await bdd.getData(null, req.params.dateMin || null, req.params.dateMax || null)
  res.send(rep);
}



var server = restify.createServer();
server.use(
  function crossOrigin(req,res,next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    return next();
  }
);


server.get('/hello/:name', respond);


/**
 * Endpoint pour forcer une MAJ de la BDD
 */
server.get('/update', updateData);

/**
 * Endpoint avec les informations sur les différentes values
 */
server.get('/typeList', (req, res, next)=>{
  res.send(background.valuesType);
});

/**
 * Endpoints pour récupérer des datas précises en fonction du lieu + intervale date
 */
server.get('/get/:lat/:lon/:dateMin/:dateMax', getData);

/**
 * Endpoints pour récupérer des datas précises en fonction du lieu + date
 */
server.get('/get/:lat/:lon/:dateMin', getData);

/**
 * Endpoints pour récupérer des datas précises en fonction du lieu uniquement
 */
server.get('/get/:lat/:lon', getData);

/**
 * Endpoints pour récupérer des datas précises en fonction du lieu uniquement
 */
server.get('/getAll', getAllData);
server.get('/getAll/:dateMin/:dateMax', getAllData);
server.get('**',  (req, res, next)=>{
  res.send("url inconnue");
});
server.listen(4202, function () {
  console.log('%s listening at %s', server.name, server.url);
});

//lancement des MAJ
background.periodeSync()


