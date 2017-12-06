'use strict';
const puppeteer = require('puppeteer');

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

var params = {
  url_initial: 'https://dominio.com',
  frame_login: 'https://subdominio.dominio.com',
  login_user: "user",
  login_pass: "*****",
  db_user_login: "user2", 
  db_pass_login: "*****",
  refresh_ms: 60000
};

(async () => {
  const browser = await puppeteer.launch({
    headless: false, 
    ignoreHTTPSErrors: true,
    args: [ '--start-maximized',  '--disable-infobars' ]
  });

  var page = await browser.newPage();
  
  console.log(`+ Acessando URL: ${params.url_initial} ...`);
  await page.goto(params.url_initial, { waitUntil: 'networkidle2' });
  
  console.log(`+ Realizando login inicial ...`);
  await page.evaluate((user, pass) => {     
    $("input[tb-test-id='textbox-username-input']")
    .val(user)
    .trigger("change", { target: { value: user }}); 
    
    $("input[tb-test-id='textbox-password-input']")
    .val(pass)
    .trigger("change", { target: { value: pass } });
    
    $("button[tb-test-id='button-signin']").click();
  }, params.login_user, params.login_pass);

  await page.waitForSelector('div.tb-tabs-banner-subplace', { timeout: 5000 });
  await timeout(1000);
  await page.close();

  page = await browser.newPage();
  
  console.log(`+ Verificando iframes após login: ${params.frame_login} ...`);
  await page.goto(params.frame_login, { waitUntil: 'networkidle2' });
  
  console.log(`+ Aguardando carregamento do iframe inicial ...`);
  await page.waitForSelector('#ng-app > div > div > div.tb-bottom.ng-scope > div > div.tb-vizviewer.tb-scroll.tb-viz-with-breadcrumb-bar.ng-scope > div > div.tb-viz.ng-isolate-scope > iframe');
  await timeout(3000);
  
  console.log(`+ Inicializando iframe para login na base de dados ...`);
  let framelogin = await page.evaluate(() => {
    return $('iframe')[0].src;
  })
  await page.close();

  page = await browser.newPage();

  console.log(`+ Carregando página para login na base de dados ...`);
  await page.goto(framelogin, { waitUntil: 'networkidle2' });
  await timeout(4000);

  console.log(`+ Carregando contexto do iframe ...`);
  const frame = await page.frames();
  await timeout(4000);
  const execcontext = await frame[1].executionContext();
  
  console.log(`+ Preenchendo login Database ...`);
  await execcontext.evaluate((user, pass) => {
    $('input[tb-test-id="textbox-username-input"]')
    .val(user)
    .trigger('change');

    $('input[tb-test-id="textbox-password-input"]')
    .val(pass)
    .trigger('change');

    $('#ng-app > div > div > div > form > div:nth-child(6) > span').click();
  }, params.db_user_login, params.db_pass_login);

  console.log(`+ Carregando e maximizando dashboard ...`);
  var sizewidth = await page.evaluate(() =>  window.screen.availWidth);
  var sizeheight = await page.evaluate(() => window.screen.availHeight);

  await page.setViewport({
    width: sizewidth, 
    height: sizeheight, 
    deviceScaleFactor: 1
  });

  let selectorrefreshdiv = "div[aria-label=Atualizar]";
  await page.waitForSelector(selectorrefreshdiv);

  console.log(`+ Localizado target para atualização a cada ${params.refresh_ms} ms ...`);
  await timeout(10000);  
  
  setInterval(async () => {
    let date = new Date();
    console.log(`+ Atualizando em: ${date} ...`);
    const inputElement = await page.$(selectorrefreshdiv);
    await inputElement.click();
  }, params.refresh_ms);
  
})();
