/**
 * Migration: Add reminder_sent column to Registrations table
 * This enables the email reminder system to track which registrations have been reminded
 */

module.exports = {
  up: async (db) => {
    console.log('Running migration: Add reminder_sent to Registrations');
    
    try {
      await db.query(`
        ALTER TABLE "Registrations" 
        ADD COLUMN reminder_sent BOOLEAN DEFAULT false;
      `);
      
      console.log('✅ Migration completed: reminder_sent column added');
    } catch (error) {
      if (error.message.includes('column "reminder_sent" of relation "Registrations" already exists')) {
        console.log('⚠️  Column already exists, skipping...');
      } else {
        throw error;
      }
    }
  },

  down: async (db) => {
    console.log('Reverting migration: Remove reminder_sent from Registrations');
    
    try {
      await db.query(`
        ALTER TABLE "Registrations" 
        DROP COLUMN reminder_sent;
      `);
      
      console.log('✅ Migration reverted');
    } catch (error) {
      console.error('Error reverting migration:', error.message);
      throw error;
    }
  }
};
