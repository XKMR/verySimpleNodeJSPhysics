const fs = require('fs');
const axios = require('axios');



const startingPosition = [10, 10]
const startingVelocity = [50, 50]
const constantAcceleration = [0, 0]

const wall = [100, 50]
const gravity = 0;
const surfaceEnergyReturn = 1

const drawPointA = true;
const pointA = [5, 5]
const pointAStartingV = [5, 4];
const pointAgMultiplier = 1;
const fixA = false;
const mA_to_mX = 1

const doDraw = false;
const reportX = false
const reportV = false
const reportSteps = false;
const recordHistory = true;
const reportToWeb = true;
const useTotalGoal = false;
const totalStepGoal = 800;    
const drawCompatibleForWeb = true

const mainPointCharacter = "X "
const spaceCharacter = ".."
const Acharacter = "A "
const additionalWallCharacter = "M "

const webMainPointCharacter = "█‏‏‎ ‎"
const webAcharacter = "A‏‏‎ ‎"
const webAdditionalWallCharacter = "X‏‏‎ ‎"

const speedRegulation = 2;
const stepTime = 0.03;
const historySeparator = "\n"
const startTime = Date.now();    

const drawAditionalWall = false
const startPoint = { x: 3, y: 3 };
const endPoint = { x: 20, y: 20 };



var vA = pointAStartingV;
var xA = pointA;
var aA = [0, 0];
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

    // X

    V[0] = V[0] + (a[0] * t); //calculate new Vx
    V[1] = V[1] + (a[1] * t); //calculate new Vy

    if((x[0] + (V[0] * t)) < 0){  // the 0 wall X
        V[0] = -(V[0] * fr);
        bounce += 1;
    }
    if((x[0] + (V[0] * t)) >= wall[0]){ // the default wall X
        V[0] = -(V[0] * fr);
        bounce += 1;
    }

    if(drawAditionalWall){
    for(var i=0; i < crossedSquares.length; i+=1){
         if((((x[0] <= crossedSquares[i].x) && (crossedSquares[i].x <= (x[0] + (V[0] * t)))) || ((x[0] >= crossedSquares[i].x) && (crossedSquares[i].x >= (x[0] + (V[0] * t))))) && (((x[1] <= crossedSquares[i].y) && (crossedSquares[i].y <= (x[1] + (V[1] * t)))) || ((x[1] >= crossedSquares[i].y) && (crossedSquares[i].y >= (x[1] + (V[1] * t)))))){
            console.log("BOUNCE WITH NEW WALL")
         }       
    }}



    // Y
    
    if((x[1] + (V[1] * t)) < 0){ // the 0 wall Y
        V[1] = -V[1] * fr;
        bounce += 1;
    }
    if((x[1] + (V[1] * t)) >= wall[1]){ // the default wall Y
        V[1] = -(V[1] * fr);
        bounce += 1;
    }

    


    x[0] = x[0] + (V[0] * t); //step X
    x[1] = x[1] + (V[1] * t); //step Y

    return [x, V];
}

//line drawing for additional wall
if(drawAditionalWall){

    function getCrossedSquares(start, end) {
        const crossedSquares = [];
    
        const dx = Math.abs(end.x - start.x);
        const dy = Math.abs(end.y - start.y);
        const sx = start.x < end.x ? 1 : -1;
        const sy = start.y < end.y ? 1 : -1;
    
        let x = start.x;
        let y = start.y;
        let err = dx - dy;
    
        while (true) {
            crossedSquares.push({ x, y });
    
            if (x === end.x && y === end.y) {
                break;
            }
    
            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x += sx;
            }
            if (e2 < dx) {
                err += dx;
                y += sy;
            }
        }
    
        return crossedSquares;
    }
    var crossedSquares = getCrossedSquares(startPoint, endPoint);
}

function draw(position){
    crossedSquares
    var plot = "";
    var drawnWall = false;
    for(var y=0; y <= wall[1]; y+=1){
        for(var x=0; x <= wall[0]; x+=1){
            if(Math.round(position[0]) == x && Math.round(position[1]) == y){
                if(drawCompatibleForWeb)plot += webMainPointCharacter
                else plot += mainPointCharacter;
            }else if(Math.round(xA[0]) == x && Math.round(xA[1]) == y && drawPointA){
                if(drawCompatibleForWeb)plot += webAcharacter;
                else plot += Acharacter;
            }else{
                if(drawAditionalWall){
                for(var i=0; i < crossedSquares.length; i+=1){
                    if(crossedSquares[i].x == x && crossedSquares[i].y == y){
                        if(drawCompatibleForWeb)plot += webAdditionalWallCharacter
                        else{plot += additionalWallCharacter};
                        drawnWall = true;
                    }
                }
            }
                if(!drawnWall) plot += spaceCharacter;
                drawnWall = false

            }
        }
        plot += "\n";
    }
    return plot;
}


var outPlot = ""
setInterval(function(){
    [position, velocity] = step(position, velocity, fr, acceleration, t);
    outPlot = draw(position);
    if(doDraw)  console.log(outPlot)
    if(reportX) console.log(`position = ${position}`)
    if(reportV) console.log(`V = ${velocity}`);
    if(reportSteps) console.log(`step = ${x}`);

    if(recordHistory){
        Vhistory[x] = JSON.stringify(velocity);
        xhistory[x] = JSON.stringify(position);
    }


    if(reportToWeb){
        axios.post('http://localhost:3000/update-content', { data: outPlot })
        .then(response => {
         })
            .catch(error => {
                console.log(`error: ${error}`)
        });

    }


    //distance to point A
    
    if(drawPointA){
        var distanceToPointA = [(xA[0]-position[0])*pointAgMultiplier, (xA[1]-position[1])*pointAgMultiplier];
        acceleration[0] = distanceToPointA[0]*mA_to_mX;     
        acceleration[1] = distanceToPointA[1]*mA_to_mX;                                                                 //used for orbiting, fun stuff!                                                                  //used for orbiting, fun stuff!      
                                                                //used for orbiting, fun stuff!      
        if(!fixA){
            aA[0] = -distanceToPointA[0] * (1/mA_to_mX);
            aA[1] = -distanceToPointA[1] * (1/mA_to_mX);
            [xA, vA] = step(xA, vA, fr, aA, t);

        }else{
            aA = [0, 0];
            vA = [0, 0];
            xA = pointA;
        }
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
