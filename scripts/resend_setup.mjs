import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';

function getApiKey() {
  if (process.env.RESEND_API_KEY) {
    return process.env.RESEND_API_KEY;
  }
  const envPath = path.resolve('billionbiz-backend/.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const match = content.match(/RESEND_API_KEY=(.+)/);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
}

async function run() {
  const apiKey = getApiKey();
  if (!apiKey || apiKey.startsWith('re_your_')) {
    console.log(JSON.stringify({
      status: 'NEEDS_API_KEY',
      message: 'RESEND_API_KEY is not set or is still a placeholder in billionbiz-backend/.env.'
    }));
    return;
  }

  const resend = new Resend(apiKey);

  try {
    // 1. List existing domains
    const listRes = await resend.domains.list();
    const targetDomain = 'mail.chandraprakash.codes';
    let domain = listRes.data?.data?.find(d => d.name === targetDomain);

    if (!domain) {
      // 2. Create domain
      console.log(`[Resend] Creating domain: ${targetDomain}...`);
      const createRes = await resend.domains.create({ name: targetDomain });
      if (createRes.error) {
        console.error(JSON.stringify({ status: 'ERROR', error: createRes.error }));
        return;
      }
      domain = createRes.data;
    }

    // 3. Fetch detailed records
    const getRes = await resend.domains.get(domain.id);
    const domainDetails = getRes.data || domain;

    console.log(JSON.stringify({
      status: 'SUCCESS',
      domain: domainDetails,
      dnsRecords: domainDetails.records || []
    }, null, 2));
  } catch (err) {
    console.error(JSON.stringify({ status: 'ERROR', error: err.message }));
  }
}

run();

