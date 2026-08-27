import os

def count_loc():
    total_lines = 0
    file_count = 0
    by_ext = {}
    ignored_dirs = {'node_modules', '.git', 'dist', 'build', '.next', 'data', 'coverage', '.turbo'}

    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in ignored_dirs]
        for f in files:
            if f in {'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'}:
                continue
            ext = os.path.splitext(f)[1]
            path = os.path.join(root, f)
            try:
                with open(path, 'r', encoding='utf-8', errors='ignore') as fp:
                    lines = sum(1 for _ in fp)
                    total_lines += lines
                    file_count += 1
                    by_ext[ext] = by_ext.get(ext, 0) + lines
            except Exception:
                pass

    print(f"Total Files: {file_count}")
    print(f"Total LOC: {total_lines}")
    for ext, count in sorted(by_ext.items(), key=lambda x: x[1], reverse=True):
        print(f"  {ext if ext else 'no-ext'}: {count} lines")

if __name__ == "__main__":
    count_loc()
