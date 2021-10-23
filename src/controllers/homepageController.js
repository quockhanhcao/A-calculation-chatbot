require("dotenv").config();
import request from "request";
import homepageService from "../services/homepageService";


const MY_VERIFY_TOKEN = process.env.MY_VERIFY_TOKEN;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

let getHomepage = (req, res) => {
    return res.render("homepage.ejs");
};

let getWebhook = (req, res) => {

    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = MY_VERIFY_TOKEN;

    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {

        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {

            // Responds with the challenge token from the request
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);

        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
};

let postWebhook = (req, res) => {
    // Parse the request body from the POST
    let body = req.body;

    // Check the webhook event is from a Page subscription
    if (body.object === 'page') {

        // Iterate over each entry - there may be multiple if batched
        body.entry.forEach(function(entry) {

            // Gets the body of the webhook event
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);


            // Get the sender PSID
            let sender_psid = webhook_event.sender.id;
            console.log('Sender PSID: ' + sender_psid);

            // Check if the event is a message or postback and
            // pass the event to the appropriate handler function
            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);
            } else if (webhook_event.postback) {
                handlePostback(sender_psid, webhook_event.postback);
            }

        });

        // Return a '200 OK' response to all events
        res.status(200).send('EVENT_RECEIVED');

    } else {
        // Return a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }

};

// Handles messages events
let handleMessage = (sender_psid, received_message) => {
    let response;

    // Checks if the message contains text
    if (received_message.text === 'INFO' || received_message.text === 'info' || received_message.text === 'Info' ) {
        // Create the payload for a basic text message, which
        // will be added to the body of our request to the Send API
        response = {
            "text": "Đây là chatbot tính số đo công thức áo dài của Khánh. Hãy chọn 'Bắt đầu tính lại' hoặc nhập MENU trong Menu  để bắt đầu nhập số đo"
        }
    } 
    else if (received_message.text === 'MENU' || received_message.text === 'menu' || received_message.text === 'Menu') {
        response = homepageService.handleGetStartedButton();
    }
    else {
        response = {
            "text": "Đây chỉ là 1 chat bot đơn giản giúp tính toán số đo cho thiết kế Áo Dài. Vui lòng nhập MENU để bắt đầu tính toán số đo"
        }
    }

    // else if (received_message.attachments) {
    //     // Get the URL of the message attachment
    //     let attachment_url = received_message.attachments[0].payload.url;
    //     response = {
    //         "attachment": {
    //             "type": "template",
    //             "payload": {
    //                 "template_type": "generic",
    //                 "elements": [{
    //                     "title": "Is this the right picture?",
    //                     "subtitle": "Tap a button to answer.",
    //                     "image_url": attachment_url,
    //                     "buttons": [
    //                         {
    //                             "type": "postback",
    //                             "title": "Yes!",
    //                             "payload": "yes",
    //                         },
    //                         {
    //                             "type": "postback",
    //                             "title": "No!",
    //                             "payload": "no",
    //                         }
    //                     ],
    //                 }]
    //             }
    //         }
    //     }
    // }

    // Send the response message
    callSendAPI(sender_psid, response);
};

// Handles messaging_postbacks events
let handlePostback = (sender_psid, received_postback) => {
    let response;
    let text = {
        "text": 'Chào mừng bạn đến với chatbot cho thiết kế Áo Dài của Khánh'
    }
    // Get the payload for the postback
    let payload = received_postback.payload;

    // Set the response based on the postback payload
    if (payload === 'yes') {
        response = { "text": "Hello" }
    } else if (payload === 'no') {
        response = { "text": "Oops, try sending another text" }
    } else if (payload === 'GET_STARTED_PAYLOAD' || payload === 'RESTART_CONVERSATION') {
        response = homepageService.handleGetStartedButton();
        callSendAPI(sender_psid, text);
         
    }
    // Send the message to acknowledge the postback
    callSendAPI(sender_psid, response);
};

