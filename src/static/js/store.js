
// request products
function update_products() {
    post("articles", {

    }, (body) => {
        // update products
        console.log("update products: " + JSON.stringify(body))
    })
}

function get_store() {
    if(uname) {
        post("get_store", {
            uname: uname,
        }, (body) => {
            if(!body.vendor_id) {
                prepare_open_store();
            } else {

            }
        });
    }
}

function prepare_open_store() {
    $("prepare_store").style.visibility = "visible";
}

function open_store() {
    post("open_store", {
        website: $("store_website").value,
        description: $("store_description").value,
    }, (body) => {
        if(body.store_created == true) {
            alert("Store successfully created.");
        }
    })
}

// load articles once
update_products();