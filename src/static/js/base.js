// JS to be used by many sub-sites

// post alias
window.post = (path, obj, callback) => {
    fetch(`/db/${path}`, {
        method: "POST",
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify(obj),
    }).then((data) => data.json().then(body => {
        if(body.error){
            alert(body.error)
            return
        }
        callback(body)
    }));
}

// simple alias
window.$ = (id) => document.getElementById(id);