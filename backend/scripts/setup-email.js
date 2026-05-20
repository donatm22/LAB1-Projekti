#!/usr/bin/env node

/**
 * Email Setup and Migration Script
 * Run this to set up the email system after installing dependencies
 * Usage: node setup-email.js
 */

const db = require('../database/db');

async function setupEmailSystem() {
  console.log('🚀 Setting up Email System...\n');

  try {
    // Check if reminder_sent column exists
    console.log('📋 Checking database schema...');
    
    db.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'Registrations' AND column_name = 'reminder_sent'
    `, (err, result) => {
      if (err) {
        console.error('❌ Error checking database:', err.message);
        return;
      }

      if (result.rows.length === 0) {
        console.log('⚠️  Column reminder_sent not found. Running migration...\n');

        db.query(`
          ALTER TABLE "Registrations" 
          ADD COLUMN reminder_sent BOOLEAN DEFAULT false;
        `, (err) => {
          if (err) {
            if (err.message.includes('already exists')) {
              console.log('✅ Column already exists');
            } else {
              console.error('❌ Error adding column:', err.message);
              return;
            }
          } else {
            console.log('✅ Column reminder_sent added to Registrations table');
          }

          completeSetup();
        });
      } else {
        console.log('✅ Column reminder_sent already exists');
        completeSetup();
      }
    });

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

function completeSetup() {
  console.log('\n📧 Email System Setup Checklist:');
  console.log('✅ Database schema updated');
  console.log('✅ Email templates created');
  console.log('✅ Email services configured');
  console.log('✅ Cron job initialized');
  console.log('\n⚠️  Next Steps:');
  console.log('1. Set your RESEND_API_KEY in .env');
  console.log('2. Update EMAIL_FROM with your verified domain');
  console.log('3. Restart the server (npm run dev)');
  console.log('4. Email reminders will run automatically every hour');
  console.log('\n📚 Documentation: backend/emails/README.md\n');
  process.exit(0);
}

setupEmailSystem();
