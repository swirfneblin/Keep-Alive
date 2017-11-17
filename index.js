const chromeLauncher = require('chrome-launcher');
const CDP = require('chrome-remote-interface');
const data = {
  url: "https://login.aliexpress.com/buyer_br.htm?spm=a2g03.11010108.1000002.7.74e196242nPjhk&return=https%3A%2F%2Fpt.aliexpress.com%2F&random=8F4EB892E95CB0372E0659440AB9BEEF",
  user: "swirfneblin@gmail.com",
  pass: "swirf007",
  port: 8081
};

(async () => {
  
  let launchChrome = async () => {
    return await chromeLauncher.launch({
      port: data.port
      chromeFlags: ['--start-maximized'],
      chromePath: '/usr/bin/google-chrome'
    })
    .catch(e => console.log(e))
    // .then(chrome => {
    //   console.log(`Chrome debugging port running on ${chrome.port}`);
    // });
  };

  const chrome = await launchChrome();
  const protocol = await CDP({
    port: data.port
  });

  const { DOM,Page,Emulation,Runtime } = protocol;
  await Promise.all([
    Page.enable(), 
    Runtime.enable(), 
    DOM.enable()
  ]);

  Page.navigate({ url: data.url });

  Page.loadEventFired(async() => {
    const expressions = [
      `document.querySelector('#fm-login-id').value = ${data.user};`,
      `document.querySelector('#fm-login-password').value = ${data.pass};`,
      `document.querySelector('#fm-login-submit').click();`
      ];

      for(let cmd of expressions)
        await Runtime.evaluate({ expression: cmd });

    // protocol.close();
    // chrome.kill(); 
  });
})();