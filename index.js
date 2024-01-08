const fs = require('fs');

const mass = 10;                 //Kg - doesn't matter for this version
const surfaceEnergyReturn = 0.7; //how much of the velocity is maintained when a bouncing
const gravity = 9.8;             //gravity in m/s^2
const speedRegulation = 10;      //limit the speed of the simulation - zero for no regulation
const totalStepGoal = 40000;     //total number of steps to be done if the useElimit is false
const stepTime = 0.016           //change the precision of the simulation, lower is more  precise. seconds/step
const startPosition = 3          //starting height
const lowerElimit = 1;           //the energy level to reach to end the simulation if useElimit is true
const useElimit = true;          //weather use the energy level or step count as a way to stop the simulation
const doDraw = true;             //weather to draw the object on the terminal
const drawingScale = 6           //to scale the drawing (used to prevent the object from going to the next line of the terminal)
const reportE = true;            //weather to report the E value of the object in the terminal
const reportX = true;            //weatehr to report the X value of the object in the terminal
const reportV = true;            //weatehr to report the V value of the object in the terminal
const startingVelocity = 0       //starting velocity (negative is downwards)

const startTime = Date.now();    
var xhistory = [];               //used to store the x values separately to prevent the proccess of storing them to slow the simulation down 
var Ehistory = [];               //same for the E values
var Vhistory = [];               //same for the V values


var x = 0;
var bounce = 0;                  //number of bounces
var E;
var velocity = startingVelocity;
var position = startPosition; 
// var direction = 0 (maybe when 2D version is made)


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

function draw(position, scale){
    var emptySpaces = Math.round((position*scale)-1);
    var plot = "";
    for(var i=0; i<emptySpaces; i+=1){
        plot += " ";
    }
    return plot + "X"
}

setInterval(function(){
    [position, velocity] = step(position, velocity, surfaceEnergyReturn, gravity, stepTime)
    E = (position*mass*gravity)+(mass*velocity*velocity*(1/2));
    Ehistory[x] = E;
    Vhistory[x] = velocity;
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
    if(doDraw) console.log(draw(position, drawingScale));
    if(reportX) console.log(`x = ${Math.round(position*10)/10}`)
    if(reportV) console.log(`V = ${Math.round(velocity*10)/10}`);
    if(reportE) console.log(`E = ${Math.round(E*10)/10}`);

},speedRegulation)//step time

function end(xhistory){
    for(var n = 0; n <= xhistory.length-1; n+=1){
        fs.appendFileSync('x.txt', `${xhistory[n]}\n`);
        fs.appendFileSync('E.txt', `${Ehistory[n]}\n`);
        fs.appendFileSync('V.txt', `${Vhistory[n]}\n`);
    }
    var totalTime = (Math.round((Date.now() - startTime)/100))/10;
    console.log(`Simulation compelited`);
    console.log(`made ${x} steps in ${totalTime} seconds.`);
    console.log(`average performance of ${(Math.round(n/totalTime*10))/10} steps/second`);
    console.log(`recorded ${bounce} bounces.`);
    console.log("position data available at /x.txt");
    process.exit();
}
