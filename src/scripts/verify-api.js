const BASE_URL = 'http://localhost:3000';

async function testEndpoint(name, url, options = {}, expectedStatus = 200) {
    console.log(`\n🧪 Testing: ${name} (${url})`);
    try {
        const res = await fetch(`${BASE_URL}${url}`, options);
        console.log(`   Status: ${res.status} ${res.status === expectedStatus ? '✅' : '❌ (Expected ' + expectedStatus + ')'}`);

        // Headers check
        const cacheControl = res.headers.get('cache-control');
        const etag = res.headers.get('etag');
        const requestId = res.headers.get('x-request-id');

        if (cacheControl) console.log(`   Cache-Control: ${cacheControl}`);
        if (etag) console.log(`   ETag: ${etag}`);
        if (requestId) console.log(`   Request-ID: ${requestId} ✅`);

        const type = res.headers.get('content-type');
        if (type && type.includes('application/json')) {
            const data = await res.json();
            if (data.success !== undefined) {
                console.log(`   Standard Response: ✅ (success=${data.success})`);
            } else if (url.includes('docs/json')) {
                console.log(`   OpenAPI Spec: ✅ (Title=${data.info?.title})`);
            } else {
                console.log('   Standard Response: ❌ (Missing success field)');
            }
        } else if (type && type.includes('text/html')) {
            console.log('   HTML Content: ✅');
        }

        return { res, headers: res.headers };
    } catch (e) {
        console.error(`   Failed: ${e.message}`);
    }
}

async function run() {
    // 1. Docs
    await testEndpoint('Swagger UI', '/api/docs', {}, 200);
    await testEndpoint('OpenAPI JSON', '/api/docs/json', {}, 200);

    // 2. Projects (Public)
    const { headers: headers1 } = await testEndpoint('Get Projects', '/api/projects', {}, 200);

    // 3. Validation (Invalid Query)
    await testEndpoint('Invalid Filter', '/api/projects?status=invalid_enum', {}, 400);

    // 4. Caching (If-None-Match)
    if (headers1 && headers1.get('etag')) {
        await testEndpoint('Cached Projects', '/api/projects', {
            headers: { 'If-None-Match': headers1.get('etag') }
        }, 304);
    }

    // 5. Auth Protection
    await testEndpoint('Create Project (Unauth)', '/api/projects', { method: 'POST' }, 401);

}

run();
