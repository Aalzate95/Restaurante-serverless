const AWS = require("aws-sdk");

const dynamo = new AWS.DynamoDB.DocumentClient();

var CUSTOMEPOCH = 1300000000000; // artificial epoch
function generateRowId(shardId /* range 0-64 for shard/slot */) {
  var ts = new Date().getTime() - CUSTOMEPOCH; // limit to recent
  var randid = Math.floor(Math.random() * 512);
  ts = (ts * 64);   // bit-shift << 6
  ts = ts + shardId;
  return (ts * 512) + randid;
}


exports.handler = async (event, context) => {
    
    let body;
    let statusCode=200
    
    try {
        switch (event.routeKey) {
            case "GET /Reservas":
                body = await dynamo.scan({ TableName: "reservas" }).promise();
                break;
            case "PUT /Reservas":
                let requestJSON = JSON.parse(event.body);
                let newPrimaryHashKey = requestJSON.nombre + generateRowId(4);
                await dynamo
                  .put({
                    TableName: "reservas",
                    Item: {
                      id: newPrimaryHashKey,
                      mesa: requestJSON.mesa,
                      nombre: requestJSON.nombre,
                      cedula: requestJSON.cedula,
                      numeroPersonas: requestJSON.numeroPersonas,
                      fecha: requestJSON.fecha,
                      hora: requestJSON.hora
                    }
                  })
                  .promise();
                body = `Put item ${newPrimaryHashKey}`;
                break;
            default:
                throw new Error(`Unsupported route: "${event.routeKey}"`);
        }
            
    }catch(err){
            
        statusCode = 400;
        body = err.message;
        
    }finally {
        
        body = JSON.stringify(body);
    
    }
        
    
    const response = {
        statusCode: statusCode,
        body: body,
    };
    return response;
};