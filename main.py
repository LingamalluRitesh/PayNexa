#!/usr/bin/env python3
"""
PayNexa Application Entrypoint (Python Service & Verification Suite)
"""

import sys
import os
import subprocess

def main():
    print("=" * 70)
    print("💳 PayNexa — Next-Generation Digital Payment Platform & Banking Core")
    print("=" * 70)
    
    print("Checking Node.js & TypeScript Monorepo environment...")
    try:
        res = subprocess.run(["node", "-v"], capture_output=True, text=True, check=True)
        print(f"Node.js Version: {res.stdout.strip()}")
    except Exception as e:
        print(f"Node.js check notice: {e}")

    print("\nRunning automated test suites...")
    try:
        subprocess.run(["npm", "test"], check=False)
    except Exception as e:
        print(f"Test run notice: {e}")

if __name__ == '__main__':
    main()
