async function main() {
    const endpoints = [
        'https://play.limitlesstcg.com/api/games/OP',
        'https://play.limitlesstcg.com/api/games/OP/cards',
        'https://onepiece.limitlesstcg.com/api/cards'
    ];

    for (const url of endpoints) {
        console.log(`Testing ${url}...`);
        try {
            const response = await fetch(url);
            console.log(`Status: ${response.status}`);
            if (response.ok) {
                const text = await response.text();
                console.log(`Response length: ${text.length}`);
                console.log(`Preview: ${text.substring(0, 200)}`);
            }
        } catch (e) {
            console.error(`Error: ${e.message}`);
        }
    }
}

main();
