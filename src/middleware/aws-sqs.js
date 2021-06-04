const AWS = require("aws-sdk");

const sqs = new AWS.SQS({apiVersion: '2012-11-05'})

// const URL = "https://sqs.eu-west-1.amazonaws.com/691785253933/crawler.fifo"

const createNewQueue = async function(){
    try{
        let time = new Date().getTime();
        let name = `${time}`
        let newSQS = await sqs.createQueue({
            QueueName: `${name}.fifo`,
            Attributes: {
                FifoQueue : "true",
                ContentBasedDeduplication: "true",
                ReceiveMessageWaitTimeSeconds: "20"
            },
        }).promise();
        return newSQS.QueueUrl
    }catch(err){
        console.log(err)
    }
}


const createMessageToQueue = async function(links, URL, id, queueName, depth){
    try{
        console.log(links);
        await sqs.sendMessage({
            QueueUrl: URL,
            MessageAttributes:{
                "queueName":{
                    DataType: "String",
                    StringValue: queueName
                },
                "id":{
                    DataType: "String",
                    StringValue:id
                },
                "depth":{
                    DataType: "String",
                    StringValue: depth + ""
                }
            },
            MessageBody: links,
            MessageGroupId: "MyGroup",
        }).promise();
        console.log("----")
    }catch(err){
        console.log(err, "            message")
    }
}

const getMessageFromQueue = async function(maxNumber, URL){
    try{
        let {Messages} = await sqs.receiveMessage({
            QueueUrl: URL,
            MessageAttributeNames: [
                "All"
            ],
            MaxNumberOfMessages: maxNumber
        }).promise();
        return Messages;
    }catch(err){
        console.log(err, "failed to receive")
    }
}


const deleteMessageFromQueue = async function(ReceiptHandle, URL){
    try{
        console.log("DELETING")
        await sqs.deleteMessage({
            QueueUrl: URL,
            ReceiptHandle: ReceiptHandle
        }).promise();
    }catch(err){
        console.log(err)
        console.log("failed to delete message")
    }
}

const deleteQueue = async function(URL){
    try{
        console.log("Deleting queue")
        await sqs.deleteQueue({
            QueueUrl: URL
        }).promise();
    }catch(err){
        console.log(err)
        console.log("Failed to delete the queue");
    }
}

module.exports = {createMessageToQueue, getMessageFromQueue, deleteMessageFromQueue, createNewQueue, deleteQueue}