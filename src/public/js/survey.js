
(function (d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) { return; }
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/messenger.Extensions.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'Messenger'));

window.extAsyncInit = function () {
    // the Messenger Extensions JS SDK is done loading 

    //get user PSID
    MessengerExtensions.getContext(facebookAppId,
        function success(thread_context) {
            let userPSID = thread_context.psid;
            document.getElementById("psid").value = userPSID;
        },
        function error(err) {
            // error
        }
    );


    $('#submitBtn').on('click', function () {
        let dataBody = {
            psid: document.getElementById("psid").value,
            daiAo: document.getElementById("daiAo").value,
            haNguc: document.getElementById("haNguc").value,
            vongCo: document.getElementById("vongCo").value,
            vongNguc: document.getElementById("vongNguc").value,
            giangNguc: document.getElementById("giangNguc").value,
            vongEo:  document.getElementById("vongEo").value,
            haEo: document.getElementById("haEo").value,
            daiTay: document.getElementById("daiTay").value,
            bapTren: document.getElementById("bapTren").value,
            bapDuoi: document.getElementById("bapDuoi").value,
            cuaTay: document.getElementById("cuaTay").value,
            xuoiVai: document.getElementById("xuoiVai").value,
            rongVai: document.getElementById("rongVai").value,
            chanNguc: document.getElementById("chanNguc").value,
            vongMong: document.getElementById("vongMong").value,
            vongOng: document.getElementById("vongOng").value,
            daiQuan: document.getElementById("daiQuan").value,
            capQuan: document.getElementById("capQuan").value,
            tayAo: document.getElementById("tayAo").value,
            material: document.getElementById("material").value,
            boob: document.getElementById("boob").value
        }

        //send a request to node.js server
        $.ajax({
            method: 'POST',
            data: dataBody,
            url: `${window.location.origin}/post-survey`,
            success: function (data) {
                //on Close webview
                MessengerExtensions.requestCloseBrowser(function success() {
                    // webview closed

                }, function error(err) {
                    alert('err submit post webview')
                    console.log('err submit post webview', err)
                    // an error occurred
                });


            },
            error: function (error) {
                console.log('error response from node js server :', error)
            }
        })

    })

};


