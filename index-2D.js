const fs = require('fs');

const startingPosition = [2, 2]
const startingVelocity = [2, 3]
const constantAcceleration = [0, 0]
const wall = [100, 10]
const gravity = 9.8;
const useTotalGoal = true;
const totalStepGoal = 800;     
const surfaceEnergyReturn = 0.8
const drawPointA = false;
const pointA = [5, 5]
const pointAgMultiplier = 1;
const doDraw = true;
const reportX = true
const reportV = true
const reportSteps = true;
const recordHistory = true;
const speedRegulation = 2;
const stepTime = 0.03;
const historySeparator = "\n"
const startTime = Date.now();    

var bounce = 0;
var t = stepTime
var fr = surfaceEnergyReturn
var acceleration = [0+constantAcceleration[0], 0+gravity+constantAcceleration[1]];
var position = startingPosition;
var velocity = startingVelocity;
var Vhistory = [];
var xhistory = []; 
var x = 0;

fs.writeFileSync('x2D.txt', "");
fs.writeFileSync("V2D.txt", "");


function step(x, V, fr, a, t){

    //distance to point A
    
    if(drawPointA){
        var distanceToPointA = [(pointA[0]-position[0])*pointAgMultiplier, (pointA[1]-position[1])*pointAgMultiplier];
        a = distanceToPointA;                                                                 //used for orbiting, fun stuff!                                                                  //used for orbiting, fun stuff!      

    }

    V[0] = V[0] + (a[0] * t); //calculate new Vx
    V[1] = V[1] + (a[1] * t); //calculate new Vy

    if((x[0] + (V[0] * t)) < 0){
        V[0] = -(V[0] * fr);
        bounce += 1;
    }
    if((x[0] + (V[0] * t)) >= wall[0]){
        V[0] = -(V[0] * fr);
        bounce += 1;
    }

    // Y
    
    if((x[1] + (V[1] * t)) < 0){
        V[1] = -V[1] * fr;
        bounce += 1;
    }
    if((x[1] + (V[1] * t)) >= wall[1]){
        V[1] = -(V[1] * fr);
        bounce += 1;
    }


    x[0] = x[0] + (V[0] * t); //step X
    x[1] = x[1] + (V[1] * t); //step Y

    return [x, V];
}



function draw(position){
    var plot = "";
    for(var y=0; y <= wall[1]; y+=1){
        for(var x=0; x <= wall[0]; x+=1){
            if(Math.round(position[0]) == x && Math.round(position[1]) == y){
                plot += "X";
            }else if(Math.round(pointA[0]) == x && Math.round(pointA[1]) == y && drawPointA){
                plot += "A"
            }else{
                plot += "=";
            }
        }
        plot += "\n";
    }
    return plot;
}

setInterval(function(){
    [position, velocity] = step(position, velocity, fr, acceleration, t);
    if(doDraw)  console.log(draw(position))
    if(reportX) console.log(`position = ${position}`)
    if(reportV) console.log(`V = ${velocity}`);
    if(reportSteps) console.log(`step = ${x}`);

    if(recordHistory){
        Vhistory[x] = JSON.stringify(velocity);
        xhistory[x] = JSON.stringify(position);
    }
    x += 1;
    if(x == totalStepGoal && useTotalGoal == true){
        end();
    }

},speedRegulation)

function end(){
    const endTime = Date.now();
    if(recordHistory == true){
        fs.writeFileSync("V2D.txt", Vhistory.join(historySeparator));
        fs.writeFileSync("x2D.txt", xhistory.join(historySeparator));
    }
    var totalTime = (Math.round((endTime - startTime)/100))/10;
    console.log(`Simulation compelited`);
    console.log(`made ${x} steps in ${totalTime} seconds.`);
    console.log(`each step was ${stepTime} seconds, the simulation was running at ${((x*stepTime)/totalTime/speedRegulation)*100}% of irl speed`)
    console.log(`average performance of ${(Math.round(x/totalTime*10))/10} steps/second`);
    console.log(`recorded ${bounce} bounces.`);
    if(recordHistory){
        console.log("data exported to txt files");
    }else{
        console.log("no data was recorded, to enable: recordHistory = true")
    }
        process.exit();
}
