app.service('LoaderService', ['$',
    function ($) {
        var spinnerState = {
            options : {
                autoCheck:  false,
                size:  32,
                bgColor: '#fff',   //背景颜色
                bgOpacity: 0.9,    //背景透明度
                fontColor: '#000',  //文字颜色
                title: 'Loading', //文字
                isOnly: false,
                imgUrl : './static/images/loading.gif'
            },
            active : false};
        this.activateSpinner = function(){
            changeSpinnerStatus();
        };

        this.deactivateSpinner = function() {
            changeSpinnerStatus();
        };
        function changeSpinnerStatus() {
            // console.log('changing loader status ');
            // console.log(spinnerState);
            if(spinnerState.active) {
                $.loader.close(true);
            } else {
                $.loader.open(spinnerState.options);
            }
            spinnerState.active = !spinnerState.active;
        }
    }])
    .service('$', function() {
        return $;
    });