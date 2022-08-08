module.exports = fetchBook;

async function fetchBook(QuickAdd) {
  const bookUrlRegex = /(https?:\/\/\w+.books\.com\.tw\/products\/\w+(?=[?\/&-]\S*)).*/;

  const query = await QuickAdd.quickAddApi.inputPrompt('請輸入博客來書籍網址');

  if (!query) {
    notice('No URL input.');
    throw new Error('No URL input.');
  }

  const bookUrl = query.match(bookUrlRegex)?.[1];

  if (!bookUrl) {
    notice('Invalid book URL');
    throw new Error(`Invalid book URL: ${query}`);
  }

  const result = await getBookByUrl(query);

  QuickAdd.variables = {
    ...result,
  };
}

async function getBookByUrl(url) {
  const coverUrlRegex = /^.*\?i=([^&]+).*/;

  const page = await fetchUrl(url);

  if (!page) {
    notice('No results found.');
    throw new Error('No results found.');
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(page, 'text/html');
  const $ = (selector) => doc.querySelector(selector);
  const $s = (selector) => doc.querySelectorAll(selector);

  const metaBlockEls = Array.from($s('.type02_p003 > ul > li'));
  const descriptionBlockEls = Array.from($s('.grid_19 > .mod_b'));
  const detailBlockEls = descriptionBlockEls
    .find((el) => el?.querySelector('h3')?.textContent === '詳細資料')
    ?.querySelectorAll('.bd > ul');

  const getContributor = getContributorFn(metaBlockEls);

  const bookId = $(`meta[property='product:retailer_item_id']`)?.content;
  const bookName = $(`meta[property='og:title']`)?.content;
  const bookUrl = $(`meta[property='og:url']`)?.content;
  const coverUrl = $(`meta[property='og:image']`)?.content?.match(coverUrlRegex)?.[1];
  const originalName = $('.type02_p002 > h2')?.textContent ?? '';
  const author = getContributor('作者');
  const originalAuthor = getContributor('原文作者');
  const translator = getContributor('譯者');
  const publisher = getPublisher(metaBlockEls);
  const originalPublisher = getOriginalPublisher(metaBlockEls);
  const datePublished = getDatePublished(metaBlockEls);
  const inLanguage = getInLanguage(metaBlockEls);
  const about = getFromDescription(descriptionBlockEls, '內容簡介');
  const aboutAuthor = getFromDescription(descriptionBlockEls, '作者介紹');
  const contents = getFromDescription(descriptionBlockEls, '目錄');
  const categories = getCategories(detailBlockEls?.[1]);
  const isbn = getFromDetail(detailBlockEls?.[0], 'ISBN');
  const series = getFromDetail(detailBlockEls?.[0], '叢書系列');
  const specification = getFromDetail(detailBlockEls?.[0], '規格');
  const placePublished = getFromDetail(detailBlockEls?.[0], '出版地');

  const bookData = {
    bookId,
    isbn,
    bookUrl,
    coverUrl,
    bookName,
    originalName,
    author,
    originalAuthor,
    translator,
    publisher,
    originalPublisher,
    datePublished,
    inLanguage,
    about,
    aboutAuthor,
    contents,
    categories,
    series,
    specification,
    placePublished,
  };

  return Object.fromEntries(
    Object.entries(bookData).map((dataMap) => (dataMap[1]?.length > 0 ? dataMap : [dataMap[0], 'N/A'])),
  );
}

function getContributorFn(elList = []) {
  const hrefRegex = /\/\/search\.books\.com\.tw\/search\/query\/key\/\S+\/adv_author\/1\//;

  return (title = '') =>
    Array.from(elList.find((el) => el?.textContent.includes(title))?.querySelectorAll('a') ?? [])
      .filter((el) => el.href?.match(hrefRegex))
      .map((el) => el.textContent)
      .join(',');
}

function getPublisher(elList = []) {
  const hrefRegex = /.*\/\/www\.books\.com\.tw\/web\/sys_puballb\/.*/;

  return (
    Array.from(elList.find((el) => el?.textContent.includes('出版社'))?.querySelectorAll('a') ?? [])
      .find((el) => el.href?.match(hrefRegex))
      ?.querySelector('span')?.textContent ?? ''
  );
}

function getOriginalPublisher(elList = []) {
  return elList.find((el) => el?.textContent.includes('原文出版社'))?.querySelector('span')?.textContent ?? '';
}

function getDatePublished(elList = []) {
  return elList.find((el) => el?.textContent.includes('出版日期'))?.textContent?.replace('出版日期：', '') ?? '';
}

function getInLanguage(elList = []) {
  return (
    elList
      .find((el) => el?.textContent.includes('語言'))
      ?.textContent?.replace('語言：', '')
      .trim() ?? ''
  );
}

function getFromDescription(elList = [], title = '') {
  const el = elList.find((el) => el?.querySelector('h3')?.textContent === title);
  return el?.querySelector('.bd > .content')?.textContent ?? '';
}

function getFromDetail(detailBlockEl, title = '') {
  return (
    (Array.from(detailBlockEl?.querySelectorAll('li')) ?? [])
      ?.find((el) => el?.textContent.includes(title))
      ?.textContent?.replace(`${title}：`, '')
      .trim()
      .replace(/\s*/g, '') ?? ''
  );
}

function getCategories(detailBlockEl) {
  return (Array.from(detailBlockEl?.querySelectorAll('li')) ?? [])
    .map((liEl) => (Array.from(liEl?.querySelectorAll('a')) ?? []).map((el) => el?.textContent ?? '').join('>'))
    .join(',');
}

async function fetchUrl(url) {
  let finalURL = new URL(url);

  return await request({
    url: finalURL.href,
    method: 'GET',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'User-Agent':
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
    },
  });
}

function notice(msg) {
  new Notice(msg, 5000);
}
