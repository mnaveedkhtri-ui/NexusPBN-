const fs = require('fs');
let code = fs.readFileSync('src/app/api/deploy/route.ts', 'utf8');

code = code.replace(/const insert = db\.prepare\([\s\S]*?\);\s*insert\.run\([^;]*\);/m, 
`try { await initDB(); } catch(e) {}
    
    await sql\`
      INSERT INTO projects (id, domain, moneyUrl, anchorText, vercelUrl, githubRepo) 
      VALUES (\${projectId}, \${domain}, \${moneyUrl}, \${anchorText}, \${finalEdgeUrl}, \${repoName})
    \`;`);

code = code.replace(/url: finalVercelUrl/g, 'url: finalEdgeUrl');

fs.writeFileSync('src/app/api/deploy/route.ts', code);
