var serviceHostAddress = "http://pricecompare/";

var getProductDetailsByIdOnSuccess = (resultArray, productDetails, successCallback) => {
    if (resultArray) {
        if (resultArray[0] && resultArray.length === 1) {
            let result = resultArray[0];
            successCallback(result);
        }
        else if (resultArray.length === 0) {
            addNewProduct(productDetails);
        }
    }
}

function getProductDetailsById(productDetails, successCallback, errorCallback) {
    $.ajax({
        url: serviceHostAddress + "get-mobile-by-id.php",
        type: "GET",
        data: {
            id: productDetails.id,
            siteName: productDetails.siteName
        },
        dataType: "JSON",
        success: function (data) {
            console.log("DTA FROM GET : ", data);
            getProductDetailsByIdOnSuccess(data, productDetails, successCallback);
        },
        error: function (textStatus, errorThrown) {
            errorCallback("")
        }
    });
}

function updateProductInfo(data) {
    $.ajax({
        url: serviceHostAddress + "update-mobile.php",
        type: "POST",
        data: data,
        dataType: "JSON",
        success: function (response) {
            $("#resultDiv").append("<span class='errorText'>results = " + JSON.stringify(response) + "</span>");
        },
        error: function (textStatus, errorThrown) {
            console.log(textStatus + " " + errorThrown);
        }
    });
}

function addNewProduct(productDetails) {
    $.ajax({
        url: serviceHostAddress + "add-mobile.php",
        type: "POST",
        data: productDetails,
        dataType: "JSON",
        success: function (data) {
            console.log("ADDED NEW MOBILE ", data);
        },
        error: function (textStatus, errorThrown) {
            console.log(textStatus + " " + errorThrown);
        }
    });

    console.log("PRODUCT DETAILS === > ", productDetails);
}