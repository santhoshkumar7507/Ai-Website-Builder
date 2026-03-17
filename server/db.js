const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'ai_builder.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

const query = (text, params = []) => {
    return new Promise((resolve, reject) => {
        let sql = text.replace(/\$\d+/g, '?');

        if (text.trim().toUpperCase().startsWith('SELECT')) {
            db.all(sql, params, (err, rows) => {
                if (err) return reject(err);
                resolve({ rows });
            });
        } else {
            db.run(sql, params, function (err) {
                if (err) return reject(err);
                resolve({ rows: [], rowCount: this.changes, lastID: this.lastID });
            });
        }
    });
};

module.exports = { query };