// Sends response messages via the Send API
let callSendAPI = (sender_psid, response) => {
    // Construct the message body
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": response
    };

    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v6.0/me/messages",
        "qs": { "access_token": PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        
        if (!err) {
            console.log('message sent!')
        } else {
            console.error("Unable to send message:" + err);
            console.log('check error send messages*******');
            console.log(res);
            console.log('check error send messages*******');
        }
    });
};

let handleSetupInfor = async (req, res) => {
    //call the facebook api

    let request_body = {
        "get_started":{
            "payload":"GET_STARTED_PAYLOAD"
          },
          "persistent_menu": [
            {
                "locale": "default",
                "composer_input_disabled": false,
                "call_to_actions": [
                    {
                        "type": "postback",
                        "title": "Bắt đầu tính lại ",
                        "payload": "RESTART_CONVERSATION"
                    },
                ]
            }
        ],
        "whitelisted_domains":[
            "https://khanh-first-chatbot.herokuapp.com", //link to your heroku app
          ]
    };
    return new Promise((resolve, reject) => {
        try {
            request({
                "uri": "https://graph.facebook.com/v11.0/me/messenger_profile",
                "qs": { "access_token": PAGE_ACCESS_TOKEN },
                "method": "POST",
                "json": request_body
            }, (err, response, body) => {

                console.log('Logs setup persistent menu & get started button: ', response);
                if (!err) {
                    return res.send('setup done!');
                } else {
                    return res.send('Somethings wrong with setup, check logs');
                    
                }
            });
        } catch (e) {
            reject(e);
        }
    })    
}

let handleGetSurveyPage = (req, res) => {
    const facebookAppId = process.env.FACEBOOK_APP_ID;
    return res.render("survey.ejs", {
        facebookAppId: facebookAppId
    });
}

