import { Database } from 'sqlite3';
import * as path from 'path';
import * as bcrypt from 'bcrypt';

const db = new Database(path.join(process.cwd(), 'data', 'database.sqlite'));

async function insertTestData() {
    try {
        // Insert a test user
        const hashedPassword = await bcrypt.hash('password123', 10);
        db.run('INSERT INTO users (name, password, role) VALUES (?, ?, ?)', 
            ['John Doe', hashedPassword, 'USER'],
            function(err) {
                if (err) {
                    console.error('Error inserting user:', err);
                    return;
                }
                const userId = this.lastID;

                // Insert test posts
                const posts = [
                    {
                        title: 'The Rise of Manchester City',
                        content: 'Manchester City has transformed English football...',
                        image: 'https://example.com/city.jpg',
                        author_id: userId
                    },
                    {
                        title: 'Champions League Final Preview',
                        content: 'The biggest game in club football...',
                        image: 'https://example.com/ucl.jpg',
                        author_id: userId
                    }
                ];

                posts.forEach(post => {
                    db.run(
                        'INSERT INTO posts (title, content, image, author_id) VALUES (?, ?, ?, ?)',
                        [post.title, post.content, post.image, post.author_id],
                        (err) => {
                            if (err) console.error('Error inserting post:', err);
                            else console.log('Post inserted successfully');
                        }
                    );
                });
            }
        );
    } catch (error) {
        console.error('Error in insertTestData:', error);
    }
}

insertTestData();