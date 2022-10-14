const sqlite3 = require('sqlite3').verbose();

// export database init function
module.exports = () => {
    const db = new sqlite3.Database('amazon-clone.db');

    db.serialize(() => {
        // create tables
        db.exec(`
            CREATE TABLE IF NOT EXISTS Users (
                user_id     INTEGER PRIMARY KEY,
                username    VARCHAR(64),
                sha256      BLOB(256),
                salt        BLOB(32)
            );

            CREATE TABLE IF NOT EXISTS Orders (
                order_id    INTEGER PRIMARY KEY,
                user_id     INTEGER
            );

            CREATE TABLE IF NOT EXISTS Ordered (
                order_id    INTEGER,
                article_id  INTEGER
            );

            CREATE TABLE IF NOT EXISTS Articles (
                article_id  INTEGER PRIMARY KEY,
                name        VARCHAR(64),
                description VARCHAR(200),
                vendor_id   INTEGER,
                price       DECIMAL(5, 2),
                rating      TINYINT(1),
                clicks      INTEGER
            );

            CREATE TABLE IF NOT EXISTS Vendors (
                vendor_id   INTEGER PRIMARY KEY,
                owner_id    INTEGER UNIQUE,
                description VARCHAR(512),
                website     VARCHAR(64)
            );

        `);

        // const stmt = db.prepare("INSERT INTO lorem VALUES (?)");
        // for (let i = 0; i < 10; i++) {
        //     stmt.run("Ipsum " + i);
        // }
        // stmt.finalize();

        // db.each("SELECT rowid AS id, info FROM lorem", (err, row) => {
        //     console.log(row.id + ": " + row.info);
        // });
    });

    return db;
}
