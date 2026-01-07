(async function () {
    const base = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const argSlug = process.argv[2];

    try {
        console.log(`Fetching blog list from ${base}/api/blog`);
        const res = await fetch(`${base}/api/blog`);
        console.log('Status:', res.status);
        const body = await res.text();
        try {
            const json = JSON.parse(body);
            if (Array.isArray(json)) {
                console.log(`Got ${json.length} posts. Sample slugs:`, json.slice(0, 5).map(p => p.slug));
            } else if (json && json.posts) {
                console.log(`Got posts meta: total=${json.total}`);
            } else {
                console.log('Response body:', JSON.stringify(json, null, 2));
            }
        } catch (e) {
            console.log('Non-JSON response body:', body);
        }

        if (argSlug) {
            console.log(`\nFetching blog by slug: ${argSlug}`);
            const s = await fetch(`${base}/api/blog?slug=${encodeURIComponent(argSlug)}`);
            console.log('Status:', s.status);
            const sBody = await s.text();
            try {
                console.log('Body:', JSON.stringify(JSON.parse(sBody), null, 2));
            } catch (e) {
                console.log('Body (text):', sBody);
            }
        }
    } catch (err) {
        console.error('Error connecting to API:', err);
        process.exit(1);
    }
})();