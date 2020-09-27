# cybeletech-back


Test technique pour le poste de développeur fullstack

# Intro
Etant donné les qualifications requises pour occuper ce type de poste, le test a pour vocation de valider les acquis du candidat sur une chaîne de traîtement de la donnée entière, depuis l'acquisition et la gestion en backend jusqu'à l'affichage en front end.

La conduite des cultures a pour vocation à placer la plante dans ses conditions optimales pour garantir une bonne production (rendement et qualité). Le climat a un impact majeur sur le développement des plantes, les actions de l'agriculteurs sont donc largement adaptées à la météo ambiante et les prévisions des jours à venir. Dans ce cadre, on souhaite restituer des données climatiques d'intérêt pour les décisions à prendre, sous format graphique agréable pour l'agriculteur ou son conseiller.

# Récupération de la donnée
## Fournisseur, nature des données
* le fournisseur de la donnée est Meteomatics. L'adresse pour la création d'un compte de test et la documentation est: https://www.meteomatics.com/en/weather-api/
* données (moyennes sur la période écoulée), prévisions sur X jours à venir: 
 * température à 2m, °C
 * humidité relative, %
 * point de rosée à 2m, °C
 * irradiance globale, W.m-2

## Eléments de spécification
* étant donné les conditions tarifaires de Meteomatics, les requêtes seront construites de manière à récupérer un maximum d'informations en un minimum de requêtes
* les éléments suivants seront passés en paramètres:
 * le nombre de jours de prévisions à inclure et le pas de temps entre deux mesures demandées
 * la région géographique d'intérêt et la distance entre deux points de données
 * authentifiants

## Technologies
* le développement se fera sous la forme d'un module NodeJS

# Stockage de la donnée
## Technologies
* la DB sera du MongoDB
* l'accès se fera par un controller en NodeJS faisant usage de Mongoose

## Technologie
* NodeJS
* utilisation d'une librairie cron de votre choix en NodeJS

# Données de test
* dans un projet complet un exécutable en cronjob assurerait la récupération automatique de la donnée à pas de temps régulier
* pour le test, utilisez le module de récupération comme bon vous semble pour obtenir les données suivantes:
 * sur 7 jours de prévision, avec un pas de temps journalier
 * pour la France entière, à raison d'un point tous les 10 km
* il n'est pas nécessaire d'inclure cet élément dans les résultats

# Accès à la donnée
## Eléments de spécification
* endpoint(s) permettant de requêter une zone et un intervalle de temps stockés en base
* pas de sécurisation de l'accès à l'API dans le cadre du test

## Technologie
* API REST HTTP (inutile se soucier du HTTPS)
* NodeJS avec framework de votre choix (restify suggéré)

# Affichage de la donnée
## Eléments de spécification
* affichage des données de prévisions sur une carte de France, par journée entière
 * le détail de l'affichage est laissé à votre choix
 * possibilité de changer de jour / variable affichée
* cliquer sur la carte permet d'afficher un graphique sur 7j au point de données le plus proche du point cliqué pour la donnée actuellement sélectionnée
* singlepage application

## Technologie
* Browser
* librairies graphiques de votre choix
* framework JS de votre choix (a priori Angular ?)


# Résultats attendus
* le projet, structuré de la manière de votre choix (un ou plusieurs modules)
* une mesure du temps que vous aurez mis
* la validation se fera par revue du code et consultation du rendu graphique
