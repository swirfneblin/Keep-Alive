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
  });
}

async function process(objs) {
  try {
    const client = await Promise.resolve(processUri(objs[0].url, objs[0].scripts));
    await setTimeout(async() => {
      const client = await Promise.resolve(processUri(objs[1].url, objs[1].scripts));
    }, 5000);
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
