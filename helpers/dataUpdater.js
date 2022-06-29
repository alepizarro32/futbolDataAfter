const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const https = require("https");

const FilePath = "D:/TRABAJOS/futbolDataServer/data/exportes.json";


const writeFile = async function(data) {
    let string = JSON.stringify(data);
    try {
        fs.writeFileSync(FilePath, string,'utf-8');
      } catch (error) {
        console.error(error);
      }

} 

const getMatch = async function (id){
    let data
    let headersList = {
        "Accept": "*/*",
        "User-Agent": "Thunder Client (https://www.thunderclient.com)",
        "X-Auth-Token": "d19215cf941e46cbb3cc83fd68f58ec3"
       }
    let url = "http://api.football-data.org/v4/matches/"+id;
       await fetch(url, { 
         method: "GET",
         headers: headersList
       }).then(res => res.json()).then(results => data= results)
       return data;
}

const getTeam = async function (id){
    let headersList = {
        "Accept": "*/*",
        "User-Agent": "Thunder Client (https://www.thunderclient.com)",
        "X-Auth-Token": "d19215cf941e46cbb3cc83fd68f58ec3"
       }
    let url = "http://api.football-data.org/v4/teams/"+id;
       await fetch(url, { 
         method: "GET",
         headers: headersList
       }).then(res => res.json()).then(results => data= results)
       return data;
}

const getAllData = async function (id){
 let matchData; 
 let idHome;
 let idAway;
 let homeData;
 let awayData;
 let totalData;

 matchData = await getMatch(id);
     idHome = matchData.homeTeam.id;
 idAway = matchData.awayTeam.id;
 homeData = await getTeam(idHome)
 awayData = await getTeam(idAway)

 totalData = {
     match:matchData,
     home:homeData,
     away:awayData
 }
 return totalData;
}

let formation = [1,4,3,3]
let playerPositions = ["Goalkeeper","Defence","Midfield","Offence"]

const squadList = async function(team,form,positions){

    let squad = [];
    let i=0;
    for (pos of form) {
        let u=i;
        let players = team.filter((player) => {
            return player.position == positions[u];});
        let playersNames = players.slice(0,form[i])
        i = ++i;
        playersNames.forEach(element => squad.push(element.name))         
    }
    let stringSquad = squad.join('<');
    console.log(stringSquad)
    return stringSquad;
}

const imageDownloader = function (url,filename){
    let imgURL = url;

    https.get(imgURL, function(res){ 
        const fileStream = fs.createWriteStream("../data/"+filename+"photo.png");
        res.pipe(fileStream);
            fileStream.on("finish", function(){
            fileStream.close();
        console. log("Fernando");
        });
    });
}


const dataComp = async function(id){
    let data;
    let comp;
    data = await getAllData(id);
    console.log(data.match.awayTeam.crest)
    let homeSquad= await squadList(data.home.squad,formation,playerPositions);
    let awaySquad= await squadList(data.away.squad,formation,playerPositions);
    imageDownloader(data.match.homeTeam.crest,"local");
    imageDownloader(data.match.awayTeam.crest,"away");
    console.log(data)
    comp ={
        match:{
            league_name: data.match.competition.name,
            match_day:data.match.season.endDate,
            team_local_name:data.match.homeTeam.name,
            team_local_tla:data.match.homeTeam.tla,
            team_local_logo:data.match.homeTeam.crest,
            team_local_coach:data.home.coach.name,
            team_away_name:data.match.awayTeam.name,
            team_away_tla:data.match.awayTeam.tla,
            team_away_logo:data.match.awayTeam.crest,
            team_away_coach:data.away.coach.name,
            match_data:{
                    local:{
                        goals:{
                            amount:1,
                            details:[{player:"name",min:10}]
                        },
                        yellow:{
                            amount:0,
                            details:[{player:"name",min:90}]
                        },
                        red:{
                            amount:0,
                            details:[{player:"name",min:10}]
                        },
                        shots:0,
                        corners:0,
                        fouls:0,
                        squad:homeSquad
                    },
                    away:{
                        goals:{
                            amount:0,
                            details:[{player:"name",min:10}]
                        },
                        yellow:{
                            amount:0,
                            details:[{player:"name",min:10}]
                        },
                        red:{
                            amount:0,
                            details:[{player:"name",min:10}]
                        },
                        shots:0,
                        corners:0,
                        fouls:0,
                        squad:awaySquad
                    }
                }

            }
        }
    return comp
    }

const dataHelper ={
    callApi: async function(id){
        let data;
        data = await dataComp(id);
        console.log(data)
        writeFile(data)
        return data
    }
    
};

module.exports = dataHelper