var currentTab;
var productDetails = {};

// Create data store
var tabDataStore = {};

var originUrls = ["http://www.amazon.in",
  "https://www.amazon.in",
  "http://www.flipkart.com",
  "https://www.flipkart.com"
];

$('#productForm').submit(function (ev) {
  ev.preventDefault(); // to stop the form from submitting
  /* Validations go here */
  let flag = true;

  $("#validationText").empty();
  $("#resultDiv").empty();
  var pn = $('#productName').val();
  if (!$.trim(pn)) {
    $("#validationText").append("<span class='errorText'>Product Name is required!</span>");
    flag = false;
  }
  var pn = $('#productPrice').val();
  if (!$.trim(pn)) {
    $("#validationText").append("<span class='errorText'>Product Price is required!</span>");
    flag = false;
  }
  if (flag === false) {
    return false;
  }
  else {
    callAPI();
  }
});
callAPI = () => {

  var root = 'http://saileshwedseshwari.in/php/sendmail.php';

  $.ajax({
    url: root, success: function (data) {
      $("#resultDiv").append("<span class='errorText'>results = " + data + "</span>");
      onCallSucess();
    }
  });
}

// Save something against that tab's data
function saveData(tab, data) {
  tabDataStore['tab_' + tab.id].urls.push(tab.url);
}
// Load something from tab's data
function getData(tab) {
  tabDataStore['tab_' + tab.id].urls[0];
}

