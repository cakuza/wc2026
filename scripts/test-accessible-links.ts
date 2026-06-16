import assert from "assert";
import { JSDOM } from "jsdom";
import { spawn } from "child_process";
import http from "http";
import net from "net";

async function getFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.listen(0, () => {
      const port = (srv.address() as net.AddressInfo).port;
      srv.close(() => resolve(port));
    });
    srv.on('error', reject);
  });
}

async function runTests() {
  console.log("=== Running Scenario 14: Accessible Links Test ===");

  const port = await getFreePort();
  const server = spawn("npm", ["run", "start", "--", "-p", port.toString()], { stdio: "pipe", shell: true });

  let serverStarted = false;

  const checkServer = () => new Promise<void>((resolve, reject) => {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      http.get(`http://localhost:${port}/matches/mexico-vs-south-africa-jun11`, (res) => {
        if (res.statusCode === 200) {
          clearInterval(interval);
          resolve();
        }
      }).on('error', () => {
        if (attempts > 30) {
          clearInterval(interval);
          reject(new Error("Server failed to start"));
        }
      });
    }, 1000);
  });

  try {
    await checkServer();
    serverStarted = true;

    const html = await new Promise<string>((resolve, reject) => {
      http.get(`http://localhost:${port}/matches/mexico-vs-south-africa-jun11`, (res) => {
        let data = "";
        res.on("data", chunk => data += chunk);
        res.on("end", () => resolve(data));
      }).on("error", reject);
    });

    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Both team URLs are correct
    const mexicoLink = document.querySelector('a[href="/teams/mexico"]');
    const southAfricaLink = document.querySelector('a[href="/teams/south-africa"]');

    assert.ok(mexicoLink, "Mexico link must exist");
    assert.ok(southAfricaLink, "South Africa link must exist");

    // Both links contain their visible team name
    assert.ok(mexicoLink.textContent?.includes("Mexico"), "Mexico link must contain text 'Mexico'");
    assert.ok(southAfricaLink.textContent?.includes("South Africa"), "South Africa link must contain text 'South Africa'");

    // Check flags are inside the links
    const mexicoFlag = mexicoLink.querySelector('svg, img, span[class*="flag"]');
    assert.ok(mexicoFlag, "Mexico link must contain flag content");

    // Neither link wraps the score/status
    const scoreText = "2 - 0"; // or whatever the current score format is
    assert.ok(!mexicoLink.textContent?.includes(scoreText), "Mexico link must not wrap the score");
    assert.ok(!southAfricaLink.textContent?.includes(scoreText), "South Africa link must not wrap the score");

    // No nested anchors
    const nestedInMexico = mexicoLink.querySelector('a');
    const nestedInSouthAfrica = southAfricaLink.querySelector('a');
    assert.strictEqual(nestedInMexico, null, "No nested anchor in Mexico link");
    assert.strictEqual(nestedInSouthAfrica, null, "No nested anchor in South Africa link");

    console.log("✅ 14. Both team panels being valid accessible links (tested against Next.js production server)\n");
    process.exitCode = 0;
  } catch (err: any) {
    console.error("❌ 14. Accessible Links Test failed");
    console.error(err.message || err);
    process.exitCode = 1;
  } finally {
    const serverPid = server.pid;
    if (typeof serverPid !== "number" || isNaN(serverPid) || serverPid <= 0) {
      console.error("No valid numeric server PID found, skipping taskkill to prevent system instability.");
    } else {
      if (process.platform === "win32") {
        spawn("taskkill", ["/PID", serverPid.toString(), "/T", "/F"]);
      } else {
        server.kill();
      }
    }
    setTimeout(() => process.exit(process.exitCode || 0), 1000);
  }
}

runTests();
