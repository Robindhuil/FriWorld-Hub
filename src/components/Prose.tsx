// Tiny markdown-lite renderer for news bodies. Supports:
//   "## Heading"  -> subheading
//   "- item"      -> bullet list (consecutive lines grouped into one <ul>)
//   anything else -> paragraph

type Block =
  | { type: 'heading'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'paragraph'; text: string };

function parse(lines: string[]): Block[] {
  const blocks: Block[] = [];
  let list: string[] | null = null;

  const flush = () => {
    if (list) { blocks.push({ type: 'list', items: list }); list = null; }
  };

  for (const line of lines) {
    if (line.startsWith('- '))       { (list ??= []).push(line.slice(2)); }
    else if (line.startsWith('## ')) { flush(); blocks.push({ type: 'heading', text: line.slice(3) }); }
    else                             { flush(); blocks.push({ type: 'paragraph', text: line }); }
  }
  flush();
  return blocks;
}

export default function Prose({ blocks }: { blocks: string[] }) {
  return (
    <div className="space-y-5">
      {parse(blocks).map((block, i) => {
        if (block.type === 'heading') {
          return (
            <h2 key={i} className="mt-6 font-display text-xl font-bold text-ink">
              {block.text}
            </h2>
          );
        }
        if (block.type === 'list') {
          return (
            <ul key={i} className="space-y-2">
              {block.items.map((item, j) => (
                <li key={j} className="flex items-start gap-2.5 text-[15px] leading-relaxed text-ink/70">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full border border-ink/20 bg-accent" />
                  {item}
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="text-base leading-[1.8] text-ink/75">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
