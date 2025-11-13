const admin = require('firebase-admin');
require('dotenv').config();

// Firebase configuration
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
};

async function testFirebase() {
  try {
    console.log('🚀 Starting Firebase test...');
    
    // Initialize Firebase
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com/`,
      storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
    });

    console.log('✅ Firebase App initialized');

    // Test Firestore
    const db = admin.firestore();
    const testDoc = db.collection('test').doc('connection');
    
    await testDoc.set({
      message: 'Firebase connection test',
      timestamp: new Date(),
      status: 'success'
    });
    console.log('✅ Firestore write test passed');

    const doc = await testDoc.get();
    if (doc.exists) {
      console.log('✅ Firestore read test passed');
      console.log('📄 Document data:', doc.data());
    }

    // Test Storage
    const bucket = admin.storage().bucket();
    const file = bucket.file('test.txt');
    
    await file.save('Firebase storage test', {
      metadata: {
        contentType: 'text/plain',
      },
    });
    console.log('✅ Storage write test passed');

    // Clean up test files
    await testDoc.delete();
    console.log('🧹 Test document cleaned up');

    console.log('🎉 ALL FIREBASE TESTS PASSED!');
    
  } catch (error) {
    console.error('❌ Firebase test failed:', error);
  }
}

// Run the test
testFirebase();
