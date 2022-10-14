const DB = "/db"
const crypto = require("crypto")

module.exports = (app, db) => {
    const respond = (res, data) => {
        res.send(JSON.stringify(data))
    }

    // update products
    app.post(`${DB}/articles`, (req, res) => {
        console.log(`Articles update: ${JSON.stringify(req.body)}`)
        const body = req.body

        db.get(`SELECT username, name, price, rating FROM Articles
                JOIN Vendors USING (vendor_id)
                JOIN Users ON owner_id = user_id
                ORDER BY clicks DESC LIMIT 10;`, 
                [body.uname], (err, row) => {
            if(err) {
                console.log("Error: " + err)
                respond(res, { error: "invalid request" })
                return
            }

            if(row) {
                // foreward the result
                respond(res, row)
            } else {
                // no results? send empty response
                respond(res, {})
            }
        })
    })
    
    app.post(`${DB}/load_products`, (req, res) => {
        console.log(`load some products: ${JSON.stringify(req.body)}`)
        const body = req.body

        db.get(`SELECT * FROM Articles ORDER BY clicks DESC LIMIT 30`, 
                (err, row) => {
            if(err) {
                console.log("Error: " + err)
                respond(res, { error: "invalid request" })
                return
            }

            if(row) {
                // foreward the result
                respond(res, row)
            } else {
                // no results? send empty response
                respond(res, {})
            }
        })
    })

    app.post(`${DB}/add_product`, (req, res) => {
        console.log(`Add product request: ${JSON.stringify(req.body)}`)
        const body = req.body
        body.price = Math.floor(parseFloat(body.price) * 20) / 20 
        console.log(body.price)

        if(!req.session || !req.session.user_id || !body.user_id 
                || req.session.user_id != body.user_id
                || !body.description || isNaN(body.price) || !body.description) {
            respond(res, { error: "invalid request" })
            return
        }

        db.run(`
        INSERT INTO Articles (name, description, vendor_id, price) VALUES (?, ?, ?, ?);
        `, [body.name, body.description, req.session.user_id, body.price], (err) => {
            if(err){
                respond(res, { error: "invalid request" })
                console.log(err)
                return
            } 
            console.log(`Inserted article with name ${body.name} into Articles table`)
            respond(res, { article_added: true })
        })

    })

    app.post(`${DB}/get_store`, (req, res) => {
        console.log(`Store request: ${JSON.stringify(req.body)}`)
        const body = req.body

        if(!req.session || !req.session.user_id || !body.uname) {
            respond(res, { error: "invalid request" })
            return
        }

        db.get(`SELECT username, vendor_id, description, website FROM Vendors
                JOIN Users ON user_id = owner_id
                WHERE Users.username = ?;`,
                [body.uname], (err, row) => {
            if(err) {
                console.log("Error: " + err)
                respond(res, { error: "invalid request" })
                return
            }

            if(row) {
                // foreward the result
                respond(res, row)
            } else {
                // no results? send empty response
                respond(res, {})
            }
        })
    })

    // open vendor store
    app.post(`${DB}/open_store`, (req, res) => {
        console.log(`Articles update: ${JSON.stringify(req.body)}`)
        const body = req.body

        // check parameters
        if(!req.session || !req.session.user_id  ||
                !body.website || typeof(body.website) != "string" ||
                !body.description || typeof(body.description) != "string"){
            respond(res, { error: "invalid request" })
            return
        }

        db.run(`
        INSERT INTO Vendors (owner_id, description, website) VALUES (?, ?, ?);
        `, [req.session.user_id, body.description, body.website], (err) => {
            if(err){
                respond(res, { error: "invalid request" })
                console.log(err)
                return
            } 
            console.log(`Inserted vendor with description ${body.description} into Vendors table`)
            respond(res, { store_created: true })
        })

    })

    app.post(`${DB}/login`, (req, res) => {
        console.log(`Database login: ${JSON.stringify(req.body)}`)
        const body = req.body

        if(typeof(body.uname) != "string" || typeof(body.pwd) != "string"){
            respond(res, { error: "invalid login" })
            return
        }

        // get the user with name from database
        db.get("SELECT user_id, sha256, salt FROM Users WHERE username = ?;", [body.uname], (err, row) => {
            if(err) {
                respond(res, { error: "invalid login" })
                return
            }

            if(row) {
                // check password and hash
                const hash = crypto.createHash("sha256").update(body.pwd).update(row.salt).digest("hex")

                if(hash === row.sha256) {
                    req.session.user_id = row.user_id
                    respond(res, { user_id: row.user_id })
                } else {
                    respond(res, { error: "invalid login" })
                }
            } else {
                respond(res, { user_id: -1 })
            }
        })
    })

    app.post(`${DB}/register`, (req, res) => {
        console.log(`Database register: ${JSON.stringify(req.body)}`)
        const body = req.body

        if(typeof(body.uname) != "string" || typeof(body.pwd) != "string"){
            respond(res, { error: "invalid login" })
            return
        }

        // check if user exists
        db.get("SELECT 1 FROM Users WHERE username = ?", [body.uname], (err, row) => {
            if(err) {
                respond(res, { error: "invalid login" })
                return
            }

            if(row) {
                respond(res, { error: "account exists" })
            } else {                
                // generate salt
                console.log("username: " + body.uname)
                const salt = crypto.randomBytes(32);
                const hash = crypto.createHash("sha256").update(body.pwd).update(salt).digest("hex")
                console.log("hash: " + hash)
                db.run(`
                    INSERT INTO Users (username, sha256, salt) VALUES (?, ?, ?);
                `, [body.uname, hash, salt], (err) => {
                    if(err){
                        respond(res, { error: "invalid login" })
                        console.log(err)
                        return
                    } 
                    console.log(`Inserted user ${body.uname} into Users table`)
                    db.get("SELECT user_id FROM Users WHERE username = ?", [body.uname], (err, row) => {
                        if(err) {
                            respond(res, { error: "invalid login" })
                            return
                        }
                        req.session.user_id = row.user_id
                        respond(res, { user_id: row.user_id })
                    })
                })
            }
        })
    })
}
