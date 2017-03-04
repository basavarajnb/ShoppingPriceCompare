function getProductDetailsById(productDetails, successCallback, errorCallback) {
    $.ajax({
        url: "http://saileshwedseshwari.in/php/get-mobile-by-id.php",
        type: "GET",
        data: {
            id: productDetails.id,
            siteName: productDetails.siteName
        },
        dataType: "JSON",
        success: function (data) {
            console.log("DTA FROM GET : ", data);
            successCallback(data);
        },
        error: function (textStatus, errorThrown) {
            errorCallback("")
        }
    });
}

function updateProductInfo(data) {
    $.ajax({
        url: "http://saileshwedseshwari.in/php/update-mobile.php",
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
        url: "http://saileshwedseshwari.in/php/add-mobile.php",
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