chrome.runtime.onMessage.addListener(function (request, sender) {
  if (request.action == "getSource") {
    afterGettingSource(request.source, sender.tab);
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

    data = data.replace(/<script[^>]+?\/>|<script(.|\s)*?\/script>/gi, '').trim();
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
    disableExtension(tab.id);
  }
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

function setPopupValues(productDetails, tabId) {
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
  getProductDetailsById(productDetails, afterGettingMobileById, afterNoRecordsFound);
}

function afterNoRecordsFound(result) {
  console.log("GET ERROR : ADD NEW MOBILE");
}

function afterGettingMobileById(result) {
  if (result) {
    if (productDetails.siteName === "Amazon") {

      $("#resultDiv").append("<span class='errorText'> productDetails.id = " + result.amazonMobileId + "</span>");
      $("#resultDiv").append("<span class='errorText'> productDetails.name = " + result.amazonMobileName + "</span>");
      $("#resultDiv").append("<span class='errorText'> productDetails.price = " + result.amazonMobilePrice + "</span>");
    }
    else if (productDetails.siteName === "Flipkart") {
      $("#resultDiv").append("<span class='errorText'> productDetails.id = " + result.flipkartMobileId + "</span>");
      $("#resultDiv").append("<span class='errorText'> productDetails.name = " + result.flipkartMobileName + "</span>");
      $("#resultDiv").append("<span class='errorText'> productDetails.price = " + result.flipkartMobilePrice + "</span>");
    }


    // Update Values if there are any

    if (productDetails.siteName === "Amazon") {
      if (result.amazonMobileId === productDetails.id) {
        let data = {};
        data.siteName = "Amazon";
        data.id = productDetails.id;
        let callApi = false;
        if (productDetails.price && result.amazonMobilePrice != productDetails.price) {
          data.price = productDetails.price;
          callApi = true;
        }
        if (productDetails.name && result.amazonMobileName != productDetails.name) {
          data.name = productDetails.name;
          callApi = true;
        }
        if (productDetails.rating && result.amazonMobileRating != productDetails.rating) {
          data.rating = productDetails.rating;
          callApi = true;
        }
        if (productDetails.reviewCount && result.amazonMobileReviewCount != productDetails.reviewCount) {
          data.reviewCount = productDetails.reviewCount;
          callApi = true;
        }
        if (productDetails.url && result.amazonMobileUrl != productDetails.url) {
          data.url = productDetails.url;
          callApi = true;
        }
        if (productDetails.reviewUrl && result.amazonMobileReviewUrl != productDetails.reviewUrl) {
          data.reviewUrl = productDetails.reviewUrl;
          callApi = true;
        }
        if (productDetails.imageUrl && result.amazonMobileImageUrl != productDetails.imageUrl) {
          data.imageUrl = productDetails.imageUrl;
          callApi = true;
        }
        if (callApi == true && productDetails.isMobile) {
          updateProductInfo(data);
        }
        else if (!productDetails.isMobile) {
          console.log("This is not Mobile");
        }
        else {
          console.log("No Updates");
        }
      }
    }
    else if (productDetails.siteName === "Flipkart") {
      if (result.flipkartMobileId === productDetails.id) {
        let data = {};
        data.siteName = "Flipkart";
        data.id = productDetails.id;
        let callApi = false;
        if (productDetails.price && result.flipkartMobilePrice != productDetails.price) {
          data.price = productDetails.price;
          callApi = true;
        }
        if (productDetails.name && result.flipkartMobileName != productDetails.name) {
          data.name = productDetails.name;
          callApi = true;
        }
        if (productDetails.rating && result.flipkartMobileRating != productDetails.rating) {
          data.rating = productDetails.rating;
          callApi = true;
        }
        if (productDetails.reviewCount && result.flipkartMobileReviewCount != productDetails.reviewCount) {
          data.reviewCount = productDetails.reviewCount;
          callApi = true;
        }
        if (productDetails.url && result.flipkartMobileUrl != productDetails.url) {
          data.url = productDetails.url;
          callApi = true;
        }
        if (productDetails.reviewUrl && result.flipkartMobileReviewUrl != productDetails.reviewUrl) {
          data.reviewUrl = productDetails.reviewUrl;
          callApi = true;
        }
        if (productDetails.imageUrl && result.flipkartMobileImageUrl != productDetails.imageUrl) {
          data.imageUrl = productDetails.imageUrl;
          callApi = true;
        }
        if (callApi == true && productDetails.isMobile) {
          updateProductInfo(data);
        }
        else if (!productDetails.isMobile) {
          console.log("This is not Mobile");
        }
        else {
          console.log("No Updates");
        }
      }
    }
  }
}

onCallSucess = () => {
  // var searchUrl = 'http://www.amazon.in/Imagine-Swhxmirn3-Rubberised-Matte-Xiaomi/dp/B01BPA7RSQ';
  // $.ajax({
  //   url: searchUrl, success: function (data) {


  // data = data.split("<body")[1].split(">").slice(1).join(">").split("</body>")[0];
  // data = data.replace(/<script[^>]+?\/>|<script(.|\s)*?\/script>/gi, '').trim();
  // console.log("DATA =>  ", data);
  // console.log("DATA =>  ", $.parseHTML(data));
  // data = $.parseHTML(data);

  // let productName = $(data).find("#productTitle").text().trim();
  // let salePrice = $(data).find("#priceblock_saleprice").text().trim();
  // $("#resultDiv").append("<span class='errorText'>results = " + productName + "</span>");
  // $("#resultDiv").append("<span class='errorText'>results = " + salePrice + "</span>");

  //     data = $(data).contents().each(function () {
  //       if (this.nodeType === Node.COMMENT_NODE || this.nodeName === "LINK" || this.nodeName === "#comment" || this.nodeName === "META") {
  //         $(this).remove();
  //       }
  //     });

  //   }
  // });
}
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

function getParameterByName(name, url) {
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function getSourceHtml() {
  var message = document.querySelector('#resultDiv');

  chrome.tabs.executeScript(null, {
    file: "getPagesSource.js"
  }, function () {
    // If you try and inject into an extensions page or the webstore/NTP you'll get an error
    if (chrome.runtime.lastError) {
      // message.innerText = 'There was an error injecting script : \n' + chrome.runtime.lastError.message;
    }
  });
}

function onWindowLoad() {

  var message = document.querySelector('#resultDiv');

  chrome.tabs.executeScript(null, {
    file: "getPagesSource.js"
  }, function () {
    // If you try and inject into an extensions page or the webstore/NTP you'll get an error
    if (chrome.runtime.lastError) {
      // message.innerText = 'There was an error injecting script : \n' + chrome.runtime.lastError.message;
    }
  });

}

window.onload = onWindowLoad;

