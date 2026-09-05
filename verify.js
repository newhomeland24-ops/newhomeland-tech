const axios = require('axios');
const mongoose = require('mongoose');

// Wait for a bit to ensure the server has time to start
setTimeout(async () => {
  try {
    console.log('--- Starting Verification ---');
    
    // 1. Check Maintenance API
    const settings = await axios.get('http://localhost:5000/api/settings');
    if (settings.status === 200) {
      console.log('✅ Maintenance API (Public) is accessible.');
    }

    // 2. Try Protected Route Without Token
    try {
      await axios.get('http://localhost:5000/api/properties/admin/all');
      console.error('❌ Security Check Failed: Admin API is accessible without token.');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Security Check Passed: Admin API returns 401 Unauthorized without token.');
      } else {
        console.error(`❌ Security Check Error: Expected 401 but got ${error.response?.status}`);
      }
    }

    // 3. Authenticate and Get Cookie
    const loginRes = await axios.post('http://localhost:5000/api/auth/admin/login', {
      password: 'change_this_password_for_production'
    });
    
    const cookie = loginRes.headers['set-cookie'] ? loginRes.headers['set-cookie'][0] : null;
    if (cookie) {
      console.log('✅ Authentication Passed: Admin can login and receive cookie.');
    } else {
      console.error('❌ Authentication Failed: No cookie received on login.');
    }

    const authHeaders = { headers: { Cookie: cookie } };

    // 4. Create a draft property
    const draftRes = await axios.post('http://localhost:5000/api/properties', {
      title: 'Draft Property',
      price: 1000000,
      location: 'Test City',
      area: 1000,
      status: 'draft'
    }, authHeaders);

    if (draftRes.status === 201) {
      console.log('✅ Admin API (Create) works.');
    }

    // 5. Create a scheduled property (future)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 2); // 2 days in future
    
    const scheduledRes = await axios.post('http://localhost:5000/api/properties', {
      title: 'Scheduled Property',
      price: 2000000,
      location: 'Test City 2',
      area: 2000,
      status: 'published',
      publishedAt: futureDate.toISOString()
    }, authHeaders);

    // 6. Check Public API (should not return draft or scheduled)
    const publicRes = await axios.get('http://localhost:5000/api/properties');
    const hasDraft = publicRes.data.some(p => p.title === 'Draft Property');
    const hasScheduled = publicRes.data.some(p => p.title === 'Scheduled Property');

    if (!hasDraft && !hasScheduled) {
      console.log('✅ Business Logic Passed: Public API hides drafts and future scheduled properties.');
    } else {
      console.error('❌ Business Logic Failed: Public API exposes hidden properties.');
    }

    // 7. Test Mark as Sold
    const markSoldRes = await axios.patch(`http://localhost:5000/api/properties/${scheduledRes.data._id}/sold`, {}, authHeaders);
    if (markSoldRes.data.status === 'sold' && markSoldRes.data.expireAt) {
      console.log('✅ Business Logic Passed: Property marked as sold populates expireAt (TTL).');
    } else {
      console.error('❌ Business Logic Failed: Property did not set sold status or expireAt correctly.');
    }

    console.log('--- Verification Complete ---');
    process.exit(0);

  } catch (err) {
    console.error('Verification Script Failed:', err.message);
    if (err.response) console.error(err.response.data);
    process.exit(1);
  }
}, 3000);
