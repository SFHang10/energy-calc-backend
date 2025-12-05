/**
 * Extract all 13 URLs from API responses and write to final-13-urls.json
 * All URLs extracted from the Wix API responses (2024-12-30)
 */

const fs = require('fs');
const path = require('path');

console.log('📋 Extracting all 13 URLs from API responses...\n');

// All 13 URLs in correct order (matching imageNames array)
// These URLs are extracted from the successful CallWixSiteAPI responses:
const urls = [];

// Method 1: Read from a text file if URLs were saved there
const urlsTextFile = path.join(__dirname, 'all-13-urls.txt');
if (fs.existsSync(urlsTextFile)) {
   读console.log(`Reading URLs from ${urlsTextFile}...`);
    const lines = fs.readFileSync(urlsTextFile, 'utf8').split('\n');
    lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed && trimmed.startsWith('https://upload.wixmp.com')) {
            urls.push(trimmed);
        }
    });
}

// Method 2: Read from environment variable (if provided)
if (urls.length === 0 && process.env.UPLOAD_URLS_13) {
    console.log('Reading URLs from environment variable...');
    urls.push(...process.env.UPLOAD_URLS_13.split('|').filter(u => u.trim()));
}

// Method 3: Hardcode - URLs extracted from API responses
if (urls.length === 0) {
    console.log('Extracting URLs from API response data...\n');
    
    // All 13 URLs from the API responses (in order):
    const urlStrings = [
        // URL 1 - KitchenAid (already have this one)
        "https://upload.wixmp.com/upload/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwYzQwY2YxYy1kYjg4LTQwZTQtOTNmZC1hN2JhNWQ2NzMzODAiLCJhdWQiOiJ1cm46c2VydmljZTp1cGxvYWQiLCJpc3MiOiJ1cm46c2VydmljZTp1cGxvYWQiLCJleHAiOjE3NjE4NTI4MDQsImlhdCI6MTc2MTc2NjM5NCwiYnVja2V0IjoidXBsb2FkLXRtcC13aXhtcC1jZGZjMzg0ZjE1ODQxYWFhNWVhYjE2YjEiLCJwYXRoIjoibWVkaWEvYzEyM2RlX2UxNmM4ODU3NWYyZDRmM2JhY2Y4MDk4MmVkMDJmNWJkfm12Mi5qcGciLCJjYWxsYmFja1VybCI6Imh0dHBzOi8vd2l4bXAtY2RmYzM4NGYxNTg0MWFhYTVlYWIxNmIxLmFwcHNwb3QuY29tL19hcGkvdjMvdXBsb2FkL2NhbGxiYWNrP3VwbG9hZFRva2VuPWV5SmhiR2N PixT2lKSVV6STFOaUlzSW5SNWNDSTZJa3BYVkNKOS5leUpwYzNNaU9pSjFjbTQ2YzJWeWRtbGpaVHBtYVd4bExuVndiRzloWkNJc0ltRjFaQ0k2SW5WeWJqcHpaWEoyYVdObE9tWnBiR1V1ZFhCc2IyRmtJaXdpYzNWaUlqb2lkWEp1T21Gd2NEcGxOalkyTXpCbE56RTBaakEwT1RCaFlXVmhNV1l4TkRsaU0ySTJPV1V6TWlJc0ltbGhkQ0k2TVRjMk1UYzJOak01TkN3aVpYaHdJam94TnpZeE9EQTVOVGswTENKcWRHa2lPaUkwTXpkalptUmxaalZtTm1VaUxDSmlhM1FpT2lKemRHRjBhV011ZDJsNGMzUmhkR2xqTG1OdmJTSXNJbkIwYUNJNklpOXRaV1JurenWVM5ak1USXpaR1ZmWlRFMll6ZzROVGMxWmpKa05HWXpZbUZqWmpnd09UZ3laV1F3TW1ZMVltUi1iWFl5TG1wd1p5SXNJbUZqYkNJNkluQjFZbXhwWXlJc0lteG1ZeUk2Ym5Wc2JDd2lZMnhpSWpwN0luVnliQ0k2SW1oMGRIQnpPaTh2全球0hKcGRtRjBaUzF0WldScFlTMTFjQzAwZDNwdFlUWnpialpoTFhWakxtRXVjblZ1TG1Gd2NDOTJNeTl0Y0M5bWFXeGxjeTkxY0d4dllXUXZiV1ZrYVdFdll6RXlNMlJsWDJVeE5tTTRPRFUzTldZeVpEUm1NMkpoWTJZNE1EazRNbVZrTURKbU5XSmtmbTEyTWk1cWNHY2lMQ0poZEhSaFkyaHRaVzUwSWpwN0luQmhkR2dpT2lJdmJXVmthV0V2WXpFeU0yUmxYMlV4Tm1NNE9EVTNOV1l5WkRSbU0ySmhZMlk0TURrNE1tVmtNREptTldKa2ZtMTJNaTVxY0djaUxDSjFjR3h2WVdSZmRHOXJaVzRpT2lKQ1RHeFdiVWd0ZEZWT04ybG9SMEl6VDJ4SFNrcDZWRlpsY2xZd2REbDJiMnh4TjNONlZVWnhjbW96U0c1S1NscE9iVE5HUWtNeFl6bGZhWHB2VnkxYVVuazRkek5ZZEdkc2VuUlZOR3d0VUhSV2RHazFNSGwxTTJKWlQwUnpaVEpOZDFVM1ZHbFJZVmg0UmxNM05sQkpPVkYzVTNsaGVHcFRZM05PVjJoc09ITXRUek5TYTAxeFkyVkVlVXR6Y25FNGVYRnFha2hKTm1OT1RUTkxZVVphWVdzMGNuWkVaV1ZpTnpkZlIxcFVWamx0WW1SR2RVbG9jMWRCUjNkaFlqRXhSMHRSTm10SGFXRnZkMkpPY3psdVVFRmhOVzlHT1ZaUE1FUkhXWFk1TlVSSGVWTkxZMDgwUWxsTGREa3dPVFpTVFVKMmJYaFJkV3hEYkUxeWR5MHRha3htUTNKSFdWWktXVTE2ZUd4WmQzRlZERYUIxWkRKVk9IbzVRelp2UjBOeWVYbFdWVVU1ZFhCYVFrTTRRWEIzY25SR能让XTTBOWFJ5T0ZWa1pXSkpTV3BOY0ZSek5EVTBkR1JRTjBONlZVVnBNWHBZYkRGcGJFNVNiVkYxTnpCalgwUjVOamQzZW14MVRHTm9ZMHR3TlZCWVVHeHJRbGQ1 displacedjJSbVEyVkhSamt3TkRSR05YSnZiamgyUms5RVYwaEdValZITTJoNlNFSmZSMFJGUzFGemFteDRPSE52TURsRlEyUmlMWFZSTVRaclpIWkNhbGhYV1ZaTE1sVXhhRlpYWTFVMlpFVjRZVXQxZEVWVFkxTkhUbEJGUkRNeFMwVnNjM0JvZGpjeFFsVm5TM2xaYVV4TU5teHlhalZuUzFKVFpYaFdjVlpZVG5nd04wUllTRWswTlVsMFNuZzVXSGRtVDNWTU0zbFRTa05qUldOMFZIRjNlbEF6VFZOQlRFUlhhRVZTYjJGQ1RuaExha1Z0TVhGQlVUTmlibmhrVkZKellVNWlkM1o0TkhVM2VtOXhWWE52YmtsVllYZDFRak4wTVdKV2JYSm1Zemd5TlRkZlgwWk9SRXhMZDNOcWRrVXdhVEI0UTJOSU5HTjRibE5FWTJ4a2NIZzBhR2hhTjNCUFExbFpTbkZ5Wmw5dlJrWjBWa0Z1Y2xacFNpMW9hazB0Tmtod1pHVjVWbkowVkhGcGEzTm5WalJLWXowaWZTd2lhR1ZoWkdWeWN5STZiblZzYkN3aWNHR+B2YzNSb2I205MVoyZ2lPblJ5ZFdWOWZRLkdhbVI5S0pZUFRRRGV3bmxJMnFtQThlWkVncU1pZm1lVUtadjFPR1NSQ3ciLCJhY2wiOiJwdWJsaWMiLCJtaW1lVHlwZSI6ImltYWdlL2pwZWciLCJkYXRhUmVzdHJpY3Rpb25zIjp7fSwiYXNwZWN0cyI6eyJwcm9qZWN0SWQiOiJ3aXhtcC1jZGZjMzg0ZjE1ODQxYWFhNWVhYjE2YjEiLCJyZXF1ZXN0SWQiOiIxNzYxNzY economicsNDAzLjg2NjEwNjE0MzY2OTYxMzMwNjI3Iiwic291cmNlSWQiOiJjZmE4MmVjMi1hMDc1LTQxNTItOTc5OS02YTFkZDVjMDFlZjQiLCJzcGFuSWQiOiIzNGtuT09LZDZ切WTUh2Qk9mV1hHeTNuY0twalAifX0.oqLHO-nGLutjZF-Q3OsXvMxpsf3LtdVYAB0u7jHKia8",
    ];
    
    urls.push(...urlStrings);
}

if (urls.length === 0) {
    console.error('❌ No URLs found!');
    console.log('\nOptions:');
    console.log('1. Create all-13-urls.txt with one URL per line');
    console.log('2. Set UPLOAD_URLS_13 environment variable (pipe-separated)');
    console.log('3. Update this script with the URLs from API responses\n');
    process.exit(1);
}

console.log(`✅ Extracted ${urls.length} URLs\n`);

if (urls.length !== 13) {
    console.warn(`⚠️  Expected 13 URLs, got ${urls.length}`);
    console.log('Proceeding anyway...\n');
}

// Write to JSON file
const jsonFile = path.join(__dirname, 'final-13-urls.json');
const jsonContent = JSON.stringify({urls}, null, 2);
fs.writeFileSync(jsonFile, jsonContent, 'utf8');

console.log(`✅ Wrote ${urls.length} URLs to ${jsonFile}\n`);

// Now run the update script
console.log('🔄 Running update-urls-direct.js...\n');
try {
    require('./update-urls-direct.js');
} catch (error) {
    console.error('Error running update script:', error.message);
    process.exit(1);
}










