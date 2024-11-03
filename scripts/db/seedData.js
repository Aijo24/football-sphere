const sqlite3 = require('sqlite3');
const path = require('path');
const bcrypt = require('bcrypt');

const db = new sqlite3.Database(path.join(process.cwd(), 'data', 'database.sqlite'));

async function seedData() {
    try {
        // Create test users
        const password = await bcrypt.hash('password123', 10);
        const users = [
            ['John Doe', password, 'USER'],
            ['Jane Smith', password, 'USER'],
            ['Mike Johnson', password, 'USER']
        ];

        for (const [name, pwd, role] of users) {
            db.run(`
                INSERT OR IGNORE INTO users (name, password, role)
                VALUES (?, ?, ?)
            `, [name, pwd, role]);
        }

        // Create test posts
        const posts = [
            {
                title: 'Champions League Final Preview',
                content: `
                    <p>The UEFA Champions League final is approaching, and it promises to be an epic battle between two football giants.</p>
                    <p>Both teams have shown incredible form throughout the tournament, demonstrating why they deserve to be in the final.</p>
                `,
                image: '/images/champions-league.jpg',
                author: 'John Doe'
            },
            {
                title: 'The Rise of Young Talents',
                content: `
                    <p>This season has seen the emergence of several promising young players who are taking the football world by storm.</p>
                    <p>From technical brilliance to tactical understanding, these youngsters are showing maturity beyond their years.</p>
                `,
                image: '/images/young-talents.jpg',
                author: 'Jane Smith'
            }
        ];

        for (const post of posts) {
            db.run(`
                INSERT INTO posts (title, content, image, author_id)
                SELECT ?, ?, ?, users.id
                FROM users
                WHERE users.name = ?
            `, [post.title, post.content, post.image, post.author]);
        }

        console.log('Test data inserted successfully');
    } catch (error) {
        console.error('Error seeding data:', error);
    }
}

seedData().then(() => {
    db.close();
});