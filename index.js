'use strict';
const chromeLauncher = require('chrome-launcher');
const CDP = require('chrome-remote-interface');
const data = {
  port: 51000
};

function processUri(url,script) {
  return new Promise(async (fulfill, reject) => {
    const client = await CDP({ port: data.port });
    const {Page, DOM, Runtime} = client;

    await Promise.all([ Page.enable(), Runtime.enable(), DOM.enable() ]);
    await Page.navigate({url});
    await setTimeout(async () => {
      await Page.loadEventFired(async() => {
        await setTimeout(async () => {
          console.log('===> Loading URL: ',url)
          for (let cmd of script){
            console.log('        +  Execute Script: ',cmd)
            await Runtime.evaluate({ expression: cmd });
          }
          console.log('\n\n');
        }, 3000);
        fulfill(client);
      });
    }, 6000);
  });
}

async function process(objs) {
  try {
    for(let obj of objs){
      const client = await Promise.resolve(processUri(obj.url, obj.scripts));
      const {Page} = client;
    }
  } catch (err) {
    console.error(err);
  }
}

(async() => {
  await chromeLauncher.launch({  port: data.port, chromeFlags: ['--start-maximized'] });
  await process([ 
  {
    url: "https://tableau.itau/#/signin?closePopupWhenDone=true&site=Corporativo&authSetting=DEFAULT&siteLuid=&embedded=true",
    scripts: [
    `document.querySelector("input[tb-test-id='textbox-username-input']").value = "*****"; `,
    `jQuery( "input[tb-test-id='textbox-username-input']" ).trigger("change", {target: {value: "*****" }}); `,
    `document.querySelector("input[tb-test-id='textbox-password-input']").value = "*****"; `,
    `jQuery( "input[tb-test-id='textbox-password-input']" ).trigger("change", {target: {value: "*****" }}); `,
    `document.querySelector("button[tb-test-id='button-signin']").click(); `
    ]
  }, 
  {
    url: "https://tableau.itau/#/site/Corporativo/views/Acompanhamentodecampoonlinev2/LogsticaOutdoor_v2?:iid=1",
    scripts: [
    `document.querySelector("input[tb-test-id='textbox-username-input']").value = "*****"; `,
    `jQuery( "input[tb-test-id='textbox-username-input']" ).trigger('change', {target: {value: "*****" }}); `,
    `document.querySelector("input[tb-test-id='textbox-password-input']").value = "*****"; `,
    `jQuery( "input[tb-test-id='textbox-password-input']" ).trigger("change", {target: {value: "*****" }}); `,
    `document.querySelector("button[tb-test-id='button-signin']").click(); `
    ]
  }
  ]);    
})();
