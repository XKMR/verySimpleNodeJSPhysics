const fs = require('fs');

const mass = 10; //Kg
const surfaceEnergyReturn = 0.8;
const gravity = 9.8;
const speedRegulation = 0; //zero for no regulation
const startTime = Date.now();
const totalStepGoal = 40000;
const stepTime = 0.01 // second/step
const startPosition = 100
const lowerElimit = 1;
const useElimit = true;
const doDraw = true;
const reportE = true;
const reportX = true;
var xhistory = [];
var Ehistory = [];
var x = 0;

var bounce = 0;
var E;
var velocity = 0; // m/s
var position = startPosition; 
// var direction = 0



function generateBar(current, total, barSize){
    var bar = ""
    var numberOfFilledSpaces = Math.round(current/total * barSize);
    var numberOfEmptySpaces = barSize - numberOfFilledSpaces;
    var filledCharacters = "";
    var emptyCharacters = "";
    for(var n=0; n < numberOfFilledSpaces; n+=1){
        filledCharacters += "=";
    }
    for(var n=0; n < numberOfEmptySpaces; n+=1){
        emptyCharacters += " ";
    }
    bar = "["+filledCharacters+emptyCharacters+"]";
    return bar
}

fs.writeFileSync('x.txt', "");
fs.writeFileSync('E.txt', "");

function step(x, V, fr, g, t){
        V = V - (g * t);
        if((x + (V * t)) < 0){
            V = -V * fr;
            bounce += 1;
        }
        x = x + (V * t);

        return [x, V];
}

function draw(position, maxPos, scale){
    var graph = "";
    for(var i=0; i<=Math.round(maxPos*scale)-1; i+=1){
        if(i == Math.round(position*scale)){
            graph += `${graph}X`;
        }else{
            graph = `${graph} `
        }
    }
    return graph
}

setInterval(function(){
    [position, velocity] = step(position, velocity, surfaceEnergyReturn, gravity, stepTime)
    E = (position*mass*gravity)+(mass*velocity*velocity*(1/2));
    Ehistory[x] = E;
    xhistory[x] = position;
    x += 1;

    if(x == totalStepGoal && useElimit == false){
        end(xhistory);
    }
    if(Math.round(E) == lowerElimit && useElimit == true){
        end(xhistory);
    }

    console.clear();
    if(!useElimit) console.log(generateBar(x, totalStepGoal, 60)+x+"/"+totalStepGoal);
    if(doDraw) console.log(draw(position, startPosition, 1));
    if(reportX) console.log(`x = ${position}`)
    if(reportE) console.log(`E = ${E}`);

},speedRegulation)//step time

function end(xhistory){
    for(var n = 0; n <= xhistory.length-1; n+=1){
        fs.appendFileSync('x.txt', `${xhistory[n]}\n`);
        fs.appendFileSync('E.txt', `${Ehistory[n]}\n`);
    }
    var totalTime = (Math.round((Date.now() - startTime)/100))/10;
    console.log(`Simulation compelited`);
    console.log(`made ${x} steps in ${totalTime} seconds.`);
    console.log(`average performance of ${(Math.round(n/totalTime*10))/10} steps/second`);
    console.log(`recorded ${bounce} bounces.`);
    console.log("position data available at /x.txt");
    process.exit();
}
