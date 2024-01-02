import os
import pathlib

def check_digit_10(isbn):
    assert len(isbn) == 9
    sum = 0
    for i in range(len(isbn)):
        c = int(isbn[i])
        w = i + 1
        sum += w * c
    r = sum % 11
    if r == 10: return 'X'
    else: return str(r)

def check_digit_13(isbn):
    assert len(isbn) == 12
    sum = 0
    for i in range(len(isbn)):
        c = int(isbn[i])
        if i % 2: w = 3
        else: w = 1
        sum += w * c
    r = 10 - (sum % 10)
    if r == 10: return '0'
    else: return str(r)

def convert_10_to_13(isbn):
    assert len(isbn) == 10
    prefix = '978' + isbn[:-1]
    check = check_digit_13(prefix)
    return prefix + check

def cache_if_not_exists(func, prefix: str, filename: str, cache_path: str = os.environ['CACHE_DIR']):
    prefix_path = os.path.join(cache_path, prefix)
    prefix = pathlib.Path(prefix_path)
    if prefix.exists():
        if not prefix.is_dir():
            raise RuntimeError("prefix exists and is not a directory %s" % (prefix_path))
    else:
        prefix.mkdir()
    
    file_path = os.path.join(cache_path, prefix, filename)

    if pathlib.Path(file_path).exists():
        return True
    
    value = func()

    with open(file_path, "w") as fd:
        fd.write(value)

    return False
