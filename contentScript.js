function getBodyTagString(document_root) {
    if (document_root && document_root.body) {
        return document_root.body.innerHTML;
    }
}

chrome.extension.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.action == 'SendBodyTagString') {
        if (getBodyTagString(document) === undefined) {
            console.log("SendBodyTagString sourceString --------->>   IS UNDEFINED");
        }
        else {
            chrome.runtime.sendMessage({ sourceString: getBodyTagString(document) });
        }
        sendResponse({ sourceString: getBodyTagString(document) });
    }
});

// function onWindowLoad() {
//     if (getBodyTagString(document) === undefined) {
//         console.log("On Load Senidng sourceString --------->>   IS UNDEFINED");
//     }
//     else {
//         chrome.runtime.sendMessage({ sourceString: getBodyTagString(document) });
//     }

// }
// window.onload = onWindowLoad;