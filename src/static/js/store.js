function order(article_id) {

}

function create_product_node(product) {
    let ret = "" 
    if(!Array.isArray(product))
        product = [product]

    product.forEach(p => {
        if(Object.keys(p).length == 0)
            return;
         ret += `
            <div class="product">
                <h3>`+p.name+`</h3> <p class="price">CHF `+p.price+`</p>
                <p class="info">`+(p.rating ? p.rating : 0)+`/10  |  `
                +(p.clicks ? p.clicks : 0)+` orders so far</p>
                <p class="description">`+p.description+`</p>
                <button onclick="order(`+p.article_id+`)">Order this item</button>
            </div>
        `
    });
    return ret
}

// request products
function update_products() {
    post("load_products", {}, (body) => {
        // update products
        console.log("update products: " + JSON.stringify(body))
        $("products").innerHTML += create_product_node(body)
    })
}

function update_store(store) {
    $("s_vendor").innerText = store.username
    $("s_website").href = store.website
    $("s_website").innerText = store.website
    $("s_description").innerText = store.description
    console.log("update store: " + JSON.stringify(store))
    $("show_store").style.display = "block"
    $("prepare_store").style.display = "none"
    $("add_product_button").style.display = 
        (store.vendor_id == localStorage.user_id ? "flex" : "none")
}

function add_product() {
    $("add_product").style.display = "none" 
    if(localStorage.user_id) {
        post("add_product", {
            user_id: localStorage.user_id,
            name: $("product_name").value,
            description: $("product_desc").value,
            price: $("product_price").value,
        }, (body) => {
            if(body.article_added) {
                $("product_name").value = '' 
                $("product_desc").value = '' 
                $("product_price").value = '' 
            }
        }) 
    }
}

function load_store_of(uname) {
    post("get_store", {
        uname
    }, (body) => {
        if(!body.vendor_id) {
            prepare_open_store();
        } else {
            update_store(body)
        }
    });
}

function get_store() {
    if(localStorage.uname) {
        load_store_of(localStorage.uname)
    }
}

function prepare_open_store() {
    $("prepare_store").style.display = "flex";
    $("show_store").style.display = "none";
}

function open_store() {
    post("open_store", {
        website: $("store_website").value,
        description: $("store_description").value,
    }, (body) => {
        if(body.store_created == true) {
            location.reload()
        }
    })
}

// load articles once
update_products();
get_store();
