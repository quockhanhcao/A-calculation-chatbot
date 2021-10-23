require('dotenv').config();


let handleGetStartedButton = () => {
    let response = {    
        // "text": 'Chào mừng bạn đến với chatbot tính số đo công thức áo dài của Khánh. Hãy chọn phím "Nhập số đo" trong form để bắt đầu nhập số đo',  
        "attachment":{
            "type":"template",
            "payload":{
            "template_type":"generic",
            "elements":[
                {
                "title":"Bắt đầu tính toán số đo",
                "image_url":"https://petersfancybrownhats.com/company_image.png",
                "subtitle":"",
                "default_action": {
                    "type": "web_url",
                    "url": "https://www.facebook.com",
                    "webview_height_ratio": "tall",
                },
                "buttons":[
                    {
                    "type":"web_url",
                    "url":`${process.env.URL_WEB_VIEW_SURVEY}`,
                    "title":"Nhập số đo",
                    "webview_height_ratio": "tall",
                    "messenger_extensions": true //false: open the webview in another tab
                    },            
                ]      
                }
            ]
            }
        }
      };
    return response;
}

module.exports = {
    handleGetStartedButton: handleGetStartedButton
};