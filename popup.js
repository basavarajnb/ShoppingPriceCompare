var currentTab;
var productDetails = {};

// Create data store
var tabDataStore = {};

var originUrls = ["http://www.amazon.in",
  "https://www.amazon.in",
  "http://www.flipkart.com",
  "https://www.flipkart.com"
];

$("#validationText").empty();
$("#resultDiv").empty();

// Save something against that tab's data
function saveData(tab, data) {
  tabDataStore['tab_' + tab.id].urls.push(tab.url);
}
// Load something from tab's data
function getData(tab) {
  tabDataStore['tab_' + tab.id].urls[0];
}

function getProductDetailsFromContentScript(tab) {
  let originUrl = tab.url.match(/^[\w-]+:\/{2,}\[?[\w\.:-]+\]?(?::[0-9]*)?/)[0];
  originUrls.forEach((value) => {
    if (value.startsWith(originUrl)) {
      isShoppingSite = true;
    }
  });
  if (isShoppingSite) {
    let selectorObj = getSelectorObject(tab.url); // From Shopping Service

    // ...and send a request for the DOM info...
    chrome.tabs.sendMessage(
      tab.id,
      { from: 'popup', subject: 'GeProductDetailsFromBackground', selectorObj: selectorObj },
      // ...also specifying a callback to be called 
      //    from the receiving end (content script) 
      function (response) {
        console.log("DATA FROM CONTENT SCRIPT =====> ", response.productDetails);
        if (response && response.productDetails && tab.status === "complete") {
          afterGettingProductDetailsFromCScript(response.productDetails, tab);
        }
        else {
          console.log("SendBodyTagString returned UNDEFINED");
          // disableExtension(tab.id)
        }
      });
  } else {
    $("#noProductErrorWindow").append("<span class='errorText'>I DONT WORK ON THIS WEBSITE</span>");
    $("#noProductErrorWindow").show();
  }
}

function afterGettingProductDetailsFromCScript(data, tab) {
  if (data.productId && data.productName && data.productFormatterPrice) {
    productDetails.siteName = data.siteName;
    productDetails.id = data.productId;
    productDetails.name = data.productName;
    productDetails.formattedPrice = data.productFormatterPrice;
    productDetails.price = Number(data.productFormatterPrice.replace(/[^0-9\.]+/g, ""));;
    productDetails.rating = data.productRating;
    productDetails.reviewCount = data.productReviewCount;
    productDetails.reviewUrl = data.productReviewUrl;
    productDetails.imageUrl = data.productImageUrl;
    productDetails.url = data.url;
    productDetails.isMobile = true;

    console.log("Product Details => ", productDetails);

    setPopupValues(productDetails);

    getProductDetailsById(productDetails, afterGettingMobileById, afterErrorOccurred);
  }
  else {
    $("#noProductErrorWindow").append("<span class='errorText'>I THINK VALUES ARE NOT RIGHT!</span>");
    $("#noProductErrorWindow").show();
  }
}

function setPopupValues(productDetails, tabId) {
  if (!productDetails.productName || !productDetails.productPrice) {
    showErrorMessageView(productDetails.productName, productDetails.productPrice, tabId);
  }
  $("#formDiv").show(300);
  $("#noProductErrorWindow").hide();

  $("#productImage").attr('src', productDetails.imageUrl);   // append("<span class='errorText'>results = " + productName + "</span>");
  $("#productName").text(productDetails.name);
  $("#productPrice").text(productDetails.formattedPrice);
  $("#productRating").text(productDetails.rating);
  $("#productReviewUrl").text(productDetails.reviewCount);

  if (productDetails.reviewUrl) {
    if (productDetails.reviewUrl.indexOf(productDetails.domain) === -1) {
      productDetails.reviewUrl = productDetails.domain + productDetails.reviewUrl;
    }
    $("#productReviewUrl").attr('href', productDetails.reviewUrl);
  }
  else {
    productDetails.reviewUrl = productDetails.url
    $("#productReviewUrl").attr('href', productDetails.url);
  }
  console.log("Product Details => ", productDetails);
}

function afterGettingMobileById(result, isUpdated) {
  if (result) {
    $("#resultDiv").append("<span class='errorText'> productDetails.id = " + result.mobileId + "</span>");
    $("#resultDiv").append("<span class='errorText'> productDetails.name = " + result.mobileName + "</span>");
    $("#resultDiv").append("<span class='errorText'> productDetails.price = " + result.mobilePrice + "</span>");
    if (isUpdated) {
      console.log("Mobile Info is updated");
    }
    else {
      console.log("Mobile Info is latest");
    }

    getPriceHistoryById(productDetails, afterGettingPriceHistory, afterGettingPriceHistoryError);
  }
}

function afterErrorOccurred(result) {
  console.error("GET ERROR : ADD NEW MOBILE");
}

function showErrorMessageView(productName, price, tabId) {
  $("#formDiv").hide(300);
  if (!productName) {
    $("#noProductErrorWindow").append("<span class='errorText'>productName is not mentioned</span>");
  }
  if (!price) {
    $("#noProductErrorWindow").append("<span class='errorText'>Price is not mentioned</span>");
  }
  $("#noProductErrorWindow").show();
}

function afterGettingPriceHistory(data) {
  if (data) {
    if ($.type(data) === "array") {
      data.forEach((item, index) => {
        $('#priceHistoryTable tr:last').after('<tr><td>' + item.productPrice + '</td><td>' + item.updatedDate + '</td></tr>');
      });
    }
  }

}
function afterGettingPriceHistoryError(data) {

}

function onWindowLoad() {

  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function (tabs) {
    getProductDetailsFromContentScript(tabs[0]);
  });
}
window.onload = onWindowLoad;

