//////////// **************** POPUP JS


/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function (tabs) {
    var tab = tabs[0];
    var url = tab.url;
    callback(url);
  });
}
function getCurrentTab(callback) {
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function (tabs) {
    var tab = tabs[0];

    callback(tab);
  });
}

document.addEventListener('DOMContentLoaded', function () {
});


// function getSourceHtml() {
//   var message = document.querySelector('#resultDiv');

//   chrome.tabs.executeScript(null, {
//     file: "getPagesSource.js"
//   }, function () {
//     // If you try and inject into an extensions page or the webstore/NTP you'll get an error
//     if (chrome.runtime.lastError) {
//       // message.innerText = 'There was an error injecting script : \n' + chrome.runtime.lastError.message;
//     }
//   });
// }

 // chrome.extension.sendMessage({ greeting: "GeProductDetailsFromBackground" },
  //   function (response) {
  //     productDetails = response.productDetails;
  //     console.log("PRODUCT DETAILS => ", productDetails);
  //     $("#resultDiv").text(JSON.stringify(productDetails));
  //   });

  // ...query for the active tab...
  // chrome.tabs.executeScript(null, {
  //   file: "getProductDetailsFromSource.js"
  // }, function () {
  //   // If you try and inject into an extensions page or the webstore/NTP you'll get an error
  //   if (chrome.runtime.lastError) {
  //     // message.innerText = 'There was an error injecting script : \n' + chrome.runtime.lastError.message;
  //   }
  // });

function getParameterByName(name, url) {
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}



chrome.runtime.onMessage.addListener(function (request, sender) {
  if (request.action == "setProductDetails") {
    console.log("GOT THE PRODUCT DETAILS");
    afterGettingSource(request.productDetails, sender.tab);
  }
});

function afterGettingSource(data, tab) {
  $("#formDiv").hide();
  $("#noProductErrorWindow").hide();

  let isShoppingSite = false;
  let originUrl = tab.url.match(/^[\w-]+:\/{2,}\[?[\w\.:-]+\]?(?::[0-9]*)?/)[0];
  originUrls.forEach((value) => {
    if (value.startsWith(originUrl)) {
      isShoppingSite = true;
    }
  });
  if (isShoppingSite) {
    productDetails.domain = originUrl;
    productDetails.url = tab.url;

    // data = data.replace(/<script[^>]+?\/>|<script(.|\s)*?\/script>/gi, '').trim();
    data = $.parseHTML(data);
    if (originUrl.indexOf("amazon") !== -1) {
      productDetails.siteName = "Amazon";
      amazonSource(data, tab.id, setPopupValues, showErrorMessageView);
    }
    else if (originUrl.indexOf("flipkart") !== -1) {
      productDetails.siteName = "Flipkart";
      flipkartSource(data, tab.id, setPopupValues, showErrorMessageView);
      console.log("FLIPKART SITE");
    }
  } else {
    // disableExtension(tab.id);
  }
}



// **************       **************** BACKGROUNG JS ;




// productDetailsSelector.isMobile = isMobile;
// productDetailsSelector.url = productDetails.domain + "/gp/product/" + productDetails.id;

// chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
//     if (request.greeting === "GeProductDetailsFromBackground") {
//         chrome.tabs.query({ active: true }, function (tabs) {
//             if (tabs.length === 0) {
//                 sendResponse({});
//                 return;
//             }
//             sendResponse({ productDetails: productDetails });
//         });
//     }
// });


    // if (originUrl.indexOf("amazon") !== -1) {
    //     productDetails.siteName = "Amazon";
    //     amazonSource(data, tab.id, setAmazonValues, disableExtension);
    // }
    // else if (originUrl.indexOf("flipkart") !== -1) {
    //     productDetails.siteName = "Flipkart";
    //     flipkartSource(data, tab.id, setFlipkartValues, disableExtension);
    //     console.log("FLIPKART SITE");
    // }


    

function getParameterByName(name, url) {
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

// chrome.tabs.onActivated.addListener(function (activeInfo) {
//     chrome.tabs.get(activeInfo.tabId, function (tab) {
//         console.log("chrome.tabs.onActivated    ---- SendBodyTagString   ---  Page Status : ", tab.status);
//         getBodyTagSourceString(tab);
//     });
// });

// chrome.runtime.onMessage.addListener(function(response, sender, sendResponse) {
//     console.log("ON LOAD  Message", sender.tab);
//     if (response && response.sourceString) {
//             afterGettingSource(response.sourceString, sender.tab);
//         }
//         else {
//             console.log("SendBodyTagString returned UNDEFINED");
//             disableExtension(sender.tab.id)
//         }
// });