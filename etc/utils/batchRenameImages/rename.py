import os

def rename_files():
    directory = '.'  # 현재 디렉토리
    prefix = 'drgroot_'
    extension = '.png'

    # 파일 목록 가져오기
    files = [f for f in os.listdir(directory) if f.startswith(prefix) and f.endswith(extension)]
    
    # 파일 이름 정렬
    files.sort(key=lambda x: int(x[len(prefix):-len(extension)]))
    
    # 파일 이름 변경
    for i, filename in enumerate(files):
        old_name = os.path.join(directory, filename)
        new_name = os.path.join(directory, f"{prefix}{i}{extension}")
        os.rename(old_name, new_name)
        print(f"Renamed: {filename} -> {os.path.basename(new_name)}")

if __name__ == "__main__":
    rename_files()