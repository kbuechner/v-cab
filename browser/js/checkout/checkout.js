//ui-view from incart
//for now I just stuck it in home
//assuming logged in
app.controller("checkoutCtrl", function ($state, CheckOutFactory, $scope, AuthService) {
    $scope.back = function() {
    };
	$scope.next = function() {
    };
    $scope.submit = CheckOutFactory.sendConfirmation;
});

app.controller("addressCtrl", function ($scope, CheckOutFactory,  AddressFactory, user, AuthService ) {
    $scope.user = user;
    $scope.shippingInfo = {};
    $scope.states = AddressFactory.getStates();

    $scope.setAddress = function (address) {
        if (address) {
            CheckOutFactory.setAddress(address);
        }
        else {
            var address = $scope.address +","+ $scope.apt +","+ $scope.city+" "+$scope.state+" "+$scope.zip;
            console.log("street", addressObj);
        }
    }
});