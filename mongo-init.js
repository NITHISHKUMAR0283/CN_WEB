// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

// Switch to the event_registration database
db = db.getSiblingDB('event_registration');

// Create collections with indexes for better performance
db.createCollection('users');
db.createCollection('events');
db.createCollection('registrations');

// Create indexes for users collection
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "studentId": 1 }, { unique: true });

// Create indexes for events collection
db.events.createIndex({ "eventDate": 1 });
db.events.createIndex({ "category": 1 });
db.events.createIndex({ "isActive": 1 });
db.events.createIndex({ "registrationDeadline": 1 });
db.events.createIndex({ "createdBy": 1 });

// Create indexes for registrations collection
db.registrations.createIndex({ "user": 1, "event": 1 }, { unique: true });
db.registrations.createIndex({ "event": 1 });
db.registrations.createIndex({ "user": 1 });
db.registrations.createIndex({ "status": 1 });
db.registrations.createIndex({ "registrationDate": -1 });
db.registrations.createIndex({ "registrationNumber": 1 }, { unique: true, sparse: true });

// Create a default admin user (optional)
// Note: This password should be changed in production
const bcrypt = require('bcrypt');

// You can uncomment and modify this section to create a default admin user
/*
db.users.insertOne({
    firstName: "Admin",
    lastName: "User",
    email: "admin@eventregistration.com",
    password: "$2a$12$placeholder_hash_replace_with_actual_hash",
    studentId: "ADMIN001",
    phone: "1234567890",
    department: "Administration",
    year: "Graduate",
    role: "admin",
    isActive: true,
    registrations: [],
    createdAt: new Date(),
    updatedAt: new Date()
});
*/

print('Event Registration Database initialized successfully!');
print('Collections created: users, events, registrations');
print('Indexes created for optimal performance');
print('Database setup complete!');