const fs = require('fs');

const stepTime = 0.03;            //change the precision of the simulation, lower is more  precise. seconds/step
const mass = 10;                  //Kg - doesn't matter for this version
const surfaceEnergyReturn = 0.65; //how much of the velocity is maintained when a bouncing
const gravity = 9.8;              //gravity in m/s^2
const speedRegulation = 20;       //limit the speed of the simulation - zero for no regulation
const totalStepGoal = 40000;      //total number of steps to be done if the useElimit is false
const startPosition = 20          //starting height
const lowerElimit = 10;           //the energy level to reach to end the simulation if useElimit is true
const useElimit = true;           //weather use the energy level or step count as a way to stop the simulation
const doDraw = true;              //weather to draw the object on the terminal
const drawingScale = 5            //to scale the drawing (used to prevent the object from going to the next line of the terminal)
const reportE = true;             //weather to report the E value of the object in the terminal
const reportX = true;             //weatehr to report the X value of the object in the terminal
const reportV = true;             //weatehr to report the V value of the object in the terminal
const recordHistory = true;       //weather to make files
const startingVelocity = 10;      //starting velocity (negative is downwards)
const historySeparator = "\n";    //character to separate values whilst saving the history

const creatUpperWall = false
const upperWallPosition = 40

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



setInterval(function(){
    [position, velocity] = step(position, velocity, surfaceEnergyReturn, gravity, stepTime)
    if(reportE) E = (position*mass*gravity)+(mass*velocity*velocity*(1/2));
    if(recordHistory){
        Ehistory[x] = E;
        Vhistory[x] = velocity;
        xhistory[x] = position;
    }
    x += 1;
    

    if(x == totalStepGoal && useElimit == false){
        end(xhistory);
    }
    if(Math.round(E) <= lowerElimit && useElimit == true){
        end(xhistory);
    }

    console.clear();
    if(!useElimit) console.log(generateBar(x, totalStepGoal, 60)+x+"/"+totalStepGoal);
    if(doDraw) console.log(draw(position, velocity, drawingScale));
    if(reportX) console.log(`x = ${position}`)
    if(reportV) console.log(`V = ${velocity}`);
    if(reportE) console.log(`E = ${E}`);

},speedRegulation)//step time


fs.writeFileSync('x.txt', "");
fs.writeFileSync('E.txt', "");
fs.writeFileSync("V.txt", "");

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


function step(x, V, fr, g, t){
        V = V - (g * t);
        if((x + (V * t)) < 0){
            V = -V * fr;
            bounce += 1;
        }
        if((x + (V * t)) > upperWallPosition && creatUpperWall){
            V = -V * fr;
            bounce += 1;
        }
        x = x + (V * t);

        return [x, V];
}

function draw(position, V, scale){
    var emptySpaces = Math.round((position*scale)-1);
    var plot = "";
    if(V < 0){
        for(var i=0; i<emptySpaces; i+=1){
            if(i+1 >= (position + V/scale)*scale) plot += "<";
            else plot += " ";
        }
        plot += "X"
    }else if(V > 0){
        for(var i=0; i<emptySpaces; i+=1){
            plot += " ";
        }
        plot += "X"
        for(i; i-V<emptySpaces; i+=1){
            plot += ">";
        }
    }
    return plot
}



function end(xhistory){
    const endTime = Date.now();
    if(recordHistory){
        fs.writeFileSync("V.txt", Vhistory.join(historySeparator));
        fs.writeFileSync("x.txt", xhistory.join(historySeparator));
        fs.writeFileSync("E.txt", Ehistory.join(historySeparator));
    }
    var totalTime = (Math.round((endTime - startTime)/100))/10;
    console.log(`Simulation compelited`);
    console.log(`made ${x} steps in ${totalTime} seconds.`);
    console.log(`each step was ${stepTime} seconds, the simulation was running at ${((x*stepTime)/totalTime)*100}% of irl speed`)
    console.log(`average performance of ${(Math.round(x/totalTime*10))/10} steps/second`);
    console.log(`recorded ${bounce} bounces.`);
    if(recordHistory){
        console.log("data exported to txt files");
    }else{
        console.log("no data was recorded, to enable: recordHistory = true")
    }
        process.exit();
}
