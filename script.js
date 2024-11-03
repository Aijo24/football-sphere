const db = require('./src/app/api/db/db');
const bcrypt = require('bcrypt');

const createFirstUser = async () => {
    const name = 'Fatima';
    const email = 'fatimakaina@icloud.com';
    const password = 'fatou'; // Change this to a secure password
    const role = 'ADMIN';

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    db.serialize(() => {
        db.run(`INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`, [name, email, hashedPassword, role], function(err) {
            if (err) {
                console.error('Error inserting user: ' + err.message);
            } else {
                console.log('First user created with ID: ' + this.lastID);
            }
        });
    });

    db.close();
};

createFirstUser().catch(err => console.error(err));