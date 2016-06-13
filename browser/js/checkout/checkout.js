//ui-view from incart
//for now I just stuck it in home
//assuming logged in
app.controller("checkoutCtrl", function ($state, CheckOutFactory, $scope, AuthService) {

    $scope.back = function() {

        if ($state.is("checkout.creditcard")) {
            $state.go("checkout.address");
        }
        if ($state.current.name !== "checkout.confirm") {
            $state.go("checkout.creditcard");
        }
    };
	$scope.next = function() {
        // console.log("here", $state.is)
        if ($state.is("checkout.address")) {
            $state.go("checkout.creditcard");
        }
        if ($state.is("checkout.creditcard")) {
            $state.go("checkout.confirm");
        }
    };
    
});

app.controller("confirmCtrl", function($scope, CheckOutFactory, products){
    $scope.finalInfo = CheckOutFactory.getMailOptions()
    console.log("finalInfo", $scope.finalInfo)
    $scope.products = products;
    console.log("products", $scope.products)

    $scope.submit = CheckOutFactory.sendConfirmation;
});

app.controller("addressCtrl", function ($scope, CheckOutFactory,  AddressFactory, user, AuthService ) {
    $scope.user = user;
  
    $scope.confirmation = function(){
        var allInfo = CheckOutFactory.getMailOptions();
        return allInfo.email && allInfo.address;
    }
    $scope.states = AddressFactory.getStates();
    $scope.state = "New York";
    $scope.setEmail = CheckOutFactory.setEmail;
        
    $scope.setAddress = function (address) {
        if (address) {
            CheckOutFactory.setAddress(address);
        }
        else {
            var address = $scope.firstname+" "+$scope.lastname+" "+$scope.address +","+ $scope.apt +","+ $scope.city+" "+$scope.state+" "+$scope.zip;

            CheckOutFactory.setAddress(address);
        }
    };
});