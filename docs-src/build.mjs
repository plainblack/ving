import markdownit from 'markdown-it';
import markdownitanchor from 'markdown-it-anchor';
import markdownittocdoneright from 'markdown-it-toc-done-right';
import fs from 'fs';

const sourcePath = "content/";
const destinationPath = "../docs/";

const md = markdownit({
    html: true,
    linkify: true,
    typographer: true,
    xhtmlOut: true,
}).use(markdownitanchor, {
    permalink: markdownitanchor.permalink.linkInsideHeader({
        symbol: `
          <span aria-hidden="true" class="hidden">#</span>
        `,
        placement: 'after'
    })
})
    .use(markdownittocdoneright);

const wrapperTemplate = (name, content, nav) => `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>${name}</title>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <link rel="stylesheet" href="https://unpkg.com/primeflex@latest/primeflex.css">
    <link rel="stylesheet" href="https://unpkg.com/primeflex@latest/themes/primeone-light.css">
        <style type="text/css">
        html {
            font-size: 1rem;
            height: 100%;
        }
        
        body {
            font-family: var(--font-family);
            background-color: var(--bg-white);
            color: var(--text-color);
            padding: 0;
            margin: 0;
            min-height: 100%;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        
        li a {
            text-decoration: none;
        }
       ol,ul {
            list-style: none;
            margin-left: 0;
            padding-left: 10px;
        }
    </style>
</head>

<body>
    <div class="grid">
        <div class="col-3 lg:col-2 p-3 surface-300">
            <div class="sticky top-0 left-0">
                <div class="text-4xl">Ving Docs</div>
                ${nav}
            </div>
        </div>
            ${content}
    </div>
    
</body>

</html>`;

if (fs.existsSync(destinationPath))
    fs.rmSync(destinationPath, { recursive: true, force: true });
fs.mkdirSync(destinationPath);

const navMd = fs.readFileSync(`nav.md`, { encoding: 'utf8' });
const navHtml = md.render(navMd);

fs.readdir(sourcePath, (err, files) => {
    files.forEach(file => {
        fs.readFile(`${sourcePath}${file}`, { encoding: 'utf8' }, (err, contents) => {
            const html = md.render(`<div class="col lg:col-3 p-3 surface-200"><div class="sticky top-0 right-0"> 

[[toc]] 

</div></div><div class="col min-h-screen"> 

${contents}

</div>`);
            const htmlFile = `${destinationPath}${file.replace(/\.md$/g, '.html')}`;
            fs.writeFile(htmlFile, wrapperTemplate(file, html, navHtml), { encoding: 'utf8' }, (err) => {
                if (err)
                    console.error(err);
            })
        });
    });
});

console.log('done');