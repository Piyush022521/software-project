from pathlib import Path
import re

TEXT_EXTENSIONS = {
    '.css', '.html', '.htm', '.js', '.json', '.md', '.py', '.sql', '.txt', '.xml',
}
MOJIBAKE_MARKERS = ('\u00f0\u0178', '\u00e2', '\u00c3', '\u00c2')
TOKEN_RE = re.compile(r'\S+')


def repair_segment(segment):
    for _ in range(3):
        if not any(marker in segment for marker in MOJIBAKE_MARKERS):
            break
        try:
            encoded = bytearray()
            for char in segment:
                if ord(char) <= 0xff:
                    encoded.append(ord(char))
                else:
                    encoded.extend(char.encode('cp1252'))
            repaired = bytes(encoded).decode('utf-8')
        except (UnicodeEncodeError, UnicodeDecodeError):
            break
        if repaired == segment:
            break
        segment = repaired
    return segment


def repair_text(text):
    text = re.sub(
        r'\u00f0\u0178.{2}',
        lambda match: repair_segment(match.group()),
        text,
    )
    return TOKEN_RE.sub(lambda match: repair_segment(match.group()), text)


root = Path(__file__).parent
files = [
    path for path in root.rglob('*')
    if path.is_file()
    and path.suffix.lower() in TEXT_EXTENSIONS
    and not any(part in {'.git', 'node_modules'} for part in path.parts)
]

changed = 0
for file in files:
    try:
        text = file.read_text(encoding='utf-8-sig')
    except UnicodeDecodeError:
        continue
    repaired = repair_text(text)
    if file.suffix.lower() in {'.html', '.htm'}:
        repaired = re.sub(
            r'<meta\s+charset\s*=\s*["\'][^"\']+["\']\s*/?>',
            '<meta charset="UTF-8">',
            repaired,
            flags=re.IGNORECASE,
        )
    if repaired != text or text.startswith('\ufeff'):
        file.write_text(repaired, encoding='utf-8', newline='')
        changed += 1

print(f'Fixed encoding in {changed} text files.')
