/**
 * Add all 10 remaining URLs to final-13-urls.json
 * Fresh URLs generated 2024-12-30
 */

const fs = require('fs');
const path = require('path');

const jsonFile = path.join(__dirname, 'final-13-urls.json');
const data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));

console.log(`Currently have ${data.urls.length} URLs\n`);

// Extract uploadUrl from each API response result
// Fresh URLs from CallWixSiteAPI responses (just received):
const freshUrls = {
    4: "https://upload.wixmp.com/upload/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzNGRiNjk0ZS1kZWQ4LTQ2ZDYtYWFkMi01ZmRmZDQzZTVlMDEiLCJhdWQiOiJ1cm46c2VydmljZTp1cGxvYWQiLCJpc3MiOiJ1cm46c2VydmljZTp1cGxvYWQiLCJleHAiOjE3NjE4NjE3MTEsImlhdCI6MTc2MTc3NTMwMSwiYnVja2V0IjoidXBsb2FkLXRtcC13aXhtcC1jZGZjMzg0ZjE1ODQxYWFhNWVhYjE2YjEiLCJwYXRoIjoibWVkaWEvYzEyM2RlXzMyODMzYjY4YmMzMTRkMGJiYzJlZmQ5YWMyNTI4YjY5fm12Mi5qcGciLCJjYWxsYmFja1VybCI6Imh0dHBzOi8vd2l4bXAtY2RmYzM4NGYxNTg0MWFhYTVlYWIxNmIxLmFwcHNwb3QuY29tL19hcGkvdjMvdXBsb2FkL2NhbGxiYWNrP3VwbG9hZFRva2VuPWV5SmhiR2NpT2lKSVV6STFOaUlzSW5SNWNDSTZJa3BYVkNKOS5leUpwYzNNaU9pSjFjbTQ2YzJWeWRtbGpaVHBtYVd4bExuVndiRzloWkNJc0ltRjFaQ0k2SW5WeWJqcHpaWEoyYVdObE9tWnBiR1V1ZFhCc2IyRmtJaXdpYzNWaUlqb2lkWEp1T21Gd2NEcGxOalkyTXpCbE56RTBaakEwT1RCaFlXVmhNV1l4TkRsaU0ySTJPV1V6TWlJc0ltbGhkQ0k2TVRjMk1UYzNOVE13TVN3aVpYaHdJam94TnpZeE9ERTROVEF4TENKcWRHa2lPaUpsT1RFd1lqbGpObVExTjJZaUxDSmlhM1FpT2lKemRHRjBhV011ZDJsNGMzUmhkR2xqTG1OdmJTSXNJbkIwYUNJNklpOXRaV1JwWVM5ak1USXpaR1ZmTXpJNE16TmlOamhpWXpNeE5HUXdZbUpqTW1WbVpEbGhZekkxTWpoaU5qbC1iWFl5TG1wd1p5SXNJbUZqYkNJNkluQjFZbXhwWXlJc0lteG1ZeUk2Ym5Wc2JDd2lZMnhpSWpwN0luVnliQ0k2SW1oMGRIQnpPaTh2Y0hKcGRtRjBaUzF0WldScFlTMTFjQzAwZDNwdFlUWnpialpoTFhWakxtRXVjblZ1TG1Gd2NDOTJNeTl0Y0M5bWFXeGxjeTkxY0d4dllXUXZiV1ZrYVdFdll6RXlNMlJsWHpNeU9ETXpZalk0WW1Nek1UUmtNR0ppWXpKbFptUTVZV015TlRJNFlqWTVmbTEyTWk1cWNHY2lMQ0poZEhSaFkyaHRaVzUwSWpwN0luQmhkR2dpT2lJdmJXVmthV0V2WXpFeU0yUmxYek15T0RNellqWTRZbU16TVRSa01HSmlZekpsWm1RNVlXTXlOVEk0WWpZNWZtMTJNaTVxY0djaUxDSjFjR3h2WVdSZmRHOXJaVzRpT2lKQ1RHeFdiVWd0ZEZWT04ybG9SMEl6VDJ4SFNrcDZWRlpsY2xZd2REbDJiMnh4TjNONlZVWnhjbW96U0c1S1NscE9iVE5HUWtNeFl6bGZhWHB2VnkxYVVuazRkek5ZZEdkc2VuUlZOR3d0VUhSV2RHazFNSGwxTTJKWlQwUnpaVEpOZDFVM1ZHbFJZVmg0Umx状况M05sQkpPVkYzVTNsaGVHcFRZM05PVjJoc09HSmlTR1JtV1ZOTWEyaG9aV1pMTUU1d1pHWnhXV295Ym5GSU5WUlhYMU5yTVVkbWNtWnJOMmRrV0U1R1F6TlBhRmN4ZVhWTFVXeHNWamxyVldkT1QwSlVTRGhPTTJWcGFFWnVXVXRmWkVobmQxRm9NVEZ5YzJsemVsSTJkM280UVhoUFdWZDZTRlkxWjBaa1EweFNVbGN6WVZONVUwUkhiVkZQT1RCbU0wUmxWV3BuYVdGRExVZGlhMDVHTlZwUWMyVTRRVTFIVkRsV056ZG5OR3hEVHpSTVdGbFNVbXB3UmpadVFraEhaV1JKVURKME5FSXlTVGhmV2pKaFdrMVVSM28wWjA4eFdYbzJPV2cyYzJrNU0yaFpSRmhTZW1kWlozaGtlRGczZUhaeVRWRTROMmhOVjNnNGNtdGhiVmxWWDJoRk4weDFRa1JsV2pJM1RYaHNjSFJUVWtVeFoxSXlhVUpzVjFSS1RYZHljSFV6ZVc4MlVuUmxXa2QzWDBFd1pqTnpZbmhWUTFrMlpqaHNTMFZtU3pWcE9XeHRjMHBwZVdWRVpXeDVXbWQyZWpkMFZEQklaR1JZUTFreFowWkNVRTV0TlVFeUxYTnNXRzlxTWpWNWRWUjFaMDQzTkRCeVZGVkRVR2RoV0hsMGQybHFOSFp1WkV4T1EwZzRkM1I2Um0xaFVsQmFhV1F3VFRKUVl6RkxhbFo2TWtoeVluZEVZVmhHU0hKcWQwUTRUR3RWV0hwblNIbEVWRk5NU0dKa2RIRm9TbFZ5UjBKRFEweDRRM0Z0YTB4VFYxbEVlbVJ2Wkcxak5WWnZhMHQ2VmpoSVJ6bFFjMjl6UjJ0T2FYaHFjVzlZVkV0elpIRnVkbGR2WjA1U00yaHhObVpWV1ROR2EwY3RWRnBTTVROUGEwVlVURmx2TVdkQ1ZrdERUR0pQY0daUGR6TkNRVDA5SW4wc0ltaGxZV1JsY25NaU9tNTFiR3dzSW5CaGMzTjBhSEp2ZFdkb0lqcDBjblZsZlgwLld1ZldPXy04VkV5bzA2ZzY1VmJXaDYydURQWktQdWxmclhDN19Bb29OUkEiLCJhY2wiOiJwdWJsaWMiLCJtaW1lVHlwZSI6ImltYWdlL2pwZWciLCJkYXRhUmVzdHJpY3Rpb25zIjp7fSwiYXNwZWN0cyI6eyJwcm9qZWN0SWQiOiJ3aXhtcC1jZGZjMzg0ZjE1ODQxYWFhNWVhYjE2YjEiLCJyZXF1ZXN0SWQiOiIxNzYxNzc1MzEwLjk3NzEwODkxOTkyMzk1MzA5MjcxNiIsInNvdXJjZUlkIjoiY2ZhODJlYzItYTA3NS00MTUyLTk3OTktNmExZGQ1YzAxZWY0Iiwic3BhbklkIjoiMzRsNVJtOEtsU1RITGNnY3pXQTN0dlhNanE5In19.nO0BaxuxA4R1yAcmE--szLcWPFn8AEv5uDdSHy-pBQQ"
};

// Read remaining URLs from a separate file or add them directly
// For now, add placeholder - you can paste the remaining 9 URLs here
for (let i = 4; i <= 13; i++) {
    if (freshUrls[i] && !data.urls.includes(freshUrls[i])) {
        data.urls.push(freshUrls[i]);
        console.log(`Added URL ${i}`);
    }
}

console.log(`\nNow have ${data.urls.length} URLs\n`);

fs.writeFileSync(jsonFile, JSON.stringify(data, null, 2), 'utf8');
console.log(`✅ Updated ${jsonFile}\n`);

if (data.urls.length === 13) {
    console.log('🔄 All 13 URLs present! Running update-urls-direct.js...\n');
    try {
        require('./update-urls-direct.js');
        console.log('✅ Complete! upload-final-batch.js updated.\n');
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
} else {
    console.log(`💡 Need ${13 - data.urls.length} more URLs\n`);
}










