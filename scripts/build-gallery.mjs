import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const sourcePath = path.join(root, 'tubefactory-styles.html');
const outDir = path.join(root, 'yt-guide');
const imagesDir = path.join(outDir, 'assets', 'images');
const dataDir = path.join(outDir, 'data');

const html = await fs.readFile(sourcePath, 'utf8');

const promptsMatch = html.match(/const prompts = (\[[\s\S]*?\]);\s*const cardsData =/);
const cardsMatch = html.match(/const cardsData = (\[[\s\S]*?\]);\s*let currentLbIndex =/);

if (!promptsMatch || !cardsMatch) {
  throw new Error('갤러리 데이터를 HTML에서 찾지 못했습니다.');
}

const prompts = vm.runInNewContext(promptsMatch[1]);
const cards = vm.runInNewContext(cardsMatch[1]);

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'item';

await fs.mkdir(imagesDir, { recursive: true });
await fs.mkdir(dataDir, { recursive: true });

const gallery = [];

for (const [index, card] of cards.entries()) {
  const match = card.imgSrc.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) {
    throw new Error(`지원하지 않는 이미지 형식입니다: ${card.name}`);
  }

  const mime = match[1];
  const base64 = match[2];
  const ext = mime.split('/')[1].replace('jpeg', 'jpg');
  const fileName = `${String(index + 1).padStart(2, '0')}-${slugify(card.name)}.${ext}`;
  const filePath = path.join(imagesDir, fileName);

  await fs.writeFile(filePath, Buffer.from(base64, 'base64'));

  gallery.push({
    id: index,
    name: card.name,
    tag: card.tag || '',
    prompt: prompts[index] || card.prompt || '',
    image: `./assets/images/${fileName}`,
  });
}

await fs.writeFile(
  path.join(dataDir, 'gallery.json'),
  JSON.stringify(
    {
      title: 'Tube Factory 영상 스타일 갤러리',
      subtitle: `총 ${gallery.length}개의 스타일`,
      items: gallery,
    },
    null,
    2,
  ),
);

console.log(`wrote ${gallery.length} items`);
