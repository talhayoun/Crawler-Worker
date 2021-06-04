const cheerio = require("cheerio");
let { getMessageFromQueue, createMessageToQueue, deleteMessageFromQueue, deleteQueue } = require("../middleware/aws-sqs");
const redisClient = require("../db/redis");
const axios = require("axios");

const getPageTitleAndLinks = async function (URL) {
    let page = await axios.get(URL)

    if (page.status === 200) {
        const $ = cheerio.load(page.data);
        let pageTitle = $("title").text();
        const links = $("a").map((i, link) => {
            if (link.attribs.href?.startsWith("http")) {
                return link.attribs.href
            }
        }).get()

        return { pageTitle, links }
    }
    else {
        console.log("Page status is not 200")
    }
}

let insertLinksToQueue = async function (links, queueURL, id, queueName, depth) {
    for (let i = 0; i < links.length; i++) {
        await createMessageToQueue(links[i], queueURL, `${id}/${i}`, queueName, depth)
    }
}


const createNode = async function (url, id, queueName, currentDepth, queueURL) {
    let { pageTitle, links } = await getPageTitleAndLinks(url);
    await insertLinksToQueue(links, queueURL, id, queueName, parseInt(currentDepth) + 1)
    return { pageTitle, links }
}


const redisGetTree = async function (queueName) {
    let tree = await redisClient.getAsync(queueName);
    let parsed = JSON.parse(tree);
    return parsed;
}


const checkMaxDepthAndMaxPages = async function (queueName, currentDepth) {
    let tree = await redisGetTree(queueName);
    if (tree.isComplete == true) {
        return true;
    }
    return false
}

const startWorkerJob = async function (req, res, next) {
    let message = await getMessageFromQueue(10, req.body.QueueURL);

    if (message) {
        console.log(message, "msg")
        for (let i = 0; i < message.length; i++) {

            let id = message[i].MessageAttributes.id.StringValue
            let messageURL = message[i].Body;
            let currentDepth = 0;

            if (id == 0) {
                let maxDepth = message[i].MessageAttributes.maxdepth.StringValue
                let maxTotalPages = message[i].MessageAttributes.maxtotalpage.StringValue
                let queueName = `${messageURL}_${maxTotalPages}_${maxDepth}`
                let nodeData = await createNode(messageURL, id, queueName, currentDepth, req.body.QueueURL)
                let data = { pageTitle: nodeData.pageTitle, links: nodeData.links, id: id, queueName: queueName, maxDepth, maxTotalPages, messageURL, QueueURL: req.body.QueueURL };
                axios.post("http://localhost:3000/get-data", { data })
            } else {
                let queueName = message[i].MessageAttributes.queueName.StringValue;
                currentDepth = message[i].MessageAttributes.depth.StringValue;
                let isReachedDepthOrPages = await checkMaxDepthAndMaxPages(queueName, currentDepth);
                if (isReachedDepthOrPages) {
                    console.log("REACHED MAX EDPTH OR PAGES")
                    await deleteQueue(req.body.QueueURL)
                    return
                };
                let nodeData = await createNode(messageURL, id, queueName, currentDepth, req.body.QueueURL)

                let data = { pageTitle: nodeData.pageTitle, links: nodeData.links, id: id, queueName: queueName, messageURL, currentDepth, QueueURL: req.body.QueueURL };
                axios.post("http://localhost:3000/get-data", { data })
            }

            await deleteMessageFromQueue(message[i].ReceiptHandle, req.body.QueueURL);
        }
        console.log("------------------------------------------------------------------------------")
        axios.post("http://localhost:4000/", { QueueURL: req.body.QueueURL })
    }
}

module.exports = { startWorkerJob, getPageTitleAndLinks };