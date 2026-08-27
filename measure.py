#!/usr/bin/env python3
"""
TrainPlex Deterministic Codebase Measurement & Metric Collector
Supports arguments: --no-llm, --build [mode], --output [file], --format [json]
"""

import sys
import os
import json
import argparse
import time

def measure_codebase():
    ignored_dirs = {
        'node_modules', '.git', 'dist', 'build', '.next', 'data',
        'coverage', '.turbo', '.cache', '__pycache__', '.pytest_cache'
    }
    ignored_files = {'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'}

    total_lines = 0
    total_code_lines = 0
    total_comment_lines = 0
    total_blank_lines = 0
    file_count = 0
    breakdown_by_ext = {}
    files_list = []

    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in ignored_dirs]
        for f in files:
            if f in ignored_files or f.endswith('.pyc') or f.endswith('.tsbuildinfo'):
                continue

            path = os.path.join(root, f)
            rel_path = os.path.relpath(path, '.').replace('\\', '/')
            ext = os.path.splitext(f)[1].lower() or 'no-ext'

            file_lines = 0
            file_code = 0
            file_comment = 0
            file_blank = 0

            try:
                with open(path, 'r', encoding='utf-8', errors='ignore') as fp:
                    for line in fp:
                        file_lines += 1
                        stripped = line.strip()
                        if not stripped:
                            file_blank += 1
                        elif stripped.startswith(('#', '//', '/*', '*', '<!--', '"""', "'''")):
                            file_comment += 1
                        else:
                            file_code += 1

                total_lines += file_lines
                total_code_lines += file_code
                total_comment_lines += file_comment
                total_blank_lines += file_blank
                file_count += 1

                if ext not in breakdown_by_ext:
                    breakdown_by_ext[ext] = {'files': 0, 'lines': 0, 'code': 0, 'comments': 0, 'blanks': 0}

                breakdown_by_ext[ext]['files'] += 1
                breakdown_by_ext[ext]['lines'] += file_lines
                breakdown_by_ext[ext]['code'] += file_code
                breakdown_by_ext[ext]['comments'] += file_comment
                breakdown_by_ext[ext]['blanks'] += file_blank

                files_list.append({
                    'path': rel_path,
                    'extension': ext,
                    'total_lines': file_lines,
                    'code_lines': file_code,
                    'comment_lines': file_comment,
                    'blank_lines': file_blank,
                })
            except Exception:
                pass

    report = {
        'status': 'success',
        'project': 'PayNexa',
        'version': '1.0.0',
        'timestamp': int(time.time()),
        'summary': {
            'total_files': file_count,
            'total_lines': total_lines,
            'code_lines': total_code_lines,
            'comment_lines': total_comment_lines,
            'blank_lines': total_blank_lines,
        },
        'by_extension': breakdown_by_ext,
        'modules': {
            'core': sum(f['total_lines'] for f in files_list if f['path'].startswith('packages/core')),
            'server': sum(f['total_lines'] for f in files_list if f['path'].startswith('server')),
            'client': sum(f['total_lines'] for f in files_list if f['path'].startswith('client')),
            'sdk_typescript': sum(f['total_lines'] for f in files_list if f['path'].startswith('packages/sdk-typescript')),
            'sdk_python': sum(f['total_lines'] for f in files_list if f['path'].startswith('packages/sdk-python')),
            'sdk_go': sum(f['total_lines'] for f in files_list if f['path'].startswith('packages/sdk-go')),
            'documentation': sum(f['total_lines'] for f in files_list if f['path'].endswith('.md') or f['path'].startswith('docs')),
        }
    }
    return report

def main():
    parser = argparse.ArgumentParser(description='TrainPlex Metric Collector')
    parser.add_argument('--no-llm', action='store_true', help='Deterministic run without LLM call')
    parser.add_argument('--build', type=str, default='none', help='Build mode (e.g. none, full, test)')
    parser.add_argument('--format', type=str, default='json', choices=['json', 'text'], help='Output format')
    parser.add_argument('--output', type=str, default=None, help='Output filepath')

    args, _ = parser.parse_known_args()

    metrics = measure_codebase()
    output_str = json.dumps(metrics, indent=2)

    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            f.write(output_str)

    # Always output valid JSON to stdout
    print(output_str)

if __name__ == '__main__':
    main()
