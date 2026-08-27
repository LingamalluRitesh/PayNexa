import os
import zipfile

def create_clean_zip():
    target_zip = "D:\\ab1.zip"
    source_dir = "D:\\ab1"
    # Keep .git and package-lock.json for TrainPlex validation
    ignored_dirs = {
        'node_modules', 'dist', 'build', '.next', 'data',
        'coverage', '.turbo', '.cache', '__pycache__', '.pytest_cache'
    }
    ignored_files = {'yarn.lock', 'pnpm-lock.yaml'}

    print(f"Creating updated {target_zip} from {source_dir}...")
    temp_zip = "D:\\ab1_temp.zip"

    added_count = 0
    with zipfile.ZipFile(temp_zip, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
        for root, dirs, files in os.walk(source_dir):
            dirs[:] = [d for d in dirs if d not in ignored_dirs]
            for f in files:
                if f in ignored_files or f.endswith('.pyc') or f.endswith('.tsbuildinfo'):
                    continue
                # Strictly ensure ZERO .env files in zip (we use example.env instead)
                if f.startswith('.env'):
                    continue

                abs_path = os.path.join(root, f)
                rel_path = os.path.relpath(abs_path, os.path.dirname(source_dir)) # 'ab1/...'
                zf.write(abs_path, rel_path)
                added_count += 1

    if os.path.exists(target_zip):
        os.remove(target_zip)
    os.rename(temp_zip, target_zip)

    size_mb = os.path.getsize(target_zip) / (1024 * 1024)
    print(f"Successfully updated {target_zip} ({added_count} files, {size_mb:.2f} MB)")

if __name__ == "__main__":
    create_clean_zip()
