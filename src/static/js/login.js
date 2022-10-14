// scripts for index.html

function go_back() {
    // reset to login-style
    $("login_form").style.visibility = "visible"
    $("register_form").style.visibility = "hidden"
}

function _check_login(body) {
    if(body.user_id == -1) {
        // Ask to register
        $("login_form").style.visibility = "hidden"
        $("register_form").style.visibility = "visible"
    }
    if(body.user_id >= 0) {
        // set my username
        localStorage.uname = $("login_uname").value
        // logged in, can now switch page
        // set user_id globally and switch page
        window.user_id = body.user_id
        // reload page from server
        window.location.reload(true)
    }
}

// define a login function
function login() {
    // set the username globally, not password
    post("login", {
        uname: $("login_uname").value,
        pwd: $("login_pwd").value,
    }, (body) => {
        _check_login(body);
    });

}

function register() {
    post("register", {
        uname: $("login_uname").value,
        pwd: $("login_pwd").value,
    }, (body) => {
        _check_login(body);
    });
}