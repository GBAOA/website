import { notices, events } from '../lib/data';
import { createNotice } from '../lib/db-notices';
import { createEvent } from '../lib/db-events';

async function migrate() {
    console.log('🚀 Starting migration...');

    // Migrate Notices
    console.log(`\n📦 Migrating ${notices.length} notices...`);
    for (const notice of notices) {
        try {
            await createNotice({
                title: notice.title,
                content: notice.content,
                category: notice.urgent ? 'Maintenance' : 'General', // Default mapping
                urgent: notice.urgent,
                published_date: new Date(notice.date).toISOString(), // Parse string date
            });
            console.log(`   ✅ Imported notice: ${notice.title}`);
        } catch (error) {
            console.error(`   ❌ Failed to import notice: ${notice.title}`, error);
        }
    }

    // Migrate Events
    console.log(`\n📅 Migrating ${events.length} events...`);
    for (const event of events) {
        try {
            await createEvent({
                title: event.title,
                description: event.description,
                date: new Date(event.date).toISOString().split('T')[0], // Extract YYYY-MM-DD
                time: event.time,
                location: event.location,
                image_url: event.image, // Map 'bg-orange-100' class to image_url for now
                google_calendar_event_id: null,
            });
            console.log(`   ✅ Imported event: ${event.title}`);
        } catch (error) {
            console.error(`   ❌ Failed to import event: ${event.title}`, error);
        }
    }

    console.log('\n✨ Migration complete!');
}

migrate().catch(console.error);
