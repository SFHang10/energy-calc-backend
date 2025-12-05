/**
 * Utility function to match new content to user interests and create notifications
 * Call this function when new content is added to the system
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database/members.db');

/**
 * Match content to user interests and create notifications
 * @param {number} contentId - The ID of the content to match
 * @param {string} contentTitle - Title of the content
 * @param {string} contentTags - Comma-separated tags
 * @param {string} contentCategory - Category of the content
 */
function matchContentToInterests(contentId, contentTitle, contentTags = '', contentCategory = '') {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        return reject(err);
      }
    });

    // Get all interest categories
    db.all('SELECT id, name FROM interest_categories', (err, categories) => {
      if (err) {
        db.close();
        return reject(err);
      }

      // Find matching interests based on tags and category
      const matchingInterests = categories.filter(cat => {
        const categoryLower = cat.name.toLowerCase();
        const tagsLower = (contentTags || '').toLowerCase();
        const contentCategoryLower = (contentCategory || '').toLowerCase();

        return tagsLower.includes(categoryLower) || 
               contentCategoryLower.includes(categoryLower) ||
               categoryLower.includes(tagsLower.split(',')[0]?.trim() || '');
      });

      if (matchingInterests.length === 0) {
        db.close();
        return resolve({ matched: 0, notifications: 0 });
      }

      const interestNames = matchingInterests.map(i => i.name);

      // Find all members with matching interests
      const placeholders = interestNames.map(() => '?').join(',');
      const query = `
        SELECT DISTINCT m.id as member_id 
        FROM members m
        JOIN member_interests mi ON m.id = mi.member_id
        WHERE mi.interest IN (${placeholders})
      `;

      db.all(query, interestNames, (err, members) => {
        if (err) {
          db.close();
          return reject(err);
        }

        if (members.length === 0) {
          db.close();
          return resolve({ matched: matchingInterests.length, notifications: 0 });
        }

        // Create notifications for each matching member
        const stmt = db.prepare(`
          INSERT INTO user_notifications 
          (member_id, content_id, notification_type, title, message, is_read)
          VALUES (?, ?, 'content_match', ?, ?, 0)
        `);

        let completed = 0;
        const total = members.length;

        members.forEach(member => {
          const message = `New content available: ${contentTitle}`;
          stmt.run([member.member_id, contentId, contentTitle, message], (err) => {
            if (err) {
              console.error(`Error creating notification for member ${member.member_id}:`, err);
            }
            completed++;
            if (completed === total) {
              stmt.finalize();
              db.close();
              resolve({
                matched: matchingInterests.length,
                notifications: total,
                interests: interestNames
              });
            }
          });
        });
      });
    });
  });
}

/**
 * Match a product to user interests
 * @param {object} product - Product object with name, category, tags, etc.
 */
function matchProductToInterests(product) {
  // This would be similar but for products
  // For now, we'll use the same logic
  return matchContentToInterests(
    null, // No content_id for products
    product.name || product.title,
    product.tags || product.category || '',
    product.category || ''
  );
}

module.exports = {
  matchContentToInterests,
  matchProductToInterests
};