let handlePostSurvey = async (req, res) => {
    let psid = req.body.psid;
    let daiAo = Number(req.body.daiAo);
    let haNguc = Number(req.body.haNguc);
    let vongCo = Number(req.body.vongCo);
    let vongNguc = Number(req.body.vongNguc);
    let giangNguc = Number(req.body.giangNguc);
    let vongEo = Number(req.body.vongEo);
    let haEo = Number(req.body.haEo);
    let daiTay = Number(req.body.daiTay);
    let bapTren = Number(req.body.bapTren);
    let bapDuoi = Number(req.body.bapDuoi);
    let cuaTay = Number(req.body.cuaTay);
    let xuoiVai = Number(req.body.xuoiVai);
    let rongVai = Number(req.body.rongVai);
    let chanNguc = Number(req.body.chanNguc);
    let vongMong = Number(req.body.vongMong);
    let vongOng = Number(req.body.vongOng);
    let daiQuan = Number(req.body.daiQuan);
    let capQuan = Number(req.body.capQuan);
    let tayAo = Number(req.body.tayAo);
    let material = Number(req.body.material);
    let boob = Number(req.body.boob);

    if (material === 2) {
        haNguc += 1;
        vongNguc += 4;
        giangNguc += 0.5;
        vongEo += 4;
        rongVai +=2;
	    haEo +=2;
	    bapTren +=2;
	    bapDuoi +=2;
	    vongMong +=4;
	    chanNguc +=4;
    } else if (material === 3) {
        haNguc +=1;
	    rongVai +=1;
	    haEo +=2;
    } else if (material === 4) {
        vongNguc +=4;
	    giangNguc +=0.5;
	    vongEo +=4;
	    rongVai +=2;
	    bapTren +=2;
	    bapDuoi +=2;
	    vongMong +=4;
	    chanNguc +=4;
    } else if (material === 5) {
        haNguc -= 1;
	    vongCo -= 2;
	    vongNguc -= 5;
	    giangNguc -= 0.5;
	    vongEo -= 5;
	    rongVai -= 3;
	    haEo -= 1;
	    bapTren -= 3;
	    bapDuoi -= 3;
	    vongMong -= 5;
	    chanNguc -= 5;
    }
    let haChanNguc = 9;
    if (boob === 2) {
        haChanNguc = (vongNguc/10) + 0.4;
    }

    daiTay += 0.5;

    // let dongDauTay = 0.9;
    let haBapTay = 15;
    let rongTay = bapTren;
    // let rongBapTayDuoi = bapDuoi;
    let rongMangTayTruoc = 0;
    let gocNachTaySau = 0;
    let xaCuaTay = 1.75;
    // let rongCo = (vongCo/8) - 1;
    let dauVai = (rongVai/2) + 0.5 - (vongCo/6);
    // let haNach = (vongNguc/4) - 0.25;

    if (tayAo === 1) {
        rongMangTayTruoc = (vongNguc/10) - 1;
        gocNachTaySau = vongNguc/19;

    } else if (tayAo === 2) {
        rongTay = bapTren - 1;
        rongMangTayTruoc = (vongNguc/10) - 3;
        gocNachTaySau = (vongNguc/20) - 0.5;

    }

    let dataSend = `
        ***** THÂN SAU *****\n
        Dài áo thân sau từ chân cổ xuống: ${daiAo - 0.5}\n
        Hạ nách thân sau: ${(vongNguc/4) - 3}\n
        Dông cổ: ${(vongCo/10) - 2.2}\n
        Rộng cổ TS: ${vongCo/6}\n
        Đầu ly: ${(vongNguc/4) - 4}\n
        Hạ eo: ${haEo}\n
        Hạ mông: ${vongMong/4}\n
        Rộng ngực TS: ${vongNguc/4}\n
        Góc nách TS: ${vongNguc/34}\n
        Trục ly: ${(vongEo/8) + 2.35}\n
        Đuôi ly: ${(vongMong/4) - 4}\n
        Rộng ly: 4\n
        Rộng bụng TS: ${(vongEo/4) + 5}\n
        Rộng mông TS: ${(vongMong/4) + 3.5}\n
        Rộng gấu: ${(vongMong/4) + 9}\n
        Xa vạt: 2.5\n\n\n
        ***** THÂN TRƯỚC *****\n
        Dài áo TT: ${daiAo - 0.5}\n
        Hạ nách TT: ${(vongNguc/4) - 6.5}\n
        Hạ mông: ${vongMong/4}\n
        Hạ đầu ly TT: ${haNguc - 1.85}\n
        Hạ eo: ${haEo - 1.8}\n
        Rộng cổ và hạ cổ: ${(vongCo/6) - 1.3}\n
        Rộng ngực TT: ${(vongNguc/4) + 0.5}\n
        Góc nách TT: ${vongNguc/20}\n
        Rộng chân ngực: ${(chanNguc/4) - 1.8}\n
        Hạ chân ngực: ${haChanNguc}\n
        Rộng bụng TT: ${vongEo/4}\n
        Rộng mông TT: ${(vongMong/4) - 2}\n
        Rộng gấu TT: ${(vongMong/4) + 3}\n
        Xa vạt: 2.8\n\n\n
        ***** TAY ÁO *****\n
        Dài tay: ${daiTay}\n
        Rộng cổ: ${(vongCo/8) - 1}\n
        Dông đầu tay: 0.9\n
        Đầu vai: ${(rongVai/2) + 0.5 - (vongCo/6)}\n
        Hạ nách: ${(vongNguc/4) - 0.25}\n
        Hạ bắp tay: 15\n
        Rộng tay: ${rongTay}\n
        Rộng bắp tay dưới: ${bapDuoi}\n
        Rộng mang tay trước: ${rongMangTayTruoc}\n
        Góc nách tay sau: ${gocNachTaySau}\n
        Cửa tay: ${cuaTay}\n
        Xa cửa tay: 1.75\n
    `
    await callSendAPI(psid, {text: dataSend});

    return res.status(200).json({
        message: 'ok'
    })
}

module.exports = {
    getHomepage: getHomepage,
    getWebhook: getWebhook,
    postWebhook: postWebhook,
    handleSetupInfor: handleSetupInfor,
    handleGetSurveyPage: handleGetSurveyPage,
    handlePostSurvey: handlePostSurvey
};
