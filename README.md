# Userscript to fetch book info for Obsidian's QuickAdd plugin

## How-to

1. Install [QuickAdd Plugin](https://github.com/chhoumann/quickadd).
2. Copy JS file into your vault.
3. Add a template with variables.
4. Add a QuickAdd Marco with Userscript and the template.
5. Add command to trigger.

## Variables

### books.com.tw (博客來)

- Userscript: `fetch-books-company.js`
- Example Template: `template-books-company.md`

```
Book ID: {{VALUE:bookId}}
Book name: {{VALUE:bookName}}
Original book name: {{VALUE:originalName}}
Cover image URL: {{VALUE:coverUrl}}
Book URL: {{VALUE:bookUrl}}
Author(s): {{VALUE:author}}
Original author(s): {{VALUE:originalAuthor}}
Translator(s): {{VALUE:translator}}
ISBN: {{VALUE:isbn}}
Publisher: {{VALUE:publisher}}
Original publisher: {{VALUE:originalPublisher}}
Published date: {{VALUE:datePublished}}
Published place: {{VALUE:placePublished}}
Book language: {{VALUE:inLanguage}}
Categories: {{VALUE:categories}}
Series: {{VALUE:series}}
Specification: {{VALUE:specification}}
About this book: {{VALUE:about}}
About autors: {{VALUE:aboutAuthor}}
Table of Contents: {{VALUE:contents}}
```